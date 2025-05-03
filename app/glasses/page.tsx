'use client';

import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ProductGrid from '@/components/product-grid';
import { ProductFormValues as Product } from '@/lib/api/validation';
import { toast } from 'sonner';
import LoadingPage from '@/components/loading';
import { Pagination } from '@/components/ui/pagination';
import Link from 'next/link';

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

export default function GlassesPage() {
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
        setPriceRange(data.glasses);
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

        const response = await fetch(`/api/glasses?page=${currentPage}&limit=${limitRef.current}`);
        const data = await response.json();
        
        if (data && data.products) {
          setProducts(data.products);
          setPagination(data.pagination || {
            total: 0,
            page: 1,
            limit: 12,
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

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`/glasses?${params.toString()}`);
  };

  // Check if products array is valid
  const hasProducts = Array.isArray(products) && products.length > 0;

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Glasses</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            {priceRange?.lowest ? (
              <>
                Our prescription glasses start from just ${priceRange.lowest.price.toFixed(2)}, including standard
                single-vision lenses. Choose from our wide range of styles and
                colors.{' '}
                {priceRange.lowest && (
                  <Link 
                    href={`/glasses/${priceRange.lowest.slug}`}
                    className="text-indigo-600 hover:underline"
                  >
                    View our most affordable option
                  </Link>
                )}
              </>
            ) : (
              <>
                Our prescription glasses start from just $95, including standard
                single-vision lenses. Choose from our wide range of styles and
                colors.
              </>
            )}
          </p>
        </div>

        {loading && <LoadingPage loading={loading} />}
        
        {!loading && !hasProducts && (
          <div className="text-center">
            <p className="text-lg text-gray-600">
              No products found. Try a different search.
            </p>
          </div>
        )}

        {!loading && hasProducts && (
          <>
            <ProductGrid products={products} />
            
            <div className="mt-8">
              <Pagination 
                currentPage={pagination.page} 
                totalPages={pagination.totalPages} 
                onPageChange={handlePageChange} 
              />
            </div>
            
            <div className="text-center text-sm text-gray-500 mt-4">
              Showing {products.length} of {pagination.total} products
            </div>
          </>
        )}
      </div>
    </main>
  );
}
