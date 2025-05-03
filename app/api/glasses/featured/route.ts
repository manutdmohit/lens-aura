import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  await connectToDatabase();

  try {
     const products = await Product.find({
      status: 'active',
      productType: 'glasses',
    })
      .sort({ createdAt: -1 })
      .select('name slug productType price imageUrl')
      .limit(4);

   
      
      
    if (!products || products.length === 0) {
      return NextResponse.json([], { status: 200 });
    }

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    console.error('Error in featured glasses API:', error);
    
    // Make sure the connection is closed even if there's an error
    try {
      await disconnectFromDatabase();
    } catch (disconnectError) {
      console.error('Error disconnecting from database:', disconnectError);
    }
    
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