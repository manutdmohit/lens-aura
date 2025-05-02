import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import Sunglasses from '@/models/Sunglasses';

/**
 * @route GET /api/sunglasses/featured
 * @description Get featured sunglasses products
 * @access Public
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Query for featured sunglasses
    const featuredSunglasses = await Sunglasses.find({ featured: true })
      .select('name price images description discount brand inStock slug rating featured')
      .sort({ createdAt: -1 })
      .limit(6);

    if (featuredSunglasses.length === 0) {
      // If no featured sunglasses are found, return top-rated sunglasses instead
      const topRatedSunglasses = await Sunglasses.find()
        .select('name price images description discount brand inStock slug rating featured')
        .sort({ rating: -1 })
        .limit(6);

      return NextResponse.json({
        success: true,
        count: topRatedSunglasses.length,
        data: topRatedSunglasses,
        message: 'Showing top rated sunglasses as featured'
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      count: featuredSunglasses.length,
      data: featuredSunglasses
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in GET /api/sunglasses/featured:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch featured sunglasses'
    }, { status: 500 });
  } finally {
    await disconnectFromDatabase();
  }
} 