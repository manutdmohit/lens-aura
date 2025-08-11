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
  description: z.string().min(1, 'Description is required'),
  price: z.number().min(0, 'Price must be greater than or equal to 0'),
  imageUrl: z.string().optional(),
  stockQuantity: z
    .number()
    .min(0, 'Stock quantity must be greater than or equal to 0'),
  category: z.enum(['glasses', 'sunglasses', 'contacts']),
  colors: z.array(z.string()).optional(),
  productType: z.enum(['glasses', 'sunglasses', 'contacts', 'accessory']),
  status: z.enum(['active', 'inactive']).default('active'),
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

// Frame color variant schema for organizing products by frame colors
export const frameColorVariantSchema = z.object({
  color: z.string().min(1, { message: 'Frame color is required' }),
  lensColor: z.string().min(1, { message: 'Lens color is required' }),
  stockQuantity: z.coerce
    .number({ invalid_type_error: 'Stock quantity must be a number' })
    .int({ message: 'Stock quantity must be a whole number' })
    .nonnegative({ message: 'Stock quantity cannot be negative' })
    .optional()
    .transform((val) => val ?? 0), // Convert undefined to 0 for validation
  images: z
    .array(z.string())
    .min(1, { message: 'At least one image is required per color' }),
});

// Consolidated product schema
export const productSchema = z
  .object({
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
    isFeatured: z.boolean().optional(),
    thumbnail: z.string().min(1, { message: 'Please provide an image URL' }),

    // Images field - only for contacts and accessories (glasses/sunglasses use frameColorVariants.images)
    images: z.array(z.string()).optional().default([]),

    // Stock quantity - only for contacts and accessories (glasses/sunglasses use frameColorVariants.stockQuantity)
    stockQuantity: z.coerce
      .number({ invalid_type_error: 'Stock quantity must be a number' })
      .int({ message: 'Stock quantity must be a whole number' })
      .nonnegative({ message: 'Stock quantity cannot be negative' })
      .optional(),

    productType: z.enum(['glasses', 'sunglasses', 'contacts', 'accessory'], {
      errorMap: () => ({ message: 'Please select a valid product type' }),
    }),

    // Colors field - only for contacts (as lens colors), glasses/sunglasses use frameColorVariants.color
    colors: z.array(z.string()).optional().default([]),

    inStock: z.boolean().default(true),
    status: z.enum(['active', 'inactive'], {
      errorMap: () => ({ message: 'Invalid status' }),
    }),

    // Product dimensions
    dimensions: z
      .object({
        eye: z.coerce.number().min(0).optional(),
        bridge: z.coerce.number().min(0).optional(),
        temple: z.coerce.number().min(0).optional(),
      })
      .optional(),

    // Shared: Glasses & Sunglasses - These will be conditionally required
    frameType: z.enum(['full-rim', 'semi-rimless', 'rimless']).optional(),
    frameMaterial: z
      .enum(['acetate', 'metal', 'titanium', 'plastic', 'mixed'])
      .optional(),
    frameWidth: z.enum(['narrow', 'medium', 'wide']).optional(),
    gender: z.enum(['men', 'women', 'unisex']).optional(),

    // Frame color variants - for glasses and sunglasses only
    frameColorVariants: z.array(frameColorVariantSchema).optional().default([]),

    // Glasses - These will be conditionally required
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

    // Sunglasses - These will be conditionally required
    category: z.enum(['signature', 'essentials']).optional(),
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
  })
  .refine(
    (data) => {
      // For sunglasses, category is required
      if (data.productType === 'sunglasses' && !data.category) {
        return false;
      }
      return true;
    },
    {
      message: 'Category is required for sunglasses',
      path: ['category'],
    }
  )
  .refine(
    (data) => {
      // For glasses and sunglasses, frameType is required
      if (
        (data.productType === 'glasses' || data.productType === 'sunglasses') &&
        !data.frameType
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Frame type is required for glasses and sunglasses',
      path: ['frameType'],
    }
  )
  .refine(
    (data) => {
      // For glasses and sunglasses, frameMaterial is required
      if (
        (data.productType === 'glasses' || data.productType === 'sunglasses') &&
        !data.frameMaterial
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Frame material is required for glasses and sunglasses',
      path: ['frameMaterial'],
    }
  )
  .refine(
    (data) => {
      // For glasses and sunglasses, frameWidth is required
      if (
        (data.productType === 'glasses' || data.productType === 'sunglasses') &&
        !data.frameWidth
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Frame width is required for glasses and sunglasses',
      path: ['frameWidth'],
    }
  )
  .refine(
    (data) => {
      // For glasses and sunglasses, gender is required
      if (
        (data.productType === 'glasses' || data.productType === 'sunglasses') &&
        !data.gender
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Gender is required for glasses and sunglasses',
      path: ['gender'],
    }
  )
  .refine(
    (data) => {
      // For sunglasses, style is required
      if (data.productType === 'sunglasses' && !data.style) {
        return false;
      }
      return true;
    },
    {
      message: 'Style is required for sunglasses',
      path: ['style'],
    }
  )
  .refine(
    (data) => {
      // For glasses, lensType is required
      if (data.productType === 'glasses' && !data.lensType) {
        return false;
      }
      return true;
    },
    {
      message: 'Lens type is required for glasses',
      path: ['lensType'],
    }
  )
  .refine(
    (data) => {
      // For glasses, prescriptionType is required
      if (data.productType === 'glasses' && !data.prescriptionType) {
        return false;
      }
      return true;
    },
    {
      message: 'Prescription type is required for glasses',
      path: ['prescriptionType'],
    }
  )
  .refine(
    (data) => {
      // For contacts, brand is required
      if (data.productType === 'contacts' && !data.brand) {
        return false;
      }
      return true;
    },
    {
      message: 'Brand is required for contact lenses',
      path: ['brand'],
    }
  )
  .refine(
    (data) => {
      // For contacts, packagingType is required
      if (data.productType === 'contacts' && !data.packagingType) {
        return false;
      }
      return true;
    },
    {
      message: 'Packaging type is required for contact lenses',
      path: ['packagingType'],
    }
  )
  .refine(
    (data) => {
      // For contacts, wearDuration is required
      if (data.productType === 'contacts' && !data.wearDuration) {
        return false;
      }
      return true;
    },
    {
      message: 'Wear duration is required for contact lenses',
      path: ['wearDuration'],
    }
  )
  .refine(
    (data) => {
      // For contacts, replacementFrequency is required
      if (data.productType === 'contacts' && !data.replacementFrequency) {
        return false;
      }
      return true;
    },
    {
      message: 'Replacement frequency is required for contact lenses',
      path: ['replacementFrequency'],
    }
  )
  .refine(
    (data) => {
      // For contacts, waterContent is required
      if (
        data.productType === 'contacts' &&
        (data.waterContent === undefined || data.waterContent === null)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Water content is required for contact lenses',
      path: ['waterContent'],
    }
  )
  .refine(
    (data) => {
      // For contacts, diameter is required
      if (
        data.productType === 'contacts' &&
        (data.diameter === undefined || data.diameter === null)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Diameter is required for contact lenses',
      path: ['diameter'],
    }
  )
  .refine(
    (data) => {
      // For contacts, baseCurve is required
      if (
        data.productType === 'contacts' &&
        (data.baseCurve === undefined || data.baseCurve === null)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Base curve is required for contact lenses',
      path: ['baseCurve'],
    }
  )
  .refine(
    (data) => {
      // For contacts, quantity is required
      if (
        data.productType === 'contacts' &&
        (data.quantity === undefined || data.quantity === null)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Quantity per package is required for contact lenses',
      path: ['quantity'],
    }
  )
  .refine(
    (data) => {
      // For contacts and accessories, stockQuantity is required
      if (
        (data.productType === 'contacts' || data.productType === 'accessory') &&
        (data.stockQuantity === undefined || data.stockQuantity === null)
      ) {
        return false;
      }
      return true;
    },
    {
      message: 'Stock quantity is required for contacts and accessories',
      path: ['stockQuantity'],
    }
  );

export type ProductFormValues = z.infer<typeof productSchema>;
