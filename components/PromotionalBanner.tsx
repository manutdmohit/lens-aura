'use client';

import { usePromotionalPricing } from '@/hooks/usePromotionalPricing';
import { formatPrice } from '@/lib/utils/discount';

export default function PromotionalBanner() {
  const { promotionalPricing, loading, hasPromotions } =
    usePromotionalPricing();

  if (loading || !hasPromotions) {
    return null;
  }

  const pricing = promotionalPricing!;

  return (
    <div className="bg-gradient-to-r from-green-500 to-blue-600 text-white py-4 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row items-center justify-between">
          {/* Promotion Message */}
          <div className="text-center md:text-left mb-4 md:mb-0">
            <h2 className="text-xl font-bold mb-2">
              🎉 Special Promotion Active!
            </h2>
            <p className="text-green-100">
              Limited time offers on our Signature and Essential collections
            </p>
          </div>

          {/* Pricing Highlights */}
          <div className="flex flex-col sm:flex-row gap-6 text-center">
            {/* Signature Collection */}
            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-sm text-green-100 mb-1">
                Signature Collection
              </div>
              <div className="text-lg font-bold">
                {formatPrice(pricing.signature.promotionalPrice)}
              </div>
              <div className="text-xs text-green-200 line-through">
                {formatPrice(pricing.signature.originalPrice)}
              </div>
              <div className="text-xs text-green-100 mt-1">
                Buy 2: {formatPrice(pricing.signature.priceForTwo)}
              </div>
            </div>

            {/* Essential Collection */}
            <div className="bg-white/20 rounded-lg p-3 backdrop-blur-sm">
              <div className="text-sm text-green-100 mb-1">
                Essential Collection
              </div>
              <div className="text-lg font-bold">
                {formatPrice(pricing.essential.promotionalPrice)}
              </div>
              <div className="text-xs text-green-200 line-through">
                {formatPrice(pricing.essential.originalPrice)}
              </div>
              <div className="text-xs text-green-100 mt-1">
                Buy 2: {formatPrice(pricing.essential.priceForTwo)}
              </div>
            </div>
          </div>

          {/* CTA Button */}
          <div className="mt-4 md:mt-0">
            <button className="bg-white text-green-600 px-6 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors">
              Shop Now
            </button>
          </div>
        </div>

        {/* Promotion Name */}
        <div className="text-center mt-3">
          <span className="text-sm text-green-100">
            Promotion: {pricing.signature.promotionName}
          </span>
        </div>
      </div>
    </div>
  );
}
