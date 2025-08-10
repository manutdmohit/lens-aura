'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';

interface PriceRange {
  lowest: {
    price: number;
    name: string;
    slug: string;
  } | null;
  highest: {
    price: number;
    name: string;
    slug: string;
  } | null;
}

interface PriceRanges {
  premiumSunglasses: PriceRange;
  standardSunglasses: PriceRange;
}

const defaultPriceRanges: PriceRanges = {
  premiumSunglasses: { lowest: null, highest: null },
  standardSunglasses: { lowest: null, highest: null },
};

// Product images for each category
const productImages = {
  premiumSunglasses: '/images/sunglasses/mens-premium.jpg',
  standardSunglasses: '/images/sunglasses/mens-standard.jpg',
};

export default function PriceRangeDisplay() {
  const [priceRanges, setPriceRanges] =
    useState<PriceRanges>(defaultPriceRanges);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPriceRanges = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('/api/products/price-range', {
          cache: 'no-store',
          headers: {
            'Cache-Control': 'no-cache',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch price ranges: ${response.status}`);
        }

        const data = await response.json();

        // Validate data before setting state
        if (data && typeof data === 'object') {
          const validatedData: PriceRanges = {
            premiumSunglasses: data.sunglasses?.premium || {
              lowest: null,
              highest: null,
            },
            standardSunglasses: data.sunglasses?.standard || {
              lowest: null,
              highest: null,
            },
          };

          setPriceRanges(validatedData);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching price ranges:', err);
        setError(
          err instanceof Error ? err.message : 'An unknown error occurred'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPriceRanges();
  }, []);

  // Show loading state
  if (loading) {
    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">
            Discover Our Price Ranges
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[1, 2].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 h-64 rounded-2xl mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Discover Our Price Ranges
          </h2>
          <p className="text-red-500">
            Unable to load price data at this time.
          </p>
        </div>
      </div>
    );
  }

  // Don't render detailed content if no price data is available
  if (!hasPriceData(priceRanges)) {
    return (
      <div className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Discover Our Price Ranges
          </h2>
          <p className="text-gray-500">No price data available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <section className="py-16 bg-gradient-to-b from-gray-50 to-white">
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Discover Our Price Ranges
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            From affordable everyday styles to premium luxury frames, find the
            perfect sunglasses that fit your budget and lifestyle.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Premium Sunglasses */}
          <Card className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-0 bg-white">
            <div className="relative h-80 overflow-hidden">
              <Image
                src={productImages.premiumSunglasses}
                alt="Premium Sunglasses"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Premium Collection
                </h3>
                <p className="text-white/90 text-sm">
                  Luxury frames with premium polarized lenses
                </p>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="space-y-6">
                {priceRanges.premiumSunglasses?.lowest && (
                  <div className="flex items-center justify-between p-4 bg-blue-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Starting from
                      </p>
                      <p className="font-semibold text-blue-600">
                        ${priceRanges.premiumSunglasses.lowest.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Link
                        href={`/sunglasses/${priceRanges.premiumSunglasses.lowest.slug}`}
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                      >
                        {priceRanges.premiumSunglasses.lowest.name}
                      </Link>
                    </div>
                  </div>
                )}

                {priceRanges.premiumSunglasses?.highest && (
                  <div className="flex items-center justify-between p-4 bg-amber-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Premium options
                      </p>
                      <p className="font-semibold text-amber-600">
                        $
                        {priceRanges.premiumSunglasses.highest.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Link
                        href={`/sunglasses/${priceRanges.premiumSunglasses.highest.slug}`}
                        className="text-sm text-amber-600 hover:text-amber-800 font-medium"
                      >
                        {priceRanges.premiumSunglasses.highest.name}
                      </Link>
                    </div>
                  </div>
                )}

                <Link
                  href="/sunglasses/premium"
                  className="block w-full bg-black text-white text-center py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-300"
                >
                  Explore Premium Collection
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Standard Sunglasses */}
          <Card className="group overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 border-0 bg-white">
            <div className="relative h-80 overflow-hidden">
              <Image
                src={productImages.standardSunglasses}
                alt="Standard Sunglasses"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h3 className="text-2xl font-bold text-white mb-2">
                  Standard Collection
                </h3>
                <p className="text-white/90 text-sm">
                  Quality everyday styles at great prices
                </p>
              </div>
            </div>

            <CardContent className="p-8">
              <div className="space-y-6">
                {priceRanges.standardSunglasses?.lowest && (
                  <div className="flex items-center justify-between p-4 bg-green-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Starting from
                      </p>
                      <p className="font-semibold text-green-600">
                        $
                        {priceRanges.standardSunglasses.lowest.price.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <Link
                        href={`/sunglasses/${priceRanges.standardSunglasses.lowest.slug}`}
                        className="text-sm text-green-600 hover:text-green-800 font-medium"
                      >
                        {priceRanges.standardSunglasses.lowest.name}
                      </Link>
                    </div>
                  </div>
                )}

                {priceRanges.standardSunglasses?.highest && (
                  <div className="flex items-center justify-between p-4 bg-teal-50 rounded-xl">
                    <div>
                      <p className="text-sm text-gray-600 mb-1">
                        Premium options
                      </p>
                      <p className="font-semibold text-teal-600">
                        $
                        {priceRanges.standardSunglasses.highest.price.toFixed(
                          2
                        )}
                      </p>
                    </div>
                    <div className="text-right">
                      <Link
                        href={`/sunglasses/${priceRanges.standardSunglasses.highest.slug}`}
                        className="text-sm text-teal-600 hover:text-teal-800 font-medium"
                      >
                        {priceRanges.standardSunglasses.highest.name}
                      </Link>
                    </div>
                  </div>
                )}

                <Link
                  href="/sunglasses/standard"
                  className="block w-full bg-black text-white text-center py-4 rounded-xl font-semibold hover:bg-gray-800 transition-colors duration-300"
                >
                  Explore Standard Collection
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

// Helper function to check if any price data exists
function hasPriceData(priceRanges: PriceRanges): boolean {
  return !!(
    priceRanges.premiumSunglasses?.lowest ||
    priceRanges.premiumSunglasses?.highest ||
    priceRanges.standardSunglasses?.lowest ||
    priceRanges.standardSunglasses?.highest
  );
}
