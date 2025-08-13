'use client';

import { useEffect, useState, useRef } from 'react';
import ProductGrid from '@/components/product-grid';
import LoadingPage from '@/components/loading';
import { Pagination } from '@/components/ui/pagination';

export default function MensSunglassesPage() {
  const [products, setProducts] = useState<
    Array<{
      id: string;
      name: string;
      thumbnail: string;
      images: string[];
      price: number;
      slug?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 12,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const limitRef = useRef(12);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const response = await fetch(
        `/api/sunglasses?gender=men&page=${pagination.page}&limit=${limitRef.current}`
      );
      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
        setPagination(data.pagination || pagination);
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page]);

  const handlePageChange = (page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  };

  const hasProducts = Array.isArray(products) && products.length > 0;

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Men&apos;s Sunglasses</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Explore our stylish and protective men&apos;s sunglasses, perfect
            for every adventure and sunny day.
          </p>
        </div>
        {loading && <LoadingPage loading={loading} />}
        {!loading && !hasProducts && (
          <div className="text-center">
            <p className="text-lg text-gray-600">
              No men&apos;s sunglasses found. Try a different search.
            </p>
          </div>
        )}
        {!loading && hasProducts && (
          <>
            <ProductGrid
              products={products.map((p) => ({
                ...p,
                description: '',
                stockQuantity: 0,
                productType: 'sunglasses',
                status: 'active',
                colors: [],
                inStock: true,
                thumbnail: p.thumbnail,
                frameColorVariants: [],
                frameColor: [],
              }))}
            />
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
