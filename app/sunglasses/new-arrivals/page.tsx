'use client';

import { useEffect, useState, useRef, Suspense } from 'react';
import ProductGrid from '@/components/product-grid';
import LoadingPage from '@/components/loading';
import { Pagination } from '@/components/ui/pagination';

export default function MensGlassesNewArrivalsPage() {
  const [products, setProducts] = useState<
    Array<{
      id: string;
      name: string;
      imageUrl: string;
      price: number;
      slug?: string;
    }>
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const response = await fetch('/api/sunglasses/new-arrivals');

      if (response.ok) {
        const data = await response.json();
        setProducts(data.products || []);
      } else {
        setProducts([]);
      }
      setLoading(false);
    };
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasProducts = Array.isArray(products) && products.length > 0;

  return (
    <main className="flex flex-col min-h-screen -mt-[64px]">
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">New Arrivals - Sunglasses</h1>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Discover our latest collection of sunglasses, featuring the latest
            styles and trends.
          </p>
        </div>
        {loading && <LoadingPage loading={loading} />}
        {!loading && !hasProducts && (
          <div className="text-center">
            <p className="text-lg text-gray-600">
              No sunglasses found. Try a different search.
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
                productType: 'glasses',
                status: 'active',
                colors: [],
                inStock: true,
                thumbnail: p.imageUrl,
                images: p.imageUrl ? [p.imageUrl] : [],
              }))}
            />
          </>
        )}
      </div>
    </main>
  );
}
