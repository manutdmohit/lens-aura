import { connectToDatabase } from './api/db';
import Order from '@/models/Order';
import type { CartItem } from '@/context/cart-context';
import mongoose from 'mongoose';
import { updateProductStock } from './products';
import type { IProduct } from '@/models/Product';
import Product from '@/models/Product';

/**
 * Generates a unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000)
    .toString()
    .padStart(4, '0');
  return `LA-${timestamp}-${random}`;
}

/**
 * Creates a pending order in the database
 */
export async function createPendingOrder(
  items: CartItem[],
  stripeSessionId: string
) {
  try {
    await connectToDatabase();

    console.log(
      `[DEBUG] Creating pending order for session: ${stripeSessionId}`
    );

    // Create initial order data with proper ObjectId conversion
    const orderItems = items.map((item) => {
      console.log(
        `[DEBUG] Processing item: ${item.product.name}, ID: ${item.product._id}`,
        { item }
      );
      // Ensure the product ID exists and is valid
      if (!item.product._id) {
        console.error(
          `[DEBUG] Missing product ID for ${item.product.name}`,
          item.product
        );
        throw new Error(`Missing product ID for ${item.product.name}`);
      }
      const productId = item.product._id.toString();
      if (!productId) {
        console.error(
          `[DEBUG] Invalid product ID for ${item.product.name}`,
          item.product
        );
        throw new Error(`Invalid product ID for ${item.product.name}`);
      }
      return {
        productId: productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        color: item.color,
        imageUrl: item.product.thumbnail,
        productType: item.product.productType,
        product: item.product._id,
      };
    });

    // Calculate total amount
    const totalAmount = items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );

    // Generate a unique order number
    const orderNumber = generateOrderNumber();

    console.log(
      `[DEBUG] Creating order with ${orderItems.length} items, total: $${totalAmount}`
    );

    // Create a new order with pending status
    const order = new Order({
      items: orderItems,
      totalAmount,
      paymentStatus: 'pending',
      stripeSessionId,
      orderNumber,
      stockReduced: false,
      paymentMethod: 'stripe',
      deliveryStatus: 'ORDER_PLACED', // Explicitly set the initial delivery status
    });

    await order.save();
    console.log(
      `[DEBUG] Created pending order: ${order._id} with number ${orderNumber}`
    );

    // Verify the order was saved correctly
    const savedOrder = await Order.findById(order._id);
    console.log(
      `[DEBUG] Verified saved order: ${savedOrder?._id}, session ID: ${savedOrder?.stripeSessionId}`
    );

    return { orderId: order._id, orderNumber };
  } catch (error) {
    console.error('[DEBUG] Error creating pending order:', error);
    throw error;
  }
}

/**
 * Updates an order with Stripe session data
 */
export async function updateOrderFromStripeSession(
  stripeSessionId: string,
  paymentStatus: 'paid' | 'failed',
  customerEmail: string,
  shippingAddress: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    postalCode: string;
  },
  paymentIntent: string
) {
  try {
    console.log(
      `[DEBUG] Updating order for session ${stripeSessionId} with status ${paymentStatus}`
    );
    await connectToDatabase();

    // Find the order by Stripe session ID
    const order = await Order.findOne({ stripeSessionId });

    if (!order) {
      console.error(`[DEBUG] Order not found for session: ${stripeSessionId}`);
      throw new Error(`Order not found for session: ${stripeSessionId}`);
    }

    console.log(
      `[DEBUG] Found order ${order._id}, current status: ${order.paymentStatus}`
    );

    // Update order with details from Stripe
    order.customerEmail = customerEmail;
    order.paymentStatus = paymentStatus;
    order.paymentIntent = paymentIntent;
    order.shippingAddress = {
      street: shippingAddress.line1,
      city: shippingAddress.city,
      state: shippingAddress.state,
      postalCode: shippingAddress.postalCode,
      country: 'Australia', // Default to Australia
    };

    // Update delivery status when payment is successful
    if (paymentStatus === 'paid' && order.deliveryStatus === 'ORDER_PLACED') {
      order.deliveryStatus = 'ORDER_CONFIRMED';
    }

    await order.save();
    console.log(
      `[DEBUG] Updated order ${order._id} with shipping details and payment status: ${paymentStatus}`
    );

    // If payment is successful, reduce the stock quantity
    if (paymentStatus === 'paid') {
      await updateProductStockFromOrder(order);
      order.stockReduced = true;
      await order.save();
    }

    return { orderId: order._id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error('[DEBUG] Error updating order from Stripe session:', error);
    throw error;
  }
}

/**
 * Updates product stock quantities based on order items
 */
async function updateProductStockFromOrder(order: any) {
  try {
    console.log(
      `[DEBUG] Updating product stock quantities for order: ${order._id}`
    );

    for (const item of order.items) {
      try {
        // Convert productId to ObjectId if it's not already
        const productId =
          item.productId instanceof mongoose.Types.ObjectId
            ? item.productId
            : new mongoose.Types.ObjectId(item.productId);

        console.log(
          `[DEBUG] Updating stock for product: ${productId}, reducing by ${item.quantity}`
        );

        // Update the product stock (pass color if available)
        const updatedProduct = await updateProductStock(
          productId.toString(),
          item.quantity,
          item.color
        );

        if (!updatedProduct) {
          console.error(
            `[DEBUG] Failed to update stock for product: ${productId}`
          );
          continue;
        }

        console.log(
          `[DEBUG] Successfully updated stock for ${updatedProduct.name}: ${updatedProduct.stockQuantity} remaining`
        );
      } catch (itemError) {
        console.error(
          `[DEBUG] Error updating stock for product in order ${order._id}:`,
          itemError
        );
      }
    }

    console.log(`[DEBUG] Completed stock updates for order: ${order._id}`);
  } catch (error) {
    console.error('[DEBUG] Error updating product stock quantities:', error);
    // We don't throw here to prevent breaking the payment process
  }
}

/**
 * Update product stock directly with MongoDB operations
 */
async function updateProductStockDirectly(productId: string, quantity: number) {
  try {
    console.log(
      `Direct MongoDB update for product ${productId}, reducing by ${quantity}`
    );

    // First get the current stock quantity
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      console.error(`Product not found for direct update: ${productId}`);
      return;
    }

    // Calculate new stock
    const newStock = Math.max(
      0,
      (currentProduct.stockQuantity ?? 0) - quantity
    );

    // Direct MongoDB update
    const result = await Product.findByIdAndUpdate(
      productId,
      {
        $set: {
          stockQuantity: newStock,
          inStock: newStock > 0,
        },
      },
      { new: true }
    );

    if (result) {
      console.log(
        `Direct update successful, new stock: ${result.stockQuantity}`
      );
    } else {
      console.log(`Direct update failed, product may not be found`);
    }
  } catch (error) {
    console.error(`Error in direct stock update for ${productId}:`, error);
  }
}
