import { connectToDatabase } from './api/db';
import Order from '@/models/Order';
import type { CartItem } from '@/context/cart-context';

/**
 * Generates a unique order number
 */
function generateOrderNumber(): string {
  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
  return `LA-${timestamp}-${random}`;
}

/**
 * Creates a pending order in the database
 */
export async function createPendingOrder(
  items: CartItem[],
  stripeSessionId: string,
) {
  try {
    await connectToDatabase();
    
    // Create initial order data
    const orderItems = items.map(item => ({
      productId: item.product.id || '',
      name: item.product.name,
      price: item.product.price,
      quantity: item.quantity,
      color: item.color,
      imageUrl: item.product.imageUrl,
    }));
    
    // Calculate total amount
    const totalAmount = items.reduce(
      (total, item) => total + item.product.price * item.quantity,
      0
    );
    
    // Generate a unique order number
    const orderNumber = generateOrderNumber();
    
    // Create a new order with pending status
    const order = new Order({
      items: orderItems,
      totalAmount,
      paymentStatus: 'pending',
      stripeSessionId,
      orderNumber, // Explicitly set the order number
      // No need to provide empty fields - they'll be updated after payment
    });
    
    await order.save();
    console.log(`Created pending order: ${order._id} with number ${orderNumber}`);
    
    return { orderId: order._id, orderNumber };
  } catch (error) {
    console.error('Error creating pending order:', error);
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
  shippingAddress: any,
  paymentIntent: string
) {
  try {
    console.log(`Updating order for session ${stripeSessionId} with status ${paymentStatus}`);
    await connectToDatabase();
    
    // Find the order by Stripe session ID
    const order = await Order.findOne({ stripeSessionId });
    
    if (!order) {
      console.error(`Order not found for session: ${stripeSessionId}`);
      throw new Error(`Order not found for session: ${stripeSessionId}`);
    }
    
    console.log(`Found order ${order._id}, current status: ${order.paymentStatus}`);
    
    // Update order with details from Stripe
    order.customerEmail = customerEmail;
    order.paymentStatus = paymentStatus;
    order.paymentIntent = paymentIntent;
    order.shippingAddress = shippingAddress;
    
    await order.save();
    console.log(`Updated order ${order._id} payment status from ${order.paymentStatus} to ${paymentStatus}`);
    
    return { orderId: order._id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error('Error updating order from Stripe session:', error);
    throw error;
  }
} 