import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';

export async function GET() {
  try {
    console.log('Testing database connection...');

    // Connect to database
    await connectToDatabase();
    console.log('Database connected successfully');

    // Test basic query
    const orderCount = await Order.countDocuments();
    console.log('Total orders in database:', orderCount);

    // Get a sample order
    const sampleOrder = await Order.findOne({}, { orderNumber: 1, _id: 1 });
    console.log('Sample order:', sampleOrder);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      orderCount,
      sampleOrder,
    });
  } catch (error) {
    console.error('Database test failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}
