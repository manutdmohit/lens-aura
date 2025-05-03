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
  glasses: PriceRange;
  sunglasses: PriceRange;
  contacts: PriceRange;
}

const defaultPriceRanges: PriceRanges = {
  glasses: { lowest: null, highest: null },
  sunglasses: { lowest: null, highest: null },
  contacts: { lowest: null, highest: null }
};

// Product images for each category
const productImages = {
  glasses: 'https://images.unsplash.com/photo-1574258495973-f010dfbb5371?q=80&w=500&auto=format&fit=crop',
  sunglasses: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=500&auto=format&fit=crop',
  contacts: 'https://images.unsplash.com/photo-1609189130830-94586b3d0167?q=80&w=500&auto=format&fit=crop'
};

// SVG Icons
const TagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-blue-500 mt-1 flex-shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
  </svg>
);

const SparklesIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5 text-amber-500 mt-1 flex-shrink-0">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
  </svg>
);

const ShoppingBagIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="h-5 w-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
  </svg>
);

export default function PriceRangeDisplay() {
  const [priceRanges, setPriceRanges] = useState<PriceRanges>(defaultPriceRanges);
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
            'Cache-Control': 'no-cache'
          }
        });
        
        if (!response.ok) {
          throw new Error(`Failed to fetch price ranges: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Validate data before setting state
        if (data && typeof data === 'object') {
          const validatedData: PriceRanges = {
            glasses: data.glasses || { lowest: null, highest: null },
            sunglasses: data.sunglasses || { lowest: null, highest: null },
            contacts: data.contacts || { lowest: null, highest: null }
          };
          
          setPriceRanges(validatedData);
        } else {
          throw new Error('Invalid data format received from API');
        }
      } catch (err) {
        console.error('Error fetching price ranges:', err);
        setError(err instanceof Error ? err.message : 'An unknown error occurred');
        
        // Check database connection if error occurs
        try {
          const statusResponse = await fetch('/api/status');
          console.log('Database status:', await statusResponse.json());
        } catch (statusErr) {
          console.error('Failed to check database status:', statusErr);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPriceRanges();
    
    // Add retry mechanism for error cases
    const retryTimer = setTimeout(() => {
      if (error) {
        console.log('Retrying price range fetch...');
        fetchPriceRanges();
      }
    }, 3000); // Retry after 3 seconds if there's an error
    
    return () => clearTimeout(retryTimer);
  }, [error]);

  // Show loading state
  if (loading) {
    return (
      <div className="my-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Shop By Price Range</h2>
        <p>Loading price ranges...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="my-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Shop By Price Range</h2>
        <p className="text-red-500">Unable to load price data at this time.</p>
      </div>
    );
  }

  // Don't render detailed content if no price data is available
  if (!hasPriceData(priceRanges)) {
    return (
      <div className="my-16 text-center">
        <h2 className="text-3xl font-bold mb-4">Shop By Price Range</h2>
        <p>No price data available at this time.</p>
      </div>
    );
  }

  return (
    <div className="my-16">
      <h2 className="text-3xl font-bold text-center mb-8">Shop By Price Range</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Glasses Price Range */}
        <Card className="overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl border-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={productImages.glasses}
              alt="Glasses"
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">Glasses</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            {priceRanges.glasses?.lowest && (
              <div className="flex items-start space-x-3">
                <TagIcon />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 text-sm">Starting from:</span>
                    <span className="font-medium text-blue-600">${priceRanges.glasses.lowest.price.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/glasses/${priceRanges.glasses.lowest.slug}`}
                    className="text-sm text-gray-700 hover:text-blue-600 hover:underline block line-clamp-1"
                  >
                    {priceRanges.glasses.lowest.name}
                  </Link>
                </div>
              </div>
            )}
            {priceRanges.glasses?.highest && (
              <div className="flex items-start space-x-3">
                <SparklesIcon />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 text-sm">Premium options:</span>
                    <span className="font-medium text-amber-600">${priceRanges.glasses.highest.price.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/glasses/${priceRanges.glasses.highest.slug}`}
                    className="text-sm text-gray-700 hover:text-amber-600 hover:underline block line-clamp-1"
                  >
                    {priceRanges.glasses.highest.name}
                  </Link>
                </div>
              </div>
            )}
            <Link
              href="/glasses"
              className="flex items-center justify-center w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition mt-4 space-x-2"
            >
              <ShoppingBagIcon />
              <span>Shop All Glasses</span>
            </Link>
          </CardContent>
        </Card>

        {/* Sunglasses Price Range */}
        <Card className="overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl border-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={productImages.sunglasses}
              alt="Sunglasses"
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">Sunglasses</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            {priceRanges.sunglasses?.lowest && (
              <div className="flex items-start space-x-3">
                <TagIcon />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 text-sm">Starting from:</span>
                    <span className="font-medium text-blue-600">${priceRanges.sunglasses.lowest.price.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/sunglasses/${priceRanges.sunglasses.lowest.slug}`}
                    className="text-sm text-gray-700 hover:text-blue-600 hover:underline block line-clamp-1"
                  >
                    {priceRanges.sunglasses.lowest.name}
                  </Link>
                </div>
              </div>
            )}
            {priceRanges.sunglasses?.highest && (
              <div className="flex items-start space-x-3">
                <SparklesIcon />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 text-sm">Premium options:</span>
                    <span className="font-medium text-amber-600">${priceRanges.sunglasses.highest.price.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/sunglasses/${priceRanges.sunglasses.highest.slug}`}
                    className="text-sm text-gray-700 hover:text-amber-600 hover:underline block line-clamp-1"
                  >
                    {priceRanges.sunglasses.highest.name}
                  </Link>
                </div>
              </div>
            )}
            <Link
              href="/sunglasses"
              className="flex items-center justify-center w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition mt-4 space-x-2"
            >
              <ShoppingBagIcon />
              <span>Shop All Sunglasses</span>
            </Link>
          </CardContent>
        </Card>

        {/* Contact Lenses Price Range */}
        <Card className="overflow-hidden rounded-lg shadow-lg transition-all hover:shadow-xl border-0">
          <div className="relative h-48 w-full overflow-hidden">
            <Image
              src={productImages.contacts}
              alt="Contact Lenses"
              fill
              style={{ objectFit: 'cover' }}
              className="transition-transform hover:scale-105 duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <h3 className="absolute bottom-4 left-4 text-xl font-bold text-white">Contact Lenses</h3>
          </div>
          <CardContent className="p-6 space-y-4">
            {priceRanges.contacts?.lowest && (
              <div className="flex items-start space-x-3">
                <TagIcon />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 text-sm">Starting from:</span>
                    <span className="font-medium text-blue-600">${priceRanges.contacts.lowest.price.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/contacts/${priceRanges.contacts.lowest.slug}`}
                    className="text-sm text-gray-700 hover:text-blue-600 hover:underline block line-clamp-1"
                  >
                    {priceRanges.contacts.lowest.name}
                  </Link>
                </div>
              </div>
            )}
            {priceRanges.contacts?.highest && (
              <div className="flex items-start space-x-3">
                <SparklesIcon />
                <div className="flex-1">
                  <div className="flex justify-between mb-1">
                    <span className="text-gray-600 text-sm">Premium options:</span>
                    <span className="font-medium text-amber-600">${priceRanges.contacts.highest.price.toFixed(2)}</span>
                  </div>
                  <Link
                    href={`/contacts/${priceRanges.contacts.highest.slug}`}
                    className="text-sm text-gray-700 hover:text-amber-600 hover:underline block line-clamp-1"
                  >
                    {priceRanges.contacts.highest.name}
                  </Link>
                </div>
              </div>
            )}
            <Link
              href="/contacts"
              className="flex items-center justify-center w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 transition mt-4 space-x-2"
            >
              <ShoppingBagIcon />
              <span>Shop All Contact Lenses</span>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Helper function to check if any price data exists
function hasPriceData(priceRanges: PriceRanges): boolean {
  return !!(
    (priceRanges.glasses?.lowest || priceRanges.glasses?.highest) ||
    (priceRanges.sunglasses?.lowest || priceRanges.sunglasses?.highest) ||
    (priceRanges.contacts?.lowest || priceRanges.contacts?.highest)
  );
} 