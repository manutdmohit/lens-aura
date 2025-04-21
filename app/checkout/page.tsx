'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, ShieldCheck, Truck } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { useCart } from '@/context/cart-context';
import { createCheckoutSession } from '@/actions/checkout';
import PageTransition from '@/components/page-transition';
import AnimatedSection from '@/components/animated-section';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, itemCount } = useCart();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

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

  if (!isClient) {
    return (
      <main className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
          <div className="h-96 flex items-center justify-center">
            Loading checkout...
          </div>
        </div>
        <Footer />
      </main>
    );
  }

  return (
    <PageTransition>
      <main className="flex flex-col min-h-screen">
        <Navbar />
        <div className="flex-grow max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
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
              <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
              <p className="text-gray-600 mb-8">
                Please add items to your cart before proceeding to checkout.
              </p>
              <Button asChild className="bg-black text-white hover:bg-gray-800">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </AnimatedSection>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <AnimatedSection className="border rounded-lg p-6 mb-6">
                  <h2 className="text-xl font-medium mb-4">Order Summary</h2>
                  <div className="divide-y">
                    {items.map((item) => (
                      <div
                        key={`${item.product.id}-${item.color}`}
                        className="py-4 flex items-center"
                      >
                        <div className="w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                          <img
                            src={item.product.imageUrl || '/placeholder.svg'}
                            alt={item.product.name}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="ml-4 flex-grow">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <p className="text-sm text-gray-500">
                            Color: {item.color}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                          <p className="text-sm text-gray-500">
                            Qty: {item.quantity}
                          </p>
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
                    Shipping details will be collected on the Stripe checkout
                    page.
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
                  <h2 className="text-xl font-medium mb-4">Payment Summary</h2>
                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Shipping</span>
                      <span>Free</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Tax</span>
                      <span>${(subtotal * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between font-medium">
                      <span>Total</span>
                      <span>${(subtotal * 1.1).toFixed(2)}</span>
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
        </div>
        <Footer />
      </main>
    </PageTransition>
  );
}
