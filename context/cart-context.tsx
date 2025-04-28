'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import type { ProductFormValues as Product } from '@/lib/api/validation';

export interface CartItem {
  product: Product;
  quantity: number;
  color: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  addItem: (product: Product, quantity: number, color: string) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const isFirstRender = useRef(true); // 👈 create a ref

  useEffect(() => {
    if (isFirstRender.current) {
      const storedCart = localStorage.getItem('cart');
      if (storedCart) {
        try {
          setItems(JSON.parse(storedCart));
        } catch (error) {
          console.error('Failed to parse cart from localStorage:', error);
          localStorage.removeItem('cart');
        }
      }
      isFirstRender.current = false; // 👈 mark first render complete
    }
  }, []);

  useEffect(() => {
    if (!isFirstRender.current) {
      localStorage.setItem('cart', JSON.stringify(items));
    }
  }, [items]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  const subtotal = items.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  const addItem = (product: Product, quantity: number, color: string) => {
    setItems((prevItems) => {
      if (!Array.isArray(prevItems)) return [];

      const existingItemIndex = prevItems.findIndex(
        (item) => item.product.id === product.id && item.color === color
      );

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [...prevItems, { product, quantity, color }];
      }
    });
  };

  const removeItem = (productId: string) => {
    setItems((prevItems) =>
      prevItems.filter((item) => item.product.id !== productId)
    );
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(productId);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        addItem,
        removeItem,
        updateQuantity,
        clearCart,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
