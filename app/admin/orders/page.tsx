'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Search,
  MoreHorizontal,
  Download,
  Filter,
  Eye,
  FileText,
  Calendar,
  CreditCard,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import AdminLayout from '@/components/admin/admin-layout';
import ProtectedRoute from '@/components/admin/protected-route';
import Link from 'next/link';

interface Order {
  id: string;
  customer: string;
  email: string;
  date: string;
  status: string;
  payment: string;
  total: number;
  deliveryStatus: string;
}

interface PaginationData {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export default function AdminOrdersPage() {
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState<PaginationData>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  const pageSizeOptions = [10, 25, 50, 100];

  const handlePageSizeChange = (newSize: string) => {
    setPagination((prev) => ({
      ...prev,
      limit: parseInt(newSize),
      page: 1, // Reset to first page when changing page size
    }));
  };

  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(
      1,
      pagination.page - Math.floor(maxVisiblePages / 2)
    );
    let endPage = Math.min(pagination.pages, startPage + maxVisiblePages - 1);

    // Adjust start page if we're near the end
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Always include first and last page
    if (startPage > 1) {
      pageNumbers.push(1);
      if (startPage > 2) pageNumbers.push('...');
    }

    // Add visible page numbers
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    // Add last page number if needed
    if (endPage < pagination.pages) {
      if (endPage < pagination.pages - 1) pageNumbers.push('...');
      pageNumbers.push(pagination.pages);
    }

