import { NextRequest, NextResponse } from 'next/server';
import { checkPaymentStatus } from '@/lib/stripe-utils';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import { updateOrderFromStripeSession } from '@/lib/order-service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }
    
    // Check payment status in Stripe
    const paymentStatus = await checkPaymentStatus(sessionId);
    
    // If payment is complete, update the order
    if (paymentStatus === 'paid') {
      // Connect to database
      await connectToDatabase();
      
      // Find the order
      const order = await Order.findOne({ stripeSessionId: sessionId });
      
      if (!order) {
        return NextResponse.json(
          { error: 'Order not found' },
          { status: 404 }
        );
      }
      
      // If order is already paid, just return success
      if (order.paymentStatus === 'paid') {
        return NextResponse.json({
          success: true,
          orderNumber: order.orderNumber,
          paymentStatus: 'paid',
          message: 'Order already marked as paid'
        });
      }
      
      // Update order status to paid
      order.paymentStatus = 'paid';
      await order.save();
      
      return NextResponse.json({
        success: true,
        orderNumber: order.orderNumber,
        paymentStatus: 'paid',
        message: 'Payment status updated successfully'
      });
    }
    
    // If payment is not complete yet
    return NextResponse.json({
      success: false,
      paymentStatus,
      message: 'Payment not complete in Stripe'
    });
  } catch (error: any) {
    console.error('Error updating payment status:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update payment status' },
      { status: 500 }
    );
  }
} 