'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CheckCircle, AlertCircle, Download } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useCart } from '@/context/cart-context';
import { toast } from '@/components/ui/use-toast';
import {
  formatPrice,
  calculateSeptember2025Pricing,
  calculatePromotionalPricing,
} from '@/lib/utils/discount';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  color: string;
  imageUrl?: string;
  productType?: string;
  category?: string;
}

interface OrderDetails {
  id: string;
  orderNumber: string;
  customerEmail: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
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

  // Function to get the correct promotional price for display (using same logic as invoice)
  const getPromotionalPrice = (item: OrderItem, orderTotal?: number) => {
    console.log('[DEBUG] getPromotionalPrice called with:', {
      name: item.name,
      productType: item.productType,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      orderTotal,
    });

    if (item.productType === 'sunglasses' && item.category) {
      let basePrice = 0;
      if (item.category === 'signature') {
        basePrice = 99; // Original Signature price
      } else if (item.category === 'essentials') {
        basePrice = 59; // Original Essentials price
      }

      if (basePrice > 0) {
        const septemberPricing = calculateSeptember2025Pricing(
          basePrice,
          item.category as 'signature' | 'essentials'
        );

        if (septemberPricing.isActive) {
          const promo = calculatePromotionalPricing(
            septemberPricing.promotionalPrice,
            item.category as 'essentials' | 'signature'
          );

          if (item.quantity === 1) {
            // 1 item - individual discounted price
            const result = septemberPricing.promotionalPrice;
            console.log(
              '[DEBUG] getPromotionalPrice result for qty=1:',
              result
            );
            return result;
          } else if (item.quantity === 2) {
            // Exactly 2 items - apply "buy two" offer
            const result = promo.twoForPrice / item.quantity;
            console.log(
              '[DEBUG] getPromotionalPrice result for qty=2:',
              result
            );
            return result;
          } else if (item.quantity > 2) {
            // For quantities > 2, check if there's a discrepancy with actual amount paid
            const promotionalPairs = Math.floor(item.quantity / 2);
            const remainingItems = item.quantity - promotionalPairs * 2;
            const promotionalPrice = promotionalPairs * promo.twoForPrice;
            const regularPrice =
              remainingItems * septemberPricing.promotionalPrice;

            // Check if there's a discrepancy between calculated and actual amount
            const calculatedTotal = promotionalPrice + regularPrice;
            const actualAmountPaid = orderTotal ? orderTotal / 100 : 0;

            // If there's a discrepancy, use the actual amount paid to calculate effective price
            if (
              actualAmountPaid > 0 &&
              Math.abs(calculatedTotal - actualAmountPaid) > 0.01
            ) {
              const effectivePrice = actualAmountPaid / item.quantity;
              console.log('[DEBUG] getPromotionalPrice using actual amount:', {
                promotionalPairs,
                remainingItems,
                promotionalPrice,
                regularPrice,
                calculatedTotal,
                actualAmountPaid,
                effectivePrice,
              });
              return effectivePrice;
            } else {
              // Use the calculated total for the line item
              const result = (promotionalPrice + regularPrice) / item.quantity;
              console.log('[DEBUG] getPromotionalPrice result for qty>2:', {
                promotionalPairs,
                remainingItems,
                promotionalPrice,
                regularPrice,
                result,
              });
              return result;
            }
          }
        }
      }
    }
    // Fallback: price is already in dollars
    const fallbackPrice = item.price || 0;
    console.log('[DEBUG] getPromotionalPrice fallback result:', fallbackPrice);
    return fallbackPrice;
  };

  // Function to get the total for an item (using same logic as invoice)
  const getItemTotal = (item: OrderItem, orderTotal?: number) => {
    console.log('[DEBUG] getItemTotal called with:', {
      name: item.name,
      productType: item.productType,
      category: item.category,
      quantity: item.quantity,
      price: item.price,
      orderTotal,
    });
    if (item.productType === 'sunglasses' && item.category) {
      let basePrice = 0;
      if (item.category === 'signature') {
        basePrice = 99; // Original Signature price
      } else if (item.category === 'essentials') {
        basePrice = 59; // Original Essentials price
      }

      if (basePrice > 0) {
        const septemberPricing = calculateSeptember2025Pricing(
          basePrice,
          item.category as 'signature' | 'essentials'
        );

        if (septemberPricing.isActive) {
          const promo = calculatePromotionalPricing(
            septemberPricing.promotionalPrice,
            item.category as 'essentials' | 'signature'
          );

          if (item.quantity === 1) {
            // 1 item - individual discounted price
            return septemberPricing.promotionalPrice;
          } else if (item.quantity === 2) {
            // Exactly 2 items - apply "buy two" offer
            return promo.twoForPrice;
          } else if (item.quantity > 2) {
            // For quantities > 2, check if there's a discrepancy with actual amount paid
            const promotionalPairs = Math.floor(item.quantity / 2);
            const remainingItems = item.quantity - promotionalPairs * 2;
            const promotionalPrice = promotionalPairs * promo.twoForPrice;
            const regularPrice =
              remainingItems * septemberPricing.promotionalPrice;

            // Check if there's a discrepancy between calculated and actual amount
            const calculatedTotal = promotionalPrice + regularPrice;
            const actualAmountPaid = orderTotal ? orderTotal / 100 : 0;

            // If there's a discrepancy, use the actual amount paid
            if (
              actualAmountPaid > 0 &&
              Math.abs(calculatedTotal - actualAmountPaid) > 0.01
            ) {
              return actualAmountPaid;
            } else {
              // Return the calculated total for this item
              return promotionalPrice + regularPrice;
            }
          }
        }
      }
    }
    // Fallback: price is already in dollars, multiply by quantity
    return (item.price || 0) * item.quantity;
  };

