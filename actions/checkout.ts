"use server"

import type { CartItem } from "@/context/cart-context"
import { createCheckoutSession as stripeCreateCheckoutSession } from "@/lib/stripe"
import { createPendingOrder } from "@/lib/order-service"

export async function createCheckoutSession(cartItems: CartItem[], origin: string) {
  if (!cartItems || cartItems.length === 0) {
    return { error: "Cart is empty" }
  }

  try {
    // Create success and cancel URLs
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/checkout/cancel`

    // Create checkout session
    const session = await stripeCreateCheckoutSession(cartItems, successUrl, cancelUrl)
    
    // Create a pending order in the database
    await createPendingOrder(cartItems, session.id)
    
    // Return session details for redirect
    return { sessionId: session.id, url: session.url }
  } catch (error) {
    console.error("Error in createCheckoutSession:", error)
    return { error: "Failed to create checkout session. Please try again." }
  }
}
