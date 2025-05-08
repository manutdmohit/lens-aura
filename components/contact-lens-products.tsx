'use client';

import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShoppingCart, Tag, Package } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { toast } from 'sonner';
import { ProductFormValues as Product } from '@/lib/api/validation';
import LoadingPage from './loading';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/cart-context';
import { Pagination } from '@/components/ui/pagination';

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PriceRange {
  lowest: {
    price: number;
    name: string;
    slug: string;
  } | null;
  highest: {
    price: number;
    name: string;
    slug: string;
  } | null;
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

export default function ContactLensProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const { addItem, items } = useCart();
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 8, // Show fewer products on homepage
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  
  // Use a ref to store the limit value
  const limitRef = useRef(8); // Show fewer products on homepage

  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const response = await fetch('/api/products/price-range');
        const data = await response.json();
        setPriceRange(data.contacts);
      } catch (error) {
        console.error('Error fetching price range:', error);
      }
    };

    fetchPriceRange();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch(`/api/contacts?page=${currentPage}&limit=${limitRef.current}`);
        const data = await response.json();
        
        if (data && data.products) {
          setProducts(data.products);
          setPagination(data.pagination || {
            total: 0,
            page: 1,
            limit: limitRef.current,
            totalPages: 1,
            hasNextPage: false,
            hasPrevPage: false,
          });
        } else {
          // If no products are returned or data is malformed, set to empty array
          setProducts([]);
        }
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast.error(`${error.message || "Failed to fetch products"}`);
        // Set products to empty array on error
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]); // Only depend on currentPage

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

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Check if products array is valid
  const hasProducts = Array.isArray(products) && products.length > 0;

  if (loading) {
    return <LoadingPage loading={loading} />;
  }

  return (
    <>
      {priceRange?.lowest && (
        <div className="mb-8 text-center">
          <p className="text-lg text-gray-600">
            Contact lenses start from just ${priceRange.lowest.price.toFixed(2)}.{' '}
            <Link 
              href={`/contacts/${priceRange.lowest.slug}`}
              className="text-indigo-600 hover:underline"
            >
              View our most affordable option
            </Link>
          </p>
        </div>
      )}
      
      {!hasProducts && (
        <div className="text-center py-8">
          <p className="text-lg text-gray-600">
            No products found. Check back later for new products.
          </p>
        </div>
      )}
      
      {hasProducts && (
        <>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            id="products"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto"
          >
            {products.map((product, index) => (
              <motion.div
                key={index}
                variants={cardVariants}
                className="flex h-full"
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="w-full flex flex-col overflow-hidden border-2 hover:border-black/10 transition-colors duration-200">
                  <Link href={`/contacts/${product.slug}`} className="block">
                    <div className="aspect-[3/2] overflow-hidden relative bg-gray-50">
                      <Image
                        src={product.imageUrl || '/placeholder.svg'}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 hover:scale-105"
                        priority
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                      {product.stockQuantity > 0 && (
                        <div className="absolute top-3 right-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                          In Stock
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 flex flex-col flex-grow space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Tag className="h-3 w-3 text-gray-500" />
                          <p className="text-xs text-gray-500">{product.brand}</p>
                        </div>
                        <h3 className="font-bold text-lg line-clamp-1 text-gray-900">{product.name}</h3>
                        <p className="text-gray-600 text-xs line-clamp-2 mt-1">
                          {product.description}
                        </p>
                      </div>
                      <div className="mt-auto pt-3 border-t border-gray-100">
                        <div className="flex justify-between items-center">
                          <p className="text-lg font-medium text-gray-900">
                            ${product.price.toFixed(2)}
                          </p>
                          {product.stockQuantity > 0 && (
                            <div className="flex items-center text-xs text-gray-500">
                              <Package className="h-3 w-3 mr-1" />
                              <span>{product.stockQuantity} left</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                  <div className="px-4 pb-4">
                    {isOutOfStock(product) ? (
                      <Button 
                        className="w-full bg-gray-100 text-gray-400 cursor-not-allowed"
                        disabled
                      >
                        Out of Stock
                      </Button>
                    ) : isMaxLimitReached(product) ? (
                      <Button 
                        className="w-full bg-amber-50 text-amber-600 border border-amber-200 cursor-not-allowed"
                        disabled
                      >
                        Max Limit Reached
                      </Button>
                    ) : (
                      <Button 
                        className="w-full bg-black text-white hover:bg-gray-800 transition-colors duration-200"
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
          </motion.div>
          
          {pagination.totalPages > 1 && (
            <div className="mt-8">
              <Pagination 
                currentPage={pagination.page} 
                totalPages={pagination.totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
          )}
          
          <div className="text-center text-sm text-gray-500 mt-4">
            Showing {products.length} of {pagination.total} products
          </div>
        </>
      )}
    </>
  );
}