  // Function to get promotional pricing information
  const getPromotionalInfo = (item: OrderItem) => {
    if (item.productType === 'sunglasses' && item.category) {
      let basePrice = 0;
      if (item.category === 'signature') {
        basePrice = 99;
      } else if (item.category === 'essentials') {
        basePrice = 59;
      }

      if (basePrice > 0) {
        const septemberPricing = calculateSeptember2025Pricing(
          basePrice,
          item.category as 'signature' | 'essentials'
        );

        if (septemberPricing.isActive) {
          const promo = calculatePromotionalPricing(
            septemberPricing.promotionalPrice,
            item.category as 'essentials' | 'signature'
          );

          if (item.quantity === 1) {
            return {
              type: 'individual',
              savings: basePrice - septemberPricing.promotionalPrice,
            };
          } else if (item.quantity === 2) {
            return {
              type: 'buy-two',
              savings: basePrice * 2 - promo.twoForPrice,
            };
          } else if (item.quantity > 2) {
            const promotionalPairs = Math.floor(item.quantity / 2);
            const remainingItems = item.quantity - promotionalPairs * 2;
            const promotionalPrice = promotionalPairs * promo.twoForPrice;
            const regularPrice =
              remainingItems * septemberPricing.promotionalPrice;
            const totalWithPromo = promotionalPrice + regularPrice;
            const totalWithoutPromo = basePrice * item.quantity;
            return {
              type: 'mixed',
              savings: totalWithoutPromo - totalWithPromo,
            };
          }
        }
      }
    }
    return null;
  };

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

      const pdfBuffer = await response.arrayBuffer();
      console.log('Received PDF buffer length:', pdfBuffer.byteLength);

      // Create a blob with the PDF content
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderDetails.orderNumber}.pdf`;
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
          {/* Logo */}
          <div className="mb-4">
            <Image
              src="/images/lens-aura-logo.jpg"
              alt="Lens Aura Logo"
              width={120}
              height={60}
              className="object-contain"
            />
          </div>

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
          {/* Logo */}
          <div className="mb-4">
            <Image
              src="/images/lens-aura-logo.jpg"
              alt="Lens Aura Logo"
              width={120}
              height={60}
              className="object-contain"
            />
          </div>

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
            {/* Logo */}
            <div className="mb-4">
              <Image
                src="/images/lens-aura-logo.jpg"
                alt="Lens Aura Logo"
                width={120}
                height={60}
                className="object-contain"
              />
            </div>

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
                      className="flex justify-between items-start p-4 bg-white rounded-lg border border-gray-200"
                    >
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-lg">
                            {item.quantity}x {item.name}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            #{index + 1}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <span className="font-medium">Color:</span>{' '}
                            {item.color || 'N/A'}
                          </div>
                          {item.productType && (
                            <div>
                              <span className="font-medium">Type:</span>{' '}
                              {item.productType.charAt(0).toUpperCase() +
                                item.productType.slice(1)}
                            </div>
                          )}
                          {item.category && (
                            <div>
                              <span className="font-medium">Category:</span>{' '}
                              {item.category.charAt(0).toUpperCase() +
                                item.category.slice(1)}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Price:</span>{' '}
                            {formatPrice(
                              getPromotionalPrice(
                                item,
                                orderDetails?.amount_total
                              )
                            )}
                          </div>
                        </div>

                        {/* Promotional Information */}
                        {(() => {
                          const promoInfo = getPromotionalInfo(item);
                          if (promoInfo) {
                            return (
                              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
                                <div className="flex items-center gap-2">
                                  <Badge
                                    variant="secondary"
                                    className="bg-green-100 text-green-800 text-xs"
                                  >
                                    Current Offer
                                  </Badge>
                                  <span className="text-sm text-green-700 font-medium">
                                    You saved {formatPrice(promoInfo.savings)}!
                                  </span>
                                </div>
                                <p className="text-xs text-green-600 mt-1">
                                  {promoInfo.type === 'individual' &&
                                    'Individual discount applied'}
                                  {promoInfo.type === 'buy-two' &&
                                    'Buy Two offer applied'}
                                  {promoInfo.type === 'mixed' &&
                                    'Mixed promotional pricing applied'}
                                </p>
                              </div>
                            );
                          }
                          return null;
                        })()}

                        {item.imageUrl && (
                          <div className="mt-2">
                            <div className="w-16 h-16 sm:w-20 sm:h-20 relative rounded-md border border-gray-200 overflow-hidden">
                              <Image
                                src={item.imageUrl}
                                alt={item.name}
                                className="w-full h-full object-contain"
                                fill
                                sizes="(max-width: 640px) 64px, 80px"
                                priority
                              />
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="text-right ml-4">
                        <p className="font-bold text-lg text-green-600">
                          {formatPrice(
                            getItemTotal(item, orderDetails?.amount_total)
                          )}
                        </p>
                        <p className="text-sm text-gray-500">
                          Total for {item.quantity} item
                          {item.quantity > 1 ? 's' : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>{formatPrice(orderDetails.subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span
                        className={
                          orderDetails.shipping === 0
                            ? 'text-green-600 font-medium'
                            : ''
                        }
                      >
                        {orderDetails.shipping === 0
                          ? 'Free'
                          : formatPrice(orderDetails.shipping)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center border-t pt-2">
                    <span className="text-lg font-semibold">Order Total:</span>
                    <span className="text-2xl font-bold text-green-600">
                      {formatPrice(orderDetails.totalAmount)}
                    </span>
                  </div>
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
                inbox. Feel free to contact us at 02 9051 0054 or
                info@lensaura.com.au if you have any questions.
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
