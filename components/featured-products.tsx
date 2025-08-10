'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import StaggeredList from '@/components/staggered-list';
import Image from 'next/image';

// Define the product type based on API response
interface Product {
  thumbnail: string;
  _id: string;
  name: string;
  slug: string;
  productType: string;
  price: number;
  imageUrl: string;
  category?: string;
  gender?: string;
  inStock?: boolean;
  stockQuantity?: number;
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);

        // Add timestamp to avoid caching issues
        const response = await fetch(`/api/sunglasses/featured`, {
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(
            `Failed to fetch featured products: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();

        // Handle the new-arrivals response format
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else if (Array.isArray(data)) {
          setProducts(data);
        } else {
          console.warn('Unexpected response format:', data);
          setProducts([]);
        }
      } catch (error) {
        console.error('Failed to fetch products:', error);
        setError(error instanceof Error ? error.message : 'An error occurred');

        // Retry logic - retry up to 3 times with increasing delays
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000; // Exponential backoff
          console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`);
          setTimeout(() => {
            setRetryCount((prev) => prev + 1);
          }, delay);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [retryCount]);

  // Retry button handler
  const handleRetry = () => {
    setRetryCount((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 0.8, 0.6] }}
            transition={{
              repeat: Number.POSITIVE_INFINITY,
              duration: 1.5,
              ease: 'easeInOut',
            }}
          >
            <Card className="animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Failed to load featured products
        </h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button
          onClick={handleRetry}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">
          No featured products available at the moment.
        </p>
      </div>
    );
  }

  return (
    <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product._id} href={`/sunglasses/${product.slug}`}>
          <Card className="group overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 border-0 bg-white">
            <div className="aspect-[4/3] relative overflow-hidden bg-gradient-to-br from-gray-50 to-white">
              <Image
                src={product.thumbnail || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-contain transition-transform duration-700 group-hover:scale-105"
                width={500}
                height={500}
              />

              {/* Category Badge */}
              {product.category && (
                <div className="absolute top-3 left-3 z-10">
                  <span
                    className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold shadow-sm ${
                      product.category === 'premium'
                        ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                        : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
                    }`}
                  >
                    {product.category === 'premium' ? 'Premium' : 'Standard'}
                  </span>
                </div>
              )}

              {/* Gender Badge */}
              {product.gender && (
                <div className="absolute top-3 right-3 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200">
                    {product.gender === 'men'
                      ? 'Men'
                      : product.gender === 'women'
                      ? 'Women'
                      : 'Unisex'}
                  </span>
                </div>
              )}

              {/* Stock Status */}
              <div className="absolute bottom-3 left-3 z-10">
                {(() => {
                  // Determine stock status based on multiple factors
                  const isInStock = product.inStock === true;
                  const hasStockQuantity =
                    product.stockQuantity && product.stockQuantity > 0;

                  if (isInStock && hasStockQuantity) {
                    return (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                        In Stock
                      </span>
                    );
                  } else if (isInStock && !hasStockQuantity) {
                    return (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                        Limited Stock
                      </span>
                    );
                  } else {
                    return (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                        Out of Stock
                      </span>
                    );
                  }
                })()}
              </div>

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
            </div>

            <CardContent className="p-6">
              <div className="space-y-3">
                {/* Product Name */}
                <h3 className="font-semibold text-lg text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2">
                  {product.name}
                </h3>

                {/* Price Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-bold text-gray-900">
                      ${product.price.toFixed(2)}
                    </span>
                    {product.category === 'premium' && (
                      <span className="text-xs text-amber-600 font-medium">
                        Premium Quality
                      </span>
                    )}
                  </div>

                  {/* Quick View Button */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                      View Details
                    </span>
                  </div>
                </div>

                {/* Additional Details */}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    UV Protection
                  </span>
                  <span className="flex items-center gap-1">
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Polarized
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </StaggeredList>
  );
}
