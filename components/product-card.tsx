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
  calculatePromotionalPricing,
} from '@/lib/utils/discount';
import { useCategoryPromotionalPricing } from '@/hooks/usePromotionalPricing';

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

  // Get promotional pricing for the product category from the database
  const productCategory = product.category as 'signature' | 'essentials';
  const hookCategory =
    productCategory === 'essentials' ? 'essential' : productCategory;
  const { categoryPricing, hasPromotions } =
    useCategoryPromotionalPricing(hookCategory);

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
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-100 text-green-800 border border-green-200">
          In Stock
        </span>
      );
    } else if (isInStock && totalStock > 0 && totalStock <= 5) {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
          Limited Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-red-100 text-red-800 border border-red-200">
          Out of Stock
        </span>
      );
    }
  };

  const renderCategoryBadge = (product: Product) => {
    if (!showCategoryBadge || !product.category) return null;

    const isSignature = product.category === 'signature';
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium ${
          isSignature
            ? 'bg-gradient-to-r from-amber-400 to-amber-500 text-white'
            : 'bg-gradient-to-r from-blue-400 to-blue-500 text-white'
        }`}
      >
        {isSignature ? 'Signature' : 'Essentials'}
      </span>
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

    // Only show features for sunglasses and glasses that have these properties
    const hasUVProtection = product.uvProtection !== undefined;
    const hasPolarized = product.polarized !== undefined;
    const hasUVBlocking = product.uvBlocking !== undefined; // For contact lenses

    if (!hasUVProtection && !hasPolarized && !hasUVBlocking) return null;

    const features = [];

    if (
      (hasUVProtection || hasUVBlocking) &&
      (product.uvProtection || product.uvBlocking)
    ) {
      features.push({
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 2L3 7v11a1 1 0 001 1h12a1 1 0 001-1V7l-7-5zM8 15V9h4v6H8z"
              clipRule="evenodd"
            />
          </svg>
        ),
        text:
          product.productType === 'contacts' ? 'UV Blocking' : 'UV Protection',
        color: 'text-blue-600',
        bgColor: 'bg-blue-50',
      });
    }

    if (hasPolarized && product.polarized) {
      features.push({
        icon: (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            />
          </svg>
        ),
        text: 'Polarized',
        color: 'text-green-600',
        bgColor: 'bg-green-50',
      });
    }

    return (
      <div className="flex flex-wrap gap-2 mt-3">
        {features.map((feature, index) => (
          <span
            key={index}
            className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium ${feature.color} ${feature.bgColor} border border-current/20`}
          >
            {feature.icon}
            {feature.text}
          </span>
        ))}
      </div>
    );
  };

  return (
    <Link href={getProductUrl()}>
      <Card className="group overflow-hidden rounded-xl shadow-sm hover:shadow-xl transition-all duration-500 border-0 bg-white">
        {/* Product Image - Clean without badges */}
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

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-all duration-300"></div>
        </div>

        {/* Product Badges Section */}
        <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100">
          <div className="flex flex-wrap gap-1.5 justify-center">
            {renderStockStatus(product)}
            {renderCategoryBadge(product)}
            {showGenderBadge && product.gender && variant !== 'compact' && (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-100 text-gray-700 border border-gray-200">
                {product.gender === 'men'
                  ? 'Men'
                  : product.gender === 'women'
                  ? 'Women'
                  : 'Unisex'}
              </span>
            )}
          </div>
        </div>

        <CardContent className={getCardPadding()}>
          <div className="space-y-3">
            {/* Color Selector */}
            {renderColorSelector()}

            {/* Product Name */}
            <h3
              className={`font-bold text-gray-900 group-hover:text-gray-700 transition-colors line-clamp-2 ${
                variant === 'compact' ? 'text-base' : 'text-xl'
              }`}
            >
              {product.name}
            </h3>

            {/* Price Section - Always reserve space for consistent height */}
            <div className="flex items-center justify-between min-h-[60px]">
              <div className="flex items-baseline gap-2">
                {(() => {
                  // Check for active promotional pricing from database first
                  if (productCategory && hasPromotions && categoryPricing) {
                    const promotionalPrice = categoryPricing.promotionalPrice;
                    const originalPrice = categoryPricing.originalPrice;
                    const savingsAmount = originalPrice - promotionalPrice;
                    const savingsPercentage = Math.round(
                      (savingsAmount / originalPrice) * 100
                    );

                    return (
                      <>
                        <div className="flex flex-col">
                          <span
                            className={`font-bold text-purple-600 ${
                              variant === 'compact' ? 'text-lg' : 'text-2xl'
                            }`}
                          >
                            {formatPrice(promotionalPrice)}
                          </span>
                          <span
                            className={`line-through text-gray-500 ${
                              variant === 'compact' ? 'text-sm' : 'text-base'
                            }`}
                          >
                            {formatPrice(originalPrice)}
                          </span>
                        </div>
                        <span className="text-xs text-purple-600 font-medium">
                          Current Offer{' '}
                          {formatSavingsPercentage(savingsPercentage)}
                        </span>
                      </>
                    );
                  }

                  // Fall back to regular discount logic from product database
                  const discountInfo = calculateDiscount(
                    product.price,
                    product.discountedPrice === ''
                      ? undefined
                      : product.discountedPrice
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
                      <>
                        <span
                          className={`font-bold text-gray-900 ${
                            variant === 'compact' ? 'text-lg' : 'text-2xl'
                          }`}
                        >
                          {formatPrice(discountInfo.displayPrice)}
                        </span>
                        <div className="flex flex-col">
                          <div className="h-[20px]"></div>{' '}
                          {/* Spacer for original price */}
                          <div className="h-[16px]"></div>{' '}
                          {/* Spacer for savings text */}
                        </div>
                      </>
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

            {/* Promotional Pricing - Always reserve space for consistent height */}
            <div className="mt-3 min-h-[48px]">
              {(product.category === 'signature' ||
                product.category === 'essentials') &&
              variant !== 'compact' ? (
                <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500 p-0.5 shadow-lg">
                  <div className="relative bg-white rounded-[10px] p-3">
                    {/* Animated background elements */}
                    <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-orange-50 opacity-60"></div>
                    <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-amber-200 to-orange-200 rounded-full opacity-20 -translate-y-2 translate-x-2"></div>
                    <div className="absolute bottom-0 left-0 w-12 h-12 bg-gradient-to-br from-orange-200 to-amber-200 rounded-full opacity-20 translate-y-2 -translate-x-2"></div>

                    {/* Main content */}
                    <div className="relative z-10">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full shadow-sm">
                            <span className="text-white text-xs font-bold">
                              🎉
                            </span>
                          </div>
                          <span className="text-amber-800 font-semibold text-sm">
                            Buy Two & Save
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <div className="w-2 h-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full animate-pulse"></div>
                          <div
                            className="w-2 h-2 bg-gradient-to-br from-orange-500 to-amber-500 rounded-full animate-pulse"
                            style={{ animationDelay: '0.2s' }}
                          ></div>
                          <div
                            className="w-2 h-2 bg-gradient-to-br from-amber-500 to-orange-500 rounded-full animate-pulse"
                            style={{ animationDelay: '0.4s' }}
                          ></div>
                        </div>
                      </div>

                      <div className="bg-gradient-to-r from-amber-100 to-orange-100 rounded-lg p-2 border border-amber-200">
                        <div className="text-center">
                          <span className="text-amber-900 font-bold text-sm">
                            {(() => {
                              // Use promotional price from database if available, otherwise use regular price
                              const basePriceForTwo =
                                hasPromotions && categoryPricing
                                  ? categoryPricing.promotionalPrice
                                  : product.price;

                              const promotionalTwoForPricing =
                                calculatePromotionalPricing(
                                  basePriceForTwo,
                                  product.category as 'essentials' | 'signature'
                                );
                              return `Two for ${formatPrice(
                                promotionalTwoForPricing.twoForPrice
                              )}`;
                            })()}
                          </span>
                          <div className="mt-1">
                            <span className="inline-flex items-center px-2 py-1 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-semibold rounded-full shadow-sm">
                              Save{' '}
                              {(() => {
                                const basePriceForTwo =
                                  hasPromotions && categoryPricing
                                    ? categoryPricing.promotionalPrice
                                    : product.price;

                                const promotionalTwoForPricing =
                                  calculatePromotionalPricing(
                                    basePriceForTwo,
                                    product.category as
                                      | 'essentials'
                                      | 'signature'
                                  );
                                return formatSavingsPercentage(
                                  promotionalTwoForPricing.savingsPercentage
                                );
                              })()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-[48px]"></div>
              )}
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
