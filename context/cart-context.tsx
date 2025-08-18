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
  const [isInitialized, setIsInitialized] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    const storedCart = localStorage.getItem('cart');
    if (storedCart) {
      try {
        const parsedCart = JSON.parse(storedCart);
        setItems(parsedCart);
      } catch (error) {
        console.error('Failed to parse cart from localStorage:', error);
        localStorage.removeItem('cart');
      }
    }
    setIsInitialized(true);
  }, []);

  // Save cart to localStorage when items change (but only after initialization)
  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem('cart', JSON.stringify(items));
      // Development-only logging to help debug
      if (process.env.NODE_ENV === 'development') {
        console.log('Cart updated:', {
          itemCount: items.length,
          totalQuantity: items.reduce((sum, item) => sum + item.quantity, 0),
          items: items.map((item) => ({
            id: item.product._id || (item.product as any).id,
            name: item.product.name,
            quantity: item.quantity,
          })),
        });
      }
    }
  }, [items, isInitialized]);

  const itemCount = items.reduce((total, item) => total + item.quantity, 0);

  // Helper function to get effective price (discounted if available, otherwise original)
  const getEffectivePrice = (product: IProduct & { _id: string }) => {
    return product.discountedPrice && product.discountedPrice > 0
      ? product.discountedPrice
      : product.price;
  };

  const subtotal = items.reduce(
    (total, item) => total + getEffectivePrice(item.product) * item.quantity,
    0
  );

  const addItem = (
    product: IProduct & { _id: string },
    quantity: number,
    color: string | { name: string; hex: string; _id?: string }
  ) => {
    // Don't allow cart modifications during initialization
    if (!isInitialized) {
      console.warn('Cart not initialized yet, ignoring addItem call');
      return;
    }

    // Normalize color to string for comparison
    const colorString = typeof color === 'string' ? color : color.name;

    setItems((prevItems) => {
      if (!Array.isArray(prevItems)) return [];

      const existingItemIndex = prevItems.findIndex((item) => {
        const itemColorString =
          typeof item.color === 'string' ? item.color : item.color.name;
        // Use both _id and id for comparison to handle both MongoDB ObjectId and string ID
        const itemProductId = item.product._id || (item.product as any).id;
        const productId = product._id || (product as any).id;

        return itemProductId === productId && itemColorString === colorString;
      });

      if (existingItemIndex >= 0) {
        // Update existing item quantity
        const updatedItems = [...prevItems];
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: updatedItems[existingItemIndex].quantity + quantity,
        };
        return updatedItems;
      } else {
        // Add new item
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
          // Use both _id and id for comparison
          const itemProductId = item.product._id || (item.product as any).id;
          return !(
            itemProductId === productId && itemColorString === colorString
          );
        });
      } else {
        // Remove all items with this product ID (legacy behavior)
        return prevItems.filter((item) => {
          const itemProductId = item.product._id || (item.product as any).id;
          return itemProductId !== productId;
        });
      }
    });
  };

  const updateQuantity = (
    productId: string,
    quantity: number,
    color: string | { name: string; hex: string; _id?: string }
  ) => {
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

        return matches ? { ...item, quantity } : item;
      });
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
