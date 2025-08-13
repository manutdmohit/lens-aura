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
import { Gem, ArrowLeft } from 'lucide-react';
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

function WomensSignatureSunglassesContent() {
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
          `/api/sunglasses?category=signature&gender=women&page=${currentPage}&limit=${limitRef.current}`
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
        console.error("Error fetching women's signature sunglasses:", error);
        toast.error(
          `${error.message || "Failed to fetch women's signature sunglasses"}`
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
    router.push(`/sunglasses/signature/womens?${params.toString()}`);
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
                  <Gem className="w-8 h-8 text-white" />
                </div>
                <h1
                  className={`${playfair.className} text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-600 to-orange-600`}
                >
                  Women's Signature Sunglasses
                </h1>
              </div>
              <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto mb-8 text-center leading-relaxed">
                Elegant luxury sunglasses designed for the sophisticated woman.
                Signature materials, exceptional style, and uncompromising
                quality.
              </p>
              <div className="flex flex-wrap justify-center gap-2 mb-8">
                <Badge
                  variant="secondary"
                  className="bg-amber-100 text-amber-800 border-amber-200"
                >
                  Signature Materials
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
                  Women's Collection
                </Badge>
              </div>
              <div className="flex justify-center">
                <Button
                  onClick={() => router.push('/sunglasses/signature')}
                  variant="outline"
                  className="border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <ArrowLeft className="mr-2 w-4 h-4" />
                  Back to Signature Collection
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
                  No women's signature sunglasses found. Check back soon for our
                  latest collection!
                </p>
                <Button
                  onClick={() => router.push('/sunglasses/signature')}
                  className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                >
                  Browse Signature Collection
                </Button>
              </div>
            )}

            {!loading && hasProducts && (
              <AnimatedSection direction="up">
                <div className="mb-8">
                  <h2
                    className={`${playfair.className} text-3xl font-bold mb-4 text-center`}
                  >
                    Women's Signature Collection ({pagination.total} Products)
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
                  Showing {products.length} of {pagination.total} women's
                  signature sunglasses
                </div>
              </AnimatedSection>
            )}
          </div>
        </section>
      </div>
    </main>
  );
}

export default function WomensSignatureSunglassesPage() {
  return (
    <Suspense fallback={<LoadingPage loading={true} />}>
      <WomensSignatureSunglassesContent />
    </Suspense>
  );
}
