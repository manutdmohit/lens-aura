import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
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
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');

    // Get the time range from query params (default to 30 days)
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    console.log('Fetching top products from:', startDate.toISOString());

    // Aggregate top selling products
    const topProducts = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: startDate },
          paymentStatus: 'paid'
        }
      },
      {
        $unwind: '$items'
      },
      {
        $group: {
          _id: '$items.name',
          firstProductId: { $first: '$items.productId' },
          name: { $first: '$items.name' },
          imageUrl: { $first: '$items.imageUrl' },
          totalQuantity: { $sum: '$items.quantity' },
          totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
          averagePrice: { $avg: '$items.price' },
          variants: {
            $addToSet: {
              color: '$items.color',
              variantId: '$items.productId'
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          productId: '$firstProductId',
          name: 1,
          imageUrl: 1,
          totalQuantity: 1,
          totalRevenue: 1,
          averagePrice: 1,
          variants: 1
        }
      },
      {
        $sort: { totalQuantity: -1 }
      },
      {
        $limit: 10
      }
    ]).exec();

    console.log('Top products data:', topProducts);

    return NextResponse.json(topProducts);
  } catch (error) {
    console.error('Error fetching top products:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch top products',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 