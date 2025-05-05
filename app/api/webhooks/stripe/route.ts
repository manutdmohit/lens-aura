import { NextRequest, NextResponse } from 'next/server';
import { Stripe } from 'stripe';
import { updateOrderFromStripeSession, createPendingOrder } from '@/lib/order-service';
import { getCheckoutSession } from '@/lib/stripe';
import { connectToDatabase } from '@/lib/api/db';
import Order from '@/models/Order';
import Product from '@/models/Product';
import { updateProductStock } from '@/lib/products';

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-03-31.basil',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export async function POST(request: NextRequest) {
  console.log('[DEBUG] Webhook received:', new Date().toISOString());
  
  try {
    const body = await request.text();
    console.log('[DEBUG] Webhook body length:', body.length);
    
    const signature = request.headers.get('stripe-signature') || '';
    console.log('[DEBUG] Signature present:', !!signature);
    console.log('[DEBUG] Endpoint secret present:', !!endpointSecret);

    // Verify webhook signature
    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
      console.log('[DEBUG] Event constructed successfully:', event.type);
    } catch (err: any) {
      console.error('[DEBUG] Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      console.log('[DEBUG] Processing checkout.session.completed event');
      const session = event.data.object as Stripe.Checkout.Session;
      
      try {
        // Check if payment is successful
        if (session.payment_status === 'paid') {
          console.log('[DEBUG] Payment is successful, processing order');
          await handleCheckoutCompleted(session);
        } else {
          console.log('[DEBUG] Payment not successful, skipping order processing');
        }
      } catch (error) {
        console.error('[DEBUG] Error handling checkout completed:', error);
      }
    } else if (event.type === 'payment_intent.succeeded') {
      console.log('[DEBUG] Processing payment_intent.succeeded event');
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      
      try {
        // First try to find the order by payment intent ID
        await connectToDatabase();
        let order = await Order.findOne({ paymentIntent: paymentIntent.id });
        
        if (order) {
          console.log(`[DEBUG] Found order ${order._id} by payment intent`);
          
          // Only update if not already paid
          if (order.paymentStatus !== 'paid') {
            console.log(`[DEBUG] Updating order ${order._id} status to paid`);
            order.paymentStatus = 'paid';
            await order.save();
            
            // Update stock quantities when payment intent succeeds
            await updateProductStockFromStripeOrder(order);
          } else {
            console.log(`[DEBUG] Order ${order._id} already marked as paid, skipping stock update`);
          }
        } else {
          // Find session associated with this payment intent
          console.log('[DEBUG] No order found by payment intent, looking for session...');
          const sessions = await stripe.checkout.sessions.list({
            payment_intent: paymentIntent.id,
            expand: ['data.customer_details']
          });
          
          if (sessions.data.length > 0) {
            console.log(`[DEBUG] Found session for payment intent: ${sessions.data[0].id}`);
            
            // Find order by session ID
            order = await Order.findOne({ 'paymentDetails.stripeSessionId': sessions.data[0].id });
            
            if (order) {
              console.log(`[DEBUG] Found order ${order._id} by session ID`);
              
              // Only update if not already paid
              if (order.paymentStatus !== 'paid') {
                console.log(`[DEBUG] Updating order ${order._id} status to paid`);
                order.paymentStatus = 'paid';
                order.paymentIntent = paymentIntent.id;
                await order.save();
                
                // Update stock quantities when payment intent succeeds
                await updateProductStockFromStripeOrder(order);
              } else {
                console.log(`[DEBUG] Order ${order._id} already marked as paid, skipping stock update`);
              }
            } else {
              console.log(`[DEBUG] No order found for session: ${sessions.data[0].id}, creating one...`);
              await handleCheckoutCompleted(sessions.data[0]);
            }
          } else {
            console.log('[DEBUG] No session found for payment intent:', paymentIntent.id);
          }
        }
      } catch (error) {
        console.error('[DEBUG] Error processing payment intent:', error);
      }
    } else {
      console.log(`[DEBUG] Unhandled event type: ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    console.log('[DEBUG] Webhook processed successfully');
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[DEBUG] Error processing webhook:', error);
    return NextResponse.json(
      { error: `Webhook handler failed: ${error.message}` }, 
      { status: 500 }
    );
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  try {
    console.log(`Processing completed checkout session: ${session.id}`);
    
    // Determine the correct payment status based on the session status
    const paymentStatus = session.payment_status === 'paid' ? 'paid' as const : 'pending' as const;
    console.log(`Setting order payment status to: ${paymentStatus}`);
    
    // Use correct status for updateOrderFromStripeSession
    const statusForUpdate = paymentStatus === 'paid' ? 'paid' as const : 'failed' as const;
    
    // Fetch the complete session with expanded customer details
    const expandedSession = await stripe.checkout.sessions.retrieve(
      session.id, 
      { expand: ['customer_details', 'line_items'] }
    );
    
    const customerDetails = expandedSession.customer_details;
    
    if (!customerDetails || !customerDetails.email) {
      throw new Error('Customer email is missing from the session');
    }
    
    console.log(`Customer email: ${customerDetails.email}`);
    
    // Create the shipping address object
    const shippingAddress = {
      line1: customerDetails.address?.line1 || '',
      line2: customerDetails.address?.line2 || '',
      city: customerDetails.address?.city || '',
      state: customerDetails.address?.state || '',
      postalCode: customerDetails.address?.postal_code || '',
    };
    
    try {
      // Try to update the existing order
      const result = await updateOrderFromStripeSession(
        expandedSession.id,
        statusForUpdate, // Use the determined payment status
        customerDetails.email,
        shippingAddress,
        expandedSession.payment_intent as string
      );
      
      console.log(`Order ${result.orderId} (${result.orderNumber}) updated to ${statusForUpdate} status`);
    } catch (error: any) {
      // If order not found, create it
      if (error.message && error.message.includes('Order not found')) {
        console.log(`Order not found for session ${expandedSession.id}, creating it now...`);
        
        // Create order directly from the Stripe session
        const orderResult = await createOrderFromStripeSession(expandedSession);
        console.log(`Created order from Stripe session: ${orderResult.orderId} (${orderResult.orderNumber})`);
        
        // Now update it with the customer details
        const updateResult = await updateOrderFromStripeSession(
          expandedSession.id,
          statusForUpdate, // Use the determined payment status
          customerDetails.email,
          shippingAddress,
          expandedSession.payment_intent as string
        );
        
        console.log(`Order ${updateResult.orderId} (${updateResult.orderNumber}) updated to ${statusForUpdate} status`);
      } else {
        // Some other error occurred
        throw error;
      }
    }
  } catch (error) {
    console.error('Error handling checkout completed event:', error);
    throw error;
  }
}

/**
 * Creates an order directly from Stripe session data, bypassing the normal cart flow
 */
async function createOrderFromStripeSession(session: Stripe.Checkout.Session): Promise<{orderId: string, orderNumber: string}> {
  try {
    await connectToDatabase();
    
    // Extract the session metadata for redundant product IDs
    const sessionMetadata = session.metadata || {};
    console.log('Session metadata:', JSON.stringify(sessionMetadata));
    
    // Extract line items
    const lineItems = session.line_items?.data || [];
    console.log('Line items data:', JSON.stringify(lineItems, null, 2));
    
    // Check if we have product IDs in session metadata as a backup
    const backupProductIds = sessionMetadata.productIds ? sessionMetadata.productIds.split(',') : [];
    console.log('Backup product IDs from session metadata:', backupProductIds);
    
    // Format order items
    const orderItems = lineItems.map((item, index) => {
      const productData = item.price?.product as Stripe.Product;
      console.log(`Processing line item ${index + 1}:`, item.description);
      
      // Log the full product data for debugging
      console.log('Product data:', JSON.stringify(productData, null, 2));
      
      // Try getting metadata from various sources
      const priceMetadata = (item.price as any)?.product_data?.metadata || {};
      const productMetadata = productData?.metadata || {};
      
      console.log('Price metadata:', JSON.stringify(priceMetadata, null, 2));
      console.log('Product metadata:', JSON.stringify(productMetadata, null, 2));
      
      // Try multiple approaches to get the product ID
      // 1. From price metadata (most reliable)
      // 2. From product metadata
      // 3. From session metadata backup (if index matches)
      // 4. From product ID itself
      const productId = 
        priceMetadata.productId || 
        productMetadata.productId || 
        (backupProductIds[index] || '') || 
        productData.id || '';
        
      console.log(`Resolved product ID for item ${index + 1}: ${productId}`);
      
      if (!productId) {
        console.warn(`⚠️ Warning: Could not resolve product ID for item: ${item.description || 'Unknown'}`);
      }
      
      return {
        productId: productId,
        name: item.description || productData.name || 'Unknown Product',
        price: (item.price?.unit_amount || 0) / 100, // Convert from cents
        quantity: item.quantity || 1,
        color: priceMetadata.color || productMetadata.color || 'Default',
        imageUrl: productData.images?.[0] || '',
      };
    });
    
    console.log('Formatted order items:', JSON.stringify(orderItems, null, 2));
    
    // Calculate total amount
    const totalAmount = orderItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    );
    
    // Create a new order directly using the Order model
    const order = new Order({
      items: orderItems,
      totalAmount,
      paymentStatus: session.payment_status === 'paid' ? 'paid' : 'pending',
      stripeSessionId: session.id,
      customerEmail: session.customer_details?.email,
      customerPhone: session.customer_details?.phone,
      // Customer data will be updated later with updateOrderFromStripeSession
    });
    
    await order.save();
    console.log(`Created order from Stripe session: ${order._id}`);
    
    // If payment is already marked as paid, update product stock
    if (session.payment_status === 'paid') {
      await updateProductStockFromStripeOrder(order);
    }
    
    return { orderId: order._id, orderNumber: order.orderNumber };
  } catch (error) {
    console.error('Error creating order from Stripe session:', error);
    throw error;
  }
}

/**
 * Updates product stock quantities for orders created directly from Stripe
 */
async function updateProductStockFromStripeOrder(order: any) {
  try {
    console.log('Updating product stock quantities for Stripe order:', order._id);
    console.log('Order items:', JSON.stringify(order.items, null, 2));
    
    if (!order.items || !Array.isArray(order.items) || order.items.length === 0) {
      console.error('No items found in order');
      return;
    }
    
    // For each item in the order
    for (const item of order.items) {
      // Skip if no product
      if (!item.product) {
        console.warn(`Skipping stock update for item without product: ${item.name}`);
        continue;
      }
      
      console.log(`Updating stock for product ${item.product}, reducing by ${item.quantity}`);
      
      try {
        // Use our utility function to update the product stock
        const updatedProduct = await updateProductStock(item.product.toString(), item.quantity);
        
        if (!updatedProduct) {
          console.error(`Failed to update stock for product ${item.product}`);
          continue;
        }
        
        console.log(`Successfully updated stock for ${updatedProduct.name}: ${updatedProduct.stockQuantity} remaining (in stock: ${updatedProduct.inStock})`);
      } catch (itemError) {
        console.error(`Error updating stock for product ${item.product}:`, itemError);
        
        // Fall back to direct update if the utility function fails
        try {
          // Directly find and update the product
          const product = await Product.findById(item.product);
          
          if (!product) {
            console.error(`Product not found in fallback: ${item.product}`);
            continue;
          }
          
          console.log(`Fallback: Current stock for ${product.name}: ${product.stockQuantity}`);
          
          // Calculate new stock quantity
          const newStockQuantity = Math.max(0, product.stockQuantity - item.quantity);
          
          // Update the product
          product.stockQuantity = newStockQuantity;
          product.inStock = newStockQuantity > 0;
          
          // Save the product
          await product.save();
          
          console.log(`Fallback: Updated stock for ${product.name}: ${product.stockQuantity} remaining`);
        } catch (fallbackError) {
          console.error(`Fallback stock update also failed for ${item.product}:`, fallbackError);
        }
      }
    }
    
    console.log('Stock update completed for order:', order._id);
  } catch (error) {
    console.error('Error updating product stock quantities:', error);
    // We don't throw here to prevent breaking the payment process
  }
}

/**
 * Update product stock directly with MongoDB operations
 * This is a fallback method to ensure stock is updated correctly
 */
async function updateProductStockDirectly(productId: string, quantity: number) {
  try {
    console.log(`Direct MongoDB update for product ${productId}, reducing by ${quantity}`);
    
    // First get the current stock quantity
    const currentProduct = await Product.findById(productId);
    if (!currentProduct) {
      console.error(`Product not found for direct update: ${productId}`);
      return;
    }
    
    // Calculate new stock
    const newStock = Math.max(0, currentProduct.stockQuantity - quantity);
    
    // Direct MongoDB update
    const result = await Product.findByIdAndUpdate(
      productId,
      { 
        $set: { 
          stockQuantity: newStock,
          inStock: newStock > 0
        }
      },
      { new: true }
    );
    
    if (result) {
      console.log(`Direct update successful, new stock: ${result.stockQuantity}`);
    } else {
      console.log(`Direct update failed, product may be out of stock or not found`);
    }
  } catch (error) {
    console.error(`Error in direct stock update for ${productId}:`, error);
  }
} 