'use client';

import { useActivePromotions } from '@/hooks/usePromotions';
import PromotionCard from './PromotionCard';

interface PromotionBannerProps {
  className?: string;
  limit?: number;
}

export default function PromotionBanner({
  className = '',
  limit = 1,
}: PromotionBannerProps) {
  const { activePromotions, loading, error } = useActivePromotions(limit);

  if (loading) {
    return (
      <div
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-6 bg-blue-200 rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-blue-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error || !activePromotions || activePromotions.length === 0) {
    return null; // Don't show anything if there are no promotions
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {activePromotions.map((promotion) => (
        <PromotionCard
          key={promotion._id}
          promotion={promotion}
          variant="featured"
          showExpiry={true}
        />
      ))}
    </div>
  );
}

// Compact version for smaller spaces
export function CompactPromotionBanner({
  className = '',
  limit = 1,
}: PromotionBannerProps) {
  const { activePromotions, loading, error } = useActivePromotions(limit);

  if (loading) {
    return (
      <div
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg ${className}`}
      >
        <div className="animate-pulse">
          <div className="h-4 bg-blue-200 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-blue-200 rounded w-1/3"></div>
        </div>
      </div>
    );
  }

  if (error || !activePromotions || activePromotions.length === 0) {
    return null;
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {activePromotions.map((promotion) => (
        <PromotionCard
          key={promotion._id}
          promotion={promotion}
          variant="compact"
          showExpiry={true}
        />
      ))}
    </div>
  );
}

