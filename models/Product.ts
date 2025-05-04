import mongoose from 'mongoose';
import { Schema, type Document, type Model } from 'mongoose';
import slugify from 'slugify';

export interface IProduct extends Document {
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  inStock: boolean;
  productType: 'glasses' | 'sunglasses' | 'contacts';
  colors: string[];
  status: 'active' | 'inactive';
  createdAt: Date;
  updatedAt: Date;

  // Common Glasses & Sunglasses fields
  frameType?: 'full-rim' | 'semi-rimless' | 'rimless';
  frameMaterial?: 'acetate' | 'metal' | 'titanium' | 'plastic' | 'mixed';
  frameWidth?: 'narrow' | 'medium' | 'wide';
  frameColor?: string[];
  gender?: 'men' | 'women' | 'unisex';

  // Glasses-specific
  lensType?:
    | 'single-vision'
    | 'bifocal'
    | 'progressive'
    | 'reading'
    | 'non-prescription';
  prescriptionType?: 'distance' | 'reading' | 'multifocal' | 'non-prescription';

  // Sunglasses-specific
  lensColor?: string;
  uvProtection?: boolean;
  polarized?: boolean;
  style?:
    | 'aviator'
    | 'wayfarer'
    | 'round'
    | 'square'
    | 'cat-eye'
    | 'sport'
    | 'oversized'
    | 'other';

  // Contact Lenses-specific
  brand?: string;
  packagingType?: 'box' | 'vial' | 'blister-pack';
  wearDuration?:
    | 'daily'
    | 'weekly'
    | 'bi-weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly';
  replacementFrequency?:
    | 'daily'
    | 'weekly'
    | 'bi-weekly'
    | 'monthly'
    | 'quarterly'
    | 'yearly';
  waterContent?: number;
  diameter?: number;
  baseCurve?: number;
  quantity?: number;
  forAstigmatism?: boolean;
  forPresbyopia?: boolean;
  uvBlocking?: boolean;
}

const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    slug: { type: String, required: true, trim: true },
    description: {
      type: String,
      required: [true, 'Product description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    imageUrl: {
      type: String,
      required: [true, 'Product image URL is required'],
    },
    stockQuantity: {
      type: Number,
      required: [true, 'Stock quantity is required'],
      min: [0, 'Stock quantity cannot be negative'],
      default: 0,
    },
    inStock: {
      type: Boolean,
      default: true,
    },
    productType: {
      type: String,
      required: true,
      enum: ['glasses', 'sunglasses', 'contacts'],
    },
    colors: [{
      name: String,
      hex: String,
    }],
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },

    // Shared: Glasses & Sunglasses
    frameType: { type: String, enum: ['full-rim', 'semi-rimless', 'rimless'] },
    frameMaterial: {
      type: String,
      enum: ['acetate', 'metal', 'titanium', 'plastic', 'mixed'],
    },
    frameWidth: { type: String, enum: ['narrow', 'medium', 'wide'] },
    frameColor: { type: [String], default: [] },
    gender: { type: String, enum: ['men', 'women', 'unisex'] },

    // Glasses
    lensType: {
      type: String,
      enum: [
        'single-vision',
        'bifocal',
        'progressive',
        'reading',
        'non-prescription',
      ],
    },
    prescriptionType: {
      type: String,
      enum: ['distance', 'reading', 'multifocal', 'non-prescription'],
    },

    // Sunglasses
    lensColor: { type: String },
    uvProtection: { type: Boolean },
    polarized: { type: Boolean },
    style: {
      type: String,
      enum: [
        'aviator',
        'wayfarer',
        'round',
        'square',
        'cat-eye',
        'sport',
        'oversized',
        'other',
      ],
    },

    // Contact Lenses
    brand: { type: String },
    packagingType: { type: String, enum: ['box', 'vial', 'blister-pack'] },
    wearDuration: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'],
    },
    replacementFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'bi-weekly', 'monthly', 'quarterly', 'yearly'],
    },
    waterContent: { type: Number },
    diameter: { type: Number },
    baseCurve: { type: Number },
    quantity: { type: Number },
    forAstigmatism: { type: Boolean },
    forPresbyopia: { type: Boolean },
    uvBlocking: { type: Boolean },
  },
  {
    timestamps: true,
    discriminatorKey: 'productType',
  }
);

// Automatically generate slug
ProductSchema.pre<IProduct>('validate', async function (next) {
  if (this.isModified('name') || !this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slugToUse = baseSlug;
    let counter = 1;

    const ProductModel = this.constructor as Model<IProduct>;

    while (await ProductModel.exists({ slug: slugToUse })) {
      slugToUse = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slugToUse;
  }

  next();
});

// Automatically set inStock on save
ProductSchema.pre('save', async function (next) {
  this.inStock = this.stockQuantity > 0;

  if (this.isModified('name') || !this.slug) {
    let baseSlug = slugify(this.name, { lower: true, strict: true });
    let slugToUse = baseSlug;
    let counter = 1;

    const ProductModel = this.constructor as Model<IProduct>;

    while (await ProductModel.exists({ slug: slugToUse })) {
      slugToUse = `${baseSlug}-${counter}`;
      counter++;
    }

    this.slug = slugToUse;
  }
  next();
});

// Update the updatedAt field before saving
ProductSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Update the updatedAt field before updating
ProductSchema.pre('findOneAndUpdate', function(next) {
  this.set({ updatedAt: new Date() });
  next();
});

// Ensure stockQuantity and inStock are in sync
ProductSchema.pre('save', function(next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

// Ensure stockQuantity and inStock are in sync for updates
ProductSchema.pre('findOneAndUpdate', function(next) {
  const update = this.getUpdate() as { $set?: { stockQuantity?: number } };
  const stockQuantity = update?.$set?.stockQuantity;
  if (stockQuantity !== undefined) {
    this.set({ inStock: stockQuantity > 0 });
  }
  next();
});

// Create indexes for better query performance
ProductSchema.index({ name: 'text', description: 'text' });
ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ inStock: 1 });

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
