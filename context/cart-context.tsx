'use client';

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
} from 'react';
import { IProduct } from '@/models';

export interface CartItem {
  product: IProduct & { _id: string };
  quantity: number;
  color: string | { name: string; hex: string; _id?: string };
}

interface CartContextType {
  items: CartItem[];
  itemCount: number;
  addItem: (
    product: IProduct & { _id: string },
    quantity: number,
    color: string | { name: string; hex: string; _id?: string }
  ) => void;
  removeItem: (
    productId: string,
    color?: string | { name: string; hex: string; _id?: string }
  ) => void;
  updateQuantity: (
    productId: string,
    quantity: number,
    color: string | { name: string; hex: string; _id?: string }
  ) => void;
  clearCart: () => void;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const isFirstRender = useRef(true);

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
      isFirstRender.current = false;
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

  const addItem = (
    product: IProduct & { _id: string },
    quantity: number,
    color: string | { name: string; hex: string; _id?: string }
  ) => {
    console.log('addItem called with product:', product);
    console.log('Product _id:', product._id);
    console.log('Product id:', (product as any).id);

    // Normalize color to string for comparison
    const colorString = typeof color === 'string' ? color : color.name;

    setItems((prevItems) => {
      if (!Array.isArray(prevItems)) return [];

      const existingItemIndex = prevItems.findIndex((item) => {
        const itemColorString =
          typeof item.color === 'string' ? item.color : item.color.name;
        return (
          item.product._id === product._id && itemColorString === colorString
        );
      });

      if (existingItemIndex >= 0) {
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex].quantity += quantity;
        return updatedItems;
      } else {
        return [...prevItems, { product, quantity, color }];
      }
    });
  };

  const removeItem = (
    productId: string,
    color?: string | { name: string; hex: string; _id?: string }
  ) => {
    setItems((prevItems) => {
      if (color) {
        // Normalize color to string for comparison
        const colorString = typeof color === 'string' ? color : color.name;

        // Remove specific product with specific color
        return prevItems.filter((item) => {
          const itemColorString =
            typeof item.color === 'string' ? item.color : item.color.name;
          return !(
            item.product._id === productId && itemColorString === colorString
          );
        });
      } else {
        // Remove all items with this product ID (legacy behavior)
        return prevItems.filter((item) => item.product._id !== productId);
      }
    });
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    color: string | { name: string; hex: string; _id?: string }
  ) => {
    console.log('updateQuantity called with:', { productId, quantity, color });
    console.log('Current items:', items);

    if (quantity <= 0) {
      removeItem(productId, color);
      return;
    }

    // Normalize color to string for comparison
    const colorString = typeof color === 'string' ? color : color.name;

    setItems((prevItems) => {
      const updatedItems = prevItems.map((item) => {
        // Check both _id and id properties for flexibility
        const itemProductId = item.product._id || (item.product as any).id;
        const itemColorString =
          typeof item.color === 'string' ? item.color : item.color.name;
        const matches =
          itemProductId === productId && itemColorString === colorString;

        console.log('Checking item:', {
          itemId: itemProductId,
          itemColor: item.color,
          itemColorString,
          matches: matches,
        });

        return matches ? { ...item, quantity } : item;
      });
      console.log('Updated items:', updatedItems);
      return updatedItems;
    });
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
