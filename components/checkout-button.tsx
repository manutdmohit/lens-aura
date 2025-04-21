"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"

interface CheckoutButtonProps {
  onCheckout: (items: any[]) => Promise<{ sessionId?: string; url?: string; error?: string }>
}

export default function CheckoutButton({ onCheckout }: CheckoutButtonProps) {
  const { items } = useCart()
  const [isLoading, setIsLoading] = useState(false)
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

    setIsLoading(true)

    try {
      const result = await onCheckout(items)

      if (result.error) {
        toast({
          title: "Checkout Error",
          description: result.error,
          variant: "destructive",
        })
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
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleCheckout}
      disabled={isLoading || items.length === 0}
      className="w-full bg-black text-white hover:bg-gray-800"
    >
      {isLoading ? "Processing..." : "Proceed to Checkout"}
    </Button>
  )
}
