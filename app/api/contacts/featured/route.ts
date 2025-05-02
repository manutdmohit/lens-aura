import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import ContactLenses from '@/models/ContactLenses';

/**
 * @route GET /api/contacts/featured
 * @description Get featured contact lenses products
 * @access Public
 */
export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    // Query for featured contact lenses
    const featuredContacts = await ContactLenses.find({ featured: true })
      .select('name price images description discount brand inStock slug rating featured')
      .sort({ createdAt: -1 })
      .limit(6);

    if (featuredContacts.length === 0) {
      // If no featured contacts are found, return top-rated contacts instead
      const topRatedContacts = await ContactLenses.find()
        .select('name price images description discount brand inStock slug rating featured')
        .sort({ rating: -1 })
        .limit(6);

      return NextResponse.json({
        success: true,
        count: topRatedContacts.length,
        data: topRatedContacts,
        message: 'Showing top rated contact lenses as featured'
      }, { status: 200 });
    }

    return NextResponse.json({
      success: true,
      count: featuredContacts.length,
      data: featuredContacts
    }, { status: 200 });

  } catch (error: any) {
    console.error('Error in GET /api/contacts/featured:', error);
    return NextResponse.json({
      success: false,
      message: error.message || 'Failed to fetch featured contact lenses'
    }, { status: 500 });
  } finally {
    await disconnectFromDatabase();
  }
} 