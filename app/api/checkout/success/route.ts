import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import { updateProductStock, getProductById } from '@/lib/products';
import mongoose from 'mongoose';
import { sendInvoiceEmail } from '@/lib/send-invoice';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    // Clean the session ID to match frontend
    const cleanSessionId = sessionId
      .trim()
      .replace(/['"]/g, '')
      .replace(/^ccs_test/, 'cs_test');
    
    console.log(`Processing successful checkout for session: ${cleanSessionId}`);
    
    await connectToDatabase();
    
    // Find the order by Stripe session ID
    const foundOrder = await Order.findOne({ stripeSessionId: cleanSessionId });
    
    if (!foundOrder) {
      console.error(`Order not found for session: ${cleanSessionId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    console.log(`Found order ${foundOrder._id}, payment status: ${foundOrder.paymentStatus}`);
    
    // Only process if the order is paid
    if (foundOrder.paymentStatus !== 'paid') {
      console.log(`Order ${foundOrder._id} is not paid, skipping stock reduction`);
      return NextResponse.json({ 
        success: false, 
        message: 'Order not paid',
        paymentStatus: foundOrder.paymentStatus
      });
    }
    
    // Check if stock has already been reduced
    if (foundOrder.stockReduced) {
      console.log(`Stock already reduced for order ${foundOrder._id}`);
      // Send invoice if not already sent (idempotency is not handled here, but could be added)
      if (foundOrder.customerEmail) {
        try {
          await sendInvoiceEmail({
            to: foundOrder.customerEmail,
            orderId: foundOrder.orderNumber || foundOrder._id.toString(),
            items: foundOrder.items.map((item: any) => ({
              name: item.name,
              quantity: item.quantity,
              price: item.price,
              color: item.color,
            })),
            total: foundOrder.totalAmount,
          });
        } catch (e) {
          console.error('Failed to send invoice email:', e);
        }
      }
      return NextResponse.json({ 
        success: true, 
        message: 'Stock already reduced',
        orderId: foundOrder._id
      });
    }
    
    // Process each order item to reduce stock
    const updateResults = [];
    let success = true;
    
    console.log(`Processing ${foundOrder.items.length} items for stock reduction`);
    
    for (const item of foundOrder.items) {
      try {
        // Skip if no product
        if (!item.productId) {
          console.warn(`Skipping stock update for item without product: ${item.name}`);
          updateResults.push({
            product: item.name,
            success: false,
            error: 'No product ID'
          });
          continue;
        }
        
        // Convert productId to ObjectId if it's not already
        const productId = item.productId instanceof mongoose.Types.ObjectId 
          ? item.productId 
          : new mongoose.Types.ObjectId(item.productId);
        
        console.log(`Updating stock for product ${productId}, reducing by ${item.quantity}`);
        
        // Get the original product data
        const originalProduct = await getProductById(productId.toString());
        
        if (!originalProduct) {
          console.error(`Product not found: ${productId}`);
          updateResults.push({
            productId: productId,
            success: false,
            error: 'Product not found'
          });
          success = false;
          continue;
        }
        
        const originalStock = originalProduct.stockQuantity;
        console.log(`Current stock for ${originalProduct.name}: ${originalStock}`);
        
        // Update the product stock
        const updatedProduct = await updateProductStock(productId.toString(), item.quantity);
        
        if (!updatedProduct) {
          console.error(`Failed to update stock for product: ${productId}`);
          updateResults.push({
            productId: productId,
            success: false,
            error: 'Failed to update stock'
          });
          success = false;
          continue;
        }
        
        console.log(`Updated stock for ${updatedProduct.name}: ${updatedProduct.stockQuantity} (was ${originalStock})`);
        
        updateResults.push({
          productId: productId,
          name: updatedProduct.name,
          success: true,
          originalStock,
          newStock: updatedProduct.stockQuantity,
          reduced: item.quantity
        });
      } catch (error: any) {
        console.error(`Error updating stock for product in order ${foundOrder._id}:`, error);
        updateResults.push({
          productId: item.productId,
          success: false,
          error: error.message
        });
        success = false;
      }
    }
    
    console.log('Stock update completed for order:', foundOrder._id);
    
    // Mark the order as having stock reduced
    foundOrder.stockReduced = true;
    await foundOrder.save();

    // Send invoice email after stock is reduced and order is paid
    if (foundOrder.customerEmail) {
      try {
        await sendInvoiceEmail({
          to: foundOrder.customerEmail,
          orderId: foundOrder.orderNumber || foundOrder._id.toString(),
          items: foundOrder.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
          })),
          total: foundOrder.totalAmount,
        });
      } catch (e) {
        console.error('Failed to send invoice email:', e);
      }
    }
    
    // Return the results
    return NextResponse.json({
      success,
      orderId: foundOrder._id,
      orderNumber: foundOrder.orderNumber,
      updates: updateResults
    });
    
  } catch (error: any) {
    console.error('Error processing successful checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 