'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/product-grid';
import { ProductFormValues as Product } from '@/lib/api/validation';
import { toast } from 'sonner';
import LoadingPage from '@/components/loading';
import { Pagination } from '@/components/ui/pagination';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Gem, Sparkles, ArrowLeft } from 'lucide-react';
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

function PremiumNewArrivalsContent() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });

  const limitRef = useRef(12);
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentPage = parseInt(searchParams.get('page') || '1');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        // Fetch premium products sorted by creation date (newest first)
        const response = await fetch(
          `/api/sunglasses?category=premium&page=${currentPage}&limit=${limitRef.current}&sort=createdAt&order=desc`
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
        console.error('Error fetching premium new arrivals:', error);
        toast.error(
          `${error.message || 'Failed to fetch premium new arrivals'}`
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
    router.push(`/sunglasses/premium/new-arrivals?${params.toString()}`);
  };

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
                  <Sparkles className="w-8 h-8 text-white" />
                </div>
                <h1
                  className={`${playfair.className} text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600`}
                >
                  Premium New Arrivals
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 text-center leading-relaxed">
                Discover our latest luxury sunglasses collection. Fresh designs,
                premium materials, and cutting-edge style.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                >
                  <Sparkles className="w-4 h-4 mr-1" />
                  New Arrivals
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                >
                  Premium Quality
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                >
                  Latest Designs
                </Badge>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => router.push('/sunglasses/premium')}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Premium Collection
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
                  No premium new arrivals found. Check back soon for our latest
                  luxury designs!
                </p>
                <Button
                  onClick={() => router.push('/sunglasses/premium')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  Browse Premium Collection
                </Button>
              </div>
            )}

            {!loading && hasProducts && (
              <AnimatedSection direction="up">
                <div className="mb-8">
                  <h2
                    className={`${playfair.className} text-3xl font-bold mb-4 text-center`}
                  >
                    Latest Premium Arrivals ({pagination.total} Products)
                  </h2>
                  <p className="text-center text-gray-600 mb-6">
                    Fresh from our designers - the newest additions to our
                    premium collection
                  </p>
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
                  Showing {products.length} of {pagination.total} premium new
                  arrivals
                </div>
              </AnimatedSection>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function PremiumNewArrivalsPage() {
  return (
    <Suspense fallback={<LoadingPage loading={true} />}>
      <PremiumNewArrivalsContent />
    </Suspense>
  );
}
