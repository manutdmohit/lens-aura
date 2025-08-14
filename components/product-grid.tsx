'use client';

import type { ProductFormValues as Product } from '@/lib/api/validation';
import StaggeredList from '@/components/staggered-list';
import ProductCard from '@/components/product-card';

interface ProductGridProps {
  products: Product[];
  showWishlist?: boolean;
  showQuickActions?: boolean;
  variant?: 'default' | 'compact' | 'featured';
  showFeatures?: boolean;
  showStockStatus?: boolean;
  showCategoryBadge?: boolean;
  showGenderBadge?: boolean;
  showColorSelector?: boolean;
}

export default function ProductGrid({
  products,
  showWishlist = true,
  showQuickActions = true,
  variant = 'default',
  showFeatures = true,
  showStockStatus = true,
  showCategoryBadge = true,
  showGenderBadge = true,
  showColorSelector = true,
}: ProductGridProps) {
  const getGridCols = () => {
    switch (variant) {
      case 'compact':
        return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5';
      case 'featured':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
      default:
        return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
  };

  return (
    <StaggeredList className={`grid ${getGridCols()} gap-6`}>
      {products.map((product) => (
        <ProductCard
          key={product.id}
          product={product}
          variant={variant}
          showFeatures={showFeatures}
          showStockStatus={showStockStatus}
          showCategoryBadge={showCategoryBadge}
          showGenderBadge={showGenderBadge}
          showColorSelector={showColorSelector}
        />
      ))}
    </StaggeredList>
  );
}
