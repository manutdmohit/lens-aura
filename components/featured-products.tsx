"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import StaggeredList from "@/components/staggered-list"

// Define the product type based on API response
interface Product {
  _id: string
  name: string
  slug: string
  productType: string
  price: number
  imageUrl: string
}

export default function FeaturedProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true)
        setError(null)
        
        // Add timestamp to avoid caching issues
        const response = await fetch(`/api/glasses/featured`, {
          cache: 'no-store'
        })
        
        if (!response.ok) {
          throw new Error(`Failed to fetch featured products: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Ensure data is an array
        if (Array.isArray(data)) {
          setProducts(data)
        } else {
          console.warn("Unexpected response format:", data)
          setProducts([])
        }
      } catch (error) {
        console.error("Failed to fetch products:", error)
        setError(error instanceof Error ? error.message : "An error occurred")
        
        // Retry logic - retry up to 3 times with increasing delays
        if (retryCount < 3) {
          const delay = Math.pow(2, retryCount) * 1000 // Exponential backoff
          console.log(`Retrying in ${delay}ms (attempt ${retryCount + 1}/3)`)
          setTimeout(() => {
            setRetryCount(prev => prev + 1)
          }, delay)
        }
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [retryCount])

  // Retry button handler
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0.6 }}
            animate={{ opacity: [0.6, 0.8, 0.6] }}
            transition={{ repeat: Number.POSITIVE_INFINITY, duration: 1.5, ease: "easeInOut" }}
          >
            <Card className="animate-pulse">
              <div className="aspect-square bg-gray-200"></div>
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Failed to load featured products</h3>
        <p className="text-sm text-gray-500 mb-4">{error}</p>
        <button 
          onClick={handleRetry}
          className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
        >
          Try Again
        </button>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No featured products available at the moment.</p>
      </div>
    )
  }

  return (
    <StaggeredList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link 
          key={product._id} 
          href={`/${product.productType}/${product.slug}`}
        >
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="aspect-square relative overflow-hidden">
              <motion.img
                src={product.imageUrl || "/placeholder.svg"}
                alt={product.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-lg">{product.name}</h3>
              <p className="text-gray-600">${product.price.toFixed(2)}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </StaggeredList>
  )
}
