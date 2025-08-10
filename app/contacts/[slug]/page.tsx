'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import ProductColorSelector from '@/components/product-color-selector';
import AddToCartButton from '@/components/add-to-cart-button';
import { formatCurrency } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  ArrowLeft,
  Award,
  Ban,
  Check,
  ChevronRight,
  Clock,
  Droplets,
  Eye,
  FileText,
  Hand,
  Heart,
  Info,
  Loader2,
  Package,
  Palette,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Sun,
  Truck,
  X,
} from 'lucide-react';
import type { ProductFormValues } from '@/lib/api/validation';
import { getCSSColor, getColorDisplayName } from '@/lib/color-utils';
import { useCart } from '@/context/cart-context';
import LoadingPage from '@/components/loading';
import { type IProduct } from '@/models';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
};

const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const slideUp = {
  hidden: { y: 20, opacity: 0 },
  visible: { y: 0, opacity: 1, transition: { duration: 0.5 } },
};

// Helper function to capitalize and format text
const formatText = (text: string) => {
  return text
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

interface Props {
  params: {
    slug: string;
  };
  searchParams: { [key: string]: string | string[] | undefined };
}

export default function ContactsProductPage() {
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
  // const pageUrl = `https://lensaura.com/glasses/${slug}`;

  interface RelatedProduct {
    id: string;
    name: string;
    imageUrl: string;
    price: number;
  }

  const [relatedProducts, setRelatedProducts] = useState<RelatedProduct[]>([]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/contacts/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            router.push('/contacts/not-found');
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

  // Fetch related products
  // useEffect(() => {
  //   const fetchRelatedProducts = async () => {
  //     if (!product?.productType) return;
  //     try {
  //       const response = await fetch(
  //         `/api/glasses/related/<span class="math-inline">\{slug\}?category\=</span>{product.category}`
  //       ); // Example API endpoint
  //       if (response.ok) {
  //         const data = await response.json();
  //         setRelatedProducts(data.relatedProducts);
  //       } else {
  //         console.error('Failed to fetch related products');
  //       }
  //     } catch (error) {
  //       console.error('Error fetching related products:', error);
  //     }
  //   };

  //   if (product?.productType) {
  //     fetchRelatedProducts();
  //   }
  // }, [slug, product?.productType]);

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
        <Button onClick={() => router.push('/contacts')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Browse All Contact Lenses
        </Button>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return null;
  }

  // Determine which colors to display
  const displayColors = product.colors || [];

  // Check if product is in stock
  const isInStock = (product.stockQuantity ?? 0) > 0;

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
            onClick={() => router.push('/contacts')}
          >
            Contact Lenses
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-black">{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 mb-16">
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
              <div className="grid grid-cols-5 gap-2 mt-4">
                {productImages.map((image, index) => (
                  <motion.button
                    key={index}
                    className={`relative aspect-square bg-gray-50 rounded-lg overflow-hidden transition-all duration-200 ${
                      activeImageIndex === index
                        ? 'ring-2 ring-blue-600 ring-offset-2 ring-offset-white'
                        : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                    }`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleImageSelect(index)}
                    aria-label={`View image ${index + 1} of ${product.name}`}
                  >
                    <Image
                      src={image || '/placeholder.svg'}
                      alt={`${product.name} - View ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 20vw, 10vw"
                      className="object-cover"
                    />
                  </motion.button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
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
            <motion.div variants={slideUp} className="flex items-center">
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

            {/* Specifications */}
            <motion.div
              variants={slideUp}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="flex items-center bg-gray-50 p-4 border-b">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-medium text-gray-900">Specifications</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-gray-200">
                <div className="p-4 space-y-3">
                  {product.packagingType && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">
                        Packaging Type
                      </span>
                      <span className="font-medium text-sm text-gray-900">
                        {formatText(product.packagingType)}
                      </span>
                    </div>
                  )}

                  {product.wearDuration && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">
                        Wear Duration
                      </span>
                      <span className="font-medium text-sm text-gray-900">
                        {formatText(product.wearDuration)}
                      </span>
                    </div>
                  )}

                  {product.replacementFrequency && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Replacement</span>
                      <span className="font-medium text-sm text-gray-900">
                        {formatText(product.replacementFrequency)}
                      </span>
                    </div>
                  )}

                  {product.waterContent && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">
                        Water Content
                      </span>
                      <span className="font-medium text-sm text-gray-900">
                        {product.waterContent}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-4 space-y-3">
                  {product.diameter && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Diameter</span>
                      <span className="font-medium text-sm text-gray-900">
                        {product.diameter} mm
                      </span>
                    </div>
                  )}

                  {product.baseCurve && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">Base Curve</span>
                      <span className="font-medium text-sm text-gray-900">
                        {product.baseCurve} mm
                      </span>
                    </div>
                  )}

                  {product.quantity && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 text-sm">
                        Quantity Per Box
                      </span>
                      <span className="font-medium text-sm text-gray-900">
                        {product.quantity}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>

            {/* Features */}
            <motion.div
              variants={slideUp}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <div className="flex items-center bg-gray-50 p-4 border-b">
                <Settings className="h-5 w-5 mr-2 text-blue-600" />
                <h3 className="font-medium text-gray-900">Features</h3>
              </div>
              <div className="p-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
                {product.forAstigmatism !== undefined && (
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-xl ${
                      product.forAstigmatism
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <Eye className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Astigmatism</span>
                    <span className="text-xs">
                      {product.forAstigmatism ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}

                {product.forPresbyopia !== undefined && (
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-xl ${
                      product.forPresbyopia
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <Eye className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">Presbyopia</span>
                    <span className="text-xs">
                      {product.forPresbyopia ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}

                {product.uvBlocking !== undefined && (
                  <div
                    className={`flex flex-col items-center justify-center p-4 rounded-xl ${
                      product.uvBlocking
                        ? 'bg-green-50 text-green-700'
                        : 'bg-gray-50 text-gray-500'
                    }`}
                  >
                    <Sun className="h-6 w-6 mb-2" />
                    <span className="text-sm font-medium">UV Blocking</span>
                    <span className="text-xs">
                      {product.uvBlocking ? 'Yes' : 'No'}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>

            {/* Color Selection */}
            {displayColors.length > 0 && (
              <motion.div
                variants={slideUp}
                className="border border-gray-200 rounded-xl overflow-hidden"
              >
                <div className="flex items-center justify-between bg-gray-50 p-4 border-b">
                  <div className="flex items-center">
                    <Palette className="h-5 w-5 mr-2 text-blue-600" />
                    <h3 className="font-medium text-gray-900">Color Options</h3>
                  </div>
                  <span className="text-sm text-blue-600 font-medium">
                    {selectedColor && formatText(selectedColor)}
                  </span>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {displayColors.map((color, index) => (
                      <motion.button
                        key={index}
                        className={`relative p-1 rounded-full cursor-pointer transition-all 
                          ${
                            selectedColor === color
                              ? 'ring-2 ring-blue-600 ring-offset-2'
                              : 'hover:ring-1 hover:ring-gray-300 hover:ring-offset-1'
                          }`}
                        onClick={() => handleColorSelect(color)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        <div
                          className="w-8 h-8 rounded-full"
                          style={{
                            backgroundColor: getCSSColor(color),
                            border:
                              color.toLowerCase() === 'white' ||
                              color.toLowerCase() === '#ffffff'
                                ? '1px solid #e5e5e5'
                                : 'none',
                          }}
                          title={getColorDisplayName(color)}
                        />
                        {selectedColor === color && (
                          <motion.div
                            className="absolute inset-0 flex items-center justify-center"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                          >
                            <Check
                              className={`h-4 w-4 ${
                                [
                                  'white',
                                  '#ffffff',
                                  'yellow',
                                  '#ffff00',
                                ].includes(color.toLowerCase())
                                  ? 'text-black'
                                  : 'text-white'
                              }`}
                            />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Add to Cart */}
            <motion.div
              variants={slideUp}
              className="flex flex-col space-y-4 mt-6 sticky bottom-0 bg-white pt-4 pb-2 border-t border-gray-200 -mx-4 px-4 sm:mx-0 sm:px-0 sm:border-0 sm:static"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <ShoppingCart className="h-5 w-5 mr-2 text-blue-600" />
                  <span className="font-medium text-gray-900">Add to Cart</span>
                </div>
                {isInStock && product.stockQuantity && (
                  <span className="text-sm text-gray-500">
                    {product.stockQuantity < 10
                      ? `Only ${product.stockQuantity} left`
                      : `${product.stockQuantity} in stock`}
                  </span>
                )}
              </div>

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
                  ) : product.stockQuantity !== undefined &&
                    quantityInCart + quantityToAdd > product.stockQuantity ? (
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

              {/* Quick shipping badge */}
              <div className="mt-4 flex justify-center">
                <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-full">
                  <Truck className="h-4 w-4 mr-1 text-green-600" />
                  <span>Free shipping on orders over $50</span>
                </div>
              </div>
            </motion.div>

            {/* Virtual Try-On */}
            {/* <motion.div variants={slideUp}>
              <Button
                variant="outline"
                className="w-full py-5 border-gray-300 rounded-lg"
              >
                <Eye className="mr-2 h-5 w-5" />
                Virtual Try-On
              </Button>
            </motion.div> */}

            {/* Shipping & Returns */}
            <motion.div
              variants={slideUp}
              className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6"
            >
              <div className="flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="rounded-full bg-blue-100 p-3 mb-3">
                  <Truck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-center">
                  Free Shipping
                </h3>
                <p className="text-xs text-gray-500 text-center">
                  On orders over $50
                </p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="rounded-full bg-blue-100 p-3 mb-3">
                  <ShieldCheck className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-center">
                  1-Year Warranty
                </h3>
                <p className="text-xs text-gray-500 text-center">
                  Against defects
                </p>
              </div>
              <div className="flex flex-col items-center p-4 rounded-xl border border-gray-200 bg-gray-50">
                <div className="rounded-full bg-blue-100 p-3 mb-3">
                  <ArrowLeft className="h-6 w-6 text-blue-600" />
                </div>
                <h3 className="text-sm font-medium text-center">
                  30-Day Returns
                </h3>
                <p className="text-xs text-gray-500 text-center">
                  Hassle-free returns
                </p>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Product Details Tabs */}
        <motion.div
          className="mb-16"
          variants={slideUp}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.3 }}
        >
          <Tabs defaultValue="details" className="w-full mt-8">
            <TabsList className="w-full justify-start rounded-xl bg-gray-100 p-1 mb-8 gap-1">
              <TabsTrigger
                value="details"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 flex-1 text-base"
              >
                <FileText className="h-4 w-4 mr-2" />
                Product Details
              </TabsTrigger>
              <TabsTrigger
                value="care"
                className="rounded-lg data-[state=active]:bg-white data-[state=active]:shadow-sm py-3 flex-1 text-base"
              >
                <ShieldCheck className="h-4 w-4 mr-2" />
                Care & Warranty
              </TabsTrigger>
            </TabsList>

            {/* Product Details Tab */}
            <TabsContent
              value="details"
              className="focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Info className="h-5 w-5 mr-2 text-blue-600" />
                    About This Product
                  </h3>
                  <div className="text-gray-700 prose prose-sm max-w-none">
                    <p className="whitespace-pre-line leading-relaxed">
                      {product.description}
                    </p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-600" />
                    Features & Benefits
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                          <Check className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            High Oxygen Permeability
                          </h4>
                          <p className="text-gray-600 text-xs mt-1">
                            Allows more oxygen to reach your eyes for healthier
                            wear
                          </p>
                        </div>
                      </div>
                    </div>

                    {product.wearDuration && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start">
                          <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                            <Clock className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              {formatText(product.wearDuration)} Wear
                            </h4>
                            <p className="text-gray-600 text-xs mt-1">
                              Designed for{' '}
                              {formatText(product.wearDuration).toLowerCase()}{' '}
                              comfort and convenience
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                          <Heart className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            Superior Comfort
                          </h4>
                          <p className="text-gray-600 text-xs mt-1">
                            Exceptional comfort throughout the entire wear time
                          </p>
                        </div>
                      </div>
                    </div>

                    {product.uvBlocking && (
                      <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                        <div className="flex items-start">
                          <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                            <Sun className="h-4 w-4 text-blue-600" />
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900 text-sm">
                              UV Protection
                            </h4>
                            <p className="text-gray-600 text-xs mt-1">
                              Built-in UV blocking technology for added eye
                              protection
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Package className="h-5 w-5 mr-2 text-blue-600" />
                    What's Included
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center text-center">
                      <div className="bg-blue-100 rounded-full p-3 mb-3">
                        <Eye className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Contact Lenses
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        {product.quantity || ''} {product.name} contact lenses
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center text-center">
                      <div className="bg-blue-100 rounded-full p-3 mb-3">
                        <Package className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Sterile Packaging
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Individually sealed sterile blister packaging
                      </p>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col items-center text-center">
                      <div className="bg-blue-100 rounded-full p-3 mb-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                      </div>
                      <h4 className="font-medium text-gray-900 text-sm">
                        Documentation
                      </h4>
                      <p className="text-gray-600 text-xs mt-1">
                        Detailed usage and care instructions
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>

            {/* Care & Warranty Tab */}
            <TabsContent
              value="care"
              className="focus-visible:outline-none focus-visible:ring-0"
            >
              <div className="space-y-8 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ShieldCheck className="h-5 w-5 mr-2 text-blue-600" />
                    Care Instructions
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                          <Hand className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            Wash Hands Thoroughly
                          </h4>
                          <p className="text-gray-600 text-xs mt-1">
                            Always wash and dry your hands before handling your
                            contact lenses
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                          <Droplets className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            Use Proper Solution
                          </h4>
                          <p className="text-gray-600 text-xs mt-1">
                            Only use recommended contact lens solution for
                            cleaning and storage
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                          <Ban className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            Avoid Water Contact
                          </h4>
                          <p className="text-gray-600 text-xs mt-1">
                            Never use tap water to clean or store your contact
                            lenses
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4 border border-gray-100">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5 flex-shrink-0">
                          <Clock className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900 text-sm">
                            Follow Replacement Schedule
                          </h4>
                          <p className="text-gray-600 text-xs mt-1">
                            Replace lenses according to the recommended schedule
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <Award className="h-5 w-5 mr-2 text-blue-600" />
                    Warranty Information
                  </h3>
                  <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
                    <p className="text-gray-700 text-sm">
                      All contact lenses come with a manufacturer warranty
                      against defects. Contact us immediately if you encounter
                      any issues with your lenses.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <Check className="h-4 w-4 text-green-500 mr-2" />
                        What's Covered
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start text-sm">
                          <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-gray-700 text-xs">
                            Manufacturing defects
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-gray-700 text-xs">
                            Packaging issues
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <div className="bg-green-100 rounded-full p-1 mr-2 mt-0.5">
                            <Check className="h-3 w-3 text-green-600" />
                          </div>
                          <span className="text-gray-700 text-xs">
                            Material defects
                          </span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                      <h4 className="font-medium text-gray-900 mb-3 flex items-center">
                        <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                        What's Not Covered
                      </h4>
                      <ul className="space-y-2">
                        <li className="flex items-start text-sm">
                          <div className="bg-red-100 rounded-full p-1 mr-2 mt-0.5">
                            <X className="h-3 w-3 text-red-600" />
                          </div>
                          <span className="text-gray-700 text-xs">
                            Damage from improper use
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <div className="bg-red-100 rounded-full p-1 mr-2 mt-0.5">
                            <X className="h-3 w-3 text-red-600" />
                          </div>
                          <span className="text-gray-700 text-xs">
                            Expired products
                          </span>
                        </li>
                        <li className="flex items-start text-sm">
                          <div className="bg-red-100 rounded-full p-1 mr-2 mt-0.5">
                            <X className="h-3 w-3 text-red-600" />
                          </div>
                          <span className="text-gray-700 text-xs">
                            Products purchased from unauthorized retailers
                          </span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator className="my-6" />

                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center">
                    <ArrowLeft className="h-5 w-5 mr-2 text-blue-600" />
                    Returns & Exchanges
                  </h3>
                  <div className="bg-gray-50 rounded-xl p-5 border border-gray-100">
                    <p className="text-gray-700 text-sm mb-4">
                      We want you to be completely satisfied with your purchase.
                      If you're not happy with your contact lenses for any
                      reason, we offer a simple return and exchange policy.
                    </p>

                    <div className="space-y-3">
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                          <Check className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700 text-sm">
                          30-day free returns on unopened products
                        </span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                          <Check className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700 text-sm">
                          Free shipping on all exchanges
                        </span>
                      </div>
                      <div className="flex items-start">
                        <div className="bg-blue-100 rounded-full p-1 mr-3 mt-0.5">
                          <Check className="h-4 w-4 text-blue-600" />
                        </div>
                        <span className="text-gray-700 text-sm">
                          Contact our customer service team for assistance with
                          returns
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>

        {/* Related Products Section */}
        {/* <motion.div
          className="pt-8"
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.5 }}
        >
          <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map((relatedProduct) => (
              <div key={relatedProduct.id} className="group cursor-pointer">
                <div className="aspect-square bg-gray-50 rounded-lg overflow-hidden mb-4">
                  <div className="relative w-full h-full">
                    <Image
                      src={relatedProduct.imageUrl || '/placeholder.svg'}
                      alt={relatedProduct.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                </div>
                <h3 className="font-medium text-gray-900 group-hover:text-black transition-colors">
                  {relatedProduct.name}
                </h3>
                <p className="text-gray-500">
                  {formatCurrency(relatedProduct.price)}
                </p>
              </div>
            ))}
          </div>
        </motion.div> */}
      </div>
    </motion.div>
  );
}
