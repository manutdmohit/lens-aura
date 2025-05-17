import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/utils/authOptions';
import { connectToDatabase} from '@/lib/api/db';
import Order from '@/models/Order';
import User from '@/models/User';

// Helper function to calculate percentage change
function calculatePercentageChange(oldValue: number, newValue: number): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / oldValue) * 100;
}

export async function GET(req: NextRequest) {
  try {
    console.log('Fetching session...');
    const session = await getServerSession(authOptions);
    console.log('Session:', session);

    if (!session) {
      console.error('No session found');
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (!session.user?.role) {
      console.error('No user role found in session:', session);
      return new NextResponse(
        JSON.stringify({ error: 'User role not found' }),
        { 
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    if (session.user.role !== 'admin') {
      console.error('User does not have admin role:', session.user.role);
      return new NextResponse(
        JSON.stringify({ error: 'Admin access required' }),
        { 
          status: 403,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');

    const { searchParams } = new URL(req.url);
    const timeRange = searchParams.get('timeRange') || 'month';
    console.log('Time range:', timeRange);

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

    console.log('Date ranges:', {
      startDate: startDate.toISOString(),
      prevStartDate: prevStartDate.toISOString()
    });

    // Get current period metrics
    console.log('Fetching current period metrics...');
    let currentRevenue, currentOrders, currentCustomers;
    try {
      [currentRevenue, currentOrders, currentCustomers] = await Promise.all([
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
        ]).exec(),
        Order.countDocuments({
          createdAt: { $gte: startDate }
        }).exec(),
        User.countDocuments({
          role: 'customer',
          createdAt: { $gte: startDate }
        }).exec()
      ]);
    } catch (error) {
      console.error('Error fetching current period metrics:', error);
      throw error;
    }

    console.log('Current period metrics:', {
      revenue: currentRevenue,
      orders: currentOrders,
      customers: currentCustomers
    });

    // Get previous period metrics
    console.log('Fetching previous period metrics...');
    let prevRevenue, prevOrders, prevCustomers;
    try {
      [prevRevenue, prevOrders, prevCustomers] = await Promise.all([
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
        ]).exec(),
        Order.countDocuments({
          createdAt: { $gte: prevStartDate, $lt: startDate }
        }).exec(),
        User.countDocuments({
          role: 'customer',
          createdAt: { $gte: prevStartDate, $lt: startDate }
        }).exec()
      ]);
    } catch (error) {
      console.error('Error fetching previous period metrics:', error);
      throw error;
    }

    console.log('Previous period metrics:', {
      revenue: prevRevenue,
      orders: prevOrders,
      customers: prevCustomers
    });

    // Calculate total visitors
    console.log('Calculating visitor metrics...');
    let totalVisitors, prevVisitors;
    try {
      [totalVisitors, prevVisitors] = await Promise.all([
        User.countDocuments({
          createdAt: { $gte: startDate }
        }).exec(),
        User.countDocuments({
          createdAt: { $gte: prevStartDate, $lt: startDate }
        }).exec()
      ]);
    } catch (error) {
      console.error('Error calculating visitor metrics:', error);
      throw error;
    }

    console.log('Visitor metrics:', {
      current: totalVisitors,
      previous: prevVisitors
    });

    // Calculate final metrics
    console.log('Calculating final metrics...');
    const currentRevenueValue = currentRevenue[0]?.total || 0;
    const prevRevenueValue = prevRevenue[0]?.total || 0;
    
    const metrics = {
      totalRevenue: {
        value: currentRevenueValue,
        change: calculatePercentageChange(prevRevenueValue, currentRevenueValue)
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

    console.log('Final calculated metrics:', metrics);

    return new NextResponse(
      JSON.stringify(metrics),
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Unhandled error in metrics calculation:', error);
    return new NextResponse(
      JSON.stringify({ 
        error: 'Failed to calculate metrics',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 