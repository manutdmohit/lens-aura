'use client';

import { useCategoryPromotionalPricing } from '@/hooks/usePromotionalPricing';
import { formatPrice } from '@/lib/utils/format-price';

interface PromotionalPricingDisplayProps {
  category: 'signature' | 'essential';
  regularPrice: number;
  showPriceForTwo?: boolean;
  className?: string;
}

export default function PromotionalPricingDisplay({
  category,
  regularPrice,
  showPriceForTwo = false,
  className = '',
}: PromotionalPricingDisplayProps) {
  const { categoryPricing, loading, hasPromotions } =
    useCategoryPromotionalPricing(category);

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-4 bg-gray-200 rounded w-20 mb-1"></div>
        {showPriceForTwo && (
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        )}
      </div>
    );
  }

  if (!hasPromotions) {
    return (
      <div className={className}>
        <div className="text-lg font-semibold text-gray-900">
          {formatPrice(regularPrice)}
        </div>
        {showPriceForTwo && (
          <div className="text-sm text-gray-600">
            Buy 2: {formatPrice(regularPrice * 2)}
          </div>
        )}
      </div>
    );
  }

  const pricing = categoryPricing!;

  return (
    <div className={className}>
      {/* Promotional Price */}
      <div className="text-lg font-semibold text-green-600">
        {formatPrice(pricing.promotionalPrice)}
      </div>

      {/* Original Price (crossed out) */}
      <div className="text-sm text-gray-500 line-through">
        {formatPrice(pricing.originalPrice)}
      </div>

      {/* Price for Two */}
      {showPriceForTwo && (
        <div className="text-sm text-blue-600 font-medium">
          Buy 2: {formatPrice(pricing.priceForTwo)}
        </div>
      )}

      {/* Promotion Badge */}
      <div className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-1">
        {pricing.promotionName}
      </div>
    </div>
  );
}

interface PromotionalPricingBadgeProps {
  category: 'signature' | 'essential';
  className?: string;
}

export function PromotionalPricingBadge({
  category,
  className = '',
}: PromotionalPricingBadgeProps) {
  const { categoryPricing, loading, hasPromotions } =
    useCategoryPromotionalPricing(category);

  if (loading || !hasPromotions) {
    return null;
  }

  const pricing = categoryPricing!;

  return (
    <div
      className={`inline-flex items-center bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full ${className}`}
    >
      <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
      {pricing.promotionName}
    </div>
  );
}
