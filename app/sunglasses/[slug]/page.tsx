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
  ArrowLeft,
  Check,
  ChevronRight,
  Eye,
  Heart,
  Info,
  Loader2,
  ShieldCheck,
  Truck,
} from 'lucide-react';
import { TiTick } from 'react-icons/ti';
import { TbXboxXFilled } from 'react-icons/tb';
import type { ProductFormValues } from '@/lib/api/validation';
import { Metadata } from 'next';
import { Span } from 'next/dist/trace';

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

export default function SunGlassesProductPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [product, setProduct] = useState<ProductFormValues | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string>('');
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [productImages, setProductImages] = useState<string[]>([]);
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
        const response = await fetch(`/api/sunglasses/${slug}`);

        if (!response.ok) {
          if (response.status === 404) {
            router.push('/glasses/not-found');
            return;
          }
          throw new Error(`Failed to fetch product: ${response.statusText}`);
        }

        const data = await response.json();
        setProduct(data.product);

        // Set initial selected color
        if (data.product.frameColor?.length > 0) {
          setSelectedColor(data.product.frameColor[0]);
        } else if (data.product.colors?.length > 0) {
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
    return (
      <div className="container mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <Loader2 className="h-10 w-10 text-gray-400 animate-spin" />
        <p className="text-gray-500 text-lg">Loading product details...</p>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-red-600 mb-4">
          Error Loading Product
        </h1>
        <p className="text-gray-700 mb-6">{error}</p>
        <Button onClick={() => router.push('/glasses')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Browse All Glasses
        </Button>
      </div>
    );
  }

  // Not found state
  if (!product) {
    return null;
  }

  // Determine which colors to display
  const displayColors =
    product.frameColor && product.frameColor.length > 0
      ? product.frameColor
      : product.colors || [];

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
            onClick={() => router.push('/glasses')}
          >
            Glasses
          </span>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-black">{product.name}</span>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Product Images */}
          <motion.div className="space-y-6" variants={slideUp}>
            {/* Main Image */}
            <div className="relative aspect-square bg-gray-50 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <Image
                src={
                  productImages[activeImageIndex] ||
                  product.imageUrl ||
                  '/placeholder.svg'
                }
                alt={product.name}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority
              />

              {/* Product badges */}
              <div className="absolute top-4 left-4 flex flex-col space-y-2">
                {!isInStock && (
                  <Badge className="bg-red-500 hover:bg-red-600">
                    Out of Stock
                  </Badge>
                )}
                {isInStock &&
                  product.stockQuantity &&
                  product.stockQuantity < 10 && (
                    <Badge className="bg-amber-500 hover:bg-amber-600">
                      Low Stock
                    </Badge>
                  )}
              </div>
            </div>

            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    className={`relative aspect-square bg-gray-50 rounded-md overflow-hidden border-2 transition-all ${
                      activeImageIndex === index
                        ? 'border-black'
                        : 'border-transparent hover:border-gray-200'
                    }`}
                    onClick={() => handleImageSelect(index)}
                    aria-label={`View image ${index + 1} of ${product.name}`}
                  >
                    <Image
                      src={image || '/placeholder.svg'}
                      alt={`${product.name} - View ${index + 1}`}
                      fill
                      sizes="(max-width: 768px) 25vw, 12vw"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Product Info */}
          <motion.div className="space-y-8" variants={staggerChildren}>
            {/* Product Title and Price */}
            <motion.div variants={slideUp}>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {product.name}
              </h1>
              <p className="text-2xl font-bold text-gray-900">
                {formatCurrency(product.price)}
              </p>
            </motion.div>

            {/* Availability */}
            <motion.div variants={slideUp} className="flex items-center">
              {isInStock ? (
                <div className="flex items-center text-green-600">
                  <Check className="h-5 w-5 mr-2" />
                  <span>
                    In Stock
                    {product.stockQuantity &&
                      product.stockQuantity < 10 &&
                      ` (Only ${product.stockQuantity} left)`}
                  </span>
                </div>
              ) : (
                <div className="flex items-center text-red-600">
                  <Info className="h-5 w-5 mr-2" />
                  <span>Out of Stock</span>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.div variants={slideUp}>
              <p className="text-gray-600 leading-relaxed">
                {product.description}
              </p>
            </motion.div>

            {/* Specifications */}
            <motion.div variants={slideUp} className="space-y-4">
              <h3 className="font-medium text-gray-900">Specifications</h3>
              <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm">
                {product.frameType && (
                  <>
                    <span className="text-gray-500">Frame Type</span>
                    <span className="font-medium">
                      {formatText(product.frameType)}
                    </span>
                  </>
                )}
                {product.frameMaterial && (
                  <>
                    <span className="text-gray-500">Frame Material</span>
                    <span className="font-medium">
                      {formatText(product.frameMaterial)}
                    </span>
                  </>
                )}
                {product.frameWidth && (
                  <>
                    <span className="text-gray-500">Frame Width</span>
                    <span className="font-medium">
                      {formatText(product.frameWidth)}
                    </span>
                  </>
                )}
                {product.gender && (
                  <>
                    <span className="text-gray-500">Gender</span>
                    <span className="font-medium">
                      {formatText(product.gender)}
                    </span>
                  </>
                )}
                {product.lensType && (
                  <>
                    <span className="text-gray-500">Lens Type</span>
                    <span className="font-medium">
                      {formatText(product.lensType)}
                    </span>
                  </>
                )}
                {product.prescriptionType && (
                  <>
                    <span className="text-gray-500">Prescription Type</span>
                    <span className="font-medium">
                      {formatText(product.prescriptionType)}
                    </span>
                  </>
                )}
                {product.uvProtection ? (
                  <>
                    <span className="text-gray-500">UV Protection</span>
                    <span className="font-medium">
                      <TiTick size={20} color="green" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500">UV Protection</span>
                    <span className="font-medium">
                      <TbXboxXFilled size={20} color="red" />
                    </span>
                  </>
                )}
                {product.polarized ? (
                  <>
                    <span className="text-gray-500">Polarized</span>
                    <span className="font-medium">
                      <TiTick size={20} color="green" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500">Polarized</span>
                    <span className="font-medium">
                      <TbXboxXFilled size={20} color="red" />
                    </span>
                  </>
                )}
                {product.style && (
                  <>
                    <span className="text-gray-500">Style</span>
                    <span className="font-medium">
                      {formatText(product.style)}
                    </span>
                  </>
                )}

                {product.forAstigmatism ? (
                  <>
                    <span className="text-gray-500">For Astigmatism</span>
                    <span className="font-medium">
                      <TiTick size={20} color="green" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500">For Astigmatism</span>
                    <span className="font-medium">
                      <TbXboxXFilled size={20} color="red" />
                    </span>
                  </>
                )}

                {product.uvBlocking ? (
                  <>
                    <span className="text-gray-500">UV Blocking</span>
                    <span className="font-medium">
                      <TiTick size={20} color="green" />
                    </span>
                  </>
                ) : (
                  <>
                    <span className="text-gray-500">UV Blocking</span>
                    <span className="font-medium">
                      <TbXboxXFilled size={20} color="red" />
                    </span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Color Selection */}
            {displayColors.length > 0 && (
              <motion.div variants={slideUp} className="space-y-4">
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900">Color</h3>
                  <span className="text-gray-600">
                    {selectedColor && formatText(selectedColor)}
                  </span>
                </div>
                <ProductColorSelector
                  colors={displayColors}
                  selectedColor={selectedColor}
                  onSelectColor={handleColorSelect}
                />
              </motion.div>
            )}

            {/* Add to Cart */}
            <motion.div variants={slideUp} className="flex space-x-4 pt-2">
              <div
                className={`flex-1 text-white py-4 md:py-5 rounded-lg transition-colors ${
                  !isInStock ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isInStock ? (
                  <>
                    <AddToCartButton product={product} />

                    {product.stockQuantity && product.stockQuantity < 15 && (
                      <span className="text-xs text-gray-500 ml-2">
                        Only {product.stockQuantity} left
                      </span>
                    )}
                  </>
                ) : (
                  <button
                    className="w-full bg-gray-300 text-gray-500 py-4 md:py-5 cursor-not-allowed"
                    disabled
                  >
                    Out of Stock
                  </button>
                )}
              </div>
              {/* <Button
                variant="outline"
                size="icon"
                className="h-14 w-14 border-gray-300 rounded-lg"
              >
                <Heart className="h-6 w-6" />
              </Button> */}
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
              className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-6"
            >
              <div className="flex items-center">
                <Truck className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium">Free Shipping</h3>
                  <p className="text-xs text-gray-500">On orders over $50</p>
                </div>
              </div>
              <div className="flex items-center">
                <ShieldCheck className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium">1-Year Warranty</h3>
                  <p className="text-xs text-gray-500">Against defects</p>
                </div>
              </div>
              <div className="flex items-center">
                <ArrowLeft className="h-8 w-8 text-gray-400 mr-3" />
                <div>
                  <h3 className="text-sm font-medium">30-Day Returns</h3>
                  <p className="text-xs text-gray-500">Hassle-free returns</p>
                </div>
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
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="w-full justify-start border-b border-gray-200 rounded-none bg-transparent h-auto p-0 mb-8 gap-2">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-3 text-base"
              >
                Product Details
              </TabsTrigger>
              <TabsTrigger
                value="care"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent py-3 text-base"
              >
                Care & Warranty
              </TabsTrigger>
            </TabsList>

            {/* Product Details Tab */}
            <TabsContent value="details" className="pt-2">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    About This Product
                  </h3>
                  <p className="text-gray-600 whitespace-pre-line leading-relaxed">
                    {product.description}
                  </p>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Features & Benefits</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Lightweight and comfortable for all-day wear</span>
                    </li>
                    {product.frameMaterial && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <span>
                          Durable {formatText(product.frameMaterial)}{' '}
                          construction for long-lasting quality
                        </span>
                      </li>
                    )}
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Adjustable nose pads for a customized fit</span>
                    </li>
                    {product.lensType && (
                      <li className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                        <span>
                          {formatText(product.lensType)} lenses for optimal
                          vision
                        </span>
                      </li>
                    )}
                  </ul>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">What's Included</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>
                        Glasses with{' '}
                        {product.lensType
                          ? formatText(product.lensType)
                          : 'standard'}{' '}
                        lenses
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Premium hardshell case</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Microfiber cleaning cloth</span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>

            {/* Care & Warranty Tab */}
            <TabsContent value="care" className="pt-2">
              <div className="space-y-8">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Care Instructions
                  </h3>
                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>
                        Clean lenses with the provided microfiber cloth and lens
                        cleaner
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Store in the protective case when not in use</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>
                        Avoid leaving glasses in hot environments (like your
                        car)
                      </span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>
                        Handle by the bridge to avoid smudging the lenses
                      </span>
                    </li>
                  </ul>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Warranty Information
                  </h3>
                  <p className="text-gray-600 mb-6">
                    All Bailey Nelson frames come with a comprehensive 1-year
                    warranty against manufacturing defects.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-medium mb-3">What's Covered</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Manufacturing defects</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Frame structural issues</span>
                        </li>
                        <li className="flex items-start">
                          <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                          <span>Coating defects</span>
                        </li>
                      </ul>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                      <h4 className="font-medium mb-3">What's Not Covered</h4>
                      <ul className="space-y-2">
                        <li className="flex items-start">
                          <Info className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                          <span>Normal wear and tear</span>
                        </li>
                        <li className="flex items-start">
                          <Info className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                          <span>Accidental damage</span>
                        </li>
                        <li className="flex items-start">
                          <Info className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                          <span>Improper use or care</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Returns & Exchanges
                  </h3>
                  <p className="text-gray-600 mb-6">
                    We want you to be completely satisfied with your purchase.
                    If you're not happy with your glasses for any reason, we
                    offer a simple return and exchange policy.
                  </p>

                  <ul className="space-y-3">
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>30-day free returns on all unworn glasses</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>Free shipping on all exchanges</span>
                    </li>
                    <li className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5" />
                      <span>
                        Prescription lenses can be exchanged if the prescription
                        was incorrectly made
                      </span>
                    </li>
                  </ul>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </motion.div>
  );
}
