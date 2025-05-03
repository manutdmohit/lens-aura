import mongoose from 'mongoose';
import { Schema, type Document, type Model } from 'mongoose';

// Define the interface for Review document
export interface IReview extends Document {
  product: Schema.Types.ObjectId;
  user: Schema.Types.ObjectId | null; // null for anonymous reviews
  userName: string;
  rating: number;
  title: string;
  comment: string;
  verified: boolean;
  helpful: number;
  notHelpful: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

// Define the Review schema
const ReviewSchema = new Schema<IReview>(
  {
    product: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
      index: true,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Allow null for anonymous reviews
    },
    userName: {
      type: String,
      required: [true, 'User name is required'],
      trim: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    title: {
      type: String,
      required: [true, 'Review title is required'],
      trim: true,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
    },
    verified: {
      type: Boolean,
      default: false, // Set to true if the user has purchased the product
    },
    helpful: {
      type: Number,
      default: 0,
    },
    notHelpful: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  {
    timestamps: true,
  }
);

// Create and export the Review model
const Review: Model<IReview> =
  mongoose.models.Review || mongoose.model<IReview>('Review', ReviewSchema);

export default Review;
