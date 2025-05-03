'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Check, AlertCircle, ShoppingCart, Clock } from 'lucide-react';
import type { ProductFormValues as Product } from '@/lib/api/validation';
import { useCart } from '@/context/cart-context';
import { toast } from 'sonner';

interface AddToCartButtonProps {
  product: Product;
  selectedColor?: string;
  quantity?: number;
}


export default function AddToCartButton({
  product,
  selectedColor,
  quantity = 1,
}: AddToCartButtonProps) {
  const router = useRouter();


  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem, itemCount, items } = useCart();

  // Determine if product is out of stock or has insufficient quantity
  const isOutOfStock = product.stockQuantity <= 0;
  const cartQuantity =
    items.find((item) => item.product.id === product.id)?.quantity || 0;

  const hasInsufficientStock = cartQuantity + quantity > product.stockQuantity;

  const buttonDisabled = isAdding || isOutOfStock || hasInsufficientStock;

  const handleAddToCart = async () => {
    if (buttonDisabled) return;

    setIsAdding(true);

    // Use the first color if none is selected
    const color = selectedColor || (product.colors && product.colors.length > 0 ? product.colors[0] : 'default');

    // Add item to cart
    addItem(product, quantity, color);

    // Show success state
    setIsAdded(true);

    // Reset button state after delay
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(false);
      
      // Show toast notification AFTER the button state has changed for better UX
      toast.success('Added to Cart', {
        description: `${product.name} has been added to your cart.`,
        action: {
          label: 'View Cart',
          onClick: () => {
            // You can add navigation to cart here if needed
            router.push('/cart');
          }
        
        },
        position: 'bottom-right',
        duration: 2000,
      });
    }, 1000);
  };

  // Get icon based on button state
  const getButtonIcon = () => {
    if (isAdding) return <Clock className="mr-2 h-5 w-5 animate-spin" />;
    if (isAdded) return <Check className="mr-2 h-5 w-5" />;
    if (isOutOfStock) return <AlertCircle className="mr-2 h-5 w-5" />;
    if (hasInsufficientStock) return <AlertCircle className="mr-2 h-5 w-5" />;
    return <ShoppingCart className="mr-2 h-5 w-5" />;
  };

  // Determine button text based on stock status
  const getButtonText = () => {
    if (isAdding) return 'Adding to Cart...';
    if (isAdded) return 'Added to Cart';
    if (isOutOfStock) return 'Out of Stock';
    if (hasInsufficientStock) return 'Max Stock Reached';
    return 'Add to Cart';
  };

  // Determine button background color based on state
  const getButtonClass = () => {
    if (isAdded) return 'bg-blue-600 hover:bg-blue-700 text-white';
    if (isOutOfStock) return 'bg-gray-600 text-white hover:bg-gray-700 cursor-not-allowed';
    if (hasInsufficientStock) return 'bg-gray-600 text-white hover:bg-gray-700 cursor-not-allowed';
    return 'bg-black text-white hover:bg-gray-800';
  };

  return (
    <motion.div
      whileHover={{ scale: buttonDisabled ? 1 : 1.02 }}
      whileTap={{ scale: buttonDisabled ? 1 : 0.98 }}
    >
      <Button
        onClick={handleAddToCart}
        disabled={buttonDisabled}
        className={`w-full h-12 text-lg transition-colors duration-300 ${getButtonClass()} ${
          buttonDisabled && !isAdded ? 'opacity-80' : ''
        }`}
      >
        {isAdding ? (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex items-center justify-center"
          >
            <Clock className="mr-2 h-5 w-5 animate-spin" />
            Adding to Cart...
          </motion.span>
        ) : isAdded ? (
          <motion.div
            className="flex items-center justify-center"
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 500, damping: 15 }}
          >
            <Check className="mr-2 h-5 w-5" />
            Added to Cart
          </motion.div>
        ) : (
          <>
            {getButtonIcon()}
            {getButtonText()}
          </>
        )}
      </Button>
    </motion.div>
  );
}
