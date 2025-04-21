import Stripe from "stripe"
import type { CartItem } from "@/context/cart-context"

// Initialize Stripe with the secret key
const stripeSecretKey = process.env.STRIPE_SECRET_KEY || ""
const stripe = new Stripe(stripeSecretKey, {
  apiVersion: "2023-10-16",
})

export async function createCheckoutSession(items: CartItem[], successUrl: string, cancelUrl: string) {
  if (!stripeSecretKey) {
    throw new Error("Stripe secret key is not set")
  }

  try {
    // Format line items for Stripe
    const lineItems = items.map((item) => ({
      price_data: {
        currency: "aud",
        product_data: {
          name: item.product.name,
          description: `Color: ${item.color}`,
          images: [item.product.imageUrl],
        },
        unit_amount: Math.round(item.product.price * 100), // Convert to cents
      },
      quantity: item.quantity,
    }))

    // Create a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: lineItems,
      mode: "payment",
      success_url: successUrl,
      cancel_url: cancelUrl,
      shipping_address_collection: {
        allowed_countries: ["AU", "NZ", "US", "CA", "GB"],
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

    return {
      id: session.id,
      url: session.url,
    }
  } catch (error) {
    console.error("Error creating checkout session:", error)
    throw error
  }
}

export async function getCheckoutSession(sessionId: string) {
  if (!stripeSecretKey) {
    throw new Error("Stripe secret key is not set")
  }

  try {
    // Retrieve the checkout session
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["line_items", "customer_details"],
    })

    return session
  } catch (error) {
    console.error("Error retrieving checkout session:", error)
    throw error
  }
}
