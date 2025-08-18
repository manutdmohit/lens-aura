/**
 * Utility functions for handling product discounts
 */

export interface DiscountInfo {
  hasDiscount: boolean;
  discountedPrice: number | undefined;
  originalPrice: number;
  savings: number;
  savingsPercentage: number;
  displayPrice: number;
}

/**
 * Calculate discount information for a product
 */
export function calculateDiscount(
  originalPrice: number,
  discountedPrice?: number
): DiscountInfo {
  const hasDiscount = discountedPrice !== undefined && discountedPrice > 0;

  if (!hasDiscount) {
    return {
      hasDiscount: false,
      discountedPrice: undefined,
      originalPrice,
      savings: 0,
      savingsPercentage: 0,
      displayPrice: originalPrice,
    };
  }

  const savings = originalPrice - discountedPrice;
  const savingsPercentage = Math.round((savings / originalPrice) * 100);

  return {
    hasDiscount: true,
    discountedPrice,
    originalPrice,
    savings,
    savingsPercentage,
    displayPrice: discountedPrice,
  };
}

/**
 * Format price with currency
 */
export function formatPrice(price: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(price);
}

/**
 * Format savings amount
 */
export function formatSavings(
  savings: number,
  currency: string = 'USD'
): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(savings);
}

/**
 * Format savings percentage
 */
export function formatSavingsPercentage(percentage: number): string {
  return `${percentage}%`;
}

/**
 * Check if a product has a valid discount
 */
export function hasValidDiscount(
  originalPrice: number,
  discountedPrice?: number
): boolean {
  return (
    discountedPrice !== undefined &&
    discountedPrice > 0 &&
    discountedPrice < originalPrice
  );
}

/**
 * Get the display price (discounted if available, otherwise original)
 */
export function getDisplayPrice(
  originalPrice: number,
  discountedPrice?: number
): number {
  return hasValidDiscount(originalPrice, discountedPrice)
    ? discountedPrice!
    : originalPrice;
}

/**
 * Calculate promotional pricing for "buy two" offers
 */
export function calculatePromotionalPricing(
  originalPrice: number,
  productType: 'essentials' | 'signature'
): {
  twoForPrice: number;
  savings: number;
  savingsPercentage: number;
} {
  let multiplier: number;

  if (productType === 'essentials') {
    // Two for the price of (essentials + 0.25 * essentials) = 1.25x
    multiplier = 1.25;
  } else {
    // Two for the price of (signature + 0.5 * signature) = 1.5x
    multiplier = 1.5;
  }

  const twoForPrice = originalPrice * multiplier;
  const regularTwoPrice = originalPrice * 2;
  const savings = regularTwoPrice - twoForPrice;
  const savingsPercentage = Math.round((savings / regularTwoPrice) * 100);

  return {
    twoForPrice,
    savings,
    savingsPercentage,
  };
}
