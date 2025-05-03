import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    
    const products = await Product.find({
      status: 'active',
      productType: 'glasses',
    })
      .sort({ createdAt: -1 })
      .select('name slug productType price imageUrl')
      .limit(4);
      
    // If no products found, return empty array instead of error
    return NextResponse.json(products || [], { status: 200 });
  } catch (error) {
    console.error('Error in featured glasses API:', error);
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      success: false 
    }, { status: 500 });
  } finally {
    try {
      await disconnectFromDatabase();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
  }
}