'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Truck,
  Calendar,
  CreditCard,
  Download,
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/admin-layout';
import ProtectedRoute from '@/components/admin/protected-route';
import Link from 'next/link';
import { formatPrice } from '@/lib/utils/discount';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface OrderDetails {
  id: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  shipping: {
    firstName?: string;
    lastName?: string;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    phone?: string;
    fullAddress: string;
  };
  items: Array<{
    name: string;
    price: number;
    quantity: number;
    color: string;
    imageUrl?: string;
    subtotal: number;
  }>;
  payment: {
    status: string;
    method: string;
    intent?: string;
    sessionId: string;
  };
  delivery: {
    status: string;
    updatedAt: string;
  };
  dates: {
    created: string;
    updated: string;
  };
  totals: {
    subtotal: number;
    total: number;
  };
}

const DELIVERY_STATUSES = [
  'ORDER_PLACED',
  'ORDER_CONFIRMED',
  'PROCESSING',
  'DISPATCHED',
  'IN_TRANSIT',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
  'RETURNED',
  'DELAYED',
] as const;

export default function OrderDetailsPage() {
  const params = useParams();
  const orderNumber = params?.orderNumber as string;
  const [order, setOrder] = useState<OrderDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloadingInvoice, setIsDownloadingInvoice] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/orders/${orderNumber}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch order details');
        }

        setOrder(data.order);
      } catch (error) {
        console.error('Error fetching order details:', error);
        const message =
          error instanceof Error
            ? error.message
            : 'Failed to fetch order details';
        setTimeout(() => {
          toast(message);
        }, 0);
      } finally {
        setLoading(false);
      }
    };

    if (orderNumber) {
      fetchOrder();
    }
  }, [orderNumber]);

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

  const updateDeliveryStatus = async (newStatus: string) => {
    try {
      setIsUpdating(true);
      const response = await fetch(`/api/admin/orders/${orderNumber}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ deliveryStatus: newStatus }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update delivery status');
      }

      setOrder((prev) =>
        prev
          ? {
              ...prev,
              delivery: {
                ...prev.delivery,
                status: data.deliveryStatus,
                updatedAt: data.updatedAt,
              },
            }
          : null
      );

      setTimeout(() => {
        toast('Delivery status updated successfully', {
          icon: '🚚',
        });
      }, 0);
    } catch (error) {
      console.error('Error updating delivery status:', error);
      const message =
        error instanceof Error
          ? error.message
          : 'Failed to update delivery status';
      setTimeout(() => {
        toast(message);
      }, 0);
    } finally {
      setIsUpdating(false);
    }
  };

  const downloadInvoice = async () => {
    if (!order) return;

    try {
      setIsDownloadingInvoice(true);
      console.log('Starting invoice download for admin order:', order.id);

      const orderDetails = {
        id: order.id,
        orderNumber: order.id,
        customerEmail: order.customer.email,
        items: order.items.map((item) => ({
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
      link.download = `invoice-${order.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      console.log('Admin invoice downloaded successfully');
      toast('Invoice downloaded successfully');
    } catch (error) {
      console.error('Error downloading admin invoice:', error);
      toast(
        `Failed to download invoice: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`
      );
    } finally {
      setIsDownloadingInvoice(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute resource="orders" action="read">
        <AdminLayout>
          <div className="space-y-6 p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-4">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-64 bg-gray-200 rounded"></div>
            </div>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  if (!order) {
    return (
      <ProtectedRoute resource="orders" action="read">
        <AdminLayout>
          <div className="flex flex-col items-center justify-center min-h-[60vh]">
            <h2 className="text-2xl font-bold mb-2">Order Not Found</h2>
            <p className="text-gray-500 mb-4">
              The order you're looking for doesn't exist.
            </p>
            <Link href="/admin/orders">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Orders
              </Button>
            </Link>
          </div>
        </AdminLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute resource="orders" action="read">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Link
                href="/admin/orders"
                className="text-sm text-gray-500 hover:text-gray-900 flex items-center mb-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Orders
              </Link>
              <h1 className="text-3xl font-bold">Order #{order.id}</h1>
            </div>
            <Button
              onClick={downloadInvoice}
              disabled={isDownloadingInvoice || !order}
              className="flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              {isDownloadingInvoice ? 'Generating...' : 'Download Invoice'}
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle>Order Status</CardTitle>
                <CardDescription>Current status of the order</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <CreditCard className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Payment Status</p>
                      <Badge
                        variant="outline"
                        className={getStatusBadgeColor(order.payment.status)}
                      >
                        {order.payment.status.charAt(0).toUpperCase() +
                          order.payment.status.slice(1)}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Method</p>
                    <p className="font-medium">{order.payment.method}</p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Delivery Status</p>
                      <Select
                        value={order.delivery.status}
                        onValueChange={updateDeliveryStatus}
                        disabled={isUpdating}
                      >
                        <SelectTrigger className="w-[180px]">
                          <SelectValue>
                            <Badge
                              variant="outline"
                              className={getDeliveryStatusBadgeColor(
                                order.delivery.status
                              )}
                            >
                              {order.delivery.status
                                ? order.delivery.status
                                    .split('_')
                                    .map(
                                      (word) =>
                                        word.charAt(0) +
                                        word.slice(1).toLowerCase()
                                    )
                                    .join(' ')
                                : 'Order Placed'}
                            </Badge>
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {DELIVERY_STATUSES.map((status) => (
                            <SelectItem key={status} value={status}>
                              <Badge
                                variant="outline"
                                className={getDeliveryStatusBadgeColor(status)}
                              >
                                {status
                                  .split('_')
                                  .map(
                                    (word) =>
                                      word.charAt(0) +
                                      word.slice(1).toLowerCase()
                                  )
                                  .join(' ')}
                              </Badge>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-500">Last Updated</p>
                    <p className="font-medium">
                      {new Date(order.delivery.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-gray-500" />
                    <div>
                      <p className="text-sm font-medium">Order Date</p>
                      <p>
                        {new Date(order.dates.created).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle>Customer Information</CardTitle>
                <CardDescription>Details about the customer</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Customer Name</p>
                  <p>
                    {order.customer.firstName} {order.customer.lastName}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-medium">Contact Information</p>
                  <p>{order.customer.email}</p>
                  <p>{order.customer.phone}</p>
                </div>
                <Separator />
                <div>
                  <p className="text-sm font-medium">Shipping Address</p>
                  <p className="whitespace-pre-line">
                    {order.shipping.fullAddress}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Items */}
          <Card>
            <CardHeader>
              <CardTitle>Order Items</CardTitle>
              <CardDescription>Products included in this order</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between py-4 border-b last:border-0"
                  >
                    <div className="flex items-center space-x-4">
                      {item.imageUrl && (
                        <div className="w-16 h-16 relative rounded overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            className="object-cover"
                          />
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-500">
                          Color: {item.color}
                        </p>
                        <p className="text-sm text-gray-500">
                          Quantity: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">
                        {formatPrice(item.subtotal)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatPrice(item.price)} each
                      </p>
                    </div>
                  </div>
                ))}

                <div className="pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Subtotal</span>
                    <span>{formatPrice(order.totals.subtotal)}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>{formatPrice(order.totals.total)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
