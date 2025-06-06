'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import type { ProductFormValues as Product } from '@/lib/api/validation';
import StaggeredList from '@/components/staggered-list';
import Image from 'next/image';

interface ProductGridProps {
  products: Product[];
}

export default function ProductGrid({ products }: ProductGridProps) {
  return (
    <StaggeredList className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Link key={product.id} href={`/${product.productType === 'accessory' ? 'accessories' : product.productType}/${product.slug}`}>
          <Card className="overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="aspect-square relative overflow-hidden">
              <motion.div whileHover={{ scale: 1.1 }} transition={{ duration: 0.5 }}>
                <Image
                  src={product.imageUrl || '/placeholder.svg'}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  width={500}
                  height={500}
                  priority
                />
              </motion.div>
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
