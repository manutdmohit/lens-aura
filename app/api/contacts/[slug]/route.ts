import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function GET(
  req: NextRequest,
  context: any
) {
  try {
    const { slug } = await context.params;

    if (!slug) {
      return NextResponse.json(
        { error: 'Slug parameter is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const product = await Product.findOne({
      slug: slug,
      productType: 'contacts',
      status: 'active',
    }).lean();

    if (!product) {
      return NextResponse.json(
        { error: 'Contacts product not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ product });
  } catch (error) {
    console.error('Error fetching glasses by slug:', error);
    return NextResponse.json(
      { error: 'Failed to fetch product' },
      { status: 500 }
    );
  }
}
