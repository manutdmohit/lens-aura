"use client"

import { useState, useEffect } from "react"
import { notFound, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { getProductById } from "@/lib/db"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import AddToCartButton from "@/components/add-to-cart-button"
import ProductColorSelector from "@/components/product-color-selector"
import ProductDetailImages from "@/components/product-detail-images"
import type { Product } from "@/types/product"

interface ProductPageProps {
  params: {
    id: string
  }
}

export default function ProductPage({ params }: ProductPageProps) {
  const [product, setProduct] = useState<Product | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedColor, setSelectedColor] = useState<string>("")
  const router = useRouter()

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const productData = await getProductById(params.id)
        if (!productData) {
          notFound()
        }
        setProduct(productData)
        setSelectedColor(productData.colors[0])
      } catch (error) {
        console.error("Failed to fetch product:", error)
        notFound()
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  if (loading) {
    return (
      <main className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div>
                <div className="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                <div className="h-12 bg-gray-200 rounded w-full mb-6"></div>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </main>
    )
  }

  if (!product) {
    return notFound()
  }

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="inline-flex items-center text-gray-600 hover:text-gray-900 mb-6">
          <ChevronLeft className="h-4 w-4 mr-1" />
          Back to products
        </Link>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
          {/* Product Images */}
          <ProductDetailImages productId={product.id} mainImage={product.imageUrl} productName={product.name} />

          {/* Product Details */}
          <div>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-2xl mt-2">${product.price.toFixed(2)}</p>

            <div className="mt-6">
              <h2 className="text-lg font-medium mb-2">Description</h2>
              <p className="text-gray-600">{product.description}</p>
            </div>

            <div className="mt-6">
              <h2 className="text-lg font-medium mb-2">Color</h2>
              <ProductColorSelector productId={product.id} colors={product.colors} onColorChange={setSelectedColor} />
            </div>

            <div className="mt-8">
              <AddToCartButton product={product} selectedColor={selectedColor} />
            </div>

            <div className="mt-8 border-t pt-6">
              <h2 className="text-lg font-medium mb-2">Shipping & Returns</h2>
              <ul className="text-gray-600 space-y-2">
                <li>Free shipping on all orders</li>
                <li>30-day return policy</li>
                <li>1-year warranty on all frames</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}
