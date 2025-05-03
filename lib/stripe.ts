import Stripe from "stripe"
import type { CartItem } from "@/context/cart-context"

// Initialize Stripe with the secret key
const getStripeSecretKey = () => {
  let key = process.env.STRIPE_SECRET_KEY || ""
  
  // Clean up the key to remove any line breaks or whitespace
  if (key) {
    // Replace any whitespace characters (including line breaks) with empty string
    key = key.replace(/\s+/g, '')
    console.log(`Stripe key length after cleanup: ${key.length}`)
    
    // Verify the key format
    if (!key.startsWith('sk_')) {
      console.error("Invalid Stripe key format: doesn't start with 'sk_'")
      return ""
    }
    
    if (key.length < 30) {
      console.error(`Stripe key appears to be too short (${key.length} chars)`)
      return ""
    }
  } else {
    console.error("Missing Stripe secret key")
  }
  
  return key
}

// Initialize Stripe with the cleaned secret key
const stripeSecretKey = getStripeSecretKey()
let stripe: Stripe | null = null

try {
  if (stripeSecretKey) {
    console.log("Initializing Stripe client...")
    stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2025-03-31.basil",
    })
    console.log("Stripe initialized successfully")
  } else {
    console.error("Cannot initialize Stripe: Invalid or missing secret key")
  }
} catch (error) {
  console.error("Error initializing Stripe:", error)
}

// Validate and truncate image URLs
function validateImageUrl(url: string | undefined): string | null {
  if (!url) return null;
  
  // Check if URL is too long (Stripe has a 2048 character limit)
  if (url.length > 2000) {
    console.warn(`Image URL exceeded 2000 chars (${url.length}), truncating for Stripe compatibility`);
    return null; // Skip image rather than risk errors
  }
  
  return url;
}

export async function createCheckoutSession(items: CartItem[], successUrl: string, cancelUrl: string) {
  if (!stripeSecretKey) {
    throw new Error("Stripe secret key is not set or invalid")
  }
  
  if (!stripe) {
    throw new Error("Stripe instance not initialized")
  }

  try {
    // Format line items for Stripe
    const lineItems = items.map((item) => {
      // Validate the image URL
      const validatedImageUrl = validateImageUrl(item.product.imageUrl);
      
      return {
        price_data: {
          currency: "aud",
          product_data: {
            name: item.product.name,
            description: `Color: ${item.color}`,
            images: validatedImageUrl ? [validatedImageUrl] : undefined,
          },
          unit_amount: Math.round(item.product.price * 100), // Convert to cents
        },
        quantity: item.quantity,
      };
    });

    console.log(`Creating Stripe checkout session with ${lineItems.length} items`)
    
    // Create a checkout session
    // Note: To fully disable Link, currency conversion, and currency selector, 
    // also disable them in your Stripe Dashboard under Settings > Checkout & Payment Links
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      locale: "en",
      currency: "aud", // Explicitly set currency to AUD

      allow_promotion_codes: false,
      success_url: successUrl,
      cancel_url: cancelUrl,
      shipping_address_collection: {
        allowed_countries: ["AU"],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: {
              amount: 0,
              currency: "aud",
            },
            display_name: "Free shipping",
            delivery_estimate: {
              minimum: {
                unit: "business_day",
                value: 5,
              },
              maximum: {
                unit: "business_day",
                value: 7,
              },
            },
          },
        },
      ],
    })

    console.log(`Stripe checkout session created: ${session.id}`)
    
    return {
      id: session.id,
      url: session.url,
    }
  } catch (error: any) {
    console.error("Error creating checkout session:", error)
    
    // Add more detailed error information
    const errorMessage = error.message || "Unknown error occurred"
    const statusCode = error.statusCode || "N/A"
    const errorType = error.type || "unknown"
    
    console.error(`Stripe error details - Type: ${errorType}, Status: ${statusCode}, Message: ${errorMessage}`)
    
    throw new Error(`Stripe checkout failed: ${errorMessage}`)
  }
}

export async function getCheckoutSession(sessionId: string) {
  if (!stripeSecretKey) {
    throw new Error("Stripe secret key is not set or invalid")
  }
  
  if (!stripe) {
    throw new Error("Stripe instance not initialized")
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details"],
    })

    return session
  } catch (error: any) {
    console.error("Error retrieving checkout session:", error)
    throw new Error(`Failed to retrieve checkout details: ${error.message || "Unknown error"}`)
  }
}
