'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Plus,
  Search,
  MoreHorizontal,
  Edit,
  Trash,
  Download,
  Filter,
  Eye,
  Copy,
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
import AdminLayout from '@/components/admin/admin-layout';
import ProtectedRoute from '@/components/admin/protected-route';
import { getProducts } from '@/lib/db';
// import type { Product } from '@/types/product';
import type { ProductFormValues as Product } from '@/lib/api/validation';
import { RouteMatcher } from 'next/dist/server/route-matchers/route-matcher';
import Image from 'next/image';

export default function AdminProductsPage() {
  const router = useRouter();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        // const data = await getProducts()
        // setProducts(data)
        setLoading(true);

        const response = await fetch('/api/admin/products');

        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }

        const data = await response.json();

        setProducts(
          data.products.map((product: any) => ({
            id: product._id,
            name: product.name,
            productType: product.productType,
            price: product.price,
            imageUrl: product.imageUrl,
            description: product.description,
            colors: product.colors,
            stockQuantity: product.stockQuantity,
          }))
        );
        setLoading(false);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      categoryFilter === 'all' || product.productType === categoryFilter;

    return matchesSearch && matchesCategory;
  });

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
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
              <Button
                className="flex items-center gap-1"
                onClick={() => router.push('/admin/products/add')}
              >
                <Plus className="h-4 w-4" />
                Add Product
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>All Products</CardTitle>
                  <CardDescription>
                    A list of all products in your inventory
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
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select
                    defaultValue="all"
                    value={categoryFilter}
                    onValueChange={setCategoryFilter}
                  >
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="glasses">Glasses</SelectItem>
                      <SelectItem value="sunglasses">Sunglasses</SelectItem>
                      <SelectItem value="contacts">Contact Lenses</SelectItem>
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
                <div className="space-y-4">
                  <div className="flex items-center py-3 border-b font-medium text-sm text-gray-500">
                    <div className="w-12"></div>
                    <div className="flex-1">Name</div>
                    <div className="flex-1">Category</div>
                    <div className="flex-1">Price</div>
                    <div className="flex-1">Status</div>
                    <div className="w-10"></div>
                  </div>
                  {filteredProducts.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      No products found matching your search.
                    </div>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <motion.div
                        key={product.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.05 }}
                        className="flex items-center py-3 border-b last:border-0"
                      >
                        <div className="w-12">
                          <div className="h-10 w-10 rounded bg-gray-100 overflow-hidden">
                            <Image
                              src={product.imageUrl || '/placeholder.svg'}
                              alt={product.name}
                              className="h-full w-full object-cover"
                              height={100}
                              width={100}
                              layout="responsive"
                              quality={100}
                              priority
                            />
                          </div>
                        </div>
                        <div className="flex-1 font-medium">{product.name}</div>
                        <div className="flex-1 capitalize">
                          {product.productType || product.productType}
                        </div>
                        <div className="flex-1">
                          ${product.price.toFixed(2)}
                        </div>
                        <div className="flex-1">
                          <Badge
                            variant="outline"
                            className={
                              product.stockQuantity > 0
                                ? 'bg-green-100 text-green-800 border-green-200'
                                : 'bg-red-100 text-red-800 border-red-200'
                            }
                          >
                            {product.stockQuantity > 0
                              ? 'In Stock'
                              : 'Out of Stock'}
                          </Badge>
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
                              <DropdownMenuItem className="cursor-pointer">
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="cursor-pointer"
                                onClick={() =>
                                  router.push(`/admin/products/${product.id}`)
                                }
                              >
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="cursor-pointer text-red-600">
                                <Trash className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </motion.div>
                    ))
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
