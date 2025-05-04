import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { updateOrderFromStripeSession, createPendingOrder } from '@/lib/order-service';
import { getCheckoutSession } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  console.log('Webhook received:', new Date().toISOString());
  
  try {
    const body = await request.text();
    console.log('Webhook body length:', body.length);
    
    const signature = request.headers.get('stripe-signature') || '';
    console.log('Signature present:', !!signature);
    console.log('Endpoint secret present:', !!endpointSecret);

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log('Event constructed successfully:', event.type);
    } catch (err: any) {
      console.error(`⚠️ Webhook signature verification failed:`, err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      console.log('Received checkout.session.completed event for session:', event.data.object.id);
      
      // Extract the session object
      const session = event.data.object as Stripe.Checkout.Session;
      console.log('Payment status:', session.payment_status);
      console.log('Payment intent:', session.payment_intent);
      
      // Only process if payment was successful
      if (session.payment_status === 'paid') {
        console.log('Payment confirmed as paid, updating order...');
        await handleCheckoutCompleted(session);
      } else if (session.payment_status === 'unpaid') {
        // This is normal for some payment methods that confirm later
        console.log(`Payment not yet confirmed (status: ${session.payment_status}), skipping order update for now`);
      } else {
        console.log(`Unknown payment status: ${session.payment_status}`);
      }
    } else if (event.type === 'payment_intent.succeeded') {
      console.log('Received payment_intent.succeeded event');
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log('Payment intent ID:', paymentIntent.id);
      
      try {
        // First try to find order by payment intent ID
        console.log('Looking for order with payment intent:', paymentIntent.id);
        await connectToDatabase();
        let order = await Order.findOne({ paymentIntent: paymentIntent.id });
        
        if (order) {
          console.log(`Found order ${order._id} by payment intent, updating status to paid`);
          order.paymentStatus = 'paid';
          await order.save();
          console.log(`Order ${order._id} updated to paid status`);
        } else {
          // Find session associated with this payment intent
          console.log('No order found by payment intent, looking for session...');
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            expand: ['data.customer_details']
          });
          
          if (sessions.data.length > 0) {
            console.log(`Found session for payment intent: ${sessions.data[0].id}`);
            
            // Find order by session ID
            order = await Order.findOne({ stripeSessionId: sessions.data[0].id });
            
            if (order) {
              console.log(`Found order ${order._id} by session ID, updating status to paid`);
              order.paymentStatus = 'paid';
              order.paymentIntent = paymentIntent.id;
              await order.save();
              console.log(`Order ${order._id} updated to paid status`);
            } else {
              console.log(`No order found for session: ${sessions.data[0].id}, creating one...`);
              await handleCheckoutCompleted(sessions.data[0]);
            }
          } else {
            console.log('No session found for payment intent:', paymentIntent.id);
          }
        }
      } catch (error) {
        console.error('Error processing payment intent:', error);
      }
    } else {
      console.log(`Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    console.log('Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Error processing webhook:', error);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` }, 
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log(`Processing completed checkout session: ${session.id}`);
    
    // Determine the correct payment status based on the session status
    const paymentStatus = session.payment_status === 'paid' ? 'paid' as const : 'pending' as const;
    console.log(`Setting order payment status to: ${paymentStatus}`);
    
    // Use correct status for updateOrderFromStripeSession
    const statusForUpdate = paymentStatus === 'paid' ? 'paid' as const : 'failed' as const;
    
    // Fetch the complete session with expanded customer details
    const expandedSession = await stripe.checkout.sessions.retrieve(
      session.id, 
      { expand: ['customer_details', 'line_items'] }
    );
    
    const customerDetails = expandedSession.customer_details;
    
    if (!customerDetails || !customerDetails.email) {
      throw new Error('Customer email is missing from the session');
    }
    
    console.log(`Customer email: ${customerDetails.email}`);
    
    // Create the shipping address object
    const shippingAddress = {
      firstName: customerDetails.name?.split(' ')[0] || '',
      lastName: customerDetails.name?.split(' ').slice(1).join(' ') || '',
      address: customerDetails.address?.line1 || '',
      city: customerDetails.address?.city || '',
      state: customerDetails.address?.state || '',
      postalCode: customerDetails.address?.postal_code || '',
      country: customerDetails.address?.country || '',
      phone: customerDetails.phone || '',
    };
    
    try {
      // Try to update the existing order
      const result = await updateOrderFromStripeSession(
        expandedSession.id,
        statusForUpdate, // Use the determined payment status
        customerDetails.email,
        shippingAddress,
        expandedSession.payment_intent as string
      );
      
      console.log(`Order ${result.orderId} (${result.orderNumber}) updated to ${statusForUpdate} status`);
    } catch (error: any) {
      // If order not found, create it
      if (error.message && error.message.includes('Order not found')) {
        console.log(`Order not found for session ${expandedSession.id}, creating it now...`);
        
        // Create order directly from the Stripe session
        const orderResult = await createOrderFromStripeSession(expandedSession);
        console.log(`Created order from Stripe session: ${orderResult.orderId} (${orderResult.orderNumber})`);
        
        // Now update it with the customer details
        const updateResult = await updateOrderFromStripeSession(
          expandedSession.id,
          statusForUpdate, // Use the determined payment status
          customerDetails.email,
          shippingAddress,
          expandedSession.payment_intent as string
        );
        
        console.log(`Order ${updateResult.orderId} (${updateResult.orderNumber}) updated to ${statusForUpdate} status`);
      } else {
        // Some other error occurred
        throw error;
      }
    }
  } catch (error) {
    console.error('Error handling checkout completed event:', error);
    throw error;
  }
}

/**
 * Creates an order directly from Stripe session data, bypassing the normal cart flow
 */
async function createOrderFromStripeSession(session: Stripe.Checkout.Session): Promise<{orderId: string, orderNumber: string}> {
  try {
    await connectToDatabase();
    
    // Extract line items
    const lineItems = session.line_items?.data || [];
    
    // Format order items
    const orderItems = lineItems.map(item => {
      const productData = item.price?.product as Stripe.Product;
      return {
        productId: productData.metadata?.productId || '',
        name: item.description || productData.name || 'Unknown Product',
        price: (item.price?.unit_amount || 0) / 100, // Convert from cents
        quantity: item.quantity || 1,
        color: productData.metadata?.color || 'Default',
        imageUrl: productData.images?.[0] || '',
      };
    });
    
    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    // Create a new order directly using the Order model
    const order = new Order({
      items: orderItems,
      totalAmount,
      paymentStatus: 'pending',
      stripeSessionId: session.id,
      // Customer data will be updated later with updateOrderFromStripeSession
    });
    
    await order.save();
    console.log(`Created order from Stripe session: ${order._id}`);
    
    return { orderId: order._id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error('Error creating order from Stripe session:', error);
    throw error;
  }
} 