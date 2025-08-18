'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/product-grid';
import { ProductFormValues as Product } from '@/lib/api/validation';
import { toast } from 'sonner';
import LoadingPage from '@/components/loading';
import { Pagination } from '@/components/ui/pagination';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gem, Star, Shield, ArrowLeft } from 'lucide-react';
import AnimatedSection from '@/components/animated-section';
import { Playfair_Display } from 'next/font/google';
import { formatPrice } from '@/lib/utils/discount';

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
function SignatureSunglassesContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  // Use a ref to store the limit value
  const limitRef = useRef(12);

  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchPriceRange = async () => {
      try {
        const response = await fetch('/api/products/price-range');
        const data = await response.json();
        setPriceRange(data.sunglasses?.signature || null);
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

        const response = await fetch(
          `/api/sunglasses?category=signature&page=${currentPage}&limit=${limitRef.current}`
        );
        const data = await response.json();

        if (data && data.products) {
          setProducts(data.products);
          setPagination(
            data.pagination || {
              total: 0,
              page: 1,
              limit: 12,
              totalPages: 1,
              hasNextPage: false,
              hasPrevPage: false,
            }
          );
        } else {
          setProducts([]);
        }
      } catch (error: any) {
        console.error('Error fetching signature sunglasses:', error);
        toast.error(
          `${error.message || 'Failed to fetch signature sunglasses'}`
        );
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage]);

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/sunglasses/signature?${params.toString()}`);
  };

  // Check if products array is valid
  const hasProducts = Array.isArray(products) && products.length > 0;

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection direction="up">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full">
                  <Gem className="w-8 h-8 text-white" />
                </div>
                <h1
                  className={`${playfair.className} text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600`}
                >
                  Signature Sunglasses
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 text-center leading-relaxed">
                Luxury designer frames crafted with signature materials,
                featuring polarized lenses and exceptional UV protection.
                {priceRange?.lowest && (
                  <>
                    {' '}
                    Starting from{' '}
                    <span className="font-semibold text-amber-600">
                      {formatPrice(priceRange.lowest.price)}
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
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                >
                  1-Year Warranty
                </Badge>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => router.push('/sunglasses')}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to All Sunglasses
                </Button>
              </div>
            </AnimatedSection>
          </div>
        </section>

        {/* Products Section */}
        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            {loading && <LoadingPage loading={loading} />}

            {!loading && !hasProducts && (
              <div className="text-center py-16">
                <p className="text-lg text-gray-600 mb-6">
                  No signature sunglasses found. Check back soon for our latest
                  luxury collection!
                </p>
                <Button
                  onClick={() => router.push('/sunglasses')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  Browse All Sunglasses
                </Button>
              </div>
            )}

            {!loading && hasProducts && (
              <AnimatedSection direction="up">
                <div className="mb-8">
                  <h2
                    className={`${playfair.className} text-3xl font-bold mb-4 text-center`}
                  >
                    Signature Collection ({pagination.total} Products)
                  </h2>
                  <div className="flex flex-wrap justify-center gap-4 mb-8">
                    <Link
                      href="/sunglasses/signature/mens"
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      Men's Signature
                    </Link>
                    <Link
                      href="/sunglasses/signature/womens"
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      Women's Signature
                    </Link>
                    <Link
                      href="/sunglasses/signature/new-arrivals"
                      className="px-4 py-2 bg-amber-100 text-amber-800 rounded-lg hover:bg-amber-200 transition-colors"
                    >
                      New Arrivals
                    </Link>
                  </div>
                </div>

                <ProductGrid products={products} />

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
                  Showing {products.length} of {pagination.total} signature
                  sunglasses
                </div>
              </AnimatedSection>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

// Main export with Suspense boundary
export default function SignatureSunglassesPage() {
  return (
    <Suspense fallback={<LoadingPage loading={true} />}>
      <SignatureSunglassesContent />
    </Suspense>
  );
}
