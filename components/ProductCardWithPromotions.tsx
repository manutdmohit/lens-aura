'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCategoryPromotionalPricing } from '@/hooks/usePromotionalPricing';
import { getProductCategory } from '@/lib/utils/product-category';
import { formatPrice } from '@/lib/utils/discount';
import type { IProduct } from '@/models';

interface ProductCardWithPromotionsProps {
  product: IProduct;
  className?: string;
}

export default function ProductCardWithPromotions({
  product,
  className = '',
}: ProductCardWithPromotionsProps) {
  const router = useRouter();
  const [imageError, setImageError] = useState(false);

  const productCategory = getProductCategory(product);
  const { categoryPricing, loading, hasPromotions, refreshPromotionalPricing } =
    useCategoryPromotionalPricing(productCategory as 'signature' | 'essential');

  // Debug logging
  console.log('🔍 ProductCard Debug:', {
    productName: product.name,
    productCategory,
    hasPromotions,
    categoryPricing,
    loading,
  });

  const handleImageError = () => {
    setImageError(true);
  };

  const handleProductClick = () => {
    router.push(`/products/${product.slug}`);
  };

  // Determine the best price to display
  const getDisplayPrice = () => {
    console.log('🔍 getDisplayPrice called with:', {
      productCategory,
      hasPromotions,
      categoryPricing: categoryPricing ? 'exists' : 'null',
      productDiscountedPrice: product.discountedPrice,
      productPrice: product.price,
    });

    // When promotion is active and product is eligible
    if (productCategory !== 'unknown' && hasPromotions && categoryPricing) {
      console.log('🔍 Using PROMOTIONAL pricing:', {
        promotionalPrice: categoryPricing.promotionalPrice,
        originalPrice: categoryPricing.originalPrice,
      });
      return {
        currentPrice: categoryPricing.promotionalPrice,
        originalPrice: categoryPricing.originalPrice,
        isPromotional: true,
        promotionName: categoryPricing.promotionName,
      };
    }

    // Fallback to product database pricing
    if (product.discountedPrice && product.discountedPrice > 0) {
      console.log('🔍 Using PRODUCT DATABASE discounted pricing:', {
        discountedPrice: product.discountedPrice,
        originalPrice: product.price,
      });
      return {
        currentPrice: product.discountedPrice,
        originalPrice: product.price,
        isPromotional: false,
      };
    }

    console.log('🔍 Using PRODUCT DATABASE regular pricing:', {
      price: product.price,
    });
    return {
      currentPrice: product.price,
      originalPrice: null,
      isPromotional: false,
    };
  };

  const pricing = getDisplayPrice();

  return (
    <div
      className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer ${className}`}
      onClick={handleProductClick}
    >
      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg">
        {!imageError && product.images && product.images.length > 0 ? (
          <img
            src={product.images[0]}
            alt={product.name}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            onError={handleImageError}
          />
        ) : (
          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
            <span className="text-gray-400 text-sm">No Image</span>
          </div>
        )}

        {/* Promotion Badge */}
        {pricing.isPromotional && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
            SALE
          </div>
        )}

        {/* Category Badge */}
        {productCategory !== 'unknown' && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white text-xs px-2 py-1 rounded-full capitalize">
            {productCategory}
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        {/* Product Name and Refresh Button */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {product.name}
          </h3>
          <button
            onClick={(e) => {
              e.stopPropagation();
              refreshPromotionalPricing();
            }}
            className="ml-2 p-1 text-gray-400 hover:text-blue-600 transition-colors"
            title="Refresh pricing"
          >
            🔄
          </button>
        </div>

        {/* Product Description */}
        {product.description && (
          <p className="text-gray-600 text-sm mb-3 line-clamp-2">
            {product.description}
          </p>
        )}

        {/* Pricing */}
        <div className="mb-3">
          {/* Current Price */}
          <div className="text-xl font-bold text-green-600">
            {formatPrice(pricing.currentPrice)}
          </div>

          {/* Original Price (if different) */}
          {pricing.originalPrice &&
            pricing.originalPrice !== pricing.currentPrice && (
              <div className="text-sm text-gray-500 line-through">
                {formatPrice(pricing.originalPrice)}
              </div>
            )}

          {/* Promotion Name */}
          {pricing.isPromotional && pricing.promotionName && (
            <div className="text-xs text-green-600 font-medium mt-1">
              {pricing.promotionName}
            </div>
          )}
        </div>

        {/* Price for Two */}
        {pricing.isPromotional && categoryPricing ? (
          // Promotional "Buy 2" pricing
          <div className="text-sm text-blue-600 font-medium mb-3">
            Buy 2: {formatPrice(categoryPricing.priceForTwo)}
          </div>
        ) : (
          // Regular "Buy 2" pricing from product database
          <div className="text-sm text-gray-600 mb-3">
            Buy 2: {formatPrice(pricing.currentPrice * 2)}
          </div>
        )}

        {/* Product Details */}
        <div className="text-xs text-gray-500 space-y-1">
          {product.brand && <div>Brand: {product.brand}</div>}
          {product.category && <div>Category: {product.category}</div>}
          {product.stock && (
            <div
              className={product.stock > 0 ? 'text-green-600' : 'text-red-600'}
            >
              {product.stock > 0
                ? `In Stock (${product.stock})`
                : 'Out of Stock'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