    return pageNumbers;
  };

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        search: searchQuery,
        status: statusFilter,
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      const response = await fetch(`/api/admin/orders?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch orders');
      }

      setOrders(data.orders);
      setPagination(data.pagination);
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({
        title: 'Error',
        description:
          error instanceof Error ? error.message : 'Failed to fetch orders',
        variant: 'destructive',
      });
      setOrders([]);
      setPagination((prev) => ({ ...prev, total: 0, pages: 0 }));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchOrders();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, statusFilter, pagination.page]);

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'failed':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getDeliveryStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'ORDER_PLACED':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ORDER_CONFIRMED':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'PROCESSING':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'DISPATCHED':
      case 'IN_TRANSIT':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OUT_FOR_DELIVERY':
        return 'bg-indigo-100 text-indigo-800 border-indigo-200';
      case 'DELIVERED':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'CANCELLED':
      case 'RETURNED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'DELAYED':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPaymentIcon = (payment: string) => {
    switch (payment) {
      case 'credit_card':
        return <CreditCard className="h-4 w-4 text-gray-500" />;
      case 'paypal':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />;
    }
  };

  const downloadInvoice = async (orderId: string) => {
    try {
      console.log('Starting invoice download for order:', orderId);

      // First, fetch the order details to get the complete order data
      const orderResponse = await fetch(`/api/admin/orders/${orderId}`);
      const orderData = await orderResponse.json();

      if (!orderResponse.ok) {
        throw new Error(orderData.error || 'Failed to fetch order details');
      }

      const order = orderData.order;

      // Prepare order details for invoice download
      const orderDetails = {
        id: order.id,
        orderNumber: order.id,
        customerEmail: order.customer.email,
        items: order.items.map((item: any) => ({
          productId: item.name, // Using name as productId since we don't have separate product object
          name: item.name,
          price: item.price * 100, // Convert to cents
          quantity: item.quantity,
          color: item.color || 'N/A',
          // Add default values for promotional pricing fields
          productType: 'sunglasses', // Default assumption
          category: 'essentials', // Default assumption
          originalPrice: item.price * 100, // Use current price as original price
        })),
        totalAmount: order.totals.total * 100, // Convert to cents
        paymentStatus: order.payment.status,
        createdAt: order.dates.created,
        amount_total: order.totals.total * 100, // Convert to cents
        customer_details: {
          name: `${order.customer.firstName} ${order.customer.lastName}`,
          email: order.customer.email,
          address: {
            line1: order.shipping.street || '',
            line2: '',
            city: order.shipping.city || '',
            state: order.shipping.state || '',
            postal_code: order.shipping.postalCode || '',
            country: order.shipping.country || '',
          },
        },
      };

      const requestBody = {
        orderDetails,
        sessionId: null, // Not needed for admin
      };

      console.log('Sending admin request to API:', requestBody);

      const response = await fetch('/api/invoice/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      console.log('Admin response status:', response.status);

      if (!response.ok) {
        const errorData = await response
          .json()
          .catch(() => ({ error: 'Unknown error' }));
        console.error('Admin API error response:', errorData);
        throw new Error(
          errorData.error || `HTTP ${response.status}: ${response.statusText}`
        );
      }

      const pdfBuffer = await response.arrayBuffer();
      console.log('Admin received PDF buffer length:', pdfBuffer.byteLength);

      // Create a blob with the PDF content
      const blob = new Blob([pdfBuffer], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${orderId}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Admin invoice downloaded successfully');
      toast({
        title: 'Success',
        description: 'Invoice downloaded successfully',
      });
    } catch (error) {
      console.error('Error downloading admin invoice:', error);
      toast({
        title: 'Error',
        description: `Failed to download invoice: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
        variant: 'destructive',
      });
    }
  };

  return (
    <ProtectedRoute resource="orders" action="read">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Orders</h1>
              <p className="text-gray-500">Manage customer orders</p>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>
                    A list of all customer orders
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search orders..."
                      className="pl-10 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="paid">Paid</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="flex items-center animate-pulse">
                      <div className="ml-4 space-y-2 flex-1">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16"></div>
                      <div className="h-8 w-8 bg-gray-200 rounded-md ml-4"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="flex items-center py-3 border-b font-medium text-sm text-gray-500">
                    <div className="flex-1">Order ID</div>
                    <div className="flex-1">Customer</div>
                    <div className="flex-1">Date</div>
                    <div className="flex-1">Status</div>
                    <div className="flex-1">Delivery</div>
                    <div className="flex-1">Payment</div>
                    <div className="flex-1 text-right">Total</div>
                    <div className="w-10"></div>
                  </div>
                  {orders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No orders found matching your search.
                    </div>
                  ) : (
                    orders.map((order, index) => (
                      <motion.div
                        key={order.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center py-3 border-b last:border-0"
                      >
                        <div className="flex-1 font-medium">{order.id}</div>
                        <div className="flex-1">
                          <div>{order.customer}</div>
                          <div className="text-sm text-gray-500">
                            {order.email}
                          </div>
                        </div>
                        <div className="flex-1 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                        <div className="flex-1">
                          <Badge
                            variant="outline"
                            className={getStatusBadgeColor(order.status)}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex-1">
                          <Badge
                            variant="outline"
                            className={getDeliveryStatusBadgeColor(
                              order.deliveryStatus
                            )}
                          >
                            {order.deliveryStatus
                              .split('_')
                              .map(
                                (word) =>
                                  word.charAt(0) + word.slice(1).toLowerCase()
                              )
                              .join(' ')}
                          </Badge>
                        </div>
                        <div className="flex-1 flex items-center">
                          {getPaymentIcon(order.payment)}
                          <span className="ml-2 capitalize">
                            {order.payment.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="flex-1 text-right font-medium">
                          ${order.total.toFixed(2)}
                        </div>
                        <div className="w-10">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuSeparator />
                              <Link href={`/admin/orders/${order.id}`}>
                                <DropdownMenuItem className="cursor-pointer">
                                  <Eye className="h-4 w-4 mr-2" />
                                  View Details
                                </DropdownMenuItem>
                              </Link>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() => downloadInvoice(order.id)}
                              >
                                <FileText className="h-4 w-4 mr-2" />
                                Download Invoice
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))
                  )}

                  {/* Enhanced Pagination */}
                  {pagination.pages > 0 && (
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-500">
                          Showing {(pagination.page - 1) * pagination.limit + 1}{' '}
                          to{' '}
                          {Math.min(
                            pagination.page * pagination.limit,
                            pagination.total
                          )}{' '}
                          of {pagination.total} entries
                        </span>
                        <Select
                          value={pagination.limit.toString()}
                          onValueChange={handlePageSizeChange}
                        >
                          <SelectTrigger className="w-[100px]">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {pageSizeOptions.map((size) => (
                              <SelectItem key={size} value={size.toString()}>
                                {size} / page
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setPagination((prev) => ({ ...prev, page: 1 }))
                          }
                          disabled={pagination.page === 1}
                          className="h-8 w-8"
                        >
                          <span className="sr-only">First page</span>
                          ««
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page - 1,
                            }))
                          }
                          disabled={pagination.page === 1}
                          className="h-8 w-8"
                        >
                          <span className="sr-only">Previous page</span>«
                        </Button>

                        <div className="flex items-center gap-1">
                          {getPageNumbers().map((pageNum, idx) =>
                            pageNum === '...' ? (
                              <span key={`ellipsis-${idx}`} className="px-2">
                                ...
                              </span>
                            ) : (
                              <Button
                                key={pageNum}
                                variant={
                                  pagination.page === pageNum
                                    ? 'default'
                                    : 'outline'
                                }
                                size="icon"
                                onClick={() =>
                                  setPagination((prev) => ({
                                    ...prev,
                                    page: pageNum as number,
                                  }))
                                }
                                className={`h-8 w-8 ${
                                  pagination.page === pageNum
                                    ? 'pointer-events-none'
                                    : ''
                                }`}
                              >
                                <span className="sr-only">Page {pageNum}</span>
                                {pageNum}
                              </Button>
                            )
                          )}
                        </div>

                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: prev.page + 1,
                            }))
                          }
                          disabled={pagination.page === pagination.pages}
                          className="h-8 w-8"
                        >
                          <span className="sr-only">Next page</span>»
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() =>
                            setPagination((prev) => ({
                              ...prev,
                              page: pagination.pages,
                            }))
                          }
                          disabled={pagination.page === pagination.pages}
                          className="h-8 w-8"
                        >
                          <span className="sr-only">Last page</span>
                          »»
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
