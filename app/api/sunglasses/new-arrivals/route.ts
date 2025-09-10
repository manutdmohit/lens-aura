import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const query = { productType: 'sunglasses' };
    const limit = 8;

    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .select(
        'name slug productType price discountedPrice thumbnail gender category priceForTwo'
      )
      .limit(limit);

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Error fetching new arrivals:', error);
    return NextResponse.json(
      { error: 'Failed to fetch new arrivals' },
      { status: 500 }
    );
  }
}
