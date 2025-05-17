"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DollarSign, Users, ShoppingBag, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import AdminLayout from "@/components/admin/admin-layout"
import ProtectedRoute from "@/components/admin/protected-route"
import Overview from "@/components/admin/overview"
import TopProducts from "@/components/admin/top-products"

interface MetricValue {
  value: number;
  change: number;
}

interface DashboardMetrics {
  totalRevenue: MetricValue;
  totalOrders: MetricValue;
  totalCustomers: MetricValue;
  conversionRate: MetricValue;
}

const defaultMetrics: DashboardMetrics = {
  totalRevenue: { value: 0, change: 0 },
  totalOrders: { value: 0, change: 0 },
  totalCustomers: { value: 0, change: 0 },
  conversionRate: { value: 0, change: 0 }
};

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics>(defaultMetrics)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        console.log('Fetching metrics...');
        const response = await fetch(`/api/admin/dashboard/metrics?timeRange=${timeRange}`, {
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        // Log the raw response for debugging
        console.log('Response status:', response.status);
        console.log('Response headers:', Object.fromEntries(response.headers.entries()));
        
        const contentType = response.headers.get('content-type');
        console.log('Content-Type:', contentType);
        
        const text = await response.text();
        console.log('Raw response body:', text);
        
        let data;
        try {
          data = JSON.parse(text);
        } catch (parseError) {
          console.error('Failed to parse response as JSON:', parseError);
          throw new Error('Invalid response format');
        }
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch metrics');
        }
        
        console.log('Parsed metrics data:', data);
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching dashboard metrics:', error);
        setMetrics(defaultMetrics);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, [timeRange]);

  return (
    <ProtectedRoute resource="analytics" action="read">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex justify-between items-center]">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-[300px]">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="quarter">Quarter</TabsTrigger>
                <TabsTrigger value="year">Year</TabsTrigger>
              </TabsList>
            </Tabs>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Revenue</CardTitle>
                    <DollarSign className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">${metrics.totalRevenue.value.toLocaleString()}</div>
                    <div className="flex items-center pt-1 text-sm">
                      {metrics.totalRevenue.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`${metrics.totalRevenue.change >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                        {Math.abs(metrics.totalRevenue.change).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-1">from last period</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Total Orders</CardTitle>
                    <ShoppingBag className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalOrders.value.toLocaleString()}</div>
                    <div className="flex items-center pt-1 text-sm">
                      {metrics.totalOrders.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`${metrics.totalOrders.change >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                        {Math.abs(metrics.totalOrders.change).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-1">from last period</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Customers</CardTitle>
                    <Users className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.totalCustomers.value.toLocaleString()}</div>
                    <div className="flex items-center pt-1 text-sm">
                      {metrics.totalCustomers.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`${metrics.totalCustomers.change >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                        {Math.abs(metrics.totalCustomers.change).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-1">from last period</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
              >
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500">Conversion Rate</CardTitle>
                    <TrendingUp className="h-4 w-4 text-gray-500" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{metrics.conversionRate.value.toFixed(1)}%</div>
                    <div className="flex items-center pt-1 text-sm">
                      {metrics.conversionRate.change >= 0 ? (
                        <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      )}
                      <span className={`${metrics.conversionRate.change >= 0 ? 'text-green-500' : 'text-red-500'} font-medium`}>
                        {Math.abs(metrics.conversionRate.change).toFixed(1)}%
                      </span>
                      <span className="text-gray-500 ml-1">from last period</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Overview Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Overview />
            </motion.div>

            {/* Top Products Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <TopProducts />
            </motion.div>
          </div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
