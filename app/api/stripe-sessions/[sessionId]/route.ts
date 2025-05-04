import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import { Stripe } from 'stripe';
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
    
    if (!order) {
      console.log(`[DEBUG] No order found for session ID: ${cleanSessionId}`);
      
      // Try alternative formats
      const alternativeFormats = [
        cleanSessionId,
        cleanSessionId.replace(/^cs_test/, 'ccs_test'),
        cleanSessionId.replace(/^ccs_test/, 'cs_test')
      ];
      
      console.log(`[DEBUG] Trying alternative session ID formats:`, alternativeFormats);
      
      for (const format of alternativeFormats) {
        const altOrder = await Order.findOne({ stripeSessionId: format });
        if (altOrder) {
          console.log(`[DEBUG] Found order with alternative format: ${format}`);
          return NextResponse.json(altOrder);
        }
      }
      
      // Count all orders to check if the database has any records
      const totalOrders = await Order.countDocuments({});
      console.log(`[DEBUG] Total orders in database: ${totalOrders}`);
      
      // Get a list of recent orders to check their session IDs
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
      console.log('[DEBUG] Recent order session IDs:');
      recentOrders.forEach(order => {
        console.log(`[DEBUG] - Order: ${order._id}, Session ID: ${order.stripeSessionId}`);
      });
      
      // Try to retrieve the session from Stripe
      try {
        console.log(`[DEBUG] Attempting to retrieve session ${cleanSessionId} from Stripe...`);
        const stripeSession = await stripe.checkout.sessions.retrieve(
          cleanSessionId,
          { expand: ['line_items', 'customer_details'] }
        );
        
        if (stripeSession) {
          console.log(`[DEBUG] Found Stripe session: ${stripeSession.id}, status: ${stripeSession.status}, payment status: ${stripeSession.payment_status}`);
          
          // For debugging purposes, return a special response
          return NextResponse.json(
            { 
              error: 'Order not found in database, but session exists in Stripe', 
              stripeSessionExists: true,
              stripeSessionId: stripeSession.id,
              stripeSessionStatus: stripeSession.status,
              stripePaymentStatus: stripeSession.payment_status,
            },
            { status: 404 }
          );
        }
      } catch (stripeError) {
        console.error('[DEBUG] Error retrieving Stripe session:', stripeError);
      }
      
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log(`[DEBUG] Found order: ${order._id}`);
    
    // Check Stripe session status
    try {
      const stripeSession = await stripe.checkout.sessions.retrieve(
        cleanSessionId,
        { expand: ['line_items', 'customer_details'] }
      );
      
      console.log(`[DEBUG] Stripe session status: ${stripeSession.payment_status}`);
      
      // Update order status if it's different from Stripe
      if (stripeSession.payment_status === 'paid' && order.paymentStatus !== 'paid') {
        console.log(`[DEBUG] Updating order status to paid`);
        order.paymentStatus = 'paid';
        await order.save();
      }
    } catch (stripeError) {
      console.error('[DEBUG] Error checking Stripe session:', stripeError);
    }
    
    return NextResponse.json(order);
  } catch (error) {
    console.error('[DEBUG] Error retrieving order:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order' },
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