import mongoose, { Model } from 'mongoose';
import Product, { type IProduct } from './product.model';

// ContactLenses interface extending the base Product
export interface IContactLenses extends IProduct {
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

// Create the ContactLenses schema as a discriminator of Product
const ContactLensesSchema = new mongoose.Schema<IContactLenses>({
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
  },
  packagingType: {
    type: String,
    required: [true, 'Packaging type is required'],
    enum: {
      values: ['box', 'vial', 'blister-pack'],
      message: '{VALUE} is not a valid packaging type',
    },
  },
  wearDuration: {
    type: String,
    required: [true, 'Wear duration is required'],
    enum: {
      values: [
        'daily',
        'weekly',
        'bi-weekly',
        'monthly',
        'quarterly',
        'yearly',
      ],
      message: '{VALUE} is not a valid wear duration',
    },
  },
  replacementFrequency: {
    type: String,
    required: [true, 'Replacement frequency is required'],
    enum: {
      values: [
        'daily',
        'weekly',
        'bi-weekly',
        'monthly',
        'quarterly',
        'yearly',
      ],
      message: '{VALUE} is not a valid replacement frequency',
    },
  },
  waterContent: {
    type: Number,
    required: [true, 'Water content is required'],
    min: [0, 'Water content cannot be negative'],
    max: [100, 'Water content cannot exceed 100%'],
  },
  diameter: {
    type: Number,
    required: [true, 'Diameter is required'],
    min: [0, 'Diameter cannot be negative'],
  },
  baseCurve: {
    type: Number,
    required: [true, 'Base curve is required'],
    min: [0, 'Base curve cannot be negative'],
  },
  quantity: {
    type: Number,
    required: [true, 'Quantity per package is required'],
    min: [1, 'Quantity must be at least 1'],
  },
  forAstigmatism: {
    type: Boolean,
    default: false,
  },
  forPresbyopia: {
    type: Boolean,
    default: false,
  },
  uvBlocking: {
    type: Boolean,
    default: false,
  },
});

// Create the ContactLenses model as a discriminator of Product
const ContactLenses: Model<IContactLenses> =
  mongoose.models.ContactLenses ||
  Product.discriminator<IContactLenses>('ContactLenses', ContactLensesSchema);

export default ContactLenses;
