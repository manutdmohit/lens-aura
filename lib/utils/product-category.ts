import type { IProduct } from '@/models';

/**
 * Determine if a product belongs to the Signature collection
 */
export function isSignatureProduct(product: IProduct): boolean {
  // Check if the product name or category contains "signature" indicators
  const signatureIndicators = [
    'signature',
    'premium',
    'luxury',
    'deluxe',
    'professional',
    'advanced',
  ];

  const productText = `${product.name} ${product.category || ''} ${
    product.description || ''
  }`.toLowerCase();

  return signatureIndicators.some((indicator) =>
    productText.includes(indicator)
  );
}

/**
 * Determine if a product belongs to the Essential collection
 */
export function isEssentialProduct(product: IProduct): boolean {
  // Check if the product name or category contains "essential" indicators
  const essentialIndicators = [
    'essential',
    'basic',
    'standard',
    'classic',
    'simple',
    'everyday',
    'starter',
  ];

  const productText = `${product.name} ${product.category || ''} ${
    product.description || ''
  }`.toLowerCase();

  return essentialIndicators.some((indicator) =>
    productText.includes(indicator)
  );
}

/**
 * Get the product category for promotional pricing
 */
export function getProductCategory(
  product: IProduct
): 'signature' | 'essential' | 'unknown' {
  if (isSignatureProduct(product)) {
    return 'signature';
  }

  if (isEssentialProduct(product)) {
    return 'essential';
  }

  return 'unknown';
}

/**
 * Check if a product is eligible for promotional pricing
 */
export function isEligibleForPromotionalPricing(product: IProduct): boolean {
  const category = getProductCategory(product);
  return category === 'signature' || category === 'essential';
}
