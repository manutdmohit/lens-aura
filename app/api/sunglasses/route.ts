import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get pagination parameters from URL
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const skip = (page - 1) * limit;

    const gender = searchParams.get('gender');
    const query: any = {
      status: 'active',
      productType: 'sunglasses',
    };
    if (gender === 'men') {
      query.gender = { $in: ['men', 'unisex'] };
    } else if (gender === 'women') {
      query.gender = { $in: ['women', 'unisex'] };
    } else if (gender === 'unisex') {
      query.gender = 'unisex';
    }

    // Get total count for pagination metadata
    const totalCount = await Product.countDocuments(query);

    // Fetch products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .select('name slug thumbnail  productType price gender')
      .skip(skip)
      .limit(limit);

    // Calculate pagination metadata
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json(
      {
        products,
        pagination: {
          total: totalCount,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPrevPage,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json({ error }, { status: 500 });
  }
}
