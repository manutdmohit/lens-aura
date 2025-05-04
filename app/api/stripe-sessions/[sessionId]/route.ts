import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import { Stripe } from 'stripe';
import { createPendingOrder } from '@/lib/order-service';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Properly await the params object before accessing properties
    const sessionParams = await Promise.resolve(params);
    const sessionId = sessionParams.sessionId;
    
    console.log(`Fetching order for session ID: ${sessionId}`);
    
    if (!sessionId) {
      console.log('No session ID provided');
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    await connectToDatabase();
    
    // Find the order by Stripe session ID
    console.log(`Looking up order with stripeSessionId: ${sessionId}`);
    const order = await Order.findOne({ stripeSessionId: sessionId });
    
    if (!order) {
      console.log(`No order found for session ID: ${sessionId}`);
      
      // Count all orders to check if the database has any records
      const totalOrders = await Order.countDocuments({});
      console.log(`Total orders in database: ${totalOrders}`);
      
      // Get a list of recent orders to check their session IDs
      const recentOrders = await Order.find().sort({ createdAt: -1 }).limit(5);
      console.log('Recent order session IDs:');
      recentOrders.forEach(order => {
        console.log(`- Order: ${order._id}, Session ID: ${order.stripeSessionId}`);
      });
      
      // Try to retrieve the session from Stripe
      try {
        console.log(`Attempting to retrieve session ${sessionId} from Stripe...`);
        const stripeSession = await stripe.checkout.sessions.retrieve(
          sessionId,
          { expand: ['line_items', 'customer_details'] }
        );
        
        if (stripeSession) {
          console.log(`Found Stripe session: ${stripeSession.id}, status: ${stripeSession.status}, payment status: ${stripeSession.payment_status}`);
          
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
        console.error('Error retrieving Stripe session:', stripeError);
      }
      
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }
    
    console.log(`Order found: ${order._id}, payment status: ${order.paymentStatus}`);
    
    // Return the order details
    return NextResponse.json({
      id: order._id,
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      items: order.items,
      totalAmount: order.totalAmount,
      paymentStatus: order.paymentStatus,
      createdAt: order.createdAt,
    });
    
  } catch (error) {
    console.error('Error retrieving order details:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve order details' },
      { status: 500 }
    );
  }
} 