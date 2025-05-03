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

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('/api/glasses/featured')
        if (!response.ok) {
          throw new Error('Failed to fetch featured products')
        }
        const data = await response.json()
        setProducts(data)
      } catch (error) {
        console.error("Failed to fetch products:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [])

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
