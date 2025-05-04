import Stripe from 'stripe';
import { connectToDatabase } from './api/db';
import Order from '@/models/Order';
import { updateOrderFromStripeSession } from './order-service';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

/**
 * Check the payment status for a Stripe checkout session
 */
export async function checkPaymentStatus(sessionId: string) {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    console.log(`Checking payment status for session: ${sessionId}`);
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    console.log('Payment Status:', session.payment_status);

    return session.payment_status; // 'paid', 'unpaid', or 'no_payment_required'
  } catch (error) {
    console.error('Failed to retrieve session:', error);
    throw error;
  }
}

/**
 * Manually check and update an order's payment status from Stripe
 */
export async function updateOrderPaymentStatus(sessionId: string) {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    console.log(`Manually updating payment status for session: ${sessionId}`);
    
    // Get the session with customer details
    const session = await stripe.checkout.sessions.retrieve(
      sessionId, 
      { expand: ['customer_details'] }
    );
    
    // Connect to database and find the order
    await connectToDatabase();
    const order = await Order.findOne({ stripeSessionId: sessionId });
    
    if (!order) {
      throw new Error(`Order not found for session: ${sessionId}`);
    }
    
    console.log(`Found order ${order._id}, current status: ${order.paymentStatus}`);
    
    // Check if the payment status in Stripe is 'paid'
    if (session.payment_status === 'paid') {
      console.log('Stripe shows payment is complete, updating order status...');
      
      const customerDetails = session.customer_details;
      if (!customerDetails) {
        throw new Error('Customer details missing from session');
      }
      
      // Create the shipping address object
      const shippingAddress = {
        line1: customerDetails.address?.line1 || '',
        line2: customerDetails.address?.line2 || '',
        city: customerDetails.address?.city || '',
        state: customerDetails.address?.state || '',
        postalCode: customerDetails.address?.postal_code || '',
      };
      
      // Update the order
      const result = await updateOrderFromStripeSession(
        sessionId,
        'paid',
        customerDetails.email || order.customerEmail || '',
        shippingAddress,
        session.payment_intent as string
      );
      
      console.log(`Order ${result.orderId} updated to paid status`);
      return {
        success: true,
        orderNumber: result.orderNumber,
        paymentStatus: 'paid'
      };
    } else {
      console.log(`Payment not complete in Stripe (status: ${session.payment_status})`);
      return {
        success: false,
        orderNumber: order.orderNumber,
        paymentStatus: order.paymentStatus,
        stripePaymentStatus: session.payment_status
      };
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    throw error;
  }
} 