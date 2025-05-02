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

    return NextResponse.json(products, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  } finally {
    await disconnectFromDatabase();
  }
}