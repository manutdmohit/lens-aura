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
import { Shield, ArrowLeft } from 'lucide-react';
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

function MensEssentialsSunglassesContent() {
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

        const response = await fetch(
          `/api/sunglasses?category=essentials&gender=men&page=${currentPage}&limit=${limitRef.current}`
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
        console.error("Error fetching men's essentials sunglasses:", error);
        toast.error(
          `${error.message || "Failed to fetch men's essentials sunglasses"}`
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
    router.push(`/sunglasses/essentials/mens?${params.toString()}`);
  };

  const hasProducts = Array.isArray(products) && products.length > 0;

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow">
        {/* Hero Section */}
        <section className="bg-gradient-to-r from-blue-50 via-indigo-50 to-blue-50 py-20 px-4">
          <div className="max-w-7xl mx-auto">
            <AnimatedSection direction="up">
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <h1
                  className={`${playfair.className} text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600`}
                >
                  Men's Essentials Sunglasses
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 text-center leading-relaxed">
                Quality everyday sunglasses designed for the active man.
                Durable, comfortable, and affordable without compromising on
                style.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
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
                  UV Protection
                </Badge>
                <Badge
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 border-blue-200"
                >
                  Men's Collection
                </Badge>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => router.push('/sunglasses/essentials')}
                  variant="outline"
                  className="border-blue-300 text-blue-700 hover:bg-blue-50"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Essentials Collection
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
                  No men's essentials sunglasses found. Check back soon for our
                  latest collection!
                </p>
                <Button
                  onClick={() => router.push('/sunglasses/essentials')}
                  className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
                >
                  Browse Essentials Collection
                </Button>
              </div>
            )}

            {!loading && hasProducts && (
              <AnimatedSection direction="up">
                <div className="mb-8">
                  <h2
                    className={`${playfair.className} text-3xl font-bold mb-4 text-center`}
                  >
                    Men's Essentials Collection ({pagination.total} Products)
                  </h2>
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
                  Showing {products.length} of {pagination.total} men's
                  essentials sunglasses
                </div>
              </AnimatedSection>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function MensEssentialsSunglassesPage() {
  return (
    <Suspense fallback={<LoadingPage loading={true} />}>
      <MensEssentialsSunglassesContent />
    </Suspense>
  );
}
