import { NextResponse } from "next/server"
import { createCheckoutSession } from "@/lib/stripe"
import type { CartItem } from "@/context/cart-context"

export async function POST(request: Request) {
  try {
    const { items } = await request.json()

    if (!items || items.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 })
    }

    // Get the origin for success and cancel URLs
    const origin = request.headers.get("origin") || "http://localhost:3000"

    // Create success and cancel URLs
    const successUrl = `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`
    const cancelUrl = `${origin}/checkout/cancel`

    // Create checkout session
    const session = await createCheckoutSession(items as CartItem[], successUrl, cancelUrl)

    return NextResponse.json({
      sessionId: session.id,
      url: session.url,
    })
  } catch (error: any) {
    console.error("Error in create-checkout-session:", error)
    return NextResponse.json({ error: error.message || "Failed to create checkout session" }, { status: 500 })
  }
}
