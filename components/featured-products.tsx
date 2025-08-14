'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import StaggeredList from '@/components/staggered-list';
import ProductCard from '@/components/product-card';
import type { ProductFormValues as Product } from '@/lib/api/validation';

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
            <Card className="animate-pulse overflow-hidden rounded-xl border-0 bg-white shadow-sm">
              <div className="aspect-[4/3] bg-gradient-to-br from-gray-50 to-white"></div>
              <CardContent className="p-6">
                <div className="h-5 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load featured products
          </h3>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={handleRetry}
            className="px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white rounded-xl hover:from-gray-800 hover:to-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="max-w-md mx-auto">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            No featured products available
          </h3>
          <p className="text-gray-600">
            Check back soon for our latest featured collection.
          </p>
        </div>
      </div>
    );
  }

  return (
    <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard
          key={product.id || product.slug}
          product={product}
          variant="featured"
          showFeatures={true}
          showStockStatus={true}
          showCategoryBadge={true}
          showGenderBadge={true}
        />
      ))}
    </StaggeredList>
  );
}
