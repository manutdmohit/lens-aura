import { getActivePromotions } from '@/actions/promotions';

export interface PromotionalPricing {
  originalPrice: number;
  promotionalPrice: number;
  priceForTwo: number;
  isPromotional: boolean;
  promotionName?: string;
}

export interface ProductPricing {
  signature: PromotionalPricing;
  essential: PromotionalPricing;
}

/**
 * Get promotional pricing for products based on active promotions
 */
export async function getPromotionalPricing(): Promise<ProductPricing | null> {
  try {
    console.log('🔍 Fetching promotional pricing...');
    const result = await getActivePromotions(1);
    console.log('🔍 getActivePromotions result:', result);

    if (
      !result.success ||
      !result.promotions ||
      result.promotions.length === 0
    ) {
      console.log('🔍 No active promotions found, returning null');
      console.log(
        '🔍 This should trigger fallback to product database pricing'
      );
      return null;
    }

    const activePromotion = result.promotions[0];
    console.log('🔍 Active promotion found:', activePromotion);
    console.log('🔍 Promotion isActive value:', activePromotion.isActive);

    return {
      signature: {
        originalPrice: activePromotion.signatureOriginalPrice,
        promotionalPrice: activePromotion.signatureDiscountedPrice,
        priceForTwo: activePromotion.signaturePriceForTwo,
        isPromotional: true,
        promotionName: activePromotion.offerName,
      },
      essential: {
        originalPrice: activePromotion.essentialOriginalPrice,
        promotionalPrice: activePromotion.essentialDiscountedPrice,
        priceForTwo: activePromotion.essentialPriceForTwo,
        isPromotional: true,
        promotionName: activePromotion.offerName,
      },
    };
  } catch (error) {
    console.error('Failed to get promotional pricing:', error);
    return null;
  }
}

/**
 * Get promotional pricing for a specific product category
 */
export async function getCategoryPromotionalPricing(
  category: 'signature' | 'essential'
): Promise<PromotionalPricing | null> {
  try {
    const promotionalPricing = await getPromotionalPricing();

    if (!promotionalPricing) {
      return null;
    }

    return promotionalPricing[category];
  } catch (error) {
    console.error(`Failed to get ${category} promotional pricing:`, error);
    return null;
  }
}

/**
 * Get the best price for a product (promotional or regular)
 * Note: This function is designed to work with the existing product database pricing
 * When no promotion is active, it returns the regularPrice parameter
 */
export async function getBestPrice(
  category: 'signature' | 'essential',
  regularPrice: number
): Promise<{
  price: number;
  isPromotional: boolean;
  promotionName?: string;
  originalPrice?: number;
}> {
  try {
    const promotionalPricing = await getCategoryPromotionalPricing(category);

    if (!promotionalPricing) {
      // No active promotion - use product database price
      return {
        price: regularPrice,
        isPromotional: false,
      };
    }

    // Active promotion - use promotional pricing
    return {
      price: promotionalPricing.promotionalPrice,
      isPromotional: true,
      promotionName: promotionalPricing.promotionName,
      originalPrice: promotionalPricing.originalPrice,
    };
  } catch (error) {
    console.error(`Failed to get best price for ${category}:`, error);
    // Error fallback - use product database price
    return {
      price: regularPrice,
      isPromotional: false,
    };
  }
}

/**
 * Get price for two products with promotional pricing
 */
export async function getPriceForTwo(
  category: 'signature' | 'essential'
): Promise<{
  price: number;
  isPromotional: boolean;
  promotionName?: string;
}> {
  try {
    const promotionalPricing = await getCategoryPromotionalPricing(category);

    if (!promotionalPricing) {
      // Fallback to regular pricing (you can adjust this logic)
      return {
        price: 0, // This will need to be handled by the calling component
        isPromotional: false,
      };
    }

    return {
      price: promotionalPricing.priceForTwo,
      isPromotional: true,
      promotionName: promotionalPricing.promotionName,
    };
  } catch (error) {
    console.error(`Failed to get price for two for ${category}:`, error);
    return {
      price: 0,
      isPromotional: false,
    };
  }
}

/**
 * Check if there are any active promotions
 */
export async function hasActivePromotions(): Promise<boolean> {
  try {
    const promotionalPricing = await getPromotionalPricing();
    return promotionalPricing !== null;
  } catch (error) {
    console.error('Failed to check for active promotions:', error);
    return false;
  }
}
