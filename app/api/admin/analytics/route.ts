import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import User from '@/models/User';
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

    // Get the time range from query params (default to 30 days)
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '30');

    // Calculate start date
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    startDate.setHours(0, 0, 0, 0);

    // Calculate monthly periods for trends
    const monthlyStartDate = new Date();
    monthlyStartDate.setMonth(monthlyStartDate.getMonth() - 11);
    monthlyStartDate.setDate(1);
    monthlyStartDate.setHours(0, 0, 0, 0);

    // Fetch all required analytics in parallel
    const [
      orderTrends,
      customerTypes,
      productPerformance,
      salesByRegion,
      retentionData,
      aovTrends
    ] = await Promise.all([
      // Order Trends - Monthly orders for the last 12 months
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: monthlyStartDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            count: { $sum: 1 },
            revenue: { $sum: '$totalAmount' }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]).exec(),

      // New vs Returning Customers
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate }
          }
        },
        {
          $group: {
            _id: '$userId',
            orderCount: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: null,
            newCustomers: {
              $sum: { $cond: [{ $eq: ['$orderCount', 1] }, 1, 0] }
            },
            returningCustomers: {
              $sum: { $cond: [{ $gt: ['$orderCount', 1] }, 1, 0] }
            }
          }
        }
      ]).exec(),

      // Product Performance - Already implemented in top products endpoint
      Order.aggregate([
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
            totalQuantity: { $sum: '$items.quantity' },
            totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        },
        {
          $limit: 10
        }
      ]).exec(),

      // Sales by Region
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: startDate },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: '$shippingAddress.state',
            totalRevenue: { $sum: '$totalAmount' },
            orderCount: { $sum: 1 }
          }
        },
        {
          $sort: { totalRevenue: -1 }
        }
      ]).exec(),

      // Retention Rate (Monthly cohorts)
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: monthlyStartDate }
          }
        },
        {
          $group: {
            _id: {
              userId: '$userId',
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            firstOrder: { $min: '$createdAt' },
            lastOrder: { $max: '$createdAt' }
          }
        },
        {
          $group: {
            _id: {
              year: '$_id.year',
              month: '$_id.month'
            },
            totalCustomers: { $sum: 1 },
            retainedCustomers: {
              $sum: {
                $cond: [
                  { $ne: ['$firstOrder', '$lastOrder'] },
                  1,
                  0
                ]
              }
            }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]).exec(),

      // Average Order Value Trends
      Order.aggregate([
        {
          $match: {
            createdAt: { $gte: monthlyStartDate },
            paymentStatus: 'paid'
          }
        },
        {
          $group: {
            _id: {
              year: { $year: '$createdAt' },
              month: { $month: '$createdAt' }
            },
            averageOrderValue: { $avg: '$totalAmount' },
            totalOrders: { $sum: 1 }
          }
        },
        {
          $sort: {
            '_id.year': 1,
            '_id.month': 1
          }
        }
      ]).exec()
    ]);

    // Format the data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    // Generate all months for the last 12 months
    const allMonths = [];
    const currentDate = new Date();
    const startYear = monthlyStartDate.getFullYear();
    const startMonth = monthlyStartDate.getMonth();
    
    for (let i = 0; i < 12; i++) {
      const date = new Date(startYear, startMonth + i, 1);
      allMonths.push({
        year: date.getFullYear(),
        month: date.getMonth() + 1,
        monthName: months[date.getMonth()]
      });
    }

    // Create a map of existing data
    const orderTrendsMap = new Map(
      orderTrends.map(item => [
        `${item._id.year}-${item._id.month}`,
        {
          orders: item.count,
          revenue: item.revenue
        }
      ])
    );

    const formattedData = {
      orderTrends: allMonths.map(({ year, month, monthName }) => {
        const key = `${year}-${month}`;
        const data = orderTrendsMap.get(key) || { orders: 0, revenue: 0 };
        return {
          date: `${monthName} ${year}`,
          orders: data.orders,
          revenue: data.revenue
        };
      }),
      
      customerTypes: customerTypes[0] || {
        newCustomers: 0,
        returningCustomers: 0
      },
      
      productPerformance: productPerformance.map(item => ({
        name: item._id,
        revenue: item.totalRevenue,
        quantity: item.totalQuantity
      })),
      
      salesByRegion: salesByRegion.map(item => ({
        region: item._id || 'Unknown',
        revenue: item.totalRevenue,
        orders: item.orderCount
      })),
      
      retention: retentionData.map(item => ({
        date: `${months[item._id.month - 1]} ${item._id.year}`,
        rate: (item.retainedCustomers / item.totalCustomers) * 100,
        totalCustomers: item.totalCustomers,
        retainedCustomers: item.retainedCustomers
      })),
      
      aovTrends: aovTrends.map(item => ({
        date: `${months[item._id.month - 1]} ${item._id.year}`,
        value: item.averageOrderValue,
        orders: item.totalOrders
      }))
    };

    return NextResponse.json(formattedData);
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
} 