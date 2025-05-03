import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase, disconnectFromDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    try {
      // Get price ranges for glasses
      const glassesRange = await getPriceRange('glasses');
      
      // Get price ranges for sunglasses
      const sunglassesRange = await getPriceRange('sunglasses');
      
      // Get price ranges for contacts
      const contactsRange = await getPriceRange('contacts');

      console.log(glassesRange);
      

      return NextResponse.json({
        glasses: glassesRange,
        sunglasses: sunglassesRange,
        contacts: contactsRange
      }, { status: 200 });
    } finally {
      // Ensure we always disconnect from the database
      await disconnectFromDatabase();
    }
  } catch (error) {
    console.error('Error fetching price ranges:', error);
    return NextResponse.json({
      error: 'Failed to fetch price ranges'
    }, { status: 500 });
  }
}

async function getPriceRange(productType: string) {
  try {
    // Find the lowest priced active product
    const lowestPriced = await Product.find({
      status: 'active',
      productType,
      price: { $gt: 0 } // Ensure price is greater than 0
    })
      .sort({ price: 1 })
      .limit(1)
      .select('price name slug');

    // Find the highest priced active product
    const highestPriced = await Product.find({
      status: 'active',
      productType
    })
      .sort({ price: -1 })
      .limit(1)
      .select('price name slug');

    return {
      lowest: lowestPriced.length > 0 ? lowestPriced[0] : null,
      highest: highestPriced.length > 0 ? highestPriced[0] : null
    };
  } catch (error) {
    console.error(`Error getting price range for ${productType}:`, error);
    return {
      lowest: null,
      highest: null
    };
  }
} 