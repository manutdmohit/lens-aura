import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import Stripe from 'stripe';
import { createPendingOrder } from '@/lib/order-service';
import { updateProductStock } from '@/lib/products';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectToDatabase();

    // Clean the session ID - handle various formats
    const cleanSessionId = params.sessionId
      .trim()
      .replace(/['"]/g, '')
      .replace(/^ccs_test/, 'cs_test')
      .replace(/^cs_test/, 'cs_test'); // Ensure consistent format

    console.log(`[DEBUG] Original session ID: ${params.sessionId}`);
    console.log(`[DEBUG] Cleaned session ID: ${cleanSessionId}`);

    // Try to find the order with the cleaned session ID
    const order = await Order.findOne({ stripeSessionId: cleanSessionId });
    console.log(`[DEBUG] Found order: ${order?._id}`);

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Get the latest session status from Stripe
    const session = await stripe.checkout.sessions.retrieve(cleanSessionId);
    console.log(`[DEBUG] Stripe session status: ${session.payment_status}`);

    // Map Stripe payment status to our order status
    const paymentStatus = session.payment_status === 'paid' ? 'paid' : 'pending';

    // If the session is paid and the order is not yet marked as paid, update it
    if (session.payment_status === 'paid' && order.paymentStatus !== 'paid') {
      console.log(`[DEBUG] Updating order ${order._id} to paid status`);
      order.paymentStatus = 'paid';
      order.paymentIntent = session.payment_intent as string;
      
      // Update customer email from session
      if (session.customer_details?.email) {
        order.customerEmail = session.customer_details.email;
      }
      
      // Update customer phone from session
      if (session.customer_details?.phone) {
        order.customerPhone = session.customer_details.phone;
      }
      
      // Update shipping address from session
      if (session.customer_details?.address) {
        order.shippingAddress = {
          address: session.customer_details.address.line1,
          address2: session.customer_details.address.line2 || '',
          city: session.customer_details.address.city,
          state: session.customer_details.address.state,
          postalCode: session.customer_details.address.postal_code,
          country: session.customer_details.address.country || 'Australia',
          phone: session.customer_details.phone || ''
        };
      }
      
      await order.save();
    }

    return NextResponse.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus, // Use the updated order status
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      amount_total: session.amount_total,
      customer_details: session.customer_details
    });
  } catch (error) {
    console.error('[DEBUG] Error fetching session status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch session status' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    await connectToDatabase();
    const { checkStock } = await request.json();
    const { sessionId } = params;

    // Find the order by session ID
    const order = await Order.findOne({ stripeSessionId: sessionId });
    
    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // If checkStock is true and payment is successful, check and update stock
    if (checkStock && order.paymentStatus === 'paid' && !order.stockReduced) {
      try {
        // Update stock for each item in the order
        for (const item of order.items) {
          await updateProductStock(item.productId, item.quantity);
        }
        
        // Mark the order as having stock reduced
        order.stockReduced = true;
        await order.save();
      } catch (error) {
        console.error('Error updating stock:', error);
        // Don't fail the request if stock update fails
      }
    }

    return NextResponse.json(order);
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order details' },
      { status: 500 }
    );
  }
} 