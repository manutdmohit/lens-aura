import Stripe from 'stripe';
import type { CartItem } from '@/context/cart-context';
import { connectToDatabase } from './api/db';
import Order from '@/models/Order';
import { updateOrderFromStripeSession } from './order-service';

// Initialize Stripe with the secret key
const getStripeSecretKey = () => {
  let key = process.env.STRIPE_SECRET_KEY || '';

  // Clean up the key to remove any line breaks or whitespace
  if (key) {
    // Replace any whitespace characters (including line breaks) with empty string
    key = key.replace(/\s+/g, '');
    console.log(`Stripe key length after cleanup: ${key.length}`);

    // Verify the key format
    if (!key.startsWith('sk_')) {
      console.error("Invalid Stripe key format: doesn't start with 'sk_'");
      return '';
    }

    if (key.length < 30) {
      console.error(`Stripe key appears to be too short (${key.length} chars)`);
      return '';
    }
  } else {
    console.error('Missing Stripe secret key');
  }

  return key;
};

// Initialize Stripe with the cleaned secret key
const stripeSecretKey = getStripeSecretKey();
let stripe: Stripe | null = null;

try {
  if (stripeSecretKey) {
    console.log('Initializing Stripe client...');
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2025-03-31.basil',
    });
    console.log('Stripe initialized successfully');
  } else {
    console.error('Cannot initialize Stripe: Invalid or missing secret key');
  }
} catch (error) {
  console.error('Error initializing Stripe:', error);
}

// Validate and truncate image URLs
function validateImageUrl(url: string | undefined): string | null {
  if (!url) return null;

  // Check if URL is too long (Stripe has a 2048 character limit)
  if (url.length > 2000) {
    console.warn(
      `Image URL exceeded 2000 chars (${url.length}), truncating for Stripe compatibility`
    );
    return null; // Skip image rather than risk errors
  }

  return url;
}

export async function createCheckoutSession(
  items: CartItem[],
  successUrl: string,
  cancelUrl: string
) {
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key is not set or invalid');
  }

  if (!stripe) {
    throw new Error('Stripe instance not initialized');
  }

  try {
    // Format line items for Stripe
    const lineItems = items.map((item) => {
      // Validate the image URL
      const validatedImageUrl = validateImageUrl(item.product.thumbnail);

      // Log product ID for debugging
      console.log(
        `Adding product to Stripe checkout: ID=${item.product._id}, Name=${item.product.name}`
      );

      // Create a detailed metadata object for each product
      const productMetadata = {
        productId: item.product._id?.toString() || '',
        color: item.color || 'Default',
        name: item.product.name,
        price: item.product.price.toString(),
        quantity: item.quantity.toString(),
      };

      // Log the metadata we're sending to Stripe
      console.log('Product metadata:', JSON.stringify(productMetadata));

      return {
        price_data: {
          currency: 'aud',
          product_data: {
            name: item.product.name,
            description: `Color: ${item.color}`,
            images: validatedImageUrl ? [validatedImageUrl] : undefined,
            metadata: productMetadata,
          },
          unit_amount: Math.round(item.product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    // Also store product IDs and details in the session metadata for redundancy
    const sessionMetadata = {
      orderId: `order_${Date.now()}`,
      itemCount: items.length.toString(),
      productIds: items.map((item) => item.product._id?.toString()).join(','),
    };

    console.log(
      `Creating Stripe checkout session with ${lineItems.length} items`
    );
    console.log('Session metadata:', JSON.stringify(sessionMetadata));

    // Create a checkout session
    // Note: To fully disable Link, currency conversion, and currency selector,
    // also disable them in your Stripe Dashboard under Settings > Checkout & Payment Links
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      locale: 'en',
      currency: 'aud', // Explicitly set currency to AUD
      allow_promotion_codes: false,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: sessionMetadata,
      shipping_address_collection: {
        allowed_countries: ['AU'],
      },
      phone_number_collection: {
        enabled: true,
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'aud',
            },
            display_name: 'Free shipping',
            delivery_estimate: {
              minimum: {
                unit: 'business_day',
                value: 5,
              },
              maximum: {
                unit: 'business_day',
                value: 7,
              },
            },
          },
        },
      ],
    });

    console.log(`Stripe checkout session created: ${session.id}`);

    return {
      id: session.id,
      url: session.url,
    };
  } catch (error: any) {
    console.error('Error creating checkout session:', error);

    // Add more detailed error information
    const errorMessage = error.message || 'Unknown error occurred';
    const statusCode = error.statusCode || 'N/A';
    const errorType = error.type || 'unknown';

    console.error(
      `Stripe error details - Type: ${errorType}, Status: ${statusCode}, Message: ${errorMessage}`
    );

    throw new Error(`Stripe checkout failed: ${errorMessage}`);
  }
}

export async function getCheckoutSession(sessionId: string) {
  if (!stripeSecretKey) {
    throw new Error('Stripe secret key is not set or invalid');
  }

  if (!stripe) {
    throw new Error('Stripe instance not initialized');
  }

  try {
    console.log(`Retrieving checkout session: ${sessionId}`);

    // Retrieve the checkout session with expanded objects
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: [
        'line_items',
        'line_items.data.price.product',
        'customer_details',
      ],
    });

    console.log(
      `Session retrieved successfully, payment status: ${session.payment_status}`
    );

    // Log the metadata for debugging
    if (session.metadata) {
      console.log('Session metadata:', JSON.stringify(session.metadata));
    }

    // Log product IDs if available in metadata
    if (session.metadata?.productIds) {
      console.log('Product IDs from metadata:', session.metadata.productIds);
    }

    return session;
  } catch (error: any) {
    console.error('Error retrieving checkout session:', error);
    throw new Error(
      `Failed to retrieve checkout details: ${error.message || 'Unknown error'}`
    );
  }
}
