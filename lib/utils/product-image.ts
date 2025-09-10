import type { IProduct } from '@/models';

/**
 * Get the correct product image based on the selected color
 * For glasses/sunglasses: returns the image from the matching frameColorVariant
 * For contacts/accessories: returns the product thumbnail or first image
 */
export function getProductImage(
  product: IProduct,
  selectedColor: string | { name: string; hex: string; _id?: string }
): string {
  // For glasses and sunglasses, use frameColorVariants
  if (
    (product.productType === 'glasses' ||
      product.productType === 'sunglasses') &&
    product.frameColorVariants &&
    product.frameColorVariants.length > 0
  ) {
    // Normalize color to string for comparison
    const colorName =
      typeof selectedColor === 'string' ? selectedColor : selectedColor.name;

    // Find the matching color variant
    const matchingVariant = product.frameColorVariants.find(
      (variant) => variant.color.name === colorName
    );

    // Return the first image from the matching variant, or fallback to thumbnail
    if (
      matchingVariant &&
      matchingVariant.images &&
      matchingVariant.images.length > 0
    ) {
      return matchingVariant.images[0];
    }
  }

  // For contacts/accessories or fallback, use thumbnail or first image
  if (product.images && product.images.length > 0) {
    return product.images[0];
  }

  return product.thumbnail || '/placeholder.svg';
}

/**
 * Get all available images for a product based on selected color
 * For glasses/sunglasses: returns images from the matching frameColorVariant
 * For contacts/accessories: returns all product images
 */
export function getProductImages(
  product: IProduct,
  selectedColor: string | { name: string; hex: string; _id?: string }
): string[] {
  // For glasses and sunglasses, use frameColorVariants
  if (
    (product.productType === 'glasses' ||
      product.productType === 'sunglasses') &&
    product.frameColorVariants &&
    product.frameColorVariants.length > 0
  ) {
    // Normalize color to string for comparison
    const colorName =
      typeof selectedColor === 'string' ? selectedColor : selectedColor.name;

    // Find the matching color variant
    const matchingVariant = product.frameColorVariants.find(
      (variant) => variant.color.name === colorName
    );

    // Return images from the matching variant
    if (
      matchingVariant &&
      matchingVariant.images &&
      matchingVariant.images.length > 0
    ) {
      return matchingVariant.images;
    }
  }

  // For contacts/accessories or fallback, use all product images
  if (product.images && product.images.length > 0) {
    return product.images;
  }

  // Final fallback
  return [product.thumbnail || '/placeholder.svg'];
}
