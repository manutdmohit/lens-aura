'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import Image from 'next/image';
import { useState } from 'react';

// Use the same Product type as the existing ProductGrid
import type { ProductFormValues as Product } from '@/lib/api/validation';
import {
  calculateDiscount,
  formatPrice,
  formatSavingsPercentage,
} from '@/lib/utils/discount';

interface ProductCardProps {
  product: Product;
  variant?: 'default' | 'compact' | 'featured';
  showFeatures?: boolean;
  showStockStatus?: boolean;
  showCategoryBadge?: boolean;
  showGenderBadge?: boolean;
  showColorSelector?: boolean;
}

export default function ProductCard({
  product,
  variant = 'default',
  showFeatures = true,
  showStockStatus = true,
  showCategoryBadge = true,
  showGenderBadge = true,
  showColorSelector = true,
}: ProductCardProps) {
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);

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

  const getProductUrl = () => {
    return `/${
      product.productType === 'accessory' ? 'accessories' : product.productType
    }/${product.slug}`;
  };

  // Get current image based on selected color
  const getCurrentImage = () => {
    if (product.frameColorVariants && product.frameColorVariants.length > 0) {
      const selectedVariant = product.frameColorVariants[selectedColorIndex];
      if (
        selectedVariant &&
        selectedVariant.images &&
        selectedVariant.images.length > 0
      ) {
        return selectedVariant.images[0];
      }
    }
    return product.thumbnail || '/placeholder.svg';
  };

  // Get current image with key for smooth transitions
  const currentImage = getCurrentImage();

  // Handle color selection
  const handleColorSelect = (index: number, e: React.MouseEvent) => {
    e.preventDefault(); // Prevent navigation
    e.stopPropagation(); // Prevent event bubbling
    setSelectedColorIndex(index);
  };

  const renderStockStatus = (product: Product) => {
    if (!showStockStatus) return null;

    const isInStock = product.inStock === true;
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
    if (!showCategoryBadge || !product.category) return null;

    const isSignature = product.category === 'signature';
    return (
      <div className="absolute top-3 right-3 z-10">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm ${
            isSignature
              ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
              : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
          }`}
        >
          {isSignature ? 'Signature' : 'Essentials'}
        </span>
      </div>
    );
  };

  const renderColorSelector = () => {
    if (
      !showColorSelector ||
      !product.frameColorVariants ||
      product.frameColorVariants.length === 0
    ) {
      return null;
    }

    const selectedVariant = product.frameColorVariants[selectedColorIndex];
    const isSingleVariant = product.frameColorVariants.length === 1;

    return (
      <div className="flex flex-col items-center gap-2">
        <div className="flex justify-center gap-2">
          {product.frameColorVariants.map((variant, index) => (
            <div
              key={index}
              className={`w-6 h-6 rounded-full border-2 transition-all duration-200 ${
                isSingleVariant
                  ? 'border-gray-400' // Static border for single variant
                  : selectedColorIndex === index
                  ? 'border-gray-800 shadow-md scale-110 cursor-pointer'
                  : 'border-gray-300 hover:border-gray-400 cursor-pointer hover:scale-110'
              }`}
              style={{
                backgroundColor: variant.color.hex,
              }}
              title={`${variant.color.name} - ${variant.lensColor}`}
              onClick={
                isSingleVariant ? undefined : (e) => handleColorSelect(index, e)
              }
            />
          ))}
        </div>
        {selectedVariant && (
          <span className="text-xs text-gray-600 font-medium text-center">
            {selectedVariant.color.name}
          </span>
        )}
      </div>
    );
  };

  const renderProductFeatures = (product: Product) => {
    if (!showFeatures || variant === 'compact') return null;

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

  return (
    <Link href={getProductUrl()}>
      <Card className="group overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 border-0 bg-white">
        <div
          className={`${getCardHeight()} relative overflow-hidden bg-gradient-to-br from-gray-50 to-white`}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="w-full h-full"
          >
            <motion.div
              key={`${
                (product as any)._id || (product as any).id
              }-${selectedColorIndex}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="w-full h-full"
            >
              <Image
                src={currentImage}
                alt={product.name}
                className="w-full h-full object-contain transition-all duration-700"
                width={500}
                height={500}
                priority={variant === 'featured'}
                style={{
                  objectPosition: 'center center',
                  transform: 'scale(1)',
                }}
              />
            </motion.div>
          </motion.div>

          {/* Stock Status Badge */}
          {renderStockStatus(product)}

          {/* Category Badge */}
          {renderCategoryBadge(product)}

          {/* Gender Badge */}
          {showGenderBadge && product.gender && variant !== 'compact' && (
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
            {/* Color Selector */}
            {renderColorSelector()}

            {/* Product Name */}
            <h3
              className={`font-semibold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 ${
                variant === 'compact' ? 'text-sm' : 'text-lg'
              }`}
            >
              {product.name}
            </h3>

            {/* Price Section */}
            <div className="flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                {(() => {
                  const discountInfo = calculateDiscount(
                    product.price,
                    product.discountedPrice
                  );

                  if (discountInfo.hasDiscount) {
                    return (
                      <>
                        <div className="flex flex-col">
                          <span
                            className={`font-bold text-red-600 ${
                              variant === 'compact' ? 'text-lg' : 'text-2xl'
                            }`}
                          >
                            {formatPrice(discountInfo.displayPrice)}
                          </span>
                          <span
                            className={`line-through text-gray-500 ${
                              variant === 'compact' ? 'text-sm' : 'text-base'
                            }`}
                          >
                            {formatPrice(discountInfo.originalPrice)}
                          </span>
                        </div>
                        <span className="text-xs text-green-600 font-medium">
                          Save{' '}
                          {formatSavingsPercentage(
                            discountInfo.savingsPercentage
                          )}
                        </span>
                      </>
                    );
                  } else {
                    return (
                      <span
                        className={`font-bold text-gray-900 ${
                          variant === 'compact' ? 'text-lg' : 'text-2xl'
                        }`}
                      >
                        {formatPrice(discountInfo.displayPrice)}
                      </span>
                    );
                  }
                })()}
                {product.category === 'signature' && variant !== 'compact' && (
                  <span className="text-xs text-amber-600 font-medium">
                    Signature Quality
                  </span>
                )}
              </div>
            </div>

            {/* Product Features */}
            {renderProductFeatures(product)}

            {/* Compact View Badges */}
            {variant === 'compact' && (
              <div className="flex items-center justify-between mt-2">
                <span className="text-xs text-gray-500">{product.gender}</span>
                {(() => {
                  const isInStock = product.inStock === true;
                  const totalStock =
                    product.frameColorVariants?.reduce((total, variant) => {
                      return total + (variant.stockQuantity || 0);
                    }, 0) || 0;

                  if (isInStock && totalStock > 5) {
                    return (
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800 border-green-200">
                        In Stock
                      </span>
                    );
                  } else if (isInStock && totalStock > 0 && totalStock <= 5) {
                    return (
                      <span className="px-2 py-1 rounded-full text-xs bg-yellow-100 text-yellow-800 border-yellow-200">
                        Limited Stock
                      </span>
                    );
                  } else {
                    return (
                      <span className="px-2 py-1 rounded-full text-xs bg-red-100 text-red-800 border-red-200">
                        Out of Stock
                      </span>
                    );
                  }
                })()}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
