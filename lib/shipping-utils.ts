/**
 * Shipping calculation utilities
 */

/**
 * Calculate shipping cost based on subtotal
 * - Orders under $60: $10 shipping
 * - Orders $60 and above: Free shipping
 */
export function calculateShipping(subtotal: number): number {
  return subtotal < 60 ? 10 : 0;
}

/**
 * Calculate total amount including shipping
 */
export function calculateTotalWithShipping(subtotal: number): number {
  const shipping = calculateShipping(subtotal);
  return subtotal + shipping;
}

/**
 * Check if order qualifies for free shipping
 */
export function isFreeShipping(subtotal: number): boolean {
  return subtotal >= 60;
}

/**
 * Get shipping status message
 */
export function getShippingMessage(subtotal: number): string {
  if (isFreeShipping(subtotal)) {
    return 'Free shipping';
  } else {
    const amountNeeded = 60 - subtotal;
    return `Add $${amountNeeded.toFixed(2)} more for free shipping`;
  }
}

