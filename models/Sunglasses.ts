import mongoose, { Model } from 'mongoose';
import Product, { type IProduct } from './Product';

// Sunglasses interface extending the base Product
export interface ISunglasses extends IProduct {
  frameType: 'full-rim' | 'semi-rimless' | 'rimless';
  frameMaterial: 'acetate' | 'metal' | 'titanium' | 'plastic' | 'mixed';
  frameWidth: 'narrow' | 'medium' | 'wide';
  frameColor: string[];
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

// Create the Sunglasses schema as a discriminator of Product
const SunglassesSchema = new mongoose.Schema<ISunglasses>({
  frameType: {
    type: String,
    required: [true, 'Frame type is required'],
    enum: {
      values: ['full-rim', 'semi-rimless', 'rimless'],
      message: '{VALUE} is not a valid frame type',
    },
  },
  frameMaterial: {
    type: String,
    required: [true, 'Frame material is required'],
    enum: {
      values: ['acetate', 'metal', 'titanium', 'plastic', 'mixed'],
      message: '{VALUE} is not a valid frame material',
    },
  },
  frameWidth: {
    type: String,
    required: [true, 'Frame width is required'],
    enum: {
      values: ['narrow', 'medium', 'wide'],
      message: '{VALUE} is not a valid frame width',
    },
  },
  frameColor: {
    type: [String],
    required: [true, 'Frame color is required'],
  },
  lensColor: {
    type: String,
    required: [true, 'Lens color is required'],
  },
  uvProtection: {
    type: Boolean,
    required: [true, 'UV protection information is required'],
    default: true,
  },
  polarized: {
    type: Boolean,
    required: [true, 'Polarized information is required'],
    default: false,
  },
  style: {
    type: String,
    required: [true, 'Style is required'],
    enum: {
      values: [
        'aviator',
        'wayfarer',
        'round',
        'square',
        'cat-eye',
        'sport',
        'oversized',
        'other',
      ],
      message: '{VALUE} is not a valid style',
    },
  },
  gender: {
    type: String,
    required: [true, 'Gender is required'],
    enum: {
      values: ['men', 'women', 'unisex'],
      message: '{VALUE} is not a valid gender',
    },
  },
});

// Create the Sunglasses model as a discriminator of Product
const Sunglasses: Model<ISunglasses> =
  mongoose.models.Glasses ||
  Product.discriminator<ISunglasses>('Sunglasses', SunglassesSchema);

export default Sunglasses;
