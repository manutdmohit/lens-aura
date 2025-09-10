'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import { createCheckoutSession } from '@/actions/checkout';
import PageTransition from '@/components/page-transition';
import AnimatedSection from '@/components/animated-section';
import { formatPrice } from '@/lib/utils/discount';
import { getProductImage } from '@/lib/utils/product-image';
import Image from 'next/image';
import { useCategoryPromotionalPricing } from '@/hooks/usePromotionalPricing';

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    subtotal,
    shipping,
    total,
    promotionalSavings,
    regularSubtotal,
    itemCount,
    isFreeShipping,
    shippingMessage,
    getItemPrice,
  } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Get promotional pricing for the product category
  // Always call hooks unconditionally - use a default value if no category
  const productCategory = items[0]?.product?.category as
    | 'signature'
    | 'essentials';
  const hookCategory =
    productCategory === 'essentials'
      ? 'essential'
      : productCategory || 'signature';

  // Always call the hook with a valid category to maintain hook order consistency
  const { categoryPricing, hasPromotions } =
    useCategoryPromotionalPricing(hookCategory);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleCheckout = async () => {
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const origin = window.location.origin;
      const result = await createCheckoutSession(items, origin);

      if (result.error) {
        setError(result.error);
        return;
      }

      // Redirect to Stripe Checkout
      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Remove early return to maintain hook order consistency

  return (
    <PageTransition>
      <main className="flex flex-col min-h-screen">
        <div className="flex-grow max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          {!isClient ? (
            // Loading state
            <div className="h-96 flex items-center justify-center">
              Loading checkout...
            </div>
          ) : (
            <>
              <div className="mb-8">
                <Link
                  href="/cart"
                  className="inline-flex items-center text-sm text-gray-600 hover:text-black"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Cart
                </Link>
                <h1 className="text-3xl font-bold mt-2">Checkout</h1>
              </div>

              {itemCount === 0 ? (
                <AnimatedSection className="text-center py-16 border rounded-lg">
                  <h2 className="text-2xl font-medium mb-2">
                    Your cart is empty
                  </h2>
                  <p className="text-gray-600 mb-8">
                    Please add items to your cart before proceeding to checkout.
                  </p>
                  <Button
                    asChild
                    className="bg-black text-white hover:bg-gray-800"
                  >
                    <Link href="/">Continue Shopping</Link>
                  </Button>
                </AnimatedSection>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  <div className="lg:col-span-2">
                    <AnimatedSection className="border rounded-lg p-6 mb-6">
                      <h2 className="text-xl font-medium mb-4">
                        Order Summary
                      </h2>
                      <div className="divide-y">
                        {items.map((item) => (
                          <div
                            key={`${
                              item.product._id || (item.product as any).id
                            }-${
                              typeof item.color === 'string'
                                ? item.color
                                : item.color.name
                            }`}
                            className="py-4 flex items-center"
                          >
                            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0 relative">
                              <Image
                                src={getProductImage(item.product, item.color)}
                                alt={item.product.name}
                                className="w-full h-full object-contain transition-transform duration-200 hover:scale-105"
                                fill
                                sizes="(max-width: 640px) 64px, 80px"
                                priority
                              />
                            </div>
                            <div className="ml-4 flex-grow">
                              <h3 className="font-medium">
                                {item.product.name}
                              </h3>
                              <p className="text-sm text-gray-500">
                                Color:{' '}
                                {typeof item.color === 'string'
                                  ? item.color
                                  : item.color.name}
                              </p>
                            </div>
                            <div className="text-right">
                              {(() => {
                                const itemPricing = getItemPrice(item);

                                // The promotional pricing logic is handled by the cart context
                                // No need to recalculate here

                                // The itemPricing.totalPrice already includes all promotional logic (including buy two)
                                // We just need to show the regular price for comparison
                                const regularPrice =
                                  item.product.price * item.quantity;

                                if (itemPricing.savings > 0) {
                                  return (
                                    <div>
                                      <p className="font-medium text-green-600">
                                        {formatPrice(itemPricing.totalPrice)}
                                      </p>
                                      <p className="text-xs text-gray-500 line-through">
                                        {formatPrice(regularPrice)}
                                      </p>
                                      <p className="text-xs text-green-600">
                                        🎉 Save{' '}
                                        {formatPrice(itemPricing.savings)}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Qty: {item.quantity}
                                      </p>
                                    </div>
                                  );
                                } else {
                                  return (
                                    <div>
                                      <p className="font-medium">
                                        {formatPrice(itemPricing.totalPrice)}
                                      </p>
                                      <p className="text-sm text-gray-500">
                                        Qty: {item.quantity}
                                      </p>
                                    </div>
                                  );
                                }
                              })()}
                            </div>
                          </div>
                        ))}
                      </div>
                    </AnimatedSection>

                    <AnimatedSection className="border rounded-lg p-6">
                      <h2 className="text-xl font-medium mb-4">
                        Shipping Information
                      </h2>
                      <p className="text-gray-600 mb-4">
                        Shipping details will be collected on the Stripe
                        checkout page.
                      </p>
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <Truck className="h-4 w-4 mr-2" />
                        Free shipping on all orders
                      </div>
                      <div className="flex items-center text-sm text-gray-600">
                        <ShieldCheck className="h-4 w-4 mr-2" />
                        Secure checkout powered by Stripe
                      </div>
                    </AnimatedSection>
                  </div>

                  <div>
                    <AnimatedSection className="border rounded-lg p-6 sticky top-24">
                      <h2 className="text-xl font-medium mb-4">
                        Payment Summary
                      </h2>
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between">
                          <span>Subtotal</span>
                          <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Shipping</span>
                          <span
                            className={
                              isFreeShipping ? 'text-green-600 font-medium' : ''
                            }
                          >
                            {isFreeShipping ? 'Free' : formatPrice(shipping)}
                          </span>
                        </div>
                        {!isFreeShipping && (
                          <div className="text-sm text-gray-600 text-center">
                            {shippingMessage}
                          </div>
                        )}
                      </div>
                      <div className="border-t pt-4 mb-6">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span>{formatPrice(total)}</span>
                        </div>
                      </div>

                      {error && (
                        <p className="text-red-500 text-sm mb-4">{error}</p>
                      )}

                      <Button
                        onClick={handleCheckout}
                        disabled={isLoading || items.length === 0}
                        className="w-full bg-black text-white hover:bg-gray-800 flex items-center justify-center"
                      >
                        {isLoading ? (
                          'Processing...'
                        ) : (
                          <>
                            <CreditCard className="mr-2 h-4 w-4" />
                            Proceed to Payment
                          </>
                        )}
                      </Button>

                      <div className="mt-4 text-center text-sm text-gray-500">
                        <p>Secure checkout powered by Stripe</p>
                        <div className="flex justify-center mt-2">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="40"
                            height="16"
                            viewBox="0 0 40 16"
                          >
                            <path
                              fill="#6772E5"
                              d="M33.5,5.3c0-1-0.8-1.3-1.7-1.3h-2.1v4.4h0.9V6.7h0.9l1.1,1.7h1.1l-1.2-1.8C33.1,6.4,33.5,6,33.5,5.3z M31.5,6h-0.9V4.7h0.9c0.5,0,0.9,0.2,0.9,0.7C32.4,5.8,32,6,31.5,6z M24.1,4h-1.6v4.4h1.6c1.3,0,2.2-0.9,2.2-2.2C26.4,4.9,25.5,4,24.1,4z M24.1,7.7h-0.7V4.8h0.7c0.9,0,1.4,0.7,1.4,1.5C25.5,7,24.9,7.7,24.1,7.7z M18.2,4h-1.6v4.4h1.6c1.3,0,2.2-0.9,2.2-2.2C20.5,4.9,19.6,4,18.2,4z M18.2,7.7h-0.7V4.8h0.7c0.9,0,1.4,0.7,1.4,1.5C19.6,7,19.1,7.7,18.2,7.7z M13.1,4.3h-1.6v1.4h1.5v0.7h-1.5v1.3h1.6v0.7h-2.4V3.6h2.4V4.3z M7.6,8.4H6.7V4.3H5.3V3.6h3.7v0.7H7.6V8.4z M38.2,6.9c0,0.9-0.7,1.5-1.6,1.5h-1.6V3.6h0.9v1.9h0.7C37.5,5.5,38.2,6.1,38.2,6.9z M37.3,6.9c0-0.5-0.3-0.8-0.8-0.8h-0.7v1.5h0.7C37,7.7,37.3,7.4,37.3,6.9z"
                            />
                          </svg>
                        </div>
                      </div>
                    </AnimatedSection>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </PageTransition>
  );
}
