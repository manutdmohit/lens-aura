'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import type { IPromotion } from '@/models';

interface PromotionCardProps {
  promotion: IPromotion;
  variant?: 'default' | 'compact' | 'featured';
  showExpiry?: boolean;
  className?: string;
}

export default function PromotionCard({
  promotion,
  variant = 'default',
  showExpiry = true,
  className = '',
}: PromotionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getDaysRemaining = () => {
    const now = new Date();
    const timeDiff = new Date(promotion.offerValidTo).getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysRemaining);
  };

  const daysRemaining = getDaysRemaining();
  const isExpired = daysRemaining === 0;

  if (variant === 'compact') {
    return (
      <div
        className={`bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4 ${className}`}
      >
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-blue-900 text-sm">
            {promotion.offerName}
          </h3>
          {showExpiry && (
            <span
              className={`text-xs px-2 py-1 rounded-full ${
                isExpired
                  ? 'bg-red-100 text-red-700'
                  : daysRemaining <= 3
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {isExpired ? 'Expired' : `${daysRemaining}d left`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs">
          <div>
            <p className="text-gray-600">Signature</p>
            <p className="font-medium text-blue-900">
              {formatPrice(promotion.signature.discountedPrice)}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Essential</p>
            <p className="font-medium text-blue-900">
              {formatPrice(promotion.essential.discountedPrice)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'featured') {
    return (
      <div
        className={`bg-gradient-to-br from-purple-600 via-blue-600 to-indigo-700 text-white rounded-xl p-6 shadow-lg ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">{promotion.offerName}</h3>
          {showExpiry && (
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                isExpired
                  ? 'bg-red-500/20 text-red-100'
                  : daysRemaining <= 3
                  ? 'bg-orange-500/20 text-orange-100'
                  : 'bg-green-500/20 text-green-100'
              }`}
            >
              {isExpired ? 'Expired' : `${daysRemaining} days left`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-6 mb-4">
          <div className="text-center">
            <p className="text-purple-200 text-sm mb-1">Signature Collection</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {formatPrice(promotion.signature.discountedPrice)}
              </p>
              <p className="text-purple-200 line-through text-sm">
                {formatPrice(promotion.signature.originalPrice)}
              </p>
              <p className="text-purple-200 text-xs">
                Buy 2 for {formatPrice(promotion.signature.priceForTwo)}
              </p>
            </div>
          </div>

          <div className="text-center">
            <p className="text-purple-200 text-sm mb-1">Essential Collection</p>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {formatPrice(promotion.essential.discountedPrice)}
              </p>
              <p className="text-purple-200 line-through text-sm">
                {formatPrice(promotion.essential.originalPrice)}
              </p>
              <p className="text-purple-200 text-xs">
                Buy 2 for {formatPrice(promotion.essential.priceForTwo)}
              </p>
            </div>
          </div>
        </div>

        <div className="text-center text-purple-200 text-sm">
          <p>
            Valid from{' '}
            {format(new Date(promotion.offerValidFrom), 'MMM dd, yyyy')}
          </p>
          <p>to {format(new Date(promotion.offerValidTo), 'MMM dd, yyyy')}</p>
        </div>
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={`bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${className}`}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {promotion.offerName}
          </h3>
          {showExpiry && (
            <span
              className={`text-sm px-3 py-1 rounded-full ${
                isExpired
                  ? 'bg-red-100 text-red-700'
                  : daysRemaining <= 3
                  ? 'bg-orange-100 text-orange-700'
                  : 'bg-green-100 text-green-700'
              }`}
            >
              {isExpired ? 'Expired' : `${daysRemaining} days left`}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div>
            <h4 className="font-medium text-gray-900 mb-3 text-center">
              Signature Collection
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Original Price:</span>
                <span className="line-through text-gray-500">
                  {formatPrice(promotion.signature.originalPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discounted Price:</span>
                <span className="font-semibold text-green-600 text-lg">
                  {formatPrice(promotion.signature.discountedPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Buy 2 for:</span>
                <span className="font-medium text-blue-600">
                  {formatPrice(promotion.signature.priceForTwo)}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-3 text-center">
              Essential Collection
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Original Price:</span>
                <span className="line-through text-gray-500">
                  {formatPrice(promotion.essential.originalPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Discounted Price:</span>
                <span className="font-semibold text-green-600 text-lg">
                  {formatPrice(promotion.essential.discountedPrice)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Buy 2 for:</span>
                <span className="font-medium text-blue-600">
                  {formatPrice(promotion.essential.priceForTwo)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              Valid from:{' '}
              {format(new Date(promotion.offerValidFrom), 'MMM dd, yyyy')}
            </span>
            <span>
              Valid to:{' '}
              {format(new Date(promotion.offerValidTo), 'MMM dd, yyyy')}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

