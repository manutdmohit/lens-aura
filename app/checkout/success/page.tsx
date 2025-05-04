"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/context/cart-context"

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
        // Remove any quotes and whitespace, and fix the 'ccs_test' prefix if present
        const cleanSessionId = sessionId
          .trim()
          .replace(/['"]/g, '')
          .replace(/^ccs_test/, 'cs_test');
        
        console.log(`[DEBUG] Original session ID: ${sessionId}`);
        console.log(`[DEBUG] Cleaned session ID: ${cleanSessionId}`);
        
        const response = await fetch(`/api/stripe-sessions/${cleanSessionId}`)
        
        if (!response.ok) {
          const errorData = await response.json()
          console.error("[DEBUG] Error response:", errorData)
          throw new Error(errorData.error || "Failed to fetch order details")
        }
        
        const data = await response.json()
        console.log('[DEBUG] Successfully fetched order details:', data)
        setOrderDetails(data)
        setHasLoadedOrder(true)
        
        // If the order is paid, ensure stock is reduced
        if (data.paymentStatus === 'paid') {
          try {
            console.log('[DEBUG] Order is paid, ensuring stock reduction');
            // Call our new API endpoint to reduce stock
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
          } catch (stockError) {
            console.error('[DEBUG] Error updating stock:', stockError);
            // We don't need to show this error to the user as it's a background operation
          }
        }
        
        // Clear the cart if we've successfully loaded order details
        // This ensures we only clear when there's actually a valid order
        clearCart()
        console.log("[DEBUG] Cart cleared after successful order")
      } catch (err) {
        console.error("[DEBUG] Error fetching order details:", err)
        setError("Could not retrieve order details")
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrderDetails()
  }, [sessionId, clearCart, hasLoadedOrder])

  // Redirect to home if no session ID after 5 seconds
  useEffect(() => {
    if (!sessionId) {
      const timer = setTimeout(() => {
        router.push("/")
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [sessionId, router])

  // Add a polling mechanism to refresh order status periodically
  useEffect(() => {
    // Only start polling if sessionId exists and we're waiting for payment to complete
    if (sessionId && orderDetails && orderDetails.paymentStatus === 'pending') {
      console.log('Starting payment status polling for pending order');
      const interval = setInterval(async () => {
        try {
          const response = await fetch(`/api/stripe-sessions/${sessionId}`)
          if (response.ok) {
            const data = await response.json()
            
            // Only update if the status has changed
            if (data.paymentStatus !== orderDetails.paymentStatus) {
              console.log(`Payment status updated: ${orderDetails.paymentStatus} → ${data.paymentStatus}`)
              setOrderDetails(data)
            }
            
            // Stop polling if payment is no longer pending
            if (data.paymentStatus !== 'pending') {
              console.log('Payment status is no longer pending, stopping polling');
              clearInterval(interval)
            }
          }
        } catch (err) {
          console.error("Error refreshing order details:", err)
        }
      }, 3000) // Check every 3 seconds
      
      return () => clearInterval(interval)
    }
    
    // Don't poll if order is already paid
    if (orderDetails && orderDetails.paymentStatus === 'paid') {
      console.log('Order is already paid, no need to poll for status updates');
    }
  }, [sessionId, orderDetails])

  // Add a function to manually check and update payment status
  const checkAndUpdatePaymentStatus = async (sessionId: string) => {
    try {
      console.log('Manually checking payment status...');
      const response = await fetch(`/api/stripe/update-payment-status?sessionId=${sessionId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Payment status update failed:', errorData);
        return false;
      }
      
      const data = await response.json();
      console.log('Payment status check result:', data);
      
      if (data.success && data.paymentStatus === 'paid') {
        // Refresh order details to show the updated status
        const orderResponse = await fetch(`/api/stripe-sessions/${sessionId}`);
        if (orderResponse.ok) {
          const orderData = await orderResponse.json();
          setOrderDetails(orderData);
          return true;
        }
      }
      
      return false;
    } catch (err) {
      console.error('Error checking payment status:', err);
      return false;
    }
  };

  // Add a button to manually check payment status if it's still pending
  const handleManualStatusCheck = async () => {
    if (!sessionId || !orderDetails) return;
    
    setIsLoading(true);
    await checkAndUpdatePaymentStatus(sessionId);
    setIsLoading(false);
  };

  if (isLoading) {
    return (
      <div className="container max-w-md mx-auto py-10">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold">Processing your order...</h1>
          <p className="text-gray-600">Please wait while we confirm your payment.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container max-w-md mx-auto py-10">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-3xl font-bold text-red-500">Order Not Found</h1>
          <p>{error}</p>
          <p>You will be redirected to the home page shortly.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container max-w-md mx-auto py-10">
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <CheckCircle className="h-12 w-12 text-green-500" />
          <h1 className="text-3xl font-bold text-center">Thank You for Your Order!</h1>
          <p className="text-lg text-gray-600 text-center">Your payment was successful and your order has been placed.</p>
        </div>

        <Card className="p-6 bg-gray-50">
          <div className="flex flex-col space-y-4">
            <h2 className="text-lg font-medium">Order Details</h2>
            <Separator />
            
            <div className="flex justify-between items-center">
              <span className="font-semibold">Order ID:</span>
              <span>{orderDetails?.orderNumber || sessionId}</span>
            </div>
            
            {orderDetails?.customerEmail && (
              <div className="flex justify-between items-center">
                <span className="font-semibold">Email:</span>
                <span>{orderDetails.customerEmail}</span>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="font-semibold">Status:</span>
              <div className="flex items-center gap-2">
                {orderDetails?.paymentStatus === 'paid' ? (
                  <Badge variant="secondary" className="bg-green-100 text-green-800">Paid</Badge>
                ) : orderDetails?.paymentStatus === 'pending' ? (
                  <>
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-xs py-0 h-6 px-2"
                      onClick={handleManualStatusCheck}
                    >
                      Refresh
                    </Button>
                  </>
                ) : (
                  <Badge variant="secondary" className="bg-red-100 text-red-800">Failed</Badge>
                )}
              </div>
            </div>
            
            {orderDetails?.totalAmount && (
              <div className="flex justify-between items-center">
                <span className="font-semibold">Total:</span>
                <span>${orderDetails.totalAmount.toFixed(2)} AUD</span>
              </div>
            )}
            
            {orderDetails?.items && orderDetails.items.length > 0 && (
              <div className="mt-4">
                <h3 className="font-semibold mb-2">Items:</h3>
                <div className="space-y-2">
                  {orderDetails.items.map((item, index) => (
                    <div key={index} className="text-sm flex justify-between">
                      <span>{item.quantity}x {item.name} ({item.color})</span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <p className="text-sm text-gray-600 mt-4">
              You will receive a confirmation email with your order details shortly.
            </p>
          </div>
        </Card>
        
        <div className="text-center mt-6">
          <Button 
            variant="link" 
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
  )
}
