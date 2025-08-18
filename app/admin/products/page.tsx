'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Download,
  Filter,
  Eye,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Package,
  DollarSign,
  TrendingUp,
  X,
  Check,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from 'sonner';
import AdminLayout from '@/components/admin/admin-layout';
import ProtectedRoute from '@/components/admin/protected-route';
import type { ProductFormValues as Product } from '@/lib/api/validation';
import Image from 'next/image';
import {
  calculateDiscount,
  formatPrice,
  formatSavingsPercentage,
} from '@/lib/utils/discount';

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortField, setSortField] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalProducts, setTotalProducts] = useState(0);

  // Analytics state
  const [analytics, setAnalytics] = useState({
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    totalValue: 0,
  });

  // Fetch products with server-side pagination
  const fetchProducts = async () => {
    try {
      setLoading(true);

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        sort: sortField,
        order: sortDirection,
      });

      if (searchQuery) {
        params.append('search', searchQuery);
      }

      if (categoryFilter !== 'all') {
        params.append('productType', categoryFilter);
      }

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      const response = await fetch(`/api/admin/products?${params}`);
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }

      const data = await response.json();
      console.log('Products data received:', data.products);
      console.log('First product ID:', data.products[0]?.id);
      setProducts(data.products);
      setTotalPages(data.pagination.pages);
      setTotalProducts(data.pagination.total);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
      setLoading(false);
    }
  };

  // Fetch analytics separately
  const fetchAnalytics = async () => {
    try {
      const response = await fetch('/api/admin/analytics');
      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const data = await response.json();
      setAnalytics(data);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      toast.error('Failed to fetch analytics');
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchAnalytics();
  }, [
    currentPage,
    itemsPerPage,
    sortField,
    sortDirection,
    searchQuery,
    categoryFilter,
    statusFilter,
  ]);

  // Handle sorting
  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  // Handle search and filters
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleCategoryFilterChange = (value: string) => {
    setCategoryFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value);
    setCurrentPage(1); // Reset to first page when filtering
  };

  const exportToCSV = () => {
    const csvHeaders = ['Name', 'Category', 'Price', 'Stock', 'Status'];
    const csvData = products.map((product) => [
      product.name,
      product.productType,
      product.discountedPrice && product.discountedPrice > 0
        ? product.discountedPrice
        : product.price,
      product.stockQuantity,
      product.status,
    ]);

    const csvContent = [csvHeaders, ...csvData]
      .map((row) => row.join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'products.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleToggleStatus = async (
    productId: string,
    currentStatus: string
  ) => {
    console.log('handleToggleStatus called with:', {
      productId,
      currentStatus,
    });

    if (!productId) {
      console.error('Product ID is missing!');
      toast.error('Product ID is missing');
      return;
    }

    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      console.log('Toggling status from', currentStatus, 'to', newStatus);

      // Send PUT request to update product status
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update product status');
      }

      const result = await response.json();
      console.log('API response:', result);

      toast.success(
        `Product ${
          newStatus === 'active' ? 'activated' : 'deactivated'
        } successfully`
      );

      // Refresh the products list and analytics
      fetchProducts();
      fetchAnalytics();
    } catch (error: any) {
      console.error('Error updating product status:', error);
      toast.error(error.message || 'Failed to update product status');
    }
  };

  return (
    <ProtectedRoute resource="products" action="read">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Products</h1>
              <p className="text-gray-500">Manage your product inventory</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={exportToCSV}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              <Button
                className="flex items-center gap-2"
                onClick={() => router.push('/admin/products/add')}
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>

          {/* Analytics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Products
                </CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.totalProducts}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Active Products
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.activeProducts}
                </div>
                <p className="text-xs text-muted-foreground">
                  {analytics.totalProducts > 0
                    ? `${Math.round(
                        (analytics.activeProducts / analytics.totalProducts) *
                          100
                      )}% of total`
                    : '0% of total'}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Low Stock Alert
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {analytics.lowStockProducts}
                </div>
                <p className="text-xs text-muted-foreground">
                  Items with ≤5 stock
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Inventory Value
                </CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  ${analytics.totalValue.toFixed(2)}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>All Products ({totalProducts})</CardTitle>
                  <CardDescription>
                    Manage your product inventory with advanced filtering and
                    bulk actions
                  </CardDescription>
                </div>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      type="search"
                      placeholder="Search products..."
                      className="pl-10 w-full sm:w-[250px]"
                      value={searchQuery}
                      onChange={(e) => handleSearchChange(e.target.value)}
                    />
                  </div>
                  <Select
                    value={categoryFilter}
                    onValueChange={handleCategoryFilterChange}
                  >
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Category" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="glasses">Glasses</SelectItem>
                      <SelectItem value="sunglasses">Sunglasses</SelectItem>
                      <SelectItem value="contacts">Contact Lenses</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={statusFilter}
                    onValueChange={handleStatusFilterChange}
                  >
                    <SelectTrigger className="w-full sm:w-[130px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Status" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
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
                      <div className="h-12 w-12 bg-gray-200 rounded"></div>
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
                <>
                  {/* Desktop Table View */}
                  <div className="hidden md:block rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[80px]">Image</TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('name')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Name
                              {sortField === 'name' &&
                                (sortDirection === 'asc' ? (
                                  <ArrowUp className="ml-2 h-4 w-4" />
                                ) : (
                                  <ArrowDown className="ml-2 h-4 w-4" />
                                ))}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('productType')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Category
                              {sortField === 'productType' &&
                                (sortDirection === 'asc' ? (
                                  <ArrowUp className="ml-2 h-4 w-4" />
                                ) : (
                                  <ArrowDown className="ml-2 h-4 w-4" />
                                ))}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('price')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Price
                              {sortField === 'price' &&
                                (sortDirection === 'asc' ? (
                                  <ArrowUp className="ml-2 h-4 w-4" />
                                ) : (
                                  <ArrowDown className="ml-2 h-4 w-4" />
                                ))}
                            </Button>
                          </TableHead>
                          <TableHead>
                            <Button
                              variant="ghost"
                              onClick={() => handleSort('stockQuantity')}
                              className="h-auto p-0 font-semibold hover:bg-transparent"
                            >
                              Stock
                              {sortField === 'stockQuantity' &&
                                (sortDirection === 'asc' ? (
                                  <ArrowUp className="ml-2 h-4 w-4" />
                                ) : (
                                  <ArrowDown className="ml-2 h-4 w-4" />
                                ))}
                            </Button>
                          </TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {products.length === 0 ? (
                          <TableRow key="no-products">
                            <TableCell colSpan={7} className="h-24 text-center">
                              No products found matching your search.
                            </TableCell>
                          </TableRow>
                        ) : (
                          products.map((product, index) => (
                            <motion.tr
                              key={product.id || `product-${index}`}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{
                                duration: 0.3,
                                delay: index * 0.05,
                              }}
                              className="group hover:bg-muted/50"
                            >
                              <TableCell>
                                <div className="h-12 w-12 rounded-md bg-gray-100 overflow-hidden">
                                  <Image
                                    src={
                                      product.thumbnail || '/placeholder.svg'
                                    }
                                    alt={product.name}
                                    className="h-full w-full object-cover"
                                    height={48}
                                    width={48}
                                  />
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">
                                <div className="flex flex-col">
                                  <span className="text-sm font-medium truncate max-w-[200px]">
                                    {product.name}
                                  </span>
                                  <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                                    {product.description}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize">
                                {product.productType}
                              </TableCell>
                              <TableCell>
                                {formatPrice(product.price ?? 0)}
                              </TableCell>
                              <TableCell>
                                {(() => {
                                  let totalStock = 0;
                                  if (
                                    product.productType === 'glasses' ||
                                    product.productType === 'sunglasses'
                                  ) {
                                    // For glasses/sunglasses, sum all frameColorVariants stock
                                    totalStock = (
                                      product.frameColorVariants || []
                                    ).reduce(
                                      (sum, variant) =>
                                        sum + (variant.stockQuantity ?? 0),
                                      0
                                    );
                                  } else {
                                    // For contacts/accessories, use direct stockQuantity
                                    totalStock = product.stockQuantity ?? 0;
                                  }
                                  return (
                                    <span
                                      className={`text-sm ${
                                        totalStock <= 5
                                          ? 'text-orange-600 font-medium'
                                          : ''
                                      }`}
                                    >
                                      {totalStock}
                                    </span>
                                  );
                                })()}
                              </TableCell>
                              <TableCell>
                                <Badge
                                  variant={
                                    product.status === 'active'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className={
                                    product.status === 'active'
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : 'bg-gray-100 text-gray-800 border-gray-200'
                                  }
                                >
                                  {product.status === 'active'
                                    ? 'Active'
                                    : 'Inactive'}
                                </Badge>
                              </TableCell>
                              <TableCell className="text-right">
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0 cursor-pointer"
                                    >
                                      <span className="sr-only">Open menu</span>
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                  >
                                    <DropdownMenuLabel>
                                      Quick Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        product.id &&
                                        router.push(
                                          `/admin/products/${product.id}`
                                        )
                                      }
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        product.id &&
                                        router.push(
                                          `/admin/products/${product.id}`
                                        )
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Product
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        handleToggleStatus(
                                          product.id || '',
                                          product.status || ''
                                        )
                                      }
                                    >
                                      {product.status === 'active' ? (
                                        <>
                                          <X className="mr-2 h-4 w-4" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <Check className="mr-2 h-4 w-4" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </TableCell>
                            </motion.tr>
                          ))
                        )}
                      </TableBody>
                    </Table>
                  </div>

                  {/* Mobile Card View */}
                  <div className="md:hidden space-y-4">
                    {products.length === 0 ? (
                      <div
                        key="no-products-mobile"
                        className="text-center py-8 text-gray-500"
                      >
                        No products found matching your search.
                      </div>
                    ) : (
                      products.map((product, index) => (
                        <motion.div
                          key={product.id || `product-mobile-${index}`}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3, delay: index * 0.05 }}
                          className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
                        >
                          <div className="flex items-start space-x-4">
                            <div className="h-16 w-16 rounded-md bg-gray-100 overflow-hidden flex-shrink-0">
                              <Image
                                src={product.thumbnail || '/placeholder.svg'}
                                alt={product.name}
                                className="h-full w-full object-cover"
                                height={64}
                                width={64}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-sm font-medium text-gray-900 truncate">
                                    {product.name}
                                  </h3>
                                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                    {product.description}
                                  </p>
                                </div>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      className="h-8 w-8 p-0 cursor-pointer"
                                    >
                                      <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent
                                    align="end"
                                    className="w-48"
                                  >
                                    <DropdownMenuLabel>
                                      Quick Actions
                                    </DropdownMenuLabel>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        product.id &&
                                        router.push(
                                          `/admin/products/${product.id}`
                                        )
                                      }
                                    >
                                      <Eye className="mr-2 h-4 w-4" />
                                      View Details
                                    </DropdownMenuItem>
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        product.id &&
                                        router.push(
                                          `/admin/products/${product.id}`
                                        )
                                      }
                                    >
                                      <Edit className="mr-2 h-4 w-4" />
                                      Edit Product
                                    </DropdownMenuItem>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuItem
                                      className="cursor-pointer"
                                      onClick={() =>
                                        handleToggleStatus(
                                          product.id || '',
                                          product.status || ''
                                        )
                                      }
                                    >
                                      {product.status === 'active' ? (
                                        <>
                                          <X className="mr-2 h-4 w-4" />
                                          Deactivate
                                        </>
                                      ) : (
                                        <>
                                          <Check className="mr-2 h-4 w-4" />
                                          Activate
                                        </>
                                      )}
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                              <div className="mt-3 flex items-center justify-between">
                                <div className="flex items-center space-x-4 text-sm">
                                  <div>
                                    <span className="text-gray-500">
                                      Category:
                                    </span>
                                    <span className="ml-1 capitalize">
                                      {product.productType}
                                    </span>
                                  </div>
                                  <div>
                                    <span className="text-gray-500">
                                      Price:
                                    </span>
                                    <div className="ml-1">
                                      {(() => {
                                        const discountInfo = calculateDiscount(
                                          product.price,
                                          product.discountedPrice
                                        );

                                        if (discountInfo.hasDiscount) {
                                          return (
                                            <div>
                                              <span className="font-medium text-red-600">
                                                {formatPrice(
                                                  discountInfo.displayPrice
                                                )}
                                              </span>
                                              <span className="text-xs line-through text-gray-500 ml-1">
                                                {formatPrice(
                                                  discountInfo.originalPrice
                                                )}
                                              </span>
                                              <span className="text-xs text-green-600 font-medium ml-1">
                                                Save{' '}
                                                {formatSavingsPercentage(
                                                  discountInfo.savingsPercentage
                                                )}
                                              </span>
                                            </div>
                                          );
                                        } else {
                                          return (
                                            <span className="font-medium">
                                              {formatPrice(
                                                discountInfo.displayPrice
                                              )}
                                            </span>
                                          );
                                        }
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                              <div className="mt-2 flex items-center justify-between">
                                <div className="text-sm">
                                  <span className="text-gray-500">Stock:</span>
                                  {(() => {
                                    let totalStock = 0;
                                    if (
                                      product.productType === 'glasses' ||
                                      product.productType === 'sunglasses'
                                    ) {
                                      // For glasses/sunglasses, sum all frameColorVariants stock
                                      totalStock = (
                                        product.frameColorVariants || []
                                      ).reduce(
                                        (sum, variant) =>
                                          sum + (variant.stockQuantity ?? 0),
                                        0
                                      );
                                    } else {
                                      // For contacts/accessories, use direct stockQuantity
                                      totalStock = product.stockQuantity ?? 0;
                                    }
                                    return (
                                      <span
                                        className={`ml-1 ${
                                          totalStock <= 5
                                            ? 'text-orange-600 font-medium'
                                            : ''
                                        }`}
                                      >
                                        {totalStock}
                                      </span>
                                    );
                                  })()}
                                </div>
                                <Badge
                                  variant={
                                    product.status === 'active'
                                      ? 'default'
                                      : 'secondary'
                                  }
                                  className={
                                    product.status === 'active'
                                      ? 'bg-green-100 text-green-800 border-green-200'
                                      : 'bg-gray-100 text-gray-800 border-gray-200'
                                  }
                                >
                                  {product.status === 'active'
                                    ? 'Active'
                                    : 'Inactive'}
                                </Badge>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))
                    )}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-2 mt-4 space-y-3 sm:space-y-0">
                      <div className="text-sm text-muted-foreground">
                        Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                        {Math.min(currentPage * itemsPerPage, totalProducts)} of{' '}
                        {totalProducts} results
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) => Math.max(prev - 1, 1))
                          }
                          disabled={currentPage === 1}
                        >
                          <ChevronLeft className="h-4 w-4" />
                          <span className="hidden sm:inline">Previous</span>
                        </Button>

                        {/* Desktop pagination */}
                        <div className="hidden sm:flex items-center space-x-1">
                          {Array.from({ length: totalPages }, (_, i) => i + 1)
                            .filter(
                              (page) =>
                                page === 1 ||
                                page === totalPages ||
                                (page >= currentPage - 2 &&
                                  page <= currentPage + 2)
                            )
                            .map((page, index, array) => (
                              <div
                                key={`page-${page}`}
                                className="flex items-center"
                              >
                                {index > 0 && array[index - 1] !== page - 1 && (
                                  <span
                                    key={`ellipsis-${page}`}
                                    className="px-2 text-muted-foreground"
                                  >
                                    ...
                                  </span>
                                )}
                                <Button
                                  key={`button-${page}`}
                                  variant={
                                    currentPage === page ? 'default' : 'outline'
                                  }
                                  size="sm"
                                  onClick={() => setCurrentPage(page)}
                                  className="w-8 h-8 p-0"
                                >
                                  {page}
                                </Button>
                              </div>
                            ))}
                        </div>

                        {/* Mobile pagination */}
                        <div className="sm:hidden flex items-center space-x-2">
                          <span className="text-sm text-muted-foreground">
                            Page {currentPage} of {totalPages}
                          </span>
                        </div>

                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            setCurrentPage((prev) =>
                              Math.min(prev + 1, totalPages)
                            )
                          }
                          disabled={currentPage === totalPages}
                        >
                          <span className="hidden sm:inline">Next</span>
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  );
}
