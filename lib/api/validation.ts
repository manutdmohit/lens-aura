import { z } from 'zod';

// User validation schemas
export const registerUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  phoneNumber: z.string().optional(),
});

export const loginUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const updateUserSchema = z.object({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phoneNumber: z.string().optional(),
});

export const addressSchema = z.object({
  type: z.enum(['shipping', 'billing']),
  street: z.string().min(1, 'Street is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  isDefault: z.boolean().optional(),
});

// Product validation schemas
export const baseProductSchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  description: z.string().min(1, 'Product description is required'),
  price: z.number().min(0, 'Price cannot be negative'),
  imageUrl: z.string().url('Image URL must be a valid URL'),
  stockQuantity: z.number().int().min(0, 'Stock quantity cannot be negative'),
  category: z.enum(['glasses', 'sunglasses', 'contacts']),
  colors: z.array(z.string()).optional(),
  productType: z.enum(['Glasses', 'Sunglasses', 'ContactLenses', 'Accessory']),
});

export const glassesSchema = baseProductSchema.extend({
  frameType: z.enum(['full-rim', 'semi-rimless', 'rimless']),
  frameMaterial: z.enum(['acetate', 'metal', 'titanium', 'plastic', 'mixed']),
  frameWidth: z.enum(['narrow', 'medium', 'wide']),
  frameColor: z.array(z.string()),
  lensType: z.enum([
    'single-vision',
    'bifocal',
    'progressive',
    'reading',
    'non-prescription',
  ]),
  prescriptionType: z.enum([
    'distance',
    'reading',
    'multifocal',
    'non-prescription',
  ]),
  gender: z.enum(['men', 'women', 'unisex']),
});

export const sunglassesSchema = baseProductSchema.extend({
  frameType: z.enum(['full-rim', 'semi-rimless', 'rimless']),
  frameMaterial: z.enum(['acetate', 'metal', 'titanium', 'plastic', 'mixed']),
  frameWidth: z.enum(['narrow', 'medium', 'wide']),
  frameColor: z.array(z.string()),
  lensColor: z.string(),
  uvProtection: z.boolean(),
  polarized: z.boolean(),
  style: z.enum([
    'aviator',
    'wayfarer',
    'round',
    'square',
    'cat-eye',
    'sport',
    'oversized',
    'other',
  ]),
  gender: z.enum(['men', 'women', 'unisex']),
});

export const contactLensesSchema = baseProductSchema.extend({
  brand: z.string(),
  packagingType: z.enum(['box', 'vial', 'blister-pack']),
  wearDuration: z.enum([
    'daily',
    'weekly',
    'bi-weekly',
    'monthly',
    'quarterly',
    'yearly',
  ]),
  replacementFrequency: z.enum([
    'daily',
    'weekly',
    'bi-weekly',
    'monthly',
    'quarterly',
    'yearly',
  ]),
  waterContent: z.number().min(0).max(100),
  diameter: z.number().min(0),
  baseCurve: z.number().min(0),
  quantity: z.number().int().min(1),
  forAstigmatism: z.boolean().optional(),
  forPresbyopia: z.boolean().optional(),
  uvBlocking: z.boolean().optional(),
});

export const accessorySchema = baseProductSchema.extend({
  type: z.enum(['glasses', 'sunglasses', 'contacts', 'accessory']),
  colors: z.array(z.string()).optional(),
});

// Order validation schemas
export const orderItemSchema = z.object({
  product: z.string(),
  productType: z.enum(['Glasses', 'Sunglasses', 'ContactLenses']),
  quantity: z.number().int().min(1),
  price: z.number().min(0),
  color: z.string().optional(),
  name: z.string(),
  imageUrl: z.string(),
});

export const shippingAddressSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  street: z.string().min(1),
  city: z.string().min(1),
  state: z.string().min(1),
  postalCode: z.string().min(1),
  country: z.string().min(1),
  phoneNumber: z.string().optional(),
});

export const createOrderSchema = z.object({
  items: z.array(orderItemSchema),
  shippingAddress: shippingAddressSchema,
  shippingMethod: z.enum(['standard', 'express', 'overnight']),
  paymentMethod: z.enum([
    'credit_card',
    'paypal',
    'apple_pay',
    'google_pay',
    'other',
  ]),
  discountCode: z.string().optional(),
});

// Review validation schema
export const reviewSchema = z.object({
  product: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(1),
  comment: z.string().min(1),
});

// Consolidated product schema
export const productSchema = z.object({
  id: z.string().optional(),
  slug: z.string().optional(),
  name: z
    .string()
    .min(2, { message: 'Product name must be at least 2 characters' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters' }),
  price: z.coerce
    .number({ invalid_type_error: 'Price must be a number' })
    .positive({ message: 'Price must be positive' }),
  imageUrl: z.string().min(1, { message: 'Please provide an image URL' }),
  stockQuantity: z.coerce
    .number({ invalid_type_error: 'Stock quantity must be a number' })
    .int({ message: 'Stock quantity must be a whole number' })
    .nonnegative({ message: 'Stock quantity cannot be negative' }),
  productType: z.enum(['glasses', 'sunglasses', 'contacts', 'accessory'], {
    errorMap: () => ({ message: 'Please select a valid product type' }),
  }),
  colors: z.array(z.string()).optional().default([]),
  inStock: z.boolean().default(true),
  status: z.enum(['active', 'inactive'], {
    errorMap: () => ({ message: 'Invalid status' }),
  }),

  // Shared: Glasses & Sunglasses
  frameType: z.enum(['full-rim', 'semi-rimless', 'rimless']).optional(),
  frameMaterial: z
    .enum(['acetate', 'metal', 'titanium', 'plastic', 'mixed'])
    .optional(),
  frameWidth: z.enum(['narrow', 'medium', 'wide']).optional(),
  frameColor: z.array(z.string()).optional(),
  gender: z.enum(['men', 'women', 'unisex']).optional(),

  // Glasses
  lensType: z
    .enum([
      'single-vision',
      'bifocal',
      'progressive',
      'reading',
      'non-prescription',
    ])
    .optional(),
  prescriptionType: z
    .enum(['distance', 'reading', 'multifocal', 'non-prescription'])
    .optional(),

  // Sunglasses
  lensColor: z.string().optional(),
  uvProtection: z.boolean().default(false).optional(),
  polarized: z.boolean().default(false).optional(),
  style: z
    .enum([
      'aviator',
      'wayfarer',
      'round',
      'square',
      'cat-eye',
      'sport',
      'oversized',
      'other',
    ])
    .optional(),

  // Contact Lenses
  brand: z.string().optional(),
  packagingType: z.enum(['box', 'vial', 'blister-pack']).optional(),
  wearDuration: z
    .enum(['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'])
    .optional(),
  replacementFrequency: z
    .enum(['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'])
    .optional(),
  waterContent: z.coerce.number().optional(),
  diameter: z.coerce.number().optional(),
  baseCurve: z.coerce.number().optional(),
  quantity: z.coerce.number().optional(),
  forAstigmatism: z.boolean().default(false).optional(),
  forPresbyopia: z.boolean().default(false).optional(),
  uvBlocking: z.boolean().default(false).optional(),
});

export type ProductFormValues = z.infer<typeof productSchema>;