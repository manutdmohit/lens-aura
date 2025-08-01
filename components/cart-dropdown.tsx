'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShoppingBag,
  X,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart, type CartItem } from '@/context/cart-context';
import { useOnClickOutside } from '@/hooks/use-click-outside';
import Image from 'next/image';

export default function CartDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const { items, itemCount, subtotal, removeItem, updateQuantity } = useCart();
  const dropdownRef = useRef<HTMLDivElement>(null!);

  // Close dropdown when clicking outside
  useOnClickOutside(dropdownRef, () => setIsOpen(false));

  // Close dropdown when pressing escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Prevent scrolling when dropdown is open on mobile
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleQuantityChange = (
    productId: string,
    newQuantity: number,
    color: string
  ) => {
    updateQuantity(productId, newQuantity, color);
  };

  const handleRemoveItem = (productId: string, color: string) => {
    removeItem(productId, color);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="relative p-2 text-[#592F25] hover:text-[#8B4513] focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-full"
        aria-label="Open cart"
      >
        <ShoppingBag className="h-6 w-6" />
        {itemCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#8B4513] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
            {itemCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="cart-dropdown"
            className="absolute right-0 mt-2 w-screen max-w-[250px] md:max-w-[400px] bg-white shadow-lg rounded-lg z-50 overflow-hidden md:right-0 md:top-full"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            <div className="p-4 border-b flex items-center justify-between">
              <h2 className="font-medium text-lg">Your Cart ({itemCount})</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-500 hover:text-gray-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-black rounded-full p-1"
                aria-label="Close cart"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {items.length === 0 ? (
              <div className="p-6 text-center">
                <ShoppingBag className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-4">Your cart is empty</p>
                <Button
                  asChild
                  className="bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90"
                  onClick={() => setIsOpen(false)}
                >
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
                  {items.map((item: CartItem) => (
                    <div
                      key={`${item.product._id}-${item.color}`}
                      className="flex gap-4 py-2 border-b last:border-0"
                    >
                      <div className="w-20 h-20 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
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
                          <p className="font-medium">
                            ${(item.product.price * item.quantity).toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          Color: {item.color}
                        </p>
                        <p className="text-sm text-gray-500">
                          ${item.product.price.toFixed(2)} each
                        </p>

                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center border rounded-md">
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product._id,
                                  item.quantity - 1,
                                  item.color
                                )
                              }
                              className="p-1 hover:bg-gray-100"
                              aria-label="Decrease quantity"
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </button>
                            <span className="px-2 text-sm">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                handleQuantityChange(
                                  item.product._id,
                                  item.quantity + 1,
                                  item.color
                                )
                              }
                              className={`p-1 ${
                                item.quantity >= item.product.stockQuantity
                                  ? 'text-gray-300 cursor-not-allowed'
                                  : 'hover:bg-gray-100'
                              }`}
                              aria-label="Increase quantity"
                              disabled={
                                item.quantity >= item.product.stockQuantity
                              }
                            >
                              <Plus className="h-3 w-3" />
                            </button>
                          </div>
                          <button
                            onClick={() =>
                              handleRemoveItem(item.product._id, item.color)
                            }
                            className="text-gray-500 hover:text-red-600 p-1"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>

                        {/* Stock warning */}
                        {item.quantity === item.product.stockQuantity && (
                          <div className="mt-2 text-xs flex items-center text-amber-600">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            <span>Maximum stock reached</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-4 border-t">
                  <div className="flex justify-between mb-4">
                    <span className="font-medium">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="space-y-2">
                    <Button
                      asChild
                      className="w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white hover:opacity-90"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/cart">
                        View Cart
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      asChild
                      className="w-full bg-black text-white hover:bg-gray-900"
                      onClick={() => setIsOpen(false)}
                    >
                      <Link href="/checkout">
                        Checkout
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
