'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActivePromotions, getPromotions } from '@/actions/promotions';
import type { IPromotion } from '@/models';

interface UsePromotionsOptions {
  limit?: number;
  autoFetch?: boolean;
}

interface UsePromotionsReturn {
  promotions: IPromotion[];
  activePromotions: IPromotion[];
  loading: boolean;
  error: string | null;
  fetchPromotions: (options?: any) => Promise<void>;
  fetchActivePromotions: (limit?: number) => Promise<void>;
  refresh: () => void;
}

export function usePromotions(
  options: UsePromotionsOptions = {}
): UsePromotionsReturn {
  const { limit = 5, autoFetch = true } = options;

  const [promotions, setPromotions] = useState<IPromotion[]>([]);
  const [activePromotions, setActivePromotions] = useState<IPromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPromotions = useCallback(async (fetchOptions?: any) => {
    try {
      setLoading(true);
      setError(null);

      const result = await getPromotions(fetchOptions);

      if (result.success) {
        setPromotions(result.promotions || []);
      } else {
        setError(result.error || 'Failed to fetch promotions');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred while fetching promotions');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchActivePromotions = useCallback(
    async (promotionLimit?: number) => {
      try {
        setLoading(true);
        setError(null);

        const result = await getActivePromotions(promotionLimit || limit);

        if (result.success) {
          setActivePromotions(result.promotions || []);
        } else {
          setError(result.error || 'Failed to fetch active promotions');
        }
      } catch (err: any) {
        setError(
          err.message || 'An error occurred while fetching active promotions'
        );
      } finally {
        setLoading(false);
      }
    },
    [limit]
  );

  const refresh = useCallback(() => {
    if (autoFetch) {
      fetchActivePromotions();
    }
  }, [autoFetch, fetchActivePromotions]);

  useEffect(() => {
    if (autoFetch) {
      fetchActivePromotions();
    }
  }, [autoFetch, fetchActivePromotions]);

  return {
    promotions,
    activePromotions,
    loading,
    error,
    fetchPromotions,
    fetchActivePromotions,
    refresh,
  };
}

// Hook specifically for active promotions
export function useActivePromotions(limit: number = 5) {
  const [activePromotions, setActivePromotions] = useState<IPromotion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchActivePromotions = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await getActivePromotions(limit);

      if (result.success) {
        setActivePromotions(result.promotions || []);
      } else {
        setError(result.error || 'Failed to fetch active promotions');
      }
    } catch (err: any) {
      setError(
        err.message || 'An error occurred while fetching active promotions'
      );
    } finally {
      setLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchActivePromotions();
  }, [fetchActivePromotions]);

  return {
    activePromotions,
    loading,
    error,
    refresh: fetchActivePromotions,
  };
}

