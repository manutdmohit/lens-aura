'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProductFormValues } from '@/lib/api/validation';
import { toast } from 'sonner';
import LoadingPage from '@/components/loading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useCart } from '@/context/cart-context';
import { formatCurrency } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronRight,
  Clock,
  Eye,
  FileText,
  Heart,
  Info,
  Package,
  Settings,
  ShoppingCart,
  Sun,
} from 'lucide-react';
import AddToCartButton from '@/components/add-to-cart-button';
import { IProduct } from '@/models';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const staggerChildren = {
  visible: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

// Helper function to format text
const formatText = (text: string) => {
  return text
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export default function AccessoryProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [productImages, setProductImages] = useState<string[]>([]);
  const { itemCount, items } = useCart();

  let quantityToAdd = 1;
  let quantityInCart = 0;

  const getItemFromCart = items.find((item) => item.product.slug === slug);

  if (getItemFromCart) {
    quantityInCart = getItemFromCart.quantity;
  }

  // Generate dynamic SEO metadata
  const pageTitle = `${product?.name} - Lens Aura`;
  const pageDescription = `${product?.description} - Lens Aura`;

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/accessories/${slug}`);

        console.log(response);

        if (!response.ok) {
          if (response.status === 404) {
            router.push('/accessories/not-found');
            return;
          }
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data.product);

        // Set initial selected color
        if (data.product.colors?.length > 0) {
          setSelectedColor(data.product.colors[0]);
        }

        // Set product images
        if (data.product.images && Array.isArray(data.product.images)) {
          setProductImages(data.product.images);
        } else if (data.product.imageUrl) {
          setProductImages([data.product.imageUrl]);
        } else {
          setProductImages(['/placeholder.svg']);
        }
      } catch (err) {
        console.error('Error fetching product:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch product'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (slug) {
      fetchProduct();
    }
  }, [slug, router]);

  // Handle color selection
  const handleColorSelect = (color: string) => {
    setSelectedColor(color);
  };

  // Handle image selection
  const handleImageSelect = (index: number) => {
    setActiveImageIndex(index);
  };

  // Loading state
  if (isLoading) {
    return <LoadingPage loading={isLoading} />;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Product
        </h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={() => router.push('/accessories')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Browse All Accessories
        </Button>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return null;
  }

  // Check if product is in stock
  const isInStock = product.stockQuantity && product.stockQuantity > 0;

  return (
    <motion.div
      className="bg-white"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <div className="container mx-auto px-4 sm:px-6 py-8 md:py-12 max-w-7xl">
        {/* Breadcrumbs */}
        <div className="flex items-center space-x-2 mb-8 text-sm text-gray-500">
          <span
            className="hover:underline cursor-pointer"
            onClick={() => router.push('/')}
          >
            Home
          </span>
          <ChevronRight className="h-4 w-4" />
          <span
            className="hover:underline cursor-pointer"
            onClick={() => router.push('/accessories')}
          >
            Accessories
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-black">{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Product Images */}
          <motion.div
            className="space-y-4 lg:sticky lg:top-24"
            variants={slideUp}
          >
            {/* Main Image */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 shadow-sm hover:shadow-md transition-all duration-300">
              <Image
                src={
                  productImages[activeImageIndex] ||
                  product.thumbnail ||
                  '/placeholder.svg'
                }
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center"
                priority
              />

              {/* Product badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2 z-10">
                {!isInStock && (
                  <Badge className="bg-gray-600 hover:bg-gray-700 px-3 py-1.5 text-sm">
                    <AlertCircle className="h-4 w-4 mr-1" />
                    Out of Stock
                  </Badge>
                )}
                {isInStock &&
                  product.stockQuantity &&
                  product.stockQuantity < 10 && (
                    <Badge className="bg-blue-600 hover:bg-blue-700 px-3 py-1.5 text-sm">
                      <Clock className="h-4 w-4 mr-1" />
                      Low Stock
                    </Badge>
                  )}
              </div>

              {/* Image zoom overlay effect */}
              <div className="absolute inset-0 bg-black opacity-0 hover:opacity-5 transition-opacity duration-300"></div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => handleImageSelect(index)}
                    className={`relative aspect-square rounded-lg overflow-hidden border-2 transition-all ${
                      activeImageIndex === index
                        ? 'border-blue-500'
                        : 'border-transparent'
                    }`}
                  >
                    <Image
                      src={image}
                      alt={`${product.name} - Image ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 12vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Details */}
          <motion.div
            className="space-y-6 md:space-y-8"
            variants={staggerChildren}
          >
            {/* Product Title and Price */}
            <motion.div variants={slideUp} className="border-b pb-5">
              <div className="flex flex-wrap justify-between items-start gap-2 mb-2">
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  {product.name}
                </h1>
                <p className="text-2xl md:text-3xl font-bold text-blue-600">
                  {formatCurrency(product.price)}
                </p>
              </div>
            </motion.div>

            {/* Availability */}
            <motion.div variants={slideUp}>
              {isInStock ? (
                <div className="flex items-center bg-green-50 text-green-700 px-4 py-2 rounded-full">
                  <Check className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">
                    In Stock
                    {product.stockQuantity &&
                      product.stockQuantity < 10 &&
                      ` (Only ${product.stockQuantity} left)`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center bg-red-50 text-red-700 px-4 py-2 rounded-full">
                  <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                  <span className="text-sm font-medium">Out of Stock</span>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div
              variants={slideUp}
              className="bg-gray-50 p-5 rounded-xl"
            >
              <div className="flex items-center mb-2">
                <Info className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-medium text-gray-900">
                  About this product
                </h3>
              </div>
              <p className="text-gray-700 leading-relaxed">
                {product.description}
              </p>
            </motion.div>

            {/* Color Selection */}
            {product.colors && product.colors.length > 0 && (
              <motion.div variants={slideUp} className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-gray-900">
                    Available Colors
                  </h3>
                  <span className="text-sm text-gray-500">
                    {selectedColor
                      ? `Selected: ${selectedColor}`
                      : 'Select a color'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map((color) => (
                    <button
                      key={color}
                      onClick={() => handleColorSelect(color)}
                      className={`px-4 py-2 rounded-full border-2 transition-all ${
                        selectedColor === color
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Add to Cart Button */}
            <motion.div variants={slideUp} className="pt-4">
              <div className="flex space-x-4">
                <div className="flex-1">
                  {!isInStock ? (
                    <Button
                      className="w-full bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center h-12 rounded-xl"
                      disabled
                    >
                      <AlertCircle className="mr-2 h-5 w-5" />
                      Out of Stock
                    </Button>
                  ) : quantityInCart + quantityToAdd >
                    (product.stockQuantity ?? 0) ? (
                    <Button
                      className="w-full bg-gray-600 text-white hover:bg-gray-700 flex items-center justify-center h-12 rounded-xl"
                      disabled
                    >
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Max Stock Limit Reached
                    </Button>
                  ) : (
                    <motion.div whileTap={{ scale: 0.98 }} className="w-full">
                      <AddToCartButton
                        product={product as unknown as IProduct}
                        selectedColor={selectedColor}
                      />
                    </motion.div>
                  )}
                </div>

                <motion.div whileTap={{ scale: 0.9 }} whileHover={{ y: -2 }}>
                  <Button
                    variant="outline"
                    size="icon"
                    className="h-12 w-12 border-gray-300 rounded-xl transition-all hover:border-blue-600 hover:text-blue-600"
                  >
                    <Heart className="h-6 w-6" />
                  </Button>
                </motion.div>
              </div>
            </motion.div>

            {/* Product Features */}
            <motion.div
              variants={slideUp}
              className="bg-gray-50 rounded-xl overflow-hidden"
            >
              <div className="flex items-center bg-gray-50 p-4 border-b">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-medium text-gray-900">Features</h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {product.gender && (
                  <div className="flex flex-col items-center justify-center p-4 rounded-xl bg-green-50 text-green-700">
                    <Settings className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Gender</span>
                    <span className="text-xs">
                      {formatText(product.gender)}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* What's Included */}
            <motion.div
              variants={slideUp}
              className="bg-gray-50 rounded-xl p-6"
            >
              <h3 className="text-lg font-semibold mb-4 flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                What's Included
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col items-center text-center">
                  <div className="bg-blue-100 rounded-full p-3 mb-3">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm">Product</h4>
                  <p className="text-gray-600 text-xs mt-1">{product.name}</p>
                </div>

                <div className="bg-white rounded-xl p-4 border border-gray-100 flex flex-col items-center text-center">
                  <div className="bg-blue-100 rounded-full p-3 mb-3">
                    <Package className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-medium text-gray-900 text-sm">
                    Protective Packaging
                  </h4>
                  <p className="text-gray-600 text-xs mt-1">
                    Secure packaging to protect your accessory
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
