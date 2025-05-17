import { NextResponse } from 'next/server';
import { connectToDatabase} from '@/lib/api/db';
import { Product } from '@/models';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const gender = searchParams.get('gender');

    await connectToDatabase();

    // Build the query
    const query: any = { productType: 'accessory', status: 'active' };
    if (gender) {
      query.gender = gender;
    }

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count of matching products
    const total = await Product.countDocuments(query);

    // Fetch products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return NextResponse.json({
      products,
      pagination: {
        total,
        page,
        limit,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error('Error fetching accessories:', error);
    return NextResponse.json(
      { error: 'Failed to fetch accessories' },
      { status: 500 }
    );
  }
} 