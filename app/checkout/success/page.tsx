"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"
import { toast } from "@/components/ui/use-toast"

interface OrderItem {
  productId: string
  name: string
  price: number
  quantity: number
  color: string
  imageUrl?: string
}

interface OrderDetails {
  id: string
  orderNumber: string
  customerEmail: string
  items: OrderItem[]
  totalAmount: number
  paymentStatus: string
  createdAt: string
}



export default function CheckoutSuccessPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const sessionId = searchParams?.get("session_id") || null
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoadedOrder, setHasLoadedOrder] = useState(false)
  const { clearCart } = useCart()

  useEffect(() => {
    // Prevent redundant fetching once order details have been loaded
    if (hasLoadedOrder) {
      console.log('[DEBUG] Order details already loaded, skipping fetch');
      return;
    }
    
    const fetchOrderDetails = async () => {
      if (!sessionId) {
        console.log('[DEBUG] No session ID found in URL');
        setError("No checkout session found")
        setIsLoading(false)
        return
      }

      try {
        // Clean the session ID - sometimes it might get malformed in transit
        const cleanSessionId = sessionId
          .trim()
          .replace(/['"]/g, '')
          .replace(/^ccs_test/, 'cs_test');
        
        console.log(`[DEBUG] Fetching order details for session: ${cleanSessionId}`);
        
        // Fetch order details
        const response = await fetch(`/api/stripe-sessions/${cleanSessionId}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error("[DEBUG] Error response:", errorData);
          throw new Error(errorData.error || "Failed to fetch order details");
        }
        
        const data = await response.json();
        console.log('[DEBUG] Successfully fetched order details:', data);
        
        // If payment is successful and stock hasn't been reduced, reduce stock
        if (data.paymentStatus === 'paid' && !data.stockReduced) {
          console.log('[DEBUG] Payment successful, reducing stock');
          const stockUpdateResponse = await fetch('/api/checkout/success', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId: cleanSessionId }),
          });
          
          if (stockUpdateResponse.ok) {
            const stockResult = await stockUpdateResponse.json();
            console.log('[DEBUG] Stock update result:', stockResult);
          } else {
            console.error('[DEBUG] Failed to update stock:', await stockUpdateResponse.json());
          }
        } else if (data.paymentStatus === 'paid') {
          console.log('[DEBUG] Payment successful but stock already reduced');
        } else {
          console.log('[DEBUG] Payment not yet successful, status:', data.paymentStatus);
        }
        
        if (data.paymentStatus === 'paid') {
          toast({
            title: "Payment Successful",
            description: "Your payment has been processed successfully.",
            duration: 5000,
          });
        }
        
        setOrderDetails(data);
        setHasLoadedOrder(true);
        clearCart();
        setIsLoading(false);
      } catch (err) {
        console.error("[DEBUG] Error fetching order details:", err);
        setError("Could not retrieve order details");
        setIsLoading(false);
      }
    }

    fetchOrderDetails();
  }, [sessionId, clearCart, hasLoadedOrder]);

  // Redirect to home if no session ID after 5 seconds
  useEffect(() => {
    if (!sessionId) {
      const timer = setTimeout(() => {
        router.push("/")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [sessionId, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <h1 className="text-2xl font-semibold">Loading order details...</h1>
          <p className="text-gray-600">Please wait while we fetch your order information.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="h-12 w-12 text-red-500">
            <AlertCircle className="h-full w-full" />
          </div>
          <h1 className="text-2xl font-semibold text-red-500">Order Not Found</h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500">You will be redirected to the home page shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-sm p-8">
          <div className="flex flex-col items-center space-y-6 mb-8">
            <div className="h-16 w-16 text-green-500">
              <CheckCircle className="h-full w-full" />
            </div>
            <div className="text-center space-y-2">
              <h1 className="text-3xl font-bold">Thank You for Your Order!</h1>
              <p className="text-lg text-gray-600">
                {orderDetails?.paymentStatus === 'paid' 
                  ? "Your order has been confirmed and is being processed."
                  : "Your order has been received and is being processed."}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h2 className="text-lg font-semibold">Order Summary</h2>
              <Separator />
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">{orderDetails?.orderNumber || sessionId}</p>
                </div>
                
                {orderDetails?.customerEmail && (
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{orderDetails.customerEmail}</p>
                  </div>
                )}
                
                <div>
                  <p className="text-sm text-gray-500">Status</p>
                  <div className="flex items-center gap-2">
                    {orderDetails?.paymentStatus === 'paid' ? (
                      <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>
                    ) : orderDetails?.paymentStatus === 'pending' ? (
                      <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Processing Payment</Badge>
                    ) : (
                      <Badge variant="secondary" className="bg-red-100 text-red-800">Failed</Badge>
                    )}
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">${orderDetails?.totalAmount.toFixed(2)} AUD</p>
                </div>
              </div>
            </div>

            {orderDetails?.items && orderDetails.items.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">Order Items</h3>
                <Separator />
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <div>
                        <p className="font-medium">{item.quantity}x {item.name}</p>
                        <p className="text-sm text-gray-500">Color: {item.color}</p>
                      </div>
                      <p className="font-medium">${(item.price * item.quantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                You will receive a confirmation email with your order details shortly.
              </p>
              <Button 
                variant="default"
                className="w-full max-w-xs"
                onClick={() => {
                  router.push("/")
                  clearCart()
                }}
              >
                Continue Shopping
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
