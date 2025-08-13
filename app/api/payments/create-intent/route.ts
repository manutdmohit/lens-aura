import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import { authenticate, handleError } from '@/lib/api/middleware';
import Order from '@/models/Order';
import mongoose from 'mongoose';
import Stripe from 'stripe';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

export async function POST(req: NextRequest) {
  try {
    const session = await authenticate(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    const body = await req.json();
    const { orderId } = body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json(
        { error: 'Valid order ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Get order
    const order = (await Order.findById(orderId)) as {
      _id: mongoose.Types.ObjectId;
      user: mongoose.Types.ObjectId;
      paymentStatus: string;
      totalAmount: number;
      paymentDetails: any;
      save: () => Promise<void>;
    } | null;

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // Check if user is authorized
    if (!order.user || order.user.toString() !== session.id) {
      return NextResponse.json(
        { error: 'You are not authorized to pay for this order' },
        { status: 403 }
      );
    }

    // Check if order is already paid
    if (order.paymentStatus === 'paid') {
      return NextResponse.json(
        { error: 'This order has already been paid' },
        { status: 400 }
      );
    }

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalAmount * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order._id.toString(),
        userId: session.id,
      },
    });

    // Update order with payment details
    order.paymentDetails = {
      ...order.paymentDetails,
      paymentIntentId: paymentIntent.id,
    };

    await order.save();

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    return handleError(error);
  }
}
