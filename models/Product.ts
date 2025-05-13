import { mongoose } from '@/lib/mongoose/db-config';
import { Schema, type Document, type Model } from 'mongoose';
import slugify from 'slugify';

export interface IProduct extends Document {
  _id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  inStock: boolean;
  productType: 'glasses' | 'sunglasses' | 'contacts' | 'accessory';
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
    name: { type: String, required: true, trim: true, index: true },
    slug: { type: String, required: true, trim: true, index: true },
    description: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    imageUrl: { type: String, required: true },
    stockQuantity: { type: Number, required: true, min: 0, default: 0 },
    inStock: {
      type: Boolean,
      default: function (this: IProduct) {
        return this.stockQuantity > 0;
      },
    },
    productType: {
      type: String,
      required: true,
      enum: ['glasses', 'sunglasses', 'contacts', 'accessory'],
    },
    colors: { type: [String], default: [] },
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

const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;