import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import User from '@/models/User';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== 'admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'month';

    // Calculate start date based on time range
    const startDate = new Date();
    switch (timeRange) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(startDate.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
      default:
        startDate.setMonth(startDate.getMonth() - 1);
    }

    // Calculate previous period start date
    const prevStartDate = new Date(startDate);
    switch (timeRange) {
      case 'week':
        prevStartDate.setDate(prevStartDate.getDate() - 7);
        break;
      case 'month':
        prevStartDate.setMonth(prevStartDate.getMonth() - 1);
        break;
      case 'quarter':
        prevStartDate.setMonth(prevStartDate.getMonth() - 3);
        break;
      case 'year':
        prevStartDate.setFullYear(prevStartDate.getFullYear() - 1);
        break;
    }

    // Get current period metrics
    const [currentRevenue, currentOrders, currentCustomers] = await Promise.all([
      // Total Revenue - sum of totalAmount for paid orders
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      // Total Orders - count all orders
      Order.countDocuments({
        createdAt: { $gte: startDate }
      }),
      // Total Customers - count users with role 'customer'
      User.countDocuments({
        role: 'customer',
        createdAt: { $gte: startDate }
      })
    ]);

    // Get previous period metrics
    const [prevRevenue, prevOrders, prevCustomers] = await Promise.all([
      // Previous Total Revenue - sum of totalAmount for paid orders
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: prevStartDate, $lt: startDate },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$totalAmount' }
          }
        }
      ]),
      // Previous Total Orders - count all orders
      Order.countDocuments({
        createdAt: { $gte: prevStartDate, $lt: startDate }
      }),
      // Previous Total Customers - count users with role 'customer'
      User.countDocuments({
        role: 'customer',
        createdAt: { $gte: prevStartDate, $lt: startDate }
      })
    ]);

    // Calculate total visitors (approximation)
    const totalVisitors = await User.countDocuments({
      createdAt: { $gte: startDate }
    });

    // Calculate previous period visitors
    const prevVisitors = await User.countDocuments({
      createdAt: { $gte: prevStartDate, $lt: startDate }
    });

    // Calculate metrics
    const metrics = {
      totalRevenue: {
        value: currentRevenue[0]?.total || 0,
        change: calculatePercentageChange(
          prevRevenue[0]?.total || 0,
          currentRevenue[0]?.total || 0
        )
      },
      totalOrders: {
        value: currentOrders,
        change: calculatePercentageChange(prevOrders, currentOrders)
      },
      totalCustomers: {
        value: currentCustomers,
        change: calculatePercentageChange(prevCustomers, currentCustomers)
      },
      conversionRate: {
        value: totalVisitors > 0 ? (currentCustomers / totalVisitors) * 100 : 0,
        change: calculatePercentageChange(
          prevVisitors > 0 ? (prevCustomers / prevVisitors) * 100 : 0,
          totalVisitors > 0 ? (currentCustomers / totalVisitors) * 100 : 0
        )
      }
    };

    return NextResponse.json(metrics);
  } catch (error) {
    console.error('Error fetching dashboard metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard metrics' },
      { status: 500 }
    );
  } finally {
    await disconnectFromDatabase();
  }
}

function calculatePercentageChange(previous: number, current: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
} 