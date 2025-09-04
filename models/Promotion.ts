import { mongoose } from '@/lib/mongoose/db-config';
import { Schema, type Document, type Model } from 'mongoose';

// Define the interface for Promotion document
export interface IPromotion extends Document {
  _id: string;
  offerName: string;
  offerValidFrom: Date;
  offerValidTo: Date;
  signatureOriginalPrice: number;
  signatureDiscountedPrice: number;
  signaturePriceForTwo: number;
  essentialOriginalPrice: number;
  essentialDiscountedPrice: number;
  essentialPriceForTwo: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Promotion schema
const PromotionSchema = new Schema<IPromotion>(
  {
    offerName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    offerValidFrom: {
      type: Date,
      required: true,
    },
    offerValidTo: {
      type: Date,
      required: true,
    },
    signatureOriginalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    signatureDiscountedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    signaturePriceForTwo: {
      type: Number,
      required: true,
      min: 0,
    },
    essentialOriginalPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    essentialDiscountedPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    essentialPriceForTwo: {
      type: Number,
      required: true,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the model
const Promotion =
  mongoose.models.Promotion ||
  mongoose.model<IPromotion>('Promotion', PromotionSchema);

export default Promotion;
