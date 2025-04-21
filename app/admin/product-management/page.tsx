"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"
import ProductModal, { type ProductFormValues } from "@/components/product-modal"
import { getProducts } from "@/lib/db"
import { useToast } from "@/hooks/use-toast"
import type { Product } from "@/types/product"

export default function ProductManagementPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<"add" | "edit">("add")
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const { toast } = useToast()

  // Fetch products on component mount
  useState(() => {
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await getProducts()
        setProducts(fetchedProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
        toast({
          title: "Error",
          description: "Failed to load products. Please refresh the page.",
          variant: "destructive",
        })
      }
    }

    fetchProducts()
  })

  const handleAddProduct = () => {
    setModalMode("add")
    setSelectedProduct(null)
    setIsModalOpen(true)
  }

  const handleEditProduct = (product: Product) => {
    setModalMode("edit")
    setSelectedProduct(product)
    setIsModalOpen(true)
  }

  const handleSaveProduct = async (productData: ProductFormValues) => {
    // In a real application, this would call an API endpoint
    // For this demo, we'll just update the local state

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    if (modalMode === "add") {
      // Add new product
      const newProduct: Product = {
        ...productData,
        id: Date.now().toString(), // Generate a unique ID
        inStock: productData.stockQuantity ? productData.stockQuantity > 0 : true,
        colors: productData.colors || [],
      }
      setProducts([...products, newProduct])
    } else {
      // Update existing product
      const updatedProducts = products.map((p) =>
        p.id === productData.id
          ? {
              ...p,
              ...productData,
              inStock: productData.stockQuantity ? productData.stockQuantity > 0 : true,
            }
          : p,
      )
      setProducts(updatedProducts)
    }
  }

  const handleDeleteProduct = async (productId: string) => {
    // In a real application, this would call an API endpoint
    // For this demo, we'll just update the local state

    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    const updatedProducts = products.filter((p) => p.id !== productId)
    setProducts(updatedProducts)
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Product Management</h1>
        <Button onClick={handleAddProduct} className="bg-black text-white hover:bg-gray-800">
          <Plus className="w-4 h-4 mr-2" />
          Add New Product
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="border rounded-lg overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleEditProduct(product)}
          >
            <div className="aspect-square bg-gray-100">
              <img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-lg">{product.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{product.category}</p>
                </div>
                <p className="font-medium">${product.price.toFixed(2)}</p>
              </div>
              <p className="text-sm text-gray-600 mt-2 line-clamp-2">{product.description}</p>
              <div className="flex justify-between items-center mt-4">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    product.inStock ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                  }`}
                >
                  {product.inStock ? "In Stock" : "Out of Stock"}
                </span>
                <span className="text-sm text-gray-500">Qty: {product.stockQuantity || 0}</span>
              </div>
            </div>
          </div>
        ))}

        {products.length === 0 && (
          <div className="col-span-3 py-12 text-center bg-gray-50 rounded-lg">
            <p className="text-gray-500">No products found. Add your first product to get started.</p>
          </div>
        )}
      </div>

      <ProductModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
        onDelete={handleDeleteProduct}
        product={selectedProduct}
        mode={modalMode}
      />
    </div>
  )
}
