'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Download } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { toast } from '@/components/ui/use-toast';
import { formatPrice } from '@/lib/utils/discount';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  imageUrl?: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerEmail: string;
  items: OrderItem[];
  totalAmount: number;
  paymentStatus: string;
  createdAt: string;
  amount_total: number;
  stockReduced?: boolean;
  customer_details: {
    name: string;
    email: string;
    address: {
      line1: string;
      line2?: string;
      city: string;
      state: string;
      postal_code: string;
      country: string;
    };
  };
}

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id') || null;
  const [orderDetails, setOrderDetails] = useState<OrderDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadedOrder, setHasLoadedOrder] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);
  const { clearCart } = useCart();
  const processedSessionsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    // Prevent redundant fetching once order details have been loaded
    if (hasLoadedOrder) {
      console.log('[DEBUG] Order details already loaded, skipping fetch');
      return;
    }

    const fetchOrderDetails = async () => {
      if (!sessionId) {
        console.log('[DEBUG] No session ID found in URL');
        setError('No checkout session found');
        setIsLoading(false);
        return;
      }

      try {
        // Clean the session ID - sometimes it might get malformed in transit
        const cleanSessionId = sessionId
          .trim()
          .replace(/['"]/g, '')
          .replace(/^ccs_test/, 'cs_test');

        console.log(
          `[DEBUG] Fetching order details for session: ${cleanSessionId}`
        );

        // Fetch order details
        const response = await fetch(`/api/stripe-sessions/${cleanSessionId}`);

        if (!response.ok) {
          const errorData = await response.json();
          console.error('[DEBUG] Error response:', errorData);
          setError(errorData.error || 'Failed to fetch order details');
          setIsLoading(false);
          return;
        }

        const data = await response.json();

        if (!data) {
          console.error('[DEBUG] No data received from API');
          setError('No order data received');
          setIsLoading(false);
          return;
        }

        console.log('[DEBUG] Successfully fetched order details:', data);

        // Set order details first
        setOrderDetails(data);
        setHasLoadedOrder(true);
        clearCart();
        setIsLoading(false);

        // Show success toast if payment is successful
        if (data.paymentStatus === 'paid') {
          toast({
            title: 'Payment Successful',
            description: 'Your payment has been processed successfully.',
            duration: 5000,
          });
        }
      } catch (err) {
        console.error('[DEBUG] Error fetching order details:', err);
        setError('Could not retrieve order details');
        setIsLoading(false);
      }
    };

    fetchOrderDetails();
  }, [sessionId, clearCart, hasLoadedOrder]);

  // Stock processing - runs once per session when order is paid
  useEffect(() => {
    if (
      !orderDetails ||
      !sessionId ||
      orderDetails.paymentStatus !== 'paid' ||
      orderDetails.stockReduced
    ) {
      console.log('[DEBUG] Skipping stock processing:', {
        hasOrderDetails: !!orderDetails,
        hasSessionId: !!sessionId,
        paymentStatus: orderDetails?.paymentStatus,
        stockReduced: orderDetails?.stockReduced,
      });
      return;
    }

    // Use a ref to track if we've already processed this session
    const sessionKey = `${sessionId}-${orderDetails.orderNumber}`;

    if (processedSessionsRef.current.has(sessionKey)) {
      console.log('[DEBUG] Stock already processed for this session');
      return;
    }

    const processStock = async () => {
      try {
        console.log(
          '[DEBUG] Processing stock reduction for order:',
          orderDetails.orderNumber
        );

        const cleanSessionId = sessionId
          .trim()
          .replace(/['"]/g, '')
          .replace(/^ccs_test/, 'cs_test');

        const stockUpdateResponse = await fetch('/api/checkout/success', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ sessionId: cleanSessionId }),
        });

        if (!stockUpdateResponse.ok) {
          const stockError = await stockUpdateResponse.json();
          console.error('[DEBUG] Error reducing stock:', stockError);
        } else {
          console.log('[DEBUG] Stock reduction processed successfully');
          // Mark this session as processed
          processedSessionsRef.current.add(sessionKey);
        }
      } catch (error) {
        console.error('[DEBUG] Error processing stock:', error);
      }
    };

    processStock();
  }, [orderDetails, sessionId]);

  const downloadInvoice = async () => {
    if (!orderDetails) return;

    try {
      setIsDownloadingInvoice(true);
      console.log(
        'Starting invoice download for order:',
        orderDetails.orderNumber
      );

      const requestBody = {
        orderDetails,
        sessionId,
      };

      console.log('Sending request to API:', requestBody);

      const response = await fetch('/api/invoice/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Response status:', response.status);
      console.log(
        'Response headers:',
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        console.error('API error response:', errorData);
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const htmlContent = await response.text();
      console.log('Received HTML content length:', htmlContent.length);

      // Create a blob with the HTML content
      const blob = new Blob([htmlContent], { type: 'text/html' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderDetails.orderNumber}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Invoice downloaded successfully');
      toast({
        title: 'Invoice Downloaded',
        description: 'Your invoice has been downloaded successfully.',
        duration: 3000,
      });
    } catch (error) {
      console.error('Error downloading invoice:', error);
      toast({
        title: 'Download Failed',
        description: `Failed to download invoice: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        duration: 5000,
      });
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  // Redirect to home if no session ID after 5 seconds
  useEffect(() => {
    if (!sessionId) {
      const timer = setTimeout(() => {
        router.push('/');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [sessionId, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
          <h1 className="text-2xl font-semibold">Loading order details...</h1>
          <p className="text-gray-600">
            Please wait while we fetch your order information.
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center space-y-6">
          <div className="h-12 w-12 text-red-500">
            <AlertCircle className="h-full w-full" />
          </div>
          <h1 className="text-2xl font-semibold text-red-500">
            Order Not Found
          </h1>
          <p className="text-gray-600">{error}</p>
          <p className="text-sm text-gray-500">
            You will be redirected to the home page shortly.
          </p>
        </div>
      </div>
    );
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
                  ? 'Your order has been confirmed and is being processed.'
                  : 'Your order has been received and is being processed.'}
              </p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-semibold">Order Summary</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                  onClick={downloadInvoice}
                  disabled={isDownloadingInvoice || !orderDetails}
                >
                  <Download className="h-4 w-4" />
                  {isDownloadingInvoice ? 'Generating...' : 'Download Invoice'}
                </Button>
              </div>
              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Order ID</p>
                  <p className="font-medium">
                    {orderDetails?.orderNumber || sessionId}
                  </p>
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
                      <Badge
                        variant="secondary"
                        className="bg-green-100 text-green-800"
                      >
                        Paid
                      </Badge>
                    ) : orderDetails?.paymentStatus === 'pending' ? (
                      <Badge
                        variant="secondary"
                        className="bg-yellow-100 text-yellow-800"
                      >
                        Processing Payment
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="bg-red-100 text-red-800"
                      >
                        Failed
                      </Badge>
                    )}
                  </div>
                </div>

                <div>
                  <p className="text-sm text-gray-500">Total Amount</p>
                  <p className="font-medium">
                    ${(orderDetails?.amount_total || 0) / 100} AUD
                  </p>
                </div>

                {orderDetails?.customer_details?.address && (
                  <div className="col-span-2">
                    <p className="text-sm text-gray-500">Shipping Address</p>
                    <p className="font-medium">
                      {orderDetails.customer_details.name}
                      <br />
                      {orderDetails.customer_details.address.line1}
                      <br />
                      {orderDetails.customer_details.address.line2 && (
                        <>
                          {orderDetails.customer_details.address.line2}
                          <br />
                        </>
                      )}
                      {orderDetails.customer_details.address.city},{' '}
                      {orderDetails.customer_details.address.state}{' '}
                      {orderDetails.customer_details.address.postal_code}
                      <br />
                      {orderDetails.customer_details.address.country}
                    </p>
                  </div>
                )}
              </div>
            </div>

            {orderDetails?.items && orderDetails.items.length > 0 && (
              <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold">Order Items</h3>
                <Separator />
                <div className="space-y-4">
                  {orderDetails.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center"
                    >
                      <div>
                        <p className="font-medium">
                          {item.quantity}x {item.name}
                        </p>
                        <p className="text-sm text-gray-500">
                          Color: {item.color}
                        </p>
                      </div>
                      <p className="font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center space-y-4">
              <p className="text-sm text-gray-600">
                You will receive a confirmation email with your order details
                shortly.
              </p>
              <p className="text-sm  text-gray-600">
                Please check your spam folder if you don't see the email in your
                inbox. Feel free to contact us at if you have any questions.
              </p>

              <div className="flex justify-center">
                <Button
                  variant="default"
                  className="flex items-center gap-2"
                  onClick={() => {
                    router.push('/');
                    clearCart();
                  }}
                >
                  Continue Shopping
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
