'use client';

import { useEffect, useState } from 'react';
import ProductGrid from '@/components/product-grid';
import { ProductFormValues as Product } from '@/lib/api/validation';
import { toast } from 'sonner';

export default function GlassesPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);

        const response = await fetch('/api/glasses');
        const data = await response.json();
        setProducts(data);
      } catch (error: any) {
        console.error('Error fetching products:', error);
        toast.error(`{error.message} || "Failed to fetch products"`);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <main className="flex flex-col min-h-screen">
      <div className="flex-grow max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Glasses</h1>
          {/* Calculate lowest price for glasses */}
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Our prescription glasses start from just $95, including standard
            single-vision lenses. Choose from our wide range of styles and
            colors.
          </p>
        </div>

        <ProductGrid products={products} />
      </div>
    </main>
  );
}
