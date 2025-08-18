'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ShoppingBag,
  ArrowRight,
  Trash2,
  Plus,
  Minus,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useCart } from '@/context/cart-context';
import CheckoutButton from '@/components/checkout-button';
import Image from 'next/image';
import {
  calculateDiscount,
  formatPrice,
  formatSavingsPercentage,
} from '@/lib/utils/discount';

export default function CartPage() {
  const {
    items,
    itemCount,
    removeItem,
    updateQuantity,
    subtotal,
    promotionalSavings,
    regularSubtotal,
    getItemPrice,
  } = useCart();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Function to get available stock for a cart item
  const getAvailableStock = (item: any) => {
    if (
      item.product.productType === 'glasses' ||
      item.product.productType === 'sunglasses'
    ) {
      // For glasses/sunglasses, check frame color variants
      const variant = item.product.frameColorVariants?.find(
        (v: any) =>
          v.color.name ===
          (typeof item.color === 'string' ? item.color : item.color?.name)
      );
      return variant?.stockQuantity || 0;
    } else {
      // For contacts/accessories, use direct stockQuantity
      return item.product.stockQuantity || 0;
    }
  };

  // Function to check if item is out of stock
  const isItemOutOfStock = (item: any) => {
    const availableStock = getAvailableStock(item);
    return availableStock === 0;
  };

  // Function to check if item has low stock
  const hasLowStock = (item: any) => {
    const availableStock = getAvailableStock(item);
    return availableStock > 0 && availableStock <= 5;
  };

  // Function to check if quantity exceeds available stock
  const exceedsStock = (item: any) => {
    const availableStock = getAvailableStock(item);
    return item.quantity > availableStock;
  };

  const handleCheckout = async (cartItems: any[]) => {
    try {
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ items: cartItems }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        return {
          error: errorData.error || 'Failed to create checkout session',
        };
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error:', error);
      return { error: 'An unexpected error occurred' };
    }
  };

  const handleUpdateQuantity = (
    productId: string | undefined,
    quantity: number,
    color: string | { name: string; hex: string; _id?: string }
  ) => {
    if (productId) {
      // Find the item to check stock
      const item = items.find(
        (i) =>
          i.product._id === productId &&
          (typeof i.color === 'string' ? i.color : i.color?.name) ===
            (typeof color === 'string' ? color : color?.name)
      );

      if (item) {
        const availableStock = getAvailableStock(item);

        // Don't allow quantity to exceed available stock
        if (quantity > availableStock) {
          quantity = availableStock;
        }

        // Don't allow negative quantities
        if (quantity < 0) {
          quantity = 0;
        }
      }

      updateQuantity(productId, quantity, color);
    }
  };

  const handleRemoveItem = (
    productId: string | undefined,
    color: string | { name: string; hex: string; _id?: string }
  ) => {
    if (productId) {
      removeItem(productId, color);
    }
  };

  // Check if any items have stock issues
  const hasStockIssues = items.some(
    (item) => isItemOutOfStock(item) || exceedsStock(item)
  );

  if (!isClient) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="h-96 flex items-center justify-center">
          Loading cart...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold mb-8">Your Cart</h1>

      {itemCount === 0 ? (
        <div className="text-center py-16 border rounded-lg">
          <ShoppingBag className="mx-auto h-16 w-16 text-gray-400 mb-4" />
          <h2 className="text-2xl font-medium mb-2">Your cart is empty</h2>
          <p className="text-gray-600 mb-8">
            Looks like you haven't added any items to your cart yet.
          </p>
          <Button asChild className="bg-black text-white hover:bg-gray-800">
            <Link href="/">
              Continue Shopping
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Stock Issues Warning */}
            {hasStockIssues && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-start">
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800 mb-1">
                      Stock Issues Detected
                    </h3>
                    <p className="text-sm text-red-700">
                      Some items in your cart have stock issues. Please review
                      and update quantities before checkout.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="border rounded-lg overflow-hidden">
              <div className="divide-y">
                {items.map((item) => {
                  const availableStock = getAvailableStock(item);
                  const isOutOfStock = isItemOutOfStock(item);
                  const hasLowStockWarning = hasLowStock(item);
                  const exceedsStockLimit = exceedsStock(item);
                  const colorName =
                    typeof item.color === 'string'
                      ? item.color
                      : item.color?.name;

                  return (
                    <div
                      key={`${item.product._id}-${colorName}`}
                      className={`p-4 sm:p-6 flex flex-col sm:flex-row gap-4 ${
                        isOutOfStock || exceedsStockLimit ? 'bg-red-50' : ''
                      }`}
                    >
                      <div className="w-full sm:w-24 h-24 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                        <Image
                          src={item.product.thumbnail || '/placeholder.svg'}
                          alt={item.product.name}
                          className="w-full h-full object-cover"
                          width={100}
                          height={100}
                          priority
                        />
                      </div>
                      <div className="flex-grow">
                        <div className="flex justify-between">
                          <h3 className="font-medium">{item.product.name}</h3>
                          <div className="text-right">
                            {(() => {
                              const itemPricing = getItemPrice(item);
                              const discountInfo = calculateDiscount(
                                item.product.price,
                                item.product.discountedPrice
                              );

                              if (itemPricing.savings > 0) {
                                return (
                                  <div className="text-right">
                                    <p className="font-medium text-green-600">
                                      {formatPrice(itemPricing.totalPrice)}
                                    </p>
                                    <p className="text-xs text-gray-500 line-through">
                                      {formatPrice(
                                        discountInfo.displayPrice *
                                          item.quantity
                                      )}
                                    </p>
                                    <p className="text-xs text-green-600">
                                      🎉 Save {formatPrice(itemPricing.savings)}
                                    </p>
                                  </div>
                                );
                              } else if (discountInfo.hasDiscount) {
                                return (
                                  <div className="text-right">
                                    <p className="font-medium text-red-600">
                                      {formatPrice(itemPricing.totalPrice)}
                                    </p>
                                    <p className="text-xs text-gray-500 line-through">
                                      {formatPrice(
                                        discountInfo.originalPrice *
                                          item.quantity
                                      )}
                                    </p>
                                  </div>
                                );
                              } else {
                                return (
                                  <p className="font-medium">
                                    {formatPrice(itemPricing.totalPrice)}
                                  </p>
                                );
                              }
                            })()}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          Color: {colorName}
                        </p>
                        <div className="text-sm text-gray-500">
                          {(() => {
                            const discountInfo = calculateDiscount(
                              item.product.price,
                              item.product.discountedPrice
                            );

                            if (discountInfo.hasDiscount) {
                              return (
                                <div>
                                  <span className="text-red-600 font-medium">
                                    {formatPrice(discountInfo.displayPrice)}
                                  </span>
                                  <span className="line-through ml-2">
                                    {formatPrice(discountInfo.originalPrice)}
                                  </span>
                                  <span className="text-green-600 text-xs ml-2">
                                    Save{' '}
                                    {formatSavingsPercentage(
                                      discountInfo.savingsPercentage
                                    )}
                                  </span>
                                </div>
                              );
                            } else {
                              return (
                                <span>
                                  {formatPrice(discountInfo.displayPrice)} each
                                </span>
                              );
                            }
                          })()}
                        </div>

                        {/* Stock Status */}
                        <div className="mt-2">
                          {isOutOfStock ? (
                            <Badge variant="destructive" className="text-xs">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Out of Stock
                            </Badge>
                          ) : hasLowStockWarning ? (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-yellow-100 text-yellow-800 border-yellow-200"
                            >
                              <AlertTriangle className="h-3 w-3 mr-1" />
                              Low Stock ({availableStock} left)
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="text-xs bg-green-100 text-green-800 border-green-200"
                            >
                              In Stock ({availableStock} available)
                            </Badge>
                          )}
                        </div>

                        {/* Stock Warning */}
                        {exceedsStockLimit && (
                          <div className="mt-2 p-2 bg-red-100 border border-red-200 rounded text-xs text-red-700">
                            <AlertTriangle className="h-3 w-3 inline mr-1" />
                            Quantity exceeds available stock. Maximum:{' '}
                            {availableStock}
                          </div>
                        )}

                        <div className="flex justify-between items-center mt-4">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product._id,
                                  item.quantity - 1,
                                  item.color
                                )
                              }
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="px-4">{item.quantity}</span>
                            <button
                              onClick={() =>
                                handleUpdateQuantity(
                                  item.product._id,
                                  item.quantity + 1,
                                  item.color
                                )
                              }
                              className="p-2 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
                              aria-label="Increase quantity"
                              disabled={item.quantity >= availableStock}
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveItem(item.product._id, item.color)
                            }
                            className="text-gray-500 hover:text-red-600"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div>
            <div className="border rounded-lg p-6 sticky top-24">
              <h2 className="text-xl font-medium mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
              </div>
              <div className="border-t pt-4 mb-6">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
              </div>

              {/* Disable checkout if there are stock issues */}
              {hasStockIssues ? (
                <Button
                  className="w-full bg-gray-400 text-white cursor-not-allowed"
                  disabled
                >
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  Resolve Stock Issues
                </Button>
              ) : (
                <CheckoutButton onCheckout={handleCheckout} />
              )}

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
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
