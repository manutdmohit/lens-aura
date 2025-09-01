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

/**
 * Calculate August-September 2025 promotional pricing
 * Signature: $79, Essentials: $39
 */
export function calculateSeptember2025Pricing(
  originalPrice: number,
  category: 'signature' | 'essentials'
): {
  promotionalPrice: number;
  savings: number;
  savingsPercentage: number;
  isActive: boolean;
  saleMonth: 'August' | 'September' | null;
} {
  const now = new Date();
  const startDate = new Date('2025-08-31T00:00:00Z'); // Start from today (August 31, 2025)
  const endDate = new Date('2025-09-30T23:59:59Z');

  const isActive = now >= startDate && now <= endDate;

  if (!isActive) {
    return {
      promotionalPrice: originalPrice,
      savings: 0,
      savingsPercentage: 0,
      isActive: false,
      saleMonth: null,
    };
  }

  let promotionalPrice: number;

  if (category === 'signature') {
    promotionalPrice = 79;
  } else if (category === 'essentials') {
    promotionalPrice = 39;
  } else {
    return {
      promotionalPrice: originalPrice,
      savings: 0,
      savingsPercentage: 0,
      isActive: false,
      saleMonth: null,
    };
  }

  const savings = originalPrice - promotionalPrice;
  const savingsPercentage = Math.round((savings / originalPrice) * 100);

  // Determine which month the sale is active in
  const currentMonth = now.getMonth(); // 7 for August, 8 for September
  const saleMonth = currentMonth === 7 ? 'August' : 'September';

  return {
    promotionalPrice,
    savings,
    savingsPercentage,
    isActive: true,
    saleMonth,
  };
}
