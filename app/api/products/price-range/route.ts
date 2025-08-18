import { type NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/api/db';
import Product from '@/models/Product';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    // Get price ranges for glasses
    const glassesRange = await getPriceRange('glasses');

    // Get price ranges for sunglasses
    const sunglassesRange = await getPriceRange('sunglasses');

    // Get price ranges for signature and essentials sunglasses
    const signatureSunglassesRange = await getPriceRangeWithCategory(
      'sunglasses',
      'signature'
    );
    const essentialsSunglassesRange = await getPriceRangeWithCategory(
      'sunglasses',
      'essentials'
    );

    // Get price ranges for accessories
    const accessoriesRange = await getPriceRange('accessory');

    return NextResponse.json(
      {
        glasses: glassesRange,
        sunglasses: {
          ...sunglassesRange,
          signature: signatureSunglassesRange,
          essentials: essentialsSunglassesRange,
        },
        accessories: accessoriesRange,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching price ranges:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch price ranges',
      },
      { status: 500 }
    );
  }
}

async function getPriceRange(productType: string) {
  try {
    // Find all active products with their prices and discounted prices
    const products = await Product.find({
      status: 'active',
      productType,
      price: { $gt: 0 }, // Ensure price is greater than 0
    }).select('price discountedPrice name slug');

    if (products.length === 0) {
      return {
        lowest: null,
        highest: null,
      };
    }

    // Calculate effective prices (use discounted price if available, otherwise original price)
    const productsWithEffectivePrices = products.map((product) => ({
      ...product.toObject(),
      effectivePrice:
        product.discountedPrice && product.discountedPrice > 0
          ? product.discountedPrice
          : product.price,
    }));

    // Find lowest and highest effective prices
    const lowestPriced = productsWithEffectivePrices.reduce((lowest, product) =>
      product.effectivePrice < lowest.effectivePrice ? product : lowest
    );

    const highestPriced = productsWithEffectivePrices.reduce(
      (highest, product) =>
        product.effectivePrice > highest.effectivePrice ? product : highest
    );

    return {
      lowest: {
        price: lowestPriced.effectivePrice,
        name: lowestPriced.name,
        slug: lowestPriced.slug,
      },
      highest: {
        price: highestPriced.effectivePrice,
        name: highestPriced.name,
        slug: highestPriced.slug,
      },
    };
  } catch (error) {
    console.error(`Error getting price range for ${productType}:`, error);
    return {
      lowest: null,
      highest: null,
    };
  }
}

async function getPriceRangeWithCategory(
  productType: string,
  category: string
) {
  try {
    // Find all active products in the category with their prices and discounted prices
    const products = await Product.find({
      status: 'active',
      productType,
      category,
      price: { $gt: 0 }, // Ensure price is greater than 0
    }).select('price discountedPrice name slug');

    if (products.length === 0) {
      return {
        lowest: null,
        highest: null,
      };
    }

    // Calculate effective prices (use discounted price if available, otherwise original price)
    const productsWithEffectivePrices = products.map((product) => ({
      ...product.toObject(),
      effectivePrice:
        product.discountedPrice && product.discountedPrice > 0
          ? product.discountedPrice
          : product.price,
    }));

    // Find lowest and highest effective prices
    const lowestPriced = productsWithEffectivePrices.reduce((lowest, product) =>
      product.effectivePrice < lowest.effectivePrice ? product : lowest
    );

    const highestPriced = productsWithEffectivePrices.reduce(
      (highest, product) =>
        product.effectivePrice > highest.effectivePrice ? product : highest
    );

    return {
      lowest: {
        price: lowestPriced.effectivePrice,
        name: lowestPriced.name,
        slug: lowestPriced.slug,
      },
      highest: {
        price: highestPriced.effectivePrice,
        name: highestPriced.name,
        slug: highestPriced.slug,
      },
    };
  } catch (error) {
    console.error(
      `Error getting price range for ${productType} ${category}:`,
      error
    );
    return {
      lowest: null,
      highest: null,
    };
  }
}
