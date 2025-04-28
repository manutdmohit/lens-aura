import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Base Product interface
export interface IProduct extends Document {
  name: string;
  description: string;
  price: number;
  imageUrl: string;
  stockQuantity: number;
  inStock: boolean;
  category: string;
  colors: string[];
  productType: string;
  createdAt: Date;
  updatedAt: Date;
}

// Base Product schema with common fields
const ProductSchema = new Schema<IProduct>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
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
      default: function (this: IProduct) {
        return this.stockQuantity > 0;
      },
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      enum: {
        values: ['glasses', 'sunglasses', 'contacts'],
        message: '{VALUE} is not a valid category',
      },
    },
    colors: {
      type: [String],
      default: [],
    },
    productType: {
      type: String,
      required: [true, 'Product type is required'],
      enum: {
        values: ['Glasses', 'Sunglasses', 'ContactLenses'],
        message: '{VALUE} is not a valid product type',
      },
    },
  },
  {
    timestamps: true,
    discriminatorKey: 'productType', // This allows us to create different product types
  }
);

// Pre-save hook to update inStock based on stockQuantity
ProductSchema.pre('save', function (next) {
  this.inStock = this.stockQuantity > 0;
  next();
});

// Create the base Product model
const Product: Model<IProduct> =
  mongoose.models.Product || mongoose.model<IProduct>('Product', ProductSchema);

export default Product;
