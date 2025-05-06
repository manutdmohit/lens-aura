import mongoose, { Schema, type Document, type Model } from 'mongoose';

// Define interfaces for nested objects
interface OrderItem {
  product: Schema.Types.ObjectId;
  productType: 'Glasses' | 'Sunglasses' | 'ContactLenses';
  quantity: number;
  price: number;
  color?: string;
  name: string;
  imageUrl: string;
}

interface ShippingAddress {
  firstName: string;
  lastName: string;
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phoneNumber?: string;
}

// Define the interface for Order document
export interface IOrder extends Document {
  user: Schema.Types.ObjectId | null; // null for guest checkout
  orderNumber: string;
  items: OrderItem[];
  totalAmount: number;
  status:
    | 'pending'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  paymentMethod:
    | 'credit_card'
    | 'paypal'
    | 'apple_pay'
    | 'google_pay'
    | 'other';
  paymentDetails: {
    transactionId?: string;
    paymentProvider?: string;
    lastFour?: string;
    [key: string]: any;
  };
  deliveryStatus: 'ORDER_PLACED' | 'ORDER_CONFIRMED' | 'PROCESSING' | 'DISPATCHED' | 'IN_TRANSIT' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'RETURNED' | 'DELAYED';
  shippingAddress: ShippingAddress;
  shippingMethod: 'standard' | 'express' | 'overnight';
  shippingCost: number;
  taxAmount: number;
  discountCode?: string;
  discountAmount: number;
  notes?: string;
  trackingNumber?: string;
  estimatedDelivery?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Define the Order schema
const OrderSchema = new Schema<IOrder>(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null, // Allow null for guest checkout
    },
    orderNumber: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true,
        },
        productType: {
          type: String,
          required: true,
          enum: ['Glasses', 'Sunglasses', 'ContactLenses'],
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, 'Quantity must be at least 1'],
        },
        price: {
          type: Number,
          required: true,
          min: [0, 'Price cannot be negative'],
        },
        color: {
          type: String,
        },
        name: {
          type: String,
          required: true,
        },
        imageUrl: {
          type: String,
          required: true,
        },
      },
    ],
    totalAmount: {
      type: Number,
      required: true,
      min: [0, 'Total amount cannot be negative'],
    },
    status: {
      type: String,
      required: true,
      enum: [
        'pending',
        'processing',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
      ],
      default: 'pending',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['credit_card', 'paypal', 'apple_pay', 'google_pay', 'other'],
    },
    paymentDetails: {
      type: Schema.Types.Mixed,
      default: {},
    },
    deliveryStatus: {
      type: String,
      required: true,
      enum: [
        'ORDER_PLACED',
        'ORDER_CONFIRMED',
        'PROCESSING',
        'DISPATCHED',
        'IN_TRANSIT',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
        'RETURNED',
        'DELAYED'
      ],
      default: 'ORDER_PLACED'
    },
    shippingAddress: {
      firstName: {
        type: String,
        required: true,
      },
      lastName: {
        type: String,
        required: true,
      },
      street: {
        type: String,
        required: true,
      },
      city: {
        type: String,
        required: true,
      },
      state: {
        type: String,
        required: true,
      },
      postalCode: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phoneNumber: {
        type: String,
      },
    },
    shippingMethod: {
      type: String,
      required: true,
      enum: ['standard', 'express', 'overnight'],
      default: 'standard',
    },
    shippingCost: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Shipping cost cannot be negative'],
    },
    taxAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Tax amount cannot be negative'],
    },
    discountCode: {
      type: String,
    },
    discountAmount: {
      type: Number,
      required: true,
      default: 0,
      min: [0, 'Discount amount cannot be negative'],
    },
    notes: {
      type: String,
    },
    trackingNumber: {
      type: String,
    },
    estimatedDelivery: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to generate order number if not provided
OrderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    // Generate a unique order number based on timestamp and random string
    const timestamp = new Date().getTime().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000000)
      .toString()
      .padStart(6, '0');
    this.orderNumber = `BN-${timestamp}-${random}`;
  }

  // Set initial delivery status if not set
  if (!this.deliveryStatus) {
    this.deliveryStatus = 'ORDER_PLACED';
  }

  // Update delivery status when payment is completed
  if (this.isModified('paymentStatus') && this.paymentStatus === 'paid' && this.deliveryStatus === 'ORDER_PLACED') {
    this.deliveryStatus = 'ORDER_CONFIRMED';
  }

  next();
});

// Create and export the Order model
const Order: Model<IOrder> =
  mongoose.models.Order || mongoose.model<IOrder>('Order', OrderSchema);

export default Order;
