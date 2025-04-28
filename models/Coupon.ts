import { mongoose } from '@/lib/mongoose/db-config';
import { Schema, type Document, type Model } from 'mongoose';

// Define the interface for Coupon document
export interface ICoupon extends Document {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  minPurchase: number;
  maxDiscount?: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  usageLimit: number;
  usageCount: number;
  applicableProducts: Schema.Types.ObjectId[] | 'all';
  applicableCategories: string[] | 'all';
  createdAt: Date;
  updatedAt: Date;
  isValid(purchaseAmount: number): boolean;
}

// Define the Coupon schema
const CouponSchema = new Schema<ICoupon>(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Coupon type is required'],
      enum: {
        values: ['percentage', 'fixed'],
        message: '{VALUE} is not a valid coupon type',
      },
    },
    value: {
      type: Number,
      required: [true, 'Coupon value is required'],
      min: [0, 'Coupon value cannot be negative'],
      validate: {
        validator: function (this: ICoupon, value: number) {
          return this.type !== 'percentage' || value <= 100;
        },
        message: 'Percentage discount cannot exceed 100%',
      },
    },
    minPurchase: {
      type: Number,
      default: 0,
      min: [0, 'Minimum purchase amount cannot be negative'],
    },
    maxDiscount: {
      type: Number,
      min: [0, 'Maximum discount amount cannot be negative'],
    },
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      default: Date.now,
    },
    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      validate: {
        validator: function (this: ICoupon, value: Date) {
          return value > this.startDate;
        },
        message: 'End date must be after start date',
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageLimit: {
      type: Number,
      default: 0, // 0 means unlimited
      min: [0, 'Usage limit cannot be negative'],
    },
    usageCount: {
      type: Number,
      default: 0,
      min: [0, 'Usage count cannot be negative'],
    },
    applicableProducts: {
      type: Schema.Types.Mixed, // Can be an array of ObjectIds or the string 'all'
      default: 'all',
      validate: {
        validator: (value: any) => value === 'all' || Array.isArray(value),
        message: 'Applicable products must be "all" or an array of product IDs',
      },
    },
    applicableCategories: {
      type: Schema.Types.Mixed, // Can be an array of strings or the string 'all'
      default: 'all',
      validate: {
        validator: (value: any) => value === 'all' || Array.isArray(value),
        message:
          'Applicable categories must be "all" or an array of category names',
      },
    },
  },
  {
    timestamps: true,
  }
);

// Method to check if a coupon is valid for a given purchase amount
CouponSchema.methods.isValid = function (purchaseAmount: number): boolean {
  const now = new Date();

  // Check if coupon is active, within date range, and has not exceeded usage limit
  const isActive = this.isActive;
  const isWithinDateRange = now >= this.startDate && now <= this.endDate;
  const hasNotExceededUsageLimit =
    this.usageLimit === 0 || this.usageCount < this.usageLimit;
  const meetsMinPurchase = purchaseAmount >= this.minPurchase;

  return (
    isActive &&
    isWithinDateRange &&
    hasNotExceededUsageLimit &&
    meetsMinPurchase
  );
};

// Create and export the Coupon model
const Coupon: Model<ICoupon> =
  mongoose.models.Coupon || mongoose.model<ICoupon>('Coupon', CouponSchema);

export default Coupon;
