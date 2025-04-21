"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ShoppingBag, Check } from "lucide-react"
import type { Product } from "@/types/product"
import { useCart } from "@/context/cart-context"
import { useToast } from "@/hooks/use-toast"

interface AddToCartButtonProps {
  product: Product
  selectedColor?: string
}

export default function AddToCartButton({ product, selectedColor }: AddToCartButtonProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

  const handleAddToCart = async () => {
    setIsAdding(true)

    // Use the first color if none is selected
    const color = selectedColor || product.colors[0]

    // Add item to cart
    addItem(product, 1, color)

    // Show success state
    setIsAdded(true)

    // Show toast notification
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    })

    // Reset button state after delay
    setTimeout(() => {
      setIsAdding(false)
      setIsAdded(false)
    }, 2000)
  }

  return (
    <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
      <Button
        onClick={handleAddToCart}
        disabled={isAdding || !product.inStock}
        className={`w-full h-12 text-lg ${
          isAdded ? "bg-green-600 hover:bg-green-700 text-white" : "bg-black text-white hover:bg-gray-800"
        }`}
      >
        {isAdding ? (
          <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            Adding to Cart...
          </motion.span>
        ) : isAdded ? (
          <motion.div
            className="flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            <Check className="mr-2 h-5 w-5" />
            Added to Cart
          </motion.div>
        ) : !product.inStock ? (
          "Out of Stock"
        ) : (
          <>
            <ShoppingBag className="mr-2 h-5 w-5" />
            Add to Cart
          </>
        )}
      </Button>
    </motion.div>
  )
}
