import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import { authenticateAdmin, handleError } from '@/lib/api/middleware';
import User from '@/lib/mongoose/models/user.model';
import Product from '@/lib/mongoose/models/product.model';
import Order from '@/lib/mongoose/models/order.model';

export async function GET(req: NextRequest) {
  try {
    const session = await authenticateAdmin(req);

    if (session instanceof NextResponse) {
      return session; // This is an error response
    }

    await connectToDatabase();

    // Get counts
    const userCount = await User.countDocuments();
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();

    // Get recent orders
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'firstName lastName email');

    // Get sales data
    const totalSales = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]);

    // Get product type distribution
    const productTypes = await Product.aggregate([
      { $group: { _id: '$productType', count: { $sum: 1 } } },
    ]);

    // Get monthly sales data for the past 6 months
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Order.aggregate([
      {
        $match: {
          createdAt: { $gte: sixMonthsAgo },
          paymentStatus: 'paid',
        },
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
          },
          total: { $sum: '$totalAmount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    return NextResponse.json({
      counts: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        sales: totalSales.length > 0 ? totalSales[0].total : 0,
      },
      recentOrders,
      productTypes,
      monthlySales,
    });
  } catch (error) {
    return handleError(error);
  } finally {
    await disconnectFromDatabase();
  }
}
