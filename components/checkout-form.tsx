"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { createCheckoutSession } from "@/actions/checkout"
import { useToast } from "@/hooks/use-toast"

export default function CheckoutForm() {
  const { items, subtotal } = useCart()
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const { toast } = useToast()

  const handleCheckout = async () => {
    if (items.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive",
      })
      return
    }

    setIsCheckingOut(true)

    try {
      const origin = window.location.origin
      const result = await createCheckoutSession(items, origin)

      if (result.error) {
        toast({
          title: "Checkout Error",
          description: result.error,
          variant: "destructive",
        })
        setIsCheckingOut(false)
        return
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url
      }
    } catch (error) {
      console.error("Checkout error:", error)
      toast({
        title: "Checkout Error",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      })
      setIsCheckingOut(false)
    }
  }

  return (
    <div className="border rounded-lg p-6 sticky top-24">
      <h2 className="text-xl font-medium mb-4">Order Summary</h2>
      <div className="space-y-2 mb-4">
        <div className="flex justify-between">
          <span>Subtotal</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Shipping</span>
          <span>Calculated at checkout</span>
        </div>
        <div className="flex justify-between">
          <span>Tax</span>
          <span>Calculated at checkout</span>
        </div>
      </div>
      <div className="border-t pt-4 mb-6">
        <div className="flex justify-between font-medium">
          <span>Estimated Total</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <p className="text-xs text-gray-500 mt-1">Final price will be calculated at checkout</p>
      </div>
      <Button
        onClick={handleCheckout}
        disabled={isCheckingOut || items.length === 0}
        className="w-full bg-black text-white hover:bg-gray-800"
      >
        {isCheckingOut ? "Processing..." : "Proceed to Checkout"}
      </Button>

      <div className="mt-4 text-center text-sm text-gray-500">
        <p>Secure checkout powered by Stripe</p>
        <div className="flex justify-center mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="16" viewBox="0 0 40 16">
            <path
              fill="#6772E5"
              d="M33.5,5.3c0-1-0.8-1.3-1.7-1.3h-2.1v4.4h0.9V6.7h0.9l1.1,1.7h1.1l-1.2-1.8C33.1,6.4,33.5,6,33.5,5.3z M31.5,6h-0.9V4.7h0.9c0.5,0,0.9,0.2,0.9,0.7C32.4,5.8,32,6,31.5,6z M24.1,4h-1.6v4.4h1.6c1.3,0,2.2-0.9,2.2-2.2C26.4,4.9,25.5,4,24.1,4z M24.1,7.7h-0.7V4.8h0.7c0.9,0,1.4,0.7,1.4,1.5C25.5,7,24.9,7.7,24.1,7.7z M18.2,4h-1.6v4.4h1.6c1.3,0,2.2-0.9,2.2-2.2C20.5,4.9,19.6,4,18.2,4z M18.2,7.7h-0.7V4.8h0.7c0.9,0,1.4,0.7,1.4,1.5C19.6,7,19.1,7.7,18.2,7.7z M13.1,4.3h-1.6v1.4h1.5v0.7h-1.5v1.3h1.6v0.7h-2.4V3.6h2.4V4.3z M7.6,8.4H6.7V4.3H5.3V3.6h3.7v0.7H7.6V8.4z M38.2,6.9c0,0.9-0.7,1.5-1.6,1.5h-1.6V3.6h0.9v1.9h0.7C37.5,5.5,38.2,6.1,38.2,6.9z M37.3,6.9c0-0.5-0.3-0.8-0.8-0.8h-0.7v1.5h0.7C37,7.7,37.3,7.4,37.3,6.9z"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}
