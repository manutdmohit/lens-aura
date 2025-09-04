'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  createPromotion,
  updatePromotion,
  getPromotion,
} from '@/actions/promotions';
import type { IPromotion } from '@/models';

interface PromotionFormProps {
  promotionId?: string;
  mode?: 'create' | 'edit';
}

interface FormData {
  offerName: string;
  offerValidFrom: string;
  offerValidTo: string;
  signatureOriginalPrice: string;
  signatureDiscountedPrice: string;
  signaturePriceForTwo: string;
  essentialOriginalPrice: string;
  essentialDiscountedPrice: string;
  essentialPriceForTwo: string;
  isActive: boolean;
}

export default function PromotionForm({
  promotionId,
  mode = 'create',
}: PromotionFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({
    offerName: '',
    offerValidFrom: '',
    offerValidTo: '',
    signatureOriginalPrice: '',
    signatureDiscountedPrice: '',
    signaturePriceForTwo: '',
    essentialOriginalPrice: '',
    essentialDiscountedPrice: '',
    essentialPriceForTwo: '',
    isActive: true,
  });

  useEffect(() => {
    if (mode === 'edit' && promotionId) {
      fetchPromotion();
    } else if (mode === 'create') {
      // Initialize with today's date for new promotions
      const today = getTodayDate();
      setFormData((prev) => ({
        ...prev,
        offerValidFrom: today,
        offerValidTo: today,
      }));
    }
  }, [mode, promotionId]);

  const fetchPromotion = async () => {
    try {
      setLoading(true);
      const result = await getPromotion(promotionId!);

      if (result.success && result.promotion) {
        const promotion = result.promotion;
        setFormData({
          offerName: promotion.offerName,
          offerValidFrom: formatDateForInput(promotion.offerValidFrom),
          offerValidTo: formatDateForInput(promotion.offerValidTo),
          signatureOriginalPrice:
            promotion.signature?.originalPrice?.toString() || '',
          signatureDiscountedPrice:
            promotion.signature?.discountedPrice?.toString() || '',
          signaturePriceForTwo:
            promotion.signature?.priceForTwo?.toString() || '',
          essentialOriginalPrice:
            promotion.essential?.originalPrice?.toString() || '',
          essentialDiscountedPrice:
            promotion.essential?.discountedPrice?.toString() || '',
          essentialPriceForTwo:
            promotion.essential?.priceForTwo?.toString() || '',
          isActive: promotion.isActive,
        });
      } else {
        setError(result.error || 'Failed to fetch promotion');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const formatDateForInput = (date: Date | string) => {
    const d = new Date(date);
    return d.toISOString().split('T')[0];
  };

  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // If Valid From date changes, ensure Valid To is not before it
    if (field === 'offerValidFrom' && typeof value === 'string') {
      const newValidFrom = value;
      const currentValidTo = prev.offerValidTo;

      if (currentValidTo && newValidFrom > currentValidTo) {
        setFormData((prev) => ({
          ...prev,
          offerValidTo: newValidFrom,
        }));
      }
    }
  };

  const validateForm = (): string | null => {
    if (!formData.offerName.trim()) {
      return 'Offer name is required';
    }

    if (!formData.offerValidFrom) {
      return 'Valid from date is required';
    }

    if (!formData.offerValidTo) {
      return 'Valid to date is required';
    }

    const fromDate = new Date(formData.offerValidFrom);
    const toDate = new Date(formData.offerValidTo);
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today

    if (fromDate < today) {
      return 'Valid from date cannot be in the past';
    }

    if (toDate <= fromDate) {
      return 'Valid to date must be after valid from date';
    }

    // Validate signature pricing
    const sigOriginal = parseFloat(formData.signatureOriginalPrice);
    const sigDiscounted = parseFloat(formData.signatureDiscountedPrice);
    const sigPriceForTwo = parseFloat(formData.signaturePriceForTwo);

    if (sigOriginal <= 0 || sigDiscounted <= 0 || sigPriceForTwo <= 0) {
      return 'All signature prices must be greater than 0';
    }

    if (sigDiscounted > sigOriginal) {
      return 'Signature discounted price cannot be higher than original price';
    }

    // Validate essential pricing
    const essOriginal = parseFloat(formData.essentialOriginalPrice);
    const essDiscounted = parseFloat(formData.essentialDiscountedPrice);
    const essPriceForTwo = parseFloat(formData.essentialPriceForTwo);

    if (essOriginal <= 0 || essDiscounted <= 0 || essPriceForTwo <= 0) {
      return 'All essential prices must be greater than 0';
    }

    if (essDiscounted > essOriginal) {
      return 'Essential discounted price cannot be higher than original price';
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const submissionData = {
        offerName: formData.offerName.trim(),
        offerValidFrom: formData.offerValidFrom,
        offerValidTo: formData.offerValidTo,
        signatureOriginalPrice: parseFloat(formData.signatureOriginalPrice),
        signatureDiscountedPrice: parseFloat(formData.signatureDiscountedPrice),
        signaturePriceForTwo: parseFloat(formData.signaturePriceForTwo),
        essentialOriginalPrice: parseFloat(formData.essentialOriginalPrice),
        essentialDiscountedPrice: parseFloat(formData.essentialDiscountedPrice),
        essentialPriceForTwo: parseFloat(formData.essentialPriceForTwo),
        isActive: formData.isActive,
      };

      let result;
      if (mode === 'edit' && promotionId) {
        result = await updatePromotion(promotionId, submissionData);
      } else {
        result = await createPromotion(submissionData);
      }

      if (result.success) {
        router.push('/admin/promotions');
      } else {
        setError(result.error || 'Failed to save promotion');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (loading && mode === 'edit') {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="space-y-4">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-12 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            {mode === 'create' ? 'Create New Promotion' : 'Edit Promotion'}
          </h1>
          <p className="text-gray-600 mt-2">
            {mode === 'create'
              ? 'Set up a new promotional offer for your customers'
              : 'Update the promotion details'}
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-lg shadow p-6"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          {/* Basic Information */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Basic Information
            </h2>

            <div className="grid grid-cols-1 gap-4">
              <div>
                <label
                  htmlFor="offerName"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Offer Name *
                </label>
                <input
                  type="text"
                  id="offerName"
                  value={formData.offerName}
                  onChange={(e) =>
                    handleInputChange('offerName', e.target.value)
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="e.g., Summer Sale 2025"
                  maxLength={100}
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="offerValidFrom"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Valid From *
                  </label>
                  <input
                    type="date"
                    id="offerValidFrom"
                    value={formData.offerValidFrom}
                    onChange={(e) =>
                      handleInputChange('offerValidFrom', e.target.value)
                    }
                    min={getTodayDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Promotion start date (cannot be in the past)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="offerValidTo"
                    className="block text-sm font-medium text-gray-700 mb-2"
                  >
                    Valid To *
                  </label>
                  <input
                    type="date"
                    id="offerValidTo"
                    value={formData.offerValidTo}
                    onChange={(e) =>
                      handleInputChange('offerValidTo', e.target.value)
                    }
                    min={formData.offerValidFrom || getTodayDate()}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    Promotion end date (must be after start date)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Signature Collection Pricing */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Signature Collection Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="sigOriginalPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Original Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="sigOriginalPrice"
                    value={formData.signatureOriginalPrice}
                    onChange={(e) =>
                      handleInputChange(
                        'signatureOriginalPrice',
                        e.target.value
                      )
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sigDiscountedPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Discounted Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="sigDiscountedPrice"
                    value={formData.signatureDiscountedPrice}
                    onChange={(e) =>
                      handleInputChange(
                        'signatureDiscountedPrice',
                        e.target.value
                      )
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="sigPriceForTwo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price for Two *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="sigPriceForTwo"
                    value={formData.signaturePriceForTwo}
                    onChange={(e) =>
                      handleInputChange('signaturePriceForTwo', e.target.value)
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Essential Collection Pricing */}
          <div className="mb-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Essential Collection Pricing
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label
                  htmlFor="essOriginalPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Original Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="essOriginalPrice"
                    value={formData.essentialOriginalPrice}
                    onChange={(e) =>
                      handleInputChange(
                        'essentialOriginalPrice',
                        e.target.value
                      )
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="essDiscountedPrice"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Discounted Price *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="essDiscountedPrice"
                    value={formData.essentialDiscountedPrice}
                    onChange={(e) =>
                      handleInputChange(
                        'essentialDiscountedPrice',
                        e.target.value
                      )
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="essPriceForTwo"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Price for Two *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-gray-500">$</span>
                  <input
                    type="number"
                    id="essPriceForTwo"
                    value={formData.essentialPriceForTwo}
                    onChange={(e) =>
                      handleInputChange('essentialPriceForTwo', e.target.value)
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="mb-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                checked={formData.isActive}
                onChange={(e) =>
                  handleInputChange('isActive', e.target.checked)
                }
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isActive"
                className="ml-2 block text-sm text-gray-900"
              >
                Active promotion
              </label>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              Inactive promotions won't be displayed to customers
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => router.push('/admin/promotions')}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading
                ? 'Saving...'
                : mode === 'create'
                ? 'Create Promotion'
                : 'Update Promotion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
