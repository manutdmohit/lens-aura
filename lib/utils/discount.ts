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
  let twoForPrice: number;
  let basePrice: number;

  if (productType === 'essentials') {
    // Two essentials for $59 (current promotional pricing)
    twoForPrice = 59;
    basePrice = 39; // Current discounted price for essentials
  } else {
    // Two signature for $139 (current promotional pricing)
    twoForPrice = 139;
    basePrice = 79; // Current discounted price for signature
  }

  // Calculate savings based on current discounted price
  const regularTwoPrice = basePrice * 2;
  const savings = regularTwoPrice - twoForPrice;
  const savingsPercentage = Math.round((savings / regularTwoPrice) * 100);

  return {
    twoForPrice,
    savings,
    savingsPercentage,
  };
}

/**
 * Calculate current promotional pricing
 * Signature: $79 (was $99), Essentials: $39 (was $59)
 * Two Signature: $139, Two Essentials: $59
 *
 * Note: This function now defaults to inactive to prevent showing promotions
 * when they are not active in the database. Use the proper promotional pricing
 * system instead.
 */
export function calculateSeptember2025Pricing(
  originalPrice: number,
  category: 'signature' | 'essentials'
): {
  promotionalPrice: number;
  savings: number;
  savingsPercentage: number;
  isActive: boolean;
  saleMonth: 'Current' | null;
} {
  // Default to inactive since we're phasing out hardcoded promotions
  // Use the proper promotional pricing system instead
  const isActive = false;

  let promotionalPrice: number;
  let basePrice: number;

  if (category === 'signature') {
    promotionalPrice = 79; // Current offer price
    basePrice = 99; // Original price for signature
  } else if (category === 'essentials') {
    promotionalPrice = 39; // Current offer price
    basePrice = 59; // Original price for essentials
  } else {
    return {
      promotionalPrice: originalPrice,
      savings: 0,
      savingsPercentage: 0,
      isActive: false,
      saleMonth: null,
    };
  }

  // Calculate savings based on original price vs promotional price
  const savings = basePrice - promotionalPrice;
  const savingsPercentage = Math.round((savings / basePrice) * 100);

  return {
    promotionalPrice,
    savings,
    savingsPercentage,
    isActive,
    saleMonth: 'Current',
  };
}
