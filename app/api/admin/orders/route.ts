import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    
    // Parse query parameters
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const skip = (page - 1) * limit;

    // Build query
    const query: any = {};

    if (search) {
      query.$or = [
        { orderNumber: { $regex: search, $options: 'i' } },
        { customerEmail: { $regex: search, $options: 'i' } }
      ];
    }

    if (status !== 'all') {
      query.paymentStatus = status;
    }

    console.log('Query:', JSON.stringify(query, null, 2));

    // Execute query with pagination
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    console.log('Found orders:', orders.length);

    // Get total count for pagination
    const total = await Order.countDocuments(query);

    console.log('Total orders:', total);

    // Format orders data
    const formattedOrders = orders.map(order => {
      try {
        const shippingAddress = order.shippingAddress || {};
        return {
          id: order.orderNumber,
          customer: shippingAddress.firstName && shippingAddress.lastName 
            ? `${shippingAddress.firstName} ${shippingAddress.lastName}`.trim() 
            : 'Guest Customer',
          email: order.customerEmail || 'No email',
          date: order.createdAt || new Date(),
          status: order.paymentStatus || 'pending',
          payment: order.paymentMethod || 'Not specified',
          total: typeof order.totalAmount === 'number' ? order.totalAmount : 0,
          deliveryStatus: order.deliveryStatus || 'ORDER_PLACED'
        };
      } catch (error) {
        console.error('Error formatting order:', error, order);
        return null;
      }
    }).filter(Boolean);

    console.log('Formatted orders:', formattedOrders.length);

    return NextResponse.json({
      orders: formattedOrders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Error fetching orders:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch orders',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  } finally {
    // Disconnect from database
    await disconnectFromDatabase();
  }
} 