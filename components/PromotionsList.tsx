'use client';

import { useActivePromotions } from '@/hooks/usePromotions';
import PromotionCard from './PromotionCard';
import type { IPromotion } from '@/models';

interface PromotionsListProps {
  promotions?: IPromotion[];
  variant?: 'default' | 'compact' | 'featured';
  showExpiry?: boolean;
  limit?: number;
  className?: string;
  loading?: boolean;
  error?: string | null;
}

export default function PromotionsList({
  promotions: propPromotions,
  variant = 'default',
  showExpiry = true,
  limit = 5,
  className = '',
  loading: propLoading,
  error: propError,
}: PromotionsListProps) {
  // Use hook if no promotions are passed as props
  const {
    activePromotions,
    loading: hookLoading,
    error: hookError,
  } = useActivePromotions(limit);

  const promotions = propPromotions || activePromotions;
  const loading = propLoading !== undefined ? propLoading : hookLoading;
  const error = propError !== undefined ? propError : hookError;

  if (loading) {
    return (
      <div
        className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${className}`}
      >
        {[...Array(limit)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-gray-200 rounded-lg h-64"></div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-red-600 mb-2">Failed to load promotions</div>
        <div className="text-sm text-gray-500">{error}</div>
      </div>
    );
  }

  if (!promotions || promotions.length === 0) {
    return (
      <div className={`text-center py-8 ${className}`}>
        <div className="text-gray-500 mb-2">No promotions available</div>
        <div className="text-sm text-gray-400">
          Check back later for special offers
        </div>
      </div>
    );
  }

  // Determine grid layout based on variant and number of promotions
  const getGridLayout = () => {
    if (variant === 'featured') {
      return 'grid-cols-1 lg:grid-cols-2';
    }
    if (variant === 'compact') {
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';
    }
    // default variant
    return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';
  };

  return (
    <div className={`grid ${getGridLayout()} gap-6 ${className}`}>
      {promotions.map((promotion) => (
        <PromotionCard
          key={promotion._id}
          promotion={promotion}
          variant={variant}
          showExpiry={showExpiry}
        />
      ))}
    </div>
  );
}

// Specialized components for different use cases
export function FeaturedPromotions({
  limit = 2,
  className = '',
}: {
  limit?: number;
  className?: string;
}) {
  return (
    <PromotionsList variant="featured" limit={limit} className={className} />
  );
}

export function CompactPromotions({
  limit = 4,
  className = '',
}: {
  limit?: number;
  className?: string;
}) {
  return (
    <PromotionsList variant="compact" limit={limit} className={className} />
  );
}

export function DefaultPromotions({
  limit = 6,
  className = '',
}: {
  limit?: number;
  className?: string;
}) {
  return (
    <PromotionsList variant="default" limit={limit} className={className} />
  );
}

