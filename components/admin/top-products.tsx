import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface Variant {
  color: string;
  variantId: string;
}

interface TopProduct {
  productId: string;
  name: string;
  imageUrl: string;
  totalQuantity: number;
  totalRevenue: number;
  averagePrice: number;
  variants: Variant[];
}

export default function TopProducts() {
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<TopProduct[]>([]);
  const [timeRange, setTimeRange] = useState('30');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/admin/products/top?days=${timeRange}`, {
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('Failed to fetch top products');
        }

        const data = await response.json();
        setProducts(data);
        setError(null);
      } catch (error) {
        console.error('Error fetching top products:', error);
        setError('Failed to load top products data');
      } finally {
        setLoading(false);
      }
    };

    fetchTopProducts();
  }, [timeRange]);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
          <CardDescription>Error: {error}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Top Products</CardTitle>
              <CardDescription>Best selling products by quantity</CardDescription>
            </div>
            <Tabs defaultValue={timeRange} onValueChange={setTimeRange}>
              <TabsList>
                <TabsTrigger value="7">7 days</TabsTrigger>
                <TabsTrigger value="30">30 days</TabsTrigger>
                <TabsTrigger value="90">90 days</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-4">
              <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
              <div className="space-y-2">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-gray-100 rounded animate-pulse" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded w-1/3 animate-pulse" />
                      <div className="h-3 bg-gray-100 rounded w-1/4 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={products}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval={0}
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis />
                    <Tooltip />
                    <Bar 
                      dataKey="totalQuantity" 
                      fill="#3b82f6"
                      name="Units Sold"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-4">
                {products.map((product) => (
                  <div key={product.productId} className="flex items-center space-x-4">
                    <div className="h-12 w-12 rounded-md overflow-hidden">
                      <img 
                        src={product.imageUrl || '/placeholder.png'} 
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium">{product.name}</h4>
                      <p className="text-sm text-gray-500">
                        {product.totalQuantity} units · ${product.totalRevenue.toFixed(2)} revenue
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
} 