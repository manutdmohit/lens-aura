'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  getPromotions,
  deletePromotion,
  togglePromotionStatus,
} from '@/actions/promotions';
import { format } from 'date-fns';
import type { IPromotion } from '@/models';
import { forceRefreshPromotionalPricing } from '@/lib/utils/refresh-promotional-pricing';

// Interface for the promotion data returned by the server actions
interface PromotionData {
  _id: string;
  offerName: string;
  offerValidFrom: string;
  offerValidTo: string;
  signatureOriginalPrice: number;
  signatureDiscountedPrice: number;
  signaturePriceForTwo: number;
  essentialOriginalPrice: number;
  essentialDiscountedPrice: number;
  essentialPriceForTwo: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
import ProtectedRoute from '@/components/admin/protected-route';
import AdminLayout from '@/components/admin/admin-layout';

export default function AdminPromotionsPage() {
  const router = useRouter();
  const [promotions, setPromotions] = useState<PromotionData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | undefined>(
    undefined
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchPromotions();
  }, [currentPage, searchTerm, filterActive]);

  const fetchPromotions = async () => {
    try {
      setLoading(true);
      const result = await getPromotions({
        search: searchTerm || undefined,
        isActive: filterActive,
        page: currentPage,
        limit: 10,
      });

      if (result.success) {
        setPromotions(result.promotions || []);
        setTotalPages(result.pagination?.pages || 1);
      } else {
        setError(result.error || 'Failed to fetch promotions');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this promotion?')) {
      return;
    }

    try {
      const result = await deletePromotion(id);
      if (result.success) {
        fetchPromotions();
      } else {
        alert(result.error || 'Failed to delete promotion');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    }
  };

  const handleToggleStatus = async (id: string) => {
    try {
      const result = await togglePromotionStatus(id);
      if (result.success) {
        fetchPromotions();
        // Automatically refresh promotional pricing when status changes
        forceRefreshPromotionalPricing();
        alert('Promotion status updated and pricing refreshed!');
      } else {
        alert(result.error || 'Failed to toggle promotion status');
      }
    } catch (err: any) {
      alert(err.message || 'An error occurred');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const getDaysRemaining = (validTo: Date) => {
    const now = new Date();
    const timeDiff = new Date(validTo).getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return Math.max(0, daysRemaining);
  };

  if (loading) {
    return (
      <ProtectedRoute resource="promotions" action="read">
        <AdminLayout>
          <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
                <div className="h-10 bg-gray-200 rounded w-1/3 mb-6"></div>
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="h-16 bg-gray-200 rounded"></div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute resource="promotions" action="read">
      <AdminLayout>
        <div className="min-h-screen bg-gray-50 p-6">
          <div className="max-w-7xl mx-auto">
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                  Promotions Management
                </h1>
                <div className="flex space-x-3">
                  <button
                    onClick={() => router.push('/admin/promotions/new')}
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Create New Promotion
                  </button>
                  <button
                    onClick={() => {
                      forceRefreshPromotionalPricing();
                      alert(
                        'Promotional pricing refreshed! Check your product pages.'
                      );
                    }}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                    title="Refresh promotional pricing across all product pages"
                  >
                    🔄 Refresh Pricing
                  </button>
                </div>
              </div>

              {/* Filters and Search */}
              <div className="bg-white rounded-lg shadow p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search promotions..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <select
                    value={
                      filterActive === undefined ? '' : filterActive.toString()
                    }
                    onChange={(e) =>
                      setFilterActive(
                        e.target.value === ''
                          ? undefined
                          : e.target.value === 'true'
                      )
                    }
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
                  {error}
                </div>
              )}

              {/* Promotions Table */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Offer Name
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Signature Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Essential Price
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Valid Period
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {promotions.map((promotion) => {
                        const daysRemaining = getDaysRemaining(
                          new Date(promotion.offerValidTo)
                        );
                        const isExpired = daysRemaining === 0;

                        return (
                          <tr key={promotion._id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {promotion.offerName}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {isExpired
                                    ? 'Expired'
                                    : `${daysRemaining} days left`}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="line-through text-gray-500">
                                  {formatPrice(
                                    promotion.signatureOriginalPrice || 0
                                  )}
                                </div>
                                <div className="font-medium text-green-600">
                                  {formatPrice(
                                    promotion.signatureDiscountedPrice || 0
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <div className="line-through text-gray-500">
                                  {formatPrice(
                                    promotion.essentialOriginalPrice || 0
                                  )}
                                </div>
                                <div className="font-medium text-green-600">
                                  {formatPrice(
                                    promotion.essentialDiscountedPrice || 0
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              <div>
                                <div>
                                  From:{' '}
                                  {format(
                                    new Date(promotion.offerValidFrom),
                                    'MMM dd, yyyy'
                                  )}
                                </div>
                                <div>
                                  To:{' '}
                                  {format(
                                    new Date(promotion.offerValidTo),
                                    'MMM dd, yyyy'
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  promotion.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {promotion.isActive ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/admin/promotions/${promotion._id}/edit`
                                    )
                                  }
                                  className="text-blue-600 hover:text-blue-900"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={() =>
                                    handleToggleStatus(promotion._id)
                                  }
                                  className={`${
                                    promotion.isActive
                                      ? 'text-orange-600 hover:text-orange-900'
                                      : 'text-green-600 hover:text-green-900'
                                  }`}
                                >
                                  {promotion.isActive
                                    ? 'Deactivate'
                                    : 'Activate'}
                                </button>
                                <button
                                  onClick={() => handleDelete(promotion._id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                      <button
                        onClick={() =>
                          setCurrentPage(Math.max(1, currentPage - 1))
                        }
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Previous
                      </button>
                      <button
                        onClick={() =>
                          setCurrentPage(Math.min(totalPages, currentPage + 1))
                        }
                        disabled={currentPage === totalPages}
                        className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                      >
                        Next
                      </button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm text-gray-700">
                          Showing page{' '}
                          <span className="font-medium">{currentPage}</span> of{' '}
                          <span className="font-medium">{totalPages}</span>
                        </p>
                      </div>
                      <div>
                        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                          <button
                            onClick={() =>
                              setCurrentPage(Math.max(1, currentPage - 1))
                            }
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() =>
                              setCurrentPage(
                                Math.min(totalPages, currentPage + 1)
                              )
                            }
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                          >
                            Next
                          </button>
                        </nav>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
