import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Add pagination later
    const products = await Product.find({
      status: 'active',
      productType: 'contacts',
    })
      .sort({ createdAt: -1 })
      .select('name brand description slug productType price imageUrl stockQuantity inStock')
      .limit(10);

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  } finally {
    await disconnectFromDatabase();
  }
}
