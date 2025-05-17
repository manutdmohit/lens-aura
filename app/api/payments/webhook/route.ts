import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import { handleError } from '@/lib/api/middleware';
import Order from '@/lib/mongoose/models/order.model';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

// Webhook secret
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const payload = await req.text();
    const signature = req.headers.get('stripe-signature') as string;

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing Stripe signature' },
        { status: 400 }
      );
    }

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(
        payload,
        signature,
        endpointSecret!
      );
    } catch (err: any) {
      return NextResponse.json(
        { error: `Webhook signature verification failed: ${err.message}` },
        { status: 400 }
      );
    }

    // Handle the event
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleSuccessfulPayment(paymentIntent);
    } else if (event.type === 'payment_intent.payment_failed') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleFailedPayment(paymentIntent);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return handleError(error);
  }
}

// Handle successful payment
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    await connectToDatabase();

    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      console.error('No order ID in payment intent metadata');
      return;
    }

    // Update order
    const order = await Order.findById(orderId);

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    // Update payment status and details
    order.paymentStatus = 'paid';
    order.status = 'processing';
    order.paymentDetails = {
      ...order.paymentDetails,
      transactionId: paymentIntent.id,
      paymentProvider: 'stripe',
      lastFour: paymentIntent.latest_charge
        ? (await stripe.charges.retrieve(paymentIntent.latest_charge as string))
            .payment_method_details?.card?.last4 || ''
        : '',
      paymentDate: new Date(),
    };

    await order.save();

    console.log(`Payment successful for order ${orderId}`);
  } catch (error) {
    console.error('Error handling successful payment:', error);
  } 
}

// Handle failed payment
async function handleFailedPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    await connectToDatabase();

    const orderId = paymentIntent.metadata.orderId;

    if (!orderId) {
      console.error('No order ID in payment intent metadata');
      return;
    }

    // Update order
    const order = await Order.findById(orderId);

    if (!order) {
      console.error(`Order not found: ${orderId}`);
      return;
    }

    // Update payment status
    order.paymentStatus = 'failed';
    order.paymentDetails = {
      ...order.paymentDetails,
      failureReason:
        paymentIntent.last_payment_error?.message || 'Unknown error',
      failureDate: new Date(),
    };

    await order.save();

    console.log(`Payment failed for order ${orderId}`);
  } catch (error) {
    console.error('Error handling failed payment:', error);
  } 
}
