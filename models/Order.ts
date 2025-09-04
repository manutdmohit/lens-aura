import mongoose, { Schema, Document } from 'mongoose';

export interface IOrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  imageUrl?: string;
  productType?: string;
  category?: string;
  originalPrice?: number;
  isPromotional?: boolean;
}

export interface IShippingAddress {
  firstName?: string;
  lastName?: string;
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
  phone?: string;
}

export interface IOrder extends Document {
  paymentMethod: string;
  deliveryStatus:
    | 'ORDER_PLACED'
    | 'ORDER_CONFIRMED'
    | 'PROCESSING'
    | 'DISPATCHED'
    | 'IN_TRANSIT'
    | 'OUT_FOR_DELIVERY'
    | 'DELIVERED'
    | 'CANCELLED'
    | 'RETURNED'
    | 'DELAYED';
  userId?: string;
  orderNumber: string;
  customerEmail?: string;
  customerPhone?: string;
  items: IOrderItem[];
  totalAmount: number;
  shippingAddress?: IShippingAddress;
  paymentStatus: 'pending' | 'paid' | 'failed';
  paymentIntent?: string;
  stripeSessionId: string;
  stockReduced: boolean;
  emailSent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const OrderSchema = new Schema(
  {
    userId: { type: String },
    orderNumber: {
      type: String,
      unique: true,
      required: true,
    },
    customerEmail: { type: String },
    customerPhone: { type: String },
    items: [
      {
        productId: { type: String },
        name: { type: String, required: true },
        price: { type: Number, required: true },
        quantity: { type: Number, required: true },
        color: { type: String, required: true },
        imageUrl: { type: String },
        productType: { type: String },
        category: { type: String },
        originalPrice: { type: Number },
        isPromotional: { type: Boolean },
        product: { type: Schema.Types.ObjectId, ref: 'Product' },
      },
    ],
    totalAmount: { type: Number, required: true },
    shippingAddress: {
      firstName: { type: String },
      lastName: { type: String },
      street: { type: String },
      city: { type: String },
      state: { type: String },
      postalCode: { type: String },
      country: { type: String },
      phone: { type: String },
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending',
    },
    deliveryStatus: {
      type: String,
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
        'DELAYED',
      ],
      default: 'ORDER_PLACED',
    },
    paymentMethod: { type: String },
    paymentIntent: { type: String },
    stripeSessionId: {
      type: String,
      required: true,
      index: true, // Add index for faster lookups
    },
    stockReduced: { type: Boolean, default: false },
    emailSent: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Generate a unique order number before saving
OrderSchema.pre('save', async function (next) {
  const order = this;

  // Only generate order number if it doesn't exist
  if (!order.orderNumber) {
    // Create a unique order number format: LA-{timestamp}-{random}
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0');
    order.orderNumber = `LA-${timestamp}-${random}`;
  }

  next();
});

// Use mongoose.models to check if the model exists already to prevent overwriting
export default mongoose.models.Order ||
  mongoose.model<IOrder>('Order', OrderSchema);
