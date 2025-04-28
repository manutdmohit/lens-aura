'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { ProductFormValues as Product } from '@/lib/api/validation';
import StaggeredList from '@/components/staggered-list';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <motion.div
        className="text-center py-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-xl font-medium">No products found</h2>
        <p className="text-gray-600 mt-2">
          Try adjusting your filters or check back later.
        </p>
      </motion.div>
    );
  }

  return (
    <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        // /glasses/${slug}
        <Link key={product.id} href={`/glasses/${product.slug}`}>
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="aspect-square relative overflow-hidden">
              <motion.img
                src={product.imageUrl || '/placeholder.svg'}
                alt={product.name}
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.5 }}
              />
            </div>
            <CardContent className="p-4">
              <h3 className="font-medium text-lg">{product.name}</h3>
              <p className="text-gray-600">${product.price.toFixed(2)}</p>
            </CardContent>
          </Card>
        </Link>
      ))}
    </StaggeredList>
  );
}
