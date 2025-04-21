"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus, Edit } from "lucide-react"
import ProductModal, { type ProductFormValues } from "@/components/product-modal"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/product"

interface ProductModalDemoProps {
  product?: Product
  onProductSaved?: (product: Product) => void
  onProductDeleted?: (productId: string) => void
  mode?: "add" | "edit"
  buttonText?: string
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive"
}

export default function ProductModalDemo({
  product,
  onProductSaved,
  onProductDeleted,
  mode = "add",
  buttonText,
  buttonVariant = "default",
}: ProductModalDemoProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { toast } = useToast()

  const handleSaveProduct = async (productData: ProductFormValues) => {
    // In a real application, this would call an API endpoint
    // For this demo, we'll just simulate an API call

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const savedProduct: Product = {
      ...productData,
      id: productData.id || Date.now().toString(), // Generate a unique ID if not provided
      inStock: productData.stockQuantity ? productData.stockQuantity > 0 : true,
      colors: productData.colors || [],
    }

    if (onProductSaved) {
      onProductSaved(savedProduct)
    }

    toast({
      title: `Product ${mode === "add" ? "added" : "updated"} successfully`,
      description: `${savedProduct.name} has been ${mode === "add" ? "added to" : "updated in"} your inventory.`,
    })
  }

  const handleDeleteProduct = async (productId: string) => {
    // In a real application, this would call an API endpoint
    // For this demo, we'll just simulate an API call

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (onProductDeleted) {
      onProductDeleted(productId)
    }

    toast({
      title: "Product deleted",
      description: "The product has been removed from your inventory.",
    })
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant={buttonVariant}
        className={buttonVariant === "default" ? "bg-black text-white hover:bg-gray-800" : ""}
      >
        {mode === "add" ? (
          <>
            <Plus className="w-4 h-4 mr-2" />
            {buttonText || "Add Product"}
          </>
        ) : (
          <>
            <Edit className="w-4 h-4 mr-2" />
            {buttonText || "Edit Product"}
          </>
        )}
      </Button>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        product={product || null}
        mode={mode}
      />
    </>
  )
}
