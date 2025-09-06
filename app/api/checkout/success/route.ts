import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import { updateProductStock, getProductById } from '@/lib/products';
import mongoose from 'mongoose';
import { MailService } from '@/lib/mail-service';

// In-memory cache to prevent duplicate processing of the same session
const processingSessions = new Set<string>();

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substr(2, 9);
  const timestamp = new Date().toISOString();
  let cleanSessionId: string = '';

  try {
    const { sessionId } = await request.json();

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Clean the session ID to match frontend
    cleanSessionId = sessionId
      .trim()
      .replace(/['"]/g, '')
      .replace(/^ccs_test/, 'cs_test');

    console.log(
      `[${requestId}] [${timestamp}] Processing successful checkout for session: ${cleanSessionId}`
    );

    // Check if this session is already being processed
    if (processingSessions.has(cleanSessionId)) {
      console.log(
        `[${requestId}] [DUPLICATE] Session ${cleanSessionId} is already being processed, skipping`
      );
      return NextResponse.json({
        success: true,
        message: 'Session already being processed',
        sessionId: cleanSessionId,
      });
    }

    // Mark this session as being processed
    processingSessions.add(cleanSessionId);
    console.log(
      `[${requestId}] [LOCK] Acquired processing lock for session: ${cleanSessionId}`
    );

    await connectToDatabase();

    // Find the order by Stripe session ID
    const foundOrder = await Order.findOne({ stripeSessionId: cleanSessionId });

    if (!foundOrder) {
      console.error(
        `[${requestId}] Order not found for session: ${cleanSessionId}`
      );
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    console.log(
      `[${requestId}] Found order ${foundOrder._id}, payment status: ${foundOrder.paymentStatus}, emailSent: ${foundOrder.emailSent}`
    );

    // Only process if the order is paid
    if (foundOrder.paymentStatus !== 'paid') {
      console.log(
        `Order ${foundOrder._id} is not paid, skipping stock reduction`
      );
      return NextResponse.json({
        success: false,
        message: 'Order not paid',
        paymentStatus: foundOrder.paymentStatus,
      });
    }

    // Check if stock has already been reduced
    if (foundOrder.stockReduced) {
      console.log(`Stock already reduced for order ${foundOrder._id}`);
      return NextResponse.json({
        success: true,
        message: 'Stock already reduced',
        orderId: foundOrder._id,
      });
    }

    // Process each order item to reduce stock
    const updateResults = [];
    let success = true;

    console.log(
      `Processing ${foundOrder.items.length} items for stock reduction`
    );

    for (const item of foundOrder.items) {
      try {
        // Skip if no product
        if (!item.productId) {
          console.warn(
            `Skipping stock update for item without product: ${item.name}`
          );
          updateResults.push({
            product: item.name,
            success: false,
            error: 'No product ID',
          });
          continue;
        }

        // Convert productId to ObjectId if it's not already
        const productId =
          item.productId instanceof mongoose.Types.ObjectId
            ? item.productId
            : new mongoose.Types.ObjectId(item.productId);

        console.log(
          `Updating stock for product ${productId}, reducing by ${item.quantity}`
        );

        // Get the original product data
        const originalProduct = await getProductById(productId.toString());

        if (!originalProduct) {
          console.error(`Product not found: ${productId}`);
          updateResults.push({
            productId: productId,
            success: false,
            error: 'Product not found',
          });
          success = false;
          continue;
        }

        const originalStock = originalProduct.stockQuantity;
        console.log(
          `Current stock for ${originalProduct.name}: ${originalStock}`
        );

        // Update the product stock (pass color if available)
        const updatedProduct = await updateProductStock(
          productId.toString(),
          item.quantity,
          item.color
        );

        if (!updatedProduct) {
          console.error(`Failed to update stock for product: ${productId}`);
          updateResults.push({
            productId: productId,
            success: false,
            error: 'Failed to update stock',
          });
          success = false;
          continue;
        }

        console.log(
          `Updated stock for ${updatedProduct.name}: ${updatedProduct.stockQuantity} (was ${originalStock})`
        );

        updateResults.push({
          productId: productId,
          name: updatedProduct.name,
          success: true,
          originalStock,
          newStock: updatedProduct.stockQuantity,
          reduced: item.quantity,
        });
      } catch (error: any) {
        console.error(
          `Error updating stock for product in order ${foundOrder._id}:`,
          error
        );
        updateResults.push({
          productId: item.productId,
          success: false,
          error: error.message,
        });
        success = false;
      }
    }

    console.log('Stock update completed for order:', foundOrder._id);

    // Mark the order as having stock reduced
    foundOrder.stockReduced = true;
    await foundOrder.save();

    // Send invoice email after stock is reduced and order is paid (only if not already sent)
    if (foundOrder.customerEmail && !foundOrder.emailSent) {
      try {
        console.log(
          `[${requestId}] [EMAIL] Sending invoice email for order ${foundOrder.orderNumber} to ${foundOrder.customerEmail}`
        );

        // Use atomic update to prevent race conditions - only update if emailSent is still false
        const updateResult = await Order.updateOne(
          {
            _id: foundOrder._id,
            emailSent: false, // Only update if email hasn't been sent yet
          },
          {
            $set: { emailSent: true },
          }
        );

        // Check if the update was successful (meaning we got the lock)
        if (updateResult.modifiedCount === 0) {
          console.log(
            `[${requestId}] [EMAIL] Email already being sent by another process for order ${foundOrder.orderNumber}`
          );
          return NextResponse.json({
            success,
            orderId: foundOrder._id,
            orderNumber: foundOrder.orderNumber,
            updates: updateResults,
            message: 'Email already being processed',
          });
        }

        console.log(
          `[${requestId}] [EMAIL] Successfully acquired email lock for order ${foundOrder.orderNumber}`
        );

        await MailService.sendInvoiceEmail({
          to: foundOrder.customerEmail,
          orderId: foundOrder.orderNumber || foundOrder._id.toString(),
          items: foundOrder.items.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            price: item.price,
            color: item.color,
            productType: item.productType,
            category: item.product?.category || item.category,
            originalPrice: item.originalPrice,
          })),
          total: foundOrder.totalAmount,
          customerName:
            foundOrder.shippingAddress?.firstName &&
            foundOrder.shippingAddress?.lastName
              ? `${foundOrder.shippingAddress.firstName} ${foundOrder.shippingAddress.lastName}`.trim()
              : 'Valued Customer',
          customerEmail: foundOrder.customerEmail,
          shippingAddress: foundOrder.shippingAddress,
          paymentMethod: foundOrder.paymentMethod || 'Stripe',
          orderDate: foundOrder.createdAt || new Date(),
        });

        console.log(
          `[${requestId}] [EMAIL] Invoice email sent successfully for order ${foundOrder.orderNumber}`
        );
      } catch (e) {
        console.error(
          `[${requestId}] [EMAIL] Failed to send invoice email:`,
          e
        );
        // Reset the flag if email sending failed using atomic update
        await Order.updateOne(
          { _id: foundOrder._id },
          { $set: { emailSent: false } }
        );
        console.log(
          `[${requestId}] [EMAIL] Reset emailSent=false due to failure for order ${foundOrder.orderNumber}`
        );
      }
    } else if (foundOrder.emailSent) {
      console.log(
        `[${requestId}] [EMAIL] Invoice email already sent for order ${foundOrder.orderNumber}`
      );
    } else {
      console.log(
        `[${requestId}] [EMAIL] No customer email found for order ${foundOrder.orderNumber}`
      );
    }

    // Return the results
    return NextResponse.json({
      success,
      orderId: foundOrder._id,
      orderNumber: foundOrder.orderNumber,
      updates: updateResults,
    });
  } catch (error: any) {
    console.error(`[${requestId}] Error processing checkout success:`, error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  } finally {
    // Always remove the session from processing set (if it was set)
    if (cleanSessionId) {
      processingSessions.delete(cleanSessionId);
      console.log(
        `[${requestId}] [UNLOCK] Released processing lock for session: ${cleanSessionId}`
      );
    }
  }
}
