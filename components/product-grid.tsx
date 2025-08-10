'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { ProductFormValues as Product } from '@/lib/api/validation';
import StaggeredList from '@/components/staggered-list';
import Image from 'next/image';
import { Badge } from './ui/badge';
import { Star } from 'lucide-react';

interface ProductGridProps {
  products: Product[];
  showWishlist?: boolean;
  showQuickActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
}

export default function ProductGrid({
  products,
  showWishlist = true,
  showQuickActions = true,
  variant = 'default',
}: ProductGridProps) {
  const getGridCols = () => {
    switch (variant) {
      case 'compact':
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 'featured':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  const getCardHeight = () => {
    switch (variant) {
      case 'compact':
        return 'aspect-[3/4]';
      case 'featured':
        return 'aspect-[4/3]';
      default:
        return 'aspect-[4/3]';
    }
  };

  const getCardPadding = () => {
    switch (variant) {
      case 'compact':
        return 'p-4';
      case 'featured':
        return 'p-6';
      default:
        return 'p-5';
    }
  };

  const renderStockStatus = (product: Product) => {
    const isInStock = product.inStock === true;

    // Calculate total stock from frameColors array
    const totalStock =
      product.frameColorVariants?.reduce((total, variant) => {
        return total + (variant.stockQuantity || 0);
      }, 0) || 0;

    if (isInStock && totalStock > 5) {
      return (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200 shadow-sm">
            In Stock
          </span>
        </div>
      );
    } else if (isInStock && totalStock > 0 && totalStock <= 5) {
      return (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 border border-yellow-200 shadow-sm">
            Limited Stock
          </span>
        </div>
      );
    } else {
      return (
        <div className="absolute top-3 left-3 z-10">
          <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-800 border border-red-200 shadow-sm">
            Out of Stock
          </span>
        </div>
      );
    }
  };

  const renderCategoryBadge = (product: Product) => {
    if (product.category) {
      const isPremium = product.category === 'premium';
      return (
        <div className="absolute top-3 right-3 z-10">
          <span
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
              isPremium
                ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
                : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
            }`}
          >
            {isPremium ? 'Premium' : 'Standard'}
          </span>
        </div>
      );
    }
    return null;
  };

  const renderProductFeatures = (product: Product) => {
    if (variant === 'compact') return null;

    return (
      <div className="flex items-center justify-between text-xs text-gray-500 mt-3">
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          UV Protection
        </span>
        <span className="flex items-center gap-1">
          <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
          Polarized
        </span>
      </div>
    );
  };

  const renderRating = (product: Product) => {
    if (variant === 'compact') return null;

    return (
      <div className="flex items-center gap-1 mt-2">
        <div className="flex items-center">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              className={`w-3 h-3 ${
                i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-xs text-gray-500 ml-1">(4.2)</span>
      </div>
    );
  };

  return (
    <StaggeredList className={`grid ${getGridCols()} gap-6`}>
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/${
            product.productType === 'accessory'
              ? 'accessories'
              : product.productType
          }/${product.slug}`}
        >
          <Card className="group overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 border-0 bg-white">
            <div
              className={`${getCardHeight()} relative overflow-hidden bg-gradient-to-br from-gray-50 to-white`}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                transition={{ duration: 0.6, ease: 'easeOut' }}
                className="w-full h-full"
              >
                <Image
                  src={product.thumbnail || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-contain transition-all duration-700"
                  width={500}
                  height={500}
                  priority={variant === 'featured'}
                />
              </motion.div>

              {/* Stock Status Badge */}
              {renderStockStatus(product)}

              {/* Category Badge */}
              {renderCategoryBadge(product)}

              {/* Gender Badge */}
              {product.gender && variant !== 'compact' && (
                <div className="absolute bottom-3 right-3 z-10">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-700 border border-gray-200">
                    {product.gender === 'men'
                      ? 'Men'
                      : product.gender === 'women'
                      ? 'Women'
                      : 'Unisex'}
                  </span>
                </div>
              )}

              {/* Hover Overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
            </div>

            <CardContent className={getCardPadding()}>
              <div className="space-y-3">
                {/* Product Name */}
                <h3
                  className={`font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 ${
                    variant === 'compact' ? 'text-sm' : 'text-lg'
                  }`}
                >
                  {product.name}
                </h3>

                {/* Rating */}
                {renderRating(product)}

                {/* Price Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span
                      className={`font-bold text-gray-900 ${
                        variant === 'compact' ? 'text-lg' : 'text-2xl'
                      }`}
                    >
                      ${product.price.toFixed(2)}
                    </span>
                    {product.category === 'premium' &&
                      variant !== 'compact' && (
                        <span className="text-xs text-amber-600 font-medium">
                          Premium Quality
                        </span>
                      )}
                  </div>

                  {/* Quick View Button */}
                  {variant === 'featured' && (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <span className="inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition-colors">
                        View Details
                      </span>
                    </div>
                  )}
                </div>

                {/* Product Features */}
                {renderProductFeatures(product)}

                {/* Compact View Badges */}
                {variant === 'compact' && (
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant="secondary" className="text-xs">
                      {product.gender}
                    </Badge>
                    {(() => {
                      const isInStock = product.inStock === true;

                      // Calculate total stock from frameColors array
                      const totalStock =
                        product.frameColorVariants?.reduce((total, variant) => {
                          return total + (variant.stockQuantity || 0);
                        }, 0) || 0;

                      if (isInStock && totalStock > 5) {
                        return (
                          <Badge className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border-green-200">
                            In Stock
                          </Badge>
                        );
                      } else if (
                        isInStock &&
                        totalStock > 0 &&
                        totalStock <= 5
                      ) {
                        return (
                          <Badge className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                            Limited Stock
                          </Badge>
                        );
                      } else {
                        return (
                          <Badge className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 border-red-200">
                            Out of Stock
                          </Badge>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
      ))}
    </StaggeredList>
  );
}
