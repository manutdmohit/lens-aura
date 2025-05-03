"use client"

import { useEffect, useState, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { CheckCircle, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"
import { useCart } from "@/context/cart-context"

// Client component that uses search params
function CheckoutSuccessContent() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get("session_id")
  const [orderDetails, setOrderDetails] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { clearCart } = useCart()

  useEffect(() => {
    const fetchSession = async () => {
      if (!sessionId) {
        setError("No session ID provided")
        setLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/checkout-session?sessionId=${sessionId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch session")
        }

        const data = await response.json()
        setOrderDetails(data)

        // Clear the cart on successful checkout
        clearCart()
      } catch (error) {
        console.error("Error fetching session:", error)
        setError("Failed to load order details")
      } finally {
        setLoading(false)
      }
    }

    fetchSession()
  }, [sessionId, clearCart])

  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center">
          <CheckCircle className="mx-auto h-16 w-16 text-green-500 mb-4" />
          <h1 className="text-3xl font-bold mb-2">Thank You for Your Order!</h1>
          <p className="text-lg text-gray-600 mb-8">Your order has been successfully placed and is being processed.</p>

          {loading ? (
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
            </div>
          ) : error ? (
            <div className="bg-yellow-50 p-6 rounded-lg mb-8">
              <p className="text-yellow-700">{error}</p>
            </div>
          ) : orderDetails ? (
            <div className="bg-gray-50 p-6 rounded-lg mb-8 text-left">
              <h2 className="text-xl font-medium mb-4">Order Details</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Order ID:</span>
                  <span>{orderDetails.id}</span>
                </div>
                {orderDetails.customer_details && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Name:</span>
                      <span>{orderDetails.customer_details.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Email:</span>
                      <span>{orderDetails.customer_details.email}</span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600">Total:</span>
                  <span>
                    ${(orderDetails.amount_total / 100).toFixed(2)} {orderDetails.currency.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="text-green-600 font-medium capitalize">{orderDetails.payment_status}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-50 p-6 rounded-lg mb-8">
              <p className="text-yellow-700">
                Order details could not be loaded. Please contact customer support for assistance.
              </p>
            </div>
          )}

          <div className="space-y-4">
            <p className="text-gray-600">We've sent a confirmation email with all the details of your purchase.</p>
            <Button asChild className="bg-black text-white hover:bg-gray-800">
              <Link href="/">
                Continue Shopping
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  )
}

// Main export with Suspense boundary
export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={
      <main className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow max-w-3xl mx-auto px-4 py-16 sm:px-6 lg:px-8 text-center">
          <div className="animate-pulse space-y-4">
            <div className="h-16 w-16 bg-gray-200 rounded-full mx-auto"></div>
            <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            <div className="h-32 bg-gray-200 rounded w-full mx-auto mt-8"></div>
          </div>
        </div>
        <Footer />
      </main>
    }>
      <CheckoutSuccessContent />
    </Suspense>
  )
}
