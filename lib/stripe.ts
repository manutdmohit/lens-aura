import Stripe from 'stripe';
import type { CartItem } from '@/context/cart-context';
import { connectToDatabase } from './api/db';
import Order from '@/models/Order';
import { updateOrderFromStripeSession } from './order-service';
import { calculatePromotionalPricing } from '@/lib/utils/discount';
import { getCategoryPromotionalPricing } from '@/lib/services/promotional-pricing';
import {
  calculateShipping,
  calculateTotalWithShipping,
} from '@/lib/shipping-utils';

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
    // Calculate subtotal first to determine shipping
    let subtotal = 0;

    // Calculate subtotal using the same logic as cart context
    for (const item of items) {
      // Get effective price (discounted or original)
      let effectivePrice = item.product.price;
      if (item.product.discountedPrice && item.product.discountedPrice > 0) {
        effectivePrice = item.product.discountedPrice;
      }

      // Check if this product qualifies for promotional pricing
      if (
        (item.product.category === 'signature' ||
          item.product.category === 'essentials') &&
        item.quantity >= 2
      ) {
        const promo = calculatePromotionalPricing(
          effectivePrice,
          item.product.category as 'essentials' | 'signature'
        );

        // Calculate pricing: 1 pair gets promotional pricing, rest pay current discounted price
        const promotionalPairs = Math.min(1, Math.floor(item.quantity / 2));
        const remainingItems = item.quantity - promotionalPairs * 2;

        const promotionalPrice = promotionalPairs * promo.twoForPrice;
        const regularPrice = remainingItems * effectivePrice;
        subtotal += promotionalPrice + regularPrice;
      } else {
        subtotal += effectivePrice * item.quantity;
      }
    }

    // Calculate shipping
    const shipping = calculateShipping(subtotal);

    // Format line items for Stripe with promotional pricing logic
    const lineItems = [];

    for (const item of items) {
      // Validate the image URL
      const validatedImageUrl = validateImageUrl(item.product.thumbnail);

      // Log product ID for debugging
      console.log(
        `Adding product to Stripe checkout: ID=${item.product._id}, Name=${item.product.name}, Quantity: ${item.quantity}`
      );

      // Handle color (could be string or ColorInfo object)
      const colorName =
        typeof item.color === 'string'
          ? item.color
          : item.color?.name || 'Default';

      // Check if this product qualifies for promotional pricing
      if (
        (item.product.category === 'signature' ||
          item.product.category === 'essentials') &&
        item.quantity >= 2
      ) {
        // Use promotional price from database if available, otherwise use regular price
        const productCategory = item.product.category as
          | 'signature'
          | 'essentials';
        const hookCategory =
          productCategory === 'essentials' ? 'essential' : productCategory;
        const categoryPricing = await getCategoryPromotionalPricing(
          hookCategory
        );

        const promoPrice =
          categoryPricing && categoryPricing.isPromotional
            ? categoryPricing.promotionalPrice
            : item.product.discountedPrice && item.product.discountedPrice > 0
            ? item.product.discountedPrice
            : item.product.price;

        const promo = calculatePromotionalPricing(
          promoPrice,
          item.product.category as 'essentials' | 'signature'
        );

        // Calculate pricing: 1 pair gets promotional pricing, rest pay current discounted price
        const promotionalPairs = Math.min(1, Math.floor(item.quantity / 2)); // Only 1 pair gets promotional pricing
        const remainingItems = item.quantity - promotionalPairs * 2; // All items beyond the first pair

        // Add promotional pair line item
        if (promotionalPairs > 0) {
          const promotionalMetadata = {
            productId: item.product._id?.toString() || '',
            color: colorName,
            name: `${item.product.name} (Promotional Pair)`,
            originalPrice: item.product.price.toString(),
            effectivePrice: promo.twoForPrice.toString(),
            quantity: '2',
            promotionalPricing: 'true',
            pricingType: 'promotional_pair',
          };

          lineItems.push({
            price_data: {
              currency: 'aud',
              product_data: {
                name: `${item.product.name} (Promotional Pair)`,
                description: `Color: ${colorName} - Buy 2 for $${promo.twoForPrice}`,
                images: validatedImageUrl ? [validatedImageUrl] : undefined,
                metadata: promotionalMetadata,
              },
              unit_amount: Math.round(promo.twoForPrice * 100), // Convert to cents
            },
            quantity: promotionalPairs,
          });
        }

        // Add remaining items at current discounted price
        if (remainingItems > 0) {
          const regularPrice =
            categoryPricing && categoryPricing.isPromotional
              ? categoryPricing.promotionalPrice
              : item.product.discountedPrice && item.product.discountedPrice > 0
              ? item.product.discountedPrice
              : item.product.price;

          const regularMetadata = {
            productId: item.product._id?.toString() || '',
            color: colorName,
            name: item.product.name,
            originalPrice: item.product.price.toString(),
            effectivePrice: regularPrice.toString(),
            quantity: remainingItems.toString(),
            promotionalPricing: 'false',
            pricingType: 'regular',
          };

          lineItems.push({
            price_data: {
              currency: 'aud',
              product_data: {
                name: item.product.name,
                description: `Color: ${colorName}`,
                images: validatedImageUrl ? [validatedImageUrl] : undefined,
                metadata: regularMetadata,
              },
              unit_amount: Math.round(regularPrice * 100), // Convert to cents
            },
            quantity: remainingItems,
          });
        }
      } else {
        // Regular pricing for non-promotional items or quantities less than 2
        let effectivePrice = item.product.price;

        // Check for current promotional pricing from database first
        if (
          item.product.productType === 'sunglasses' &&
          item.product.category
        ) {
          const productCategory = item.product.category as
            | 'signature'
            | 'essentials';
          const hookCategory =
            productCategory === 'essentials' ? 'essential' : productCategory;
          const categoryPricing = await getCategoryPromotionalPricing(
            hookCategory
          );

          if (categoryPricing && categoryPricing.isPromotional) {
            effectivePrice = categoryPricing.promotionalPrice;
          } else if (
            item.product.discountedPrice &&
            item.product.discountedPrice > 0
          ) {
            effectivePrice = item.product.discountedPrice;
          }
        } else if (
          item.product.discountedPrice &&
          item.product.discountedPrice > 0
        ) {
          effectivePrice = item.product.discountedPrice;
        }

        const productMetadata = {
          productId: item.product._id?.toString() || '',
          color: colorName,
          name: item.product.name,
          originalPrice: item.product.price.toString(),
          effectivePrice: effectivePrice.toString(),
          quantity: item.quantity.toString(),
          promotionalPricing:
            item.product.productType === 'sunglasses' && item.product.category
              ? 'true'
              : 'false',
        };

        lineItems.push({
          price_data: {
            currency: 'aud',
            product_data: {
              name: item.product.name,
              description: `Color: ${colorName}`,
              images: validatedImageUrl ? [validatedImageUrl] : undefined,
              metadata: productMetadata,
            },
            unit_amount: Math.round(effectivePrice * 100), // Convert to cents
          },
          quantity: item.quantity,
        });
      }
    }

    // Don't add shipping as a line item - let Stripe handle it via shipping_options
    // This prevents duplicate shipping charges from appearing

    // Also store product IDs and details in the session metadata for redundancy
    const sessionMetadata = {
      orderId: `order_${Date.now()}`,
      itemCount: items.length.toString(),
      productIds: items.map((item) => item.product._id?.toString()).join(','),
      subtotal: subtotal.toString(),
      shipping: shipping.toString(),
      total: calculateTotalWithShipping(subtotal).toString(),
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
      shipping_options:
        shipping > 0
          ? [
              {
                shipping_rate_data: {
                  type: 'fixed_amount',
                  fixed_amount: {
                    amount: Math.round(shipping * 100),
                    currency: 'aud',
                  },
                  display_name: 'Standard shipping',
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
            ]
          : [
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
