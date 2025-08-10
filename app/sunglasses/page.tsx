'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/product-grid';
import { ProductFormValues as Product } from '@/lib/api/validation';
import { toast } from 'sonner';
import LoadingPage from '@/components/loading';
import { Pagination } from '@/components/ui/pagination';
import Link from 'next/link';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowRight, Star, Shield, Gem } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import AnimatedSection from '@/components/animated-section';
import { Playfair_Display } from 'next/font/google';

const playfair = Playfair_Display({ subsets: ['latin'] });

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

// Separate the main content to a client component
function SunglassesContent() {
  const [premiumProducts, setPremiumProducts] = useState<Product[]>([]);
  const [standardProducts, setStandardProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<{
    premium: PriceRange | null;
    standard: PriceRange | null;
  }>({
    premium: null,
    standard: null,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch premium and standard products in parallel
        const [premiumResponse, standardResponse, priceRangeResponse] =
          await Promise.all([
            fetch('/api/sunglasses?category=premium&limit=6'),
            fetch('/api/sunglasses?category=standard&limit=6'),
            fetch('/api/products/price-range'),
          ]);

        const [premiumData, standardData, priceData] = await Promise.all([
          premiumResponse.json(),
          standardResponse.json(),
          priceRangeResponse.json(),
        ]);

        if (premiumData?.products) {
          setPremiumProducts(premiumData.products);
        }

        if (standardData?.products) {
          setStandardProducts(standardData.products);
        }

        if (priceData?.sunglasses) {
          setPriceRange({
            premium: priceData.sunglasses.premium || null,
            standard: priceData.sunglasses.standard || null,
          });
        }
      } catch (error: any) {
        console.error('Error fetching sunglasses data:', error);
        toast.error(`${error.message || 'Failed to fetch sunglasses'}`);
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, []);

  if (loading) {
    return <LoadingPage loading={loading} />;
  }

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-gray-50 to-white py-20 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <AnimatedSection direction="up">
              <h1
                className={`${playfair.className} text-5xl md:text-6xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-indigo-800 via-purple-700 to-pink-600`}
              >
                Sunglasses Collection
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-12 leading-relaxed">
                Discover our premium and standard sunglasses collections. From
                luxury designer frames to everyday essentials, we have the
                perfect pair for every style and budget.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Premium Sunglasses Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection direction="up" className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                  <Gem className="w-8 h-8 text-white" />
                </div>
                <h2
                  className={`${playfair.className} text-4xl md:text-5xl font-bold`}
                >
                  Premium Sunglasses
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Luxury designer frames with premium polarized lenses, superior
                UV protection, and exceptional craftsmanship.
                {priceRange.premium?.lowest && (
                  <>
                    {' '}
                    Starting from{' '}
                    <span className="font-semibold text-amber-600">
                      ${priceRange.premium.lowest.price.toFixed(2)}
                    </span>
                  </>
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                >
                  <Star className="w-4 h-4 mr-1" />
                  Premium Materials
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  UV400 Protection
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                >
                  Polarized Lenses
                </Badge>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.2}>
              {premiumProducts.length > 0 ? (
                <>
                  <ProductGrid products={premiumProducts} />
                  <div className="text-center mt-12">
                    <Button
                      onClick={() => router.push('/sunglasses/premium')}
                      size="lg"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg"
                    >
                      View All Premium Sunglasses
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Premium sunglasses coming soon!
                  </p>
                </div>
              )}
            </AnimatedSection>
          </div>
        </section>

        {/* Standard Sunglasses Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection direction="up" className="text-center mb-16">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h2
                  className={`${playfair.className} text-4xl md:text-5xl font-bold`}
                >
                  Standard Sunglasses
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Quality everyday sunglasses with excellent UV protection at
                affordable prices. Perfect for daily wear and active lifestyles.
                {priceRange.standard?.lowest && (
                  <>
                    {' '}
                    Starting from{' '}
                    <span className="font-semibold text-blue-600">
                      ${priceRange.standard.lowest.price.toFixed(2)}
                    </span>
                  </>
                )}
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 border-blue-200"
                >
                  <Shield className="w-4 h-4 mr-1" />
                  UV Protection
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 border-blue-200"
                >
                  Durable Frames
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 border-blue-200"
                >
                  Affordable Quality
                </Badge>
              </div>
            </AnimatedSection>

            <AnimatedSection direction="up" delay={0.2}>
              {standardProducts.length > 0 ? (
                <>
                  <ProductGrid products={standardProducts} />
                  <div className="text-center mt-12">
                    <Button
                      onClick={() => router.push('/sunglasses/standard')}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 text-lg"
                    >
                      View All Standard Sunglasses
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Standard sunglasses coming soon!
                  </p>
                </div>
              )}
            </AnimatedSection>
          </div>
        </section>

        {/* Comparison Section */}
        <section className="py-20 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <AnimatedSection direction="up" className="text-center mb-16">
              <h2
                className={`${playfair.className} text-4xl md:text-5xl font-bold mb-6`}
              >
                Choose Your Perfect Pair
              </h2>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                Compare our Premium and Standard collections to find the
                sunglasses that match your style and budget.
              </p>
            </AnimatedSection>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <AnimatedSection direction="left" delay={0.1}>
                <Card className="h-full border-2 border-amber-200 hover:border-amber-300 transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center">
                      <Gem className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle
                      className={`${playfair.className} text-3xl text-amber-600`}
                    >
                      Premium Collection
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Luxury designer frames for the discerning customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Premium polarized lenses</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Designer materials (Titanium, Acetate)</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>UV400 maximum protection</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Luxury packaging & case</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>1-year warranty</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => router.push('/sunglasses/premium')}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        size="lg"
                      >
                        Shop Premium
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>

              <AnimatedSection direction="right" delay={0.2}>
                <Card className="h-full border-2 border-blue-200 hover:border-blue-300 transition-all duration-300 hover:shadow-xl">
                  <CardHeader className="text-center">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center">
                      <Shield className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle
                      className={`${playfair.className} text-3xl text-blue-600`}
                    >
                      Standard Collection
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Quality everyday sunglasses at affordable prices
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>UV protection lenses</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Durable plastic & metal frames</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>UV400 protection</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>Protective case included</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span>1-year warranty</span>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <Button
                        onClick={() => router.push('/sunglasses/standard')}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        size="lg"
                      >
                        Shop Standard
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

// Main export with Suspense boundary
export default function SunglassesPage() {
  return (
    <Suspense fallback={<LoadingPage loading={true} />}>
      <SunglassesContent />
    </Suspense>
  );
}
