import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get pagination parameters from URL
    const searchParams = req.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '8'); // Default to 8 featured products

    // Find all products where isFeatured is true
    let products = await Product.find({
      status: 'active',
      productType: 'sunglasses',
      isFeatured: true,
    })
      .sort({ createdAt: -1 })
      .select(
        'name slug thumbnail productType price discountedPrice gender category isFeatured inStock stockQuantity frameColorVariants uvProtection polarized'
      )
      .limit(limit);

    // If no featured products are found, show products with UV protection and polarized features
    if (products.length === 0) {
      products = await Product.find({
        status: 'active',
        productType: 'sunglasses',
        uvProtection: true,
        polarized: true,
      })
        .sort({ createdAt: -1 })
        .select(
          'name slug thumbnail productType price discountedPrice gender category isFeatured inStock stockQuantity frameColorVariants uvProtection polarized'
        )
        .limit(limit);
    }

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching featured products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch featured products' },
      { status: 500 }
    );
  }
}
