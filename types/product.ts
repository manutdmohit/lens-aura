// Frame color variant interface for organizing products by frame colors
export interface FrameColorVariant {
  color: string;
  lensColor: string;
  stockQuantity: number | undefined; // Allow undefined for empty state
  images: string[];
}

// Base product interface
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  inStock: boolean;
  category: string;
  colors: string[];
  productType: 'glasses' | 'sunglasses' | 'contactLenses';
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
  frameColorVariants?: FrameColorVariant[];
  dimensions?: {
    eye?: number;
    bridge?: number;
    temple?: number;
  };
}

// Glasses specific interface
export interface GlassesProduct extends Product {
  productType: 'glasses';
  frameType: 'full-rim' | 'semi-rimless' | 'rimless';
  frameMaterial: 'acetate' | 'metal' | 'titanium' | 'plastic' | 'mixed';
  frameWidth: 'narrow' | 'medium' | 'wide';
  frameColor: string[];
  lensType:
    | 'single-vision'
    | 'bifocal'
    | 'progressive'
    | 'reading'
    | 'non-prescription';
  prescriptionType: 'distance' | 'reading' | 'multifocal' | 'non-prescription';
  gender: 'men' | 'women' | 'unisex';
}

// Sunglasses specific interface
export interface SunglassesProduct extends Product {
  productType: 'sunglasses';
  category: 'signature' | 'essentials';
  frameType: 'full-rim' | 'semi-rimless' | 'rimless';
  frameMaterial: 'acetate' | 'metal' | 'titanium' | 'plastic' | 'mixed';
  frameWidth: 'narrow' | 'medium' | 'wide';
  frameColor: string[];
  frameColorVariants: FrameColorVariant[];
  lensColor: string;
  uvProtection: boolean;
  polarized: boolean;
  style:
    | 'aviator'
    | 'wayfarer'
    | 'round'
    | 'square'
    | 'cat-eye'
    | 'sport'
    | 'oversized'
    | 'other';
  gender: 'men' | 'women' | 'unisex';
}

// Contact Lenses specific interface
export interface ContactLensesProduct extends Product {
  productType: 'contactLenses';
  brand: string;
  packagingType: 'box' | 'vial' | 'blister-pack';
  wearDuration:
    | 'daily'
    | 'weekly'
    | 'bi-weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly';
  replacementFrequency:
    | 'daily'
    | 'weekly'
    | 'bi-weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly';
  waterContent: number;
  diameter: number;
  baseCurve: number;
  quantity: number;
  forAstigmatism: boolean;
  forPresbyopia: boolean;
  uvBlocking: boolean;
}

// Type guard functions to check product types
export function isGlassesProduct(product: Product): product is GlassesProduct {
  return product.productType === 'glasses';
}

export function isSunglassesProduct(
  product: Product
): product is SunglassesProduct {
  return product.productType === 'sunglasses';
}

export function isContactLensesProduct(
  product: Product
): product is ContactLensesProduct {
  return product.productType === 'contactLenses';
}
