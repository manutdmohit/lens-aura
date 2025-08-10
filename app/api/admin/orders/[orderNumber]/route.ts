import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order, { IOrder } from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Find order by orderNumber
    const { orderNumber } = await context.params;
    const order = await Order.findOne({ orderNumber })
      .lean() as unknown as IOrder;

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    // Format the order data
    const shippingAddress = order.shippingAddress || {};
    const formattedOrder = {
      id: order.orderNumber,
      customer: {
        firstName: shippingAddress.firstName || '',
        lastName: shippingAddress.lastName || '',
        email: order.customerEmail || 'No email',
        phone: order.customerPhone || 'No phone'
      },
      shipping: {
        ...shippingAddress,
        fullAddress: [
          shippingAddress.city,
          shippingAddress.state,
          shippingAddress.postalCode,
          shippingAddress.country
        ].filter(Boolean).join(', ')
      },
      items: order.items.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        color: item.color,
        imageUrl: item.imageUrl,
        subtotal: item.price * item.quantity
      })),
      payment: {
        status: order.paymentStatus,
        method: order.paymentMethod || 'Not specified',
        intent: order.paymentIntent,
        sessionId: order.stripeSessionId
      },
      delivery: {
        status: order.deliveryStatus || "ORDER_PLACED",
        updatedAt: order.updatedAt
      },
      dates: {
        created: order.createdAt,
        updated: order.updatedAt
      },
      totals: {
        subtotal: order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0),
        total: order.totalAmount
      }
    };

    return NextResponse.json({ order: formattedOrder });
  } catch (error) {
    console.error('Error fetching order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } 
}

export async function PATCH(
  req: NextRequest,
  context: any
) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Connect to database
    await connectToDatabase();

    const body = await req.json();
    const { deliveryStatus } = body;

    if (!deliveryStatus) {
      return NextResponse.json(
        { error: 'Delivery status is required' },
        { status: 400 }
      );
    }

    // Update order
    const { orderNumber } = await context.params;
    const order = await Order.findOneAndUpdate(
      { orderNumber },
      { 
        $set: { 
          deliveryStatus,
          updatedAt: new Date()
        } 
      },
      { new: true }
    ).lean() as unknown as IOrder;

    if (!order) {
      return NextResponse.json(
        { error: 'Order not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      success: true,
      deliveryStatus: order.deliveryStatus,
      updatedAt: order.updatedAt
    });
  } catch (error) {
    console.error('Error updating order:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update order',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } 
} 