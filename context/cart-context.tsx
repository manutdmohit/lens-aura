'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { Product, IProduct } from '@/models';

export interface CartItem {
  product: IProduct;
  quantity: number;
  color: string;
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  addItem: (product: IProduct, quantity: number, color: string) => void;
  removeItem: (productId: string, color?: string) => void;
  updateQuantity: (productId: string, quantity: number, color: string) => void;
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

  const addItem = (product: IProduct, quantity: number, color: string) => {
    setItems((prevItems) => {
      if (!Array.isArray(prevItems)) return [];

      const existingItemIndex = prevItems.findIndex(
        (item) => item.product._id === product._id && item.color === color
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

  const removeItem = (productId: string, color?: string) => {
    setItems((prevItems) => {
      if (color) {
        // Remove specific product with specific color
        return prevItems.filter(
          (item) => !(item.product._id === productId && item.color === color)
        );
      } else {
        // Remove all items with this product ID (legacy behavior)
        return prevItems.filter((item) => item.product._id !== productId);
      }
    });
  };

  const updateQuantity = (productId: string, quantity: number, color: string) => {
    if (quantity <= 0) {
      removeItem(productId, color);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.product._id === productId && item.color === color
          ? { ...item, quantity }
          : item
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
