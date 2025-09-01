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
import {
  formatPrice,
  formatSavingsPercentage,
  calculatePromotionalPricing,
  calculateSeptember2025Pricing,
} from '@/lib/utils/discount';

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
  const [signatureProducts, setSignatureProducts] = useState<Product[]>([]);
  const [essentialsProducts, setEssentialsProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<{
    signature: PriceRange | null;
    essentials: PriceRange | null;
  }>({
    signature: null,
    essentials: null,
  });

  const router = useRouter();

  useEffect(() => {
    const fetchAllData = async () => {
      try {
        setLoading(true);

        // Fetch signature and essentials products in parallel
        const [signatureResponse, essentialsResponse, priceRangeResponse] =
          await Promise.all([
            fetch('/api/sunglasses?category=signature&limit=6'),
            fetch('/api/sunglasses?category=essentials&limit=6'),
            fetch('/api/products/price-range'),
          ]);

        const [signatureData, essentialsData, priceData] = await Promise.all([
          signatureResponse.json(),
          essentialsResponse.json(),
          priceRangeResponse.json(),
        ]);

        if (signatureData?.products) {
          setSignatureProducts(signatureData.products);
        }

        if (essentialsData?.products) {
          setEssentialsProducts(essentialsData.products);
        }

        if (priceData?.sunglasses) {
          setPriceRange({
            signature: priceData.sunglasses.signature || null,
            essentials: priceData.sunglasses.essentials || null,
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
                Discover our signature and essentials sunglasses collections.
                From luxury designer frames to everyday essentials, we have the
                perfect pair for every style and budget.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* September 2025 Promotional Banner */}
        <section className="py-12 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection direction="up" className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                🎉{' '}
                {(() => {
                  const now = new Date();
                  const currentMonth = now.getMonth();
                  return currentMonth === 7
                    ? 'August Sale - Active Now!'
                    : 'September Sale - Active Now!';
                })()}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Signature Collection
                  </h3>
                  <p className="text-white/90 mb-3">
                    Limited time offer - all signature sunglasses
                  </p>
                  <div className="text-2xl font-bold text-white">
                    Just {formatPrice(79)}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Essentials Collection
                  </h3>
                  <p className="text-white/90 mb-3">
                    Limited time offer - all essentials sunglasses
                  </p>
                  <div className="text-2xl font-bold text-white">
                    Just {formatPrice(39)}
                  </div>
                </div>
              </div>
              <p className="text-white/80 mt-6 text-sm">
                *Offer valid August 31 - September 30, 2025. Cannot be combined
                with other promotions.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Signature Sunglasses Section */}
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
                  Signature Sunglasses
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Luxury designer frames with signature polarized lenses, superior
                UV protection, and exceptional craftsmanship.
                {priceRange.signature?.lowest && (
                  <>
                    {' '}
                    Starting from{' '}
                    <span className="font-semibold text-amber-600">
                      {formatPrice(priceRange.signature.lowest.price)}
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
                  Signature Materials
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
              {signatureProducts.length > 0 ? (
                <>
                  <ProductGrid products={signatureProducts} />
                  <div className="text-center mt-12">
                    <Button
                      onClick={() => router.push('/sunglasses/signature')}
                      size="lg"
                      className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white px-8 py-3 text-lg"
                    >
                      View All Signature Sunglasses
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Signature sunglasses coming soon!
                  </p>
                </div>
              )}
            </AnimatedSection>
          </div>
        </section>

        {/* Essentials Sunglasses Section */}
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
                  Essentials Sunglasses
                </h2>
              </div>
              <p className="text-lg text-gray-600 max-w-3xl mx-auto mb-8">
                Quality everyday sunglasses with excellent UV protection at
                affordable prices. Perfect for daily wear and active lifestyles.
                {priceRange.essentials?.lowest && (
                  <>
                    {' '}
                    Starting from{' '}
                    <span className="font-semibold text-blue-600">
                      {formatPrice(priceRange.essentials.lowest.price)}
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
              {essentialsProducts.length > 0 ? (
                <>
                  <ProductGrid products={essentialsProducts} />
                  <div className="text-center mt-12">
                    <Button
                      onClick={() => router.push('/sunglasses/essentials')}
                      size="lg"
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-8 py-3 text-lg"
                    >
                      View All Essentials Sunglasses
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">
                    Essentials sunglasses coming soon!
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
                Compare our Signature and Essentials collections to find the
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
                      Signature Collection
                    </CardTitle>
                    <CardDescription className="text-lg">
                      Luxury designer frames for the discerning customer
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                        <span>Signature polarized lenses</span>
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
                        onClick={() => router.push('/sunglasses/signature')}
                        className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        size="lg"
                      >
                        Shop Signature
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
                      Essentials Collection
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
                        onClick={() => router.push('/sunglasses/essentials')}
                        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                        size="lg"
                      >
                        Shop Essentials
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedSection>
            </div>
          </div>
        </section>

        {/* Promotional Banner */}
        <section className="py-12 bg-gradient-to-r from-amber-500 to-orange-500">
          <div className="max-w-6xl mx-auto px-4">
            <AnimatedSection direction="up" className="text-center">
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                🎉 Special Offer: Buy Two, Save More!
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Essentials Collection
                  </h3>
                  <p className="text-white/90 mb-3">
                    Two for the price of (Essentials + 25% of Essentials)
                  </p>
                  <div className="text-2xl font-bold text-white">
                    {(() => {
                      const promo = calculatePromotionalPricing(
                        39,
                        'essentials'
                      );
                      return `Save up to ${formatSavingsPercentage(
                        promo.savingsPercentage
                      )}`;
                    })()}
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
                  <h3 className="text-xl font-bold text-white mb-2">
                    Signature Collection
                  </h3>
                  <p className="text-white/90 mb-3">
                    Two for the price of (Signature + 50% of Signature)
                  </p>
                  <div className="text-2xl font-bold text-white">
                    {(() => {
                      const promo = calculatePromotionalPricing(
                        79,
                        'signature'
                      );
                      return `Save up to ${formatSavingsPercentage(
                        promo.savingsPercentage
                      )}`;
                    })()}
                  </div>
                </div>
              </div>
              <p className="text-white/80 mt-6 text-sm">
                *Offer valid on selected styles. Cannot be combined with other
                promotions.
              </p>
            </AnimatedSection>
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
