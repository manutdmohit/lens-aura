'use client';

import { useState, useEffect } from 'react';
import {
  getPromotionalPricing,
  getBestPrice,
  getPriceForTwo,
  hasActivePromotions,
} from '@/lib/services/promotional-pricing';
import type {
  ProductPricing,
  PromotionalPricing,
} from '@/lib/services/promotional-pricing';
import { registerRefreshCallback } from '@/lib/utils/refresh-promotional-pricing';

export function usePromotionalPricing() {
  const [promotionalPricing, setPromotionalPricing] =
    useState<ProductPricing | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function fetchPromotionalPricing() {
      try {
        setLoading(true);
        setError(null);
        console.log('🔍 usePromotionalPricing - Starting to fetch...');
        const pricing = await getPromotionalPricing();
        console.log(
          '🔍 usePromotionalPricing - Promotional pricing fetched:',
          pricing
        );
        console.log('🔍 usePromotionalPricing - Setting state to:', pricing);
        setPromotionalPricing(pricing);
      } catch (err: any) {
        console.error('🔍 usePromotionalPricing - Error:', err);
        setError(err.message || 'Failed to fetch promotional pricing');
      } finally {
        setLoading(false);
      }
    }

    fetchPromotionalPricing();

    // Set up interval to refresh promotional pricing every 30 seconds
    const interval = setInterval(fetchPromotionalPricing, 30000);

    // Register with global refresh system
    const unregister = registerRefreshCallback(fetchPromotionalPricing);

    return () => {
      clearInterval(interval);
      unregister();
    };
  }, [refreshKey]);

  const getBestPriceForCategory = async (
    category: 'signature' | 'essential',
    regularPrice: number
  ) => {
    try {
      return await getBestPrice(category, regularPrice);
    } catch (err: any) {
      console.error(`Failed to get best price for ${category}:`, err);
      return {
        price: regularPrice,
        isPromotional: false,
      };
    }
  };

  const getPriceForTwoForCategory = async (
    category: 'signature' | 'essential'
  ) => {
    try {
      return await getPriceForTwo(category);
    } catch (err: any) {
      console.error(`Failed to get price for two for ${category}:`, err);
      return {
        price: 0,
        isPromotional: false,
      };
    }
  };

  const checkActivePromotions = async () => {
    try {
      return await hasActivePromotions();
    } catch (err: any) {
      console.error('Failed to check active promotions:', err);
      return false;
    }
  };

  const refreshPromotionalPricing = () => {
    console.log('🔍 Manual refresh triggered');
    setRefreshKey((prev) => prev + 1);
  };

  return {
    promotionalPricing,
    loading,
    error,
    getBestPriceForCategory,
    getPriceForTwoForCategory,
    checkActivePromotions,
    hasPromotions: promotionalPricing !== null,
    refreshPromotionalPricing,
  };
}

export function useCategoryPromotionalPricing(
  category: 'signature' | 'essential'
) {
  const { promotionalPricing, loading, error } = usePromotionalPricing();

  const categoryPricing = promotionalPricing
    ? promotionalPricing[category]
    : null;

  return {
    categoryPricing,
    loading,
    error,
    hasPromotions: categoryPricing !== null,
  };
}
