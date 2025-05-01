'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ShoppingBag, Check } from 'lucide-react';
import type { ProductFormValues as Product } from '@/lib/api/validation';
import { useCart } from '@/context/cart-context';
import { useToast } from '@/hooks/use-toast';

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
  const [isAdding, setIsAdding] = useState(false);
  const [isAdded, setIsAdded] = useState(false);
  const { addItem, itemCount, items } = useCart();
  const { toast } = useToast();

  // Determine if product is out of stock or has insufficient quantity
  const isOutOfStock = !product.inStock || product.stockQuantity <= 0;
  const hasInsufficientStock = product.stockQuantity < quantity;
  const buttonDisabled = isAdding || isOutOfStock || hasInsufficientStock;

  const handleAddToCart = async () => {
    if (buttonDisabled) return;

    setIsAdding(true);

    // Use the first color if none is selected
    const color = selectedColor || product.colors[0];

    // Add item to cart
    addItem(product, quantity, color);

    // Show success state
    setIsAdded(true);

    // Reset button state after delay
    setTimeout(() => {
      setIsAdding(false);
      setIsAdded(false);
    }, 2000);
  };

  // Determine button text based on stock status
  const getButtonText = () => {
    if (isAdding) return 'Adding to Cart...';
    if (isAdded) return 'Added to Cart';
    if (isOutOfStock) return 'Out of Stock';
    if (hasInsufficientStock) return `Only ${product.stockQuantity} Available`;
    return 'Add to Cart';
  };

  const getItemFromCart = items.find(
    (item) => item.product.slug === product.slug
  );

  let productQuantityInStock = 0;

  if (getItemFromCart) {
    productQuantityInStock = getItemFromCart.quantity;
  }

  return (
    <motion.div
      whileHover={{ scale: buttonDisabled ? 1 : 1.02 }}
      whileTap={{ scale: buttonDisabled ? 1 : 0.98 }}
    >
      {productQuantityInStock + quantity > product.stockQuantity ? (
        <span>Error</span>
      ) : (
        <>
          <Button
            onClick={handleAddToCart}
            disabled={buttonDisabled}
            className={`w-full h-12 text-lg ${
              isAdded
                ? 'bg-green-600 hover:bg-green-700 text-white'
                : 'bg-black text-white hover:bg-gray-800'
            } ${
              buttonDisabled && !isAdded ? 'opacity-60 cursor-not-allowed' : ''
            }`}
          >
            {isAdding ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
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
                <ShoppingBag className="mr-2 h-5 w-5" />
                {getButtonText()}
              </>
            )}
          </Button>
        </>
      )}
    </motion.div>
  );
}
