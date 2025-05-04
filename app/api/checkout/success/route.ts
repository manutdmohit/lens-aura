import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import { updateProductStock, getProductById } from '@/lib/products';

export async function POST(request: NextRequest) {
  try {
    const { sessionId } = await request.json();
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Session ID is required' }, { status: 400 });
    }
    
    console.log(`Processing successful checkout for session: ${sessionId}`);
    
    await connectToDatabase();
    
    // Find the order by Stripe session ID
    const order = await Order.findOne({ stripeSessionId: sessionId });
    
    if (!order) {
      console.error(`Order not found for session: ${sessionId}`);
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }
    
    console.log(`Found order ${order._id}, payment status: ${order.paymentStatus}`);
    
    // Only process if the order is paid
    if (order.paymentStatus !== 'paid') {
      console.log(`Order ${order._id} is not paid, skipping stock reduction`);
      return NextResponse.json({ 
        success: false, 
        message: 'Order not paid',
        paymentStatus: order.paymentStatus
      });
    }
    
    // Check if stock has already been reduced
    if (order.stockReduced) {
      console.log(`Stock already reduced for order ${order._id}`);
      return NextResponse.json({ 
        success: true, 
        message: 'Stock already reduced',
        orderId: order._id
      });
    }
    
    // Process each order item to reduce stock
    const updateResults = [];
    let success = true;
    
    console.log(`Processing ${order.items.length} items for stock reduction`);
    
    for (const item of order.items) {
      try {
        // Skip if no productId
        if (!item.productId) {
          console.warn(`Skipping stock update for item without productId: ${item.name}`);
          updateResults.push({
            product: item.name,
            success: false,
            error: 'No product ID'
          });
          continue;
        }
        
        console.log(`Updating stock for product ${item.productId}, reducing by ${item.quantity}`);
        
        // Get the original product data
        const originalProduct = await getProductById(item.productId);
        
        if (!originalProduct) {
          console.error(`Product not found: ${item.productId}`);
          updateResults.push({
            productId: item.productId,
            success: false,
            error: 'Product not found'
          });
          success = false;
          continue;
        }
        
        const originalStock = originalProduct.stockQuantity;
        console.log(`Current stock for ${originalProduct.name}: ${originalStock}`);
        
        // Update the product stock
        const updatedProduct = await updateProductStock(item.productId, item.quantity);
        
        if (!updatedProduct) {
          console.error(`Failed to update stock for product: ${item.productId}`);
          updateResults.push({
            productId: item.productId,
            success: false,
            error: 'Failed to update stock'
          });
          success = false;
          continue;
        }
        
        console.log(`Updated stock for ${updatedProduct.name}: ${updatedProduct.stockQuantity} (was ${originalStock})`);
        
        updateResults.push({
          productId: item.productId,
          name: updatedProduct.name,
          success: true,
          originalStock,
          newStock: updatedProduct.stockQuantity,
          reduced: item.quantity
        });
      } catch (error: any) {
        console.error(`Error updating stock for product in order ${order._id}:`, error);
        updateResults.push({
          productId: item.productId,
          success: false,
          error: error.message
        });
        success = false;
      }
    }
    
    console.log('Stock update completed for order:', order._id);
    
    // Mark the order as having stock reduced
    order.stockReduced = true;
    await order.save();
    
    // Return the results
    return NextResponse.json({
      success,
      orderId: order._id,
      orderNumber: order.orderNumber,
      updates: updateResults
    });
    
  } catch (error: any) {
    console.error('Error processing successful checkout:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
} 