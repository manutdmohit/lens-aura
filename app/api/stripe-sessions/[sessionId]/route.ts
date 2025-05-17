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
  req: NextRequest,
  context: any
) {
  try {
    await connectToDatabase();

    const { sessionId } = context.params;

    // Clean the session ID - handle various formats
    const cleanSessionId = sessionId
      .replace(/^ccs_/, 'cs_') // Handle potential double 'c' prefix
      .replace(/^ccs_test_/, 'cs_test_') // Handle test sessions with double 'c'
      .trim();

    console.log('[DEBUG] Original session ID:', sessionId);
    console.log('[DEBUG] Cleaned session ID:', cleanSessionId);

    // First try with the cleaned session ID
    let order = await Order.findOne({ stripeSessionId: cleanSessionId });
    console.log('[DEBUG] First search with cleanSessionId:', cleanSessionId, ', found:', order?._id);

    // If not found, try with the original session ID
    if (!order) {
      order = await Order.findOne({ stripeSessionId: sessionId });
      console.log('[DEBUG] Second search with original sessionId:', sessionId, ', found:', order?._id);
    }

    // If still not found, try with test prefix
    if (!order && sessionId.startsWith('cs_test_')) {
      const testSessionId = 'ccs_test_' + sessionId.slice(8);
      order = await Order.findOne({ stripeSessionId: testSessionId });
      console.log('[DEBUG] Third search with testSessionId:', testSessionId, ', found:', order?._id);
    }

    // If still not found, try with paymentDetails.stripeSessionId
    if (!order) {
      order = await Order.findOne({ 'paymentDetails.stripeSessionId': cleanSessionId });
      console.log('[DEBUG] Fourth search with paymentDetails.stripeSessionId:', cleanSessionId, ', found:', order?._id);
    }

    // If still not found, try with paymentDetails.stripeSessionId and original session ID
    if (!order) {
      order = await Order.findOne({ 'paymentDetails.stripeSessionId': sessionId });
      console.log('[DEBUG] Fifth search with paymentDetails.stripeSessionId:', sessionId, ', found:', order?._id);
    }

    // If still not found, log all orders for debugging
    if (!order) {
      const allOrders = await Order.find({}, { stripeSessionId: 1, 'paymentDetails.stripeSessionId': 1 });
      console.log('[DEBUG] All orders with session IDs:', allOrders.map(o => ({
        id: o._id,
        sessionId: o.stripeSessionId,
        paymentDetailsSessionId: o.paymentDetails?.stripeSessionId
      })));
    }

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
          firstName: session.customer_details.name?.split(' ')[0] || 'Pending',
          lastName: session.customer_details.name?.split(' ').slice(1).join(' ') || 'Customer',
          street: session.customer_details.address.line1,
          city: session.customer_details.address.city,
          state: session.customer_details.address.state,
          postalCode: session.customer_details.address.postal_code,
          country: session.customer_details.address.country || 'Australia',
          phoneNumber: session.customer_details.phone || ''
        };
      }
      
      await order.save();
    }

    return NextResponse.json({
      orderId: order._id,
      orderNumber: order.orderNumber,
      paymentStatus: order.paymentStatus,
      customerEmail: order.customerEmail,
      customerPhone: order.customerPhone,
      shippingAddress: order.shippingAddress,
      amount_total: session.amount_total,
      customer_details: session.customer_details
    });
  } catch (error) {
    console.error('[DEBUG] Error fetching order:', error);
    return NextResponse.json(
      { error: 'Failed to fetch order' },
      { status: 500 }
    );
  }
}

export async function POST(
  req: NextRequest,
  context: any
) {
  try {
    await connectToDatabase();
    const { checkStock } = await req.json();
    const { sessionId } = context.params;

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