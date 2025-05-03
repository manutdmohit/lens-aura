'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ProductFormValues as Product } from '@/lib/api/validation';
import LoadingPage from './loading';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';


export default function ContactLensProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { addItem, items } = useCart();

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/contacts');
        const data = await response.json();
        setProducts(data);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast.error(`{error.message} || "Failed to fetch products"`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (e: React.MouseEvent, product: Product) => {
    e.preventDefault();
    e.stopPropagation();
    
    // Find this product in cart to check current quantity
    const cartItem = items.find(item => item.product.id === product.id);
    const currentQuantity = cartItem ? cartItem.quantity : 0;
    
    // Check if adding one more would exceed stock
    if (currentQuantity >= (product.stockQuantity || 0)) {
      toast.error(`Maximum available quantity reached (${product.stockQuantity})`);
      return;
    }
    
    addItem(product, 1, 'default');
    toast.success(`Added ${product.name} to cart`);
  };


  
  
  const isOutOfStock = (product: Product) => {
    return !product.stockQuantity || product.stockQuantity <= 0;
  };
  
  const isMaxLimitReached = (product: Product) => {
    const cartItem = items.find(item => item.product.id === product.id);
    return cartItem && cartItem.quantity >= (product.stockQuantity || 0);
  };

  if (loading) {
    return <LoadingPage loading={loading} />;
  }

  return (
    <div
      id="products"
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
    >
      {products.map((product, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.05 }}
          className="flex"
        >
          <Card className="w-full flex flex-col">
            <Link href={`/contacts/${product.slug}`} className="block">
              <div className="aspect-square bg-gray-100 flex items-center justify-center p-4">
                <Image
                  src={product.imageUrl || '/placeholder.svg'}
                  alt={product.name}
                  className="max-h-full max-w-full object-contain"
                  width={300}
                  height={300}
                  priority
                />
              </div>
              <CardContent className="p-4 flex flex-col h-44">
                <div>
                  <p className="text-sm text-gray-500">{product.brand}</p>
                  <h3 className="font-bold text-lg line-clamp-1">{product.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-2 mb-2">
                    {product.description}
                  </p>
                </div>
                <div className="mt-auto">
                  <div className="flex justify-between items-center mb-2">
                    <p className="text-lg font-medium">
                      ${product.price.toFixed(2)}
                    </p>
                    {(product.stockQuantity > 0) && (
                      <p className="text-xs text-gray-500">
                        Stock: {product.stockQuantity}
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Link>
            <div className="px-4 pb-4">
              {isOutOfStock(product) ? (
                <Button 
                  className="w-full bg-gray-300 text-gray-700 cursor-not-allowed"
                  disabled
                >
                  Out of Stock
                </Button>
              ) : isMaxLimitReached(product) ? (
                <Button 
                  className="w-full bg-amber-500 text-white cursor-not-allowed"
                  disabled
                >
                  Max Limit Reached
                </Button>
              ) : (
                <Button 
                  className="w-full bg-black text-white hover:bg-gray-800"
                  onClick={(e) => handleAddToCart(e, product)}
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  Add to Cart
                </Button>
              )}
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
