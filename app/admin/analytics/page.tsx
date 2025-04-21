"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { TrendingUp, Users, ShoppingBag, DollarSign, ArrowUpRight, ArrowDownRight, Download } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import AdminLayout from "@/components/admin/admin-layout"
import ProtectedRoute from "@/components/admin/protected-route"
import { getDashboardStats, getSalesData, getProductPerformance } from "@/lib/admin-data"
import type { DashboardStats, SalesData, ProductPerformance } from "@/types/admin"
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar, Pie } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend)

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([])
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsData, sales, products] = await Promise.all([
          getDashboardStats(),
          getSalesData(),
          getProductPerformance(),
        ])
        setStats(statsData)
        setSalesData(sales)
        setProductPerformance(products)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Prepare chart data
  const salesChartData = {
    labels: salesData.map((data) => data.date),
    datasets: [
      {
        label: "Sales",
        data: salesData.map((data) => data.amount),
        borderColor: "rgb(59, 130, 246)",
        backgroundColor: "rgba(59, 130, 246, 0.5)",
        tension: 0.3,
      },
    ],
  }

  const productChartData = {
    labels: productPerformance.map((product) => product.name),
    datasets: [
      {
        label: "Sales",
        data: productPerformance.map((product) => product.sales),
        backgroundColor: [
          "rgba(59, 130, 246, 0.7)",
          "rgba(16, 185, 129, 0.7)",
          "rgba(245, 158, 11, 0.7)",
          "rgba(239, 68, 68, 0.7)",
          "rgba(139, 92, 246, 0.7)",
        ],
        borderWidth: 1,
      },
    ],
  }

  const conversionChartData = {
    labels: productPerformance.map((product) => product.name),
    datasets: [
      {
        label: "Conversion Rate (%)",
        data: productPerformance.map((product) => product.conversionRate),
        backgroundColor: "rgba(16, 185, 129, 0.7)",
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
      },
    },
  }

  return (
    <ProtectedRoute resource="analytics" action="read">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Analytics</h1>
              <p className="text-gray-500">Detailed insights into your business performance</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Tabs defaultValue={timeRange} onValueChange={setTimeRange} className="w-[300px]">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="week">Week</TabsTrigger>
                  <TabsTrigger value="month">Month</TabsTrigger>
                  <TabsTrigger value="quarter">Quarter</TabsTrigger>
                  <TabsTrigger value="year">Year</TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
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
                    <div className="text-2xl font-bold">${stats?.totalSales.toLocaleString()}</div>
                    <div className="flex items-center pt-1 text-sm">
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">+12.5%</span>
                      <span className="text-gray-500 ml-1">from last {timeRange}</span>
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
                    <div className="text-2xl font-bold">{stats?.totalOrders.toLocaleString()}</div>
                    <div className="flex items-center pt-1 text-sm">
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">+8.2%</span>
                      <span className="text-gray-500 ml-1">from last {timeRange}</span>
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
                    <div className="text-2xl font-bold">{stats?.totalUsers.toLocaleString()}</div>
                    <div className="flex items-center pt-1 text-sm">
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">+5.3%</span>
                      <span className="text-gray-500 ml-1">from last {timeRange}</span>
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
                    <div className="text-2xl font-bold">{stats?.conversionRate}%</div>
                    <div className="flex items-center pt-1 text-sm">
                      <ArrowDownRight className="h-4 w-4 text-red-500 mr-1" />
                      <span className="text-red-500 font-medium">-0.5%</span>
                      <span className="text-gray-500 ml-1">from last {timeRange}</span>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.5 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Sales Overview</CardTitle>
                  <CardDescription>Monthly sales performance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {loading ? (
                      <div className="h-full bg-gray-100 animate-pulse rounded-md"></div>
                    ) : (
                      <Line data={salesChartData} options={chartOptions} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.6 }}
            >
              <Card>
                <CardHeader>
                  <CardTitle>Product Performance</CardTitle>
                  <CardDescription>Sales by product</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {loading ? (
                      <div className="h-full bg-gray-100 animate-pulse rounded-md"></div>
                    ) : (
                      <Pie data={productChartData} options={chartOptions} />
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.7 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Conversion Rates</CardTitle>
                <CardDescription>Product conversion performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  {loading ? (
                    <div className="h-full bg-gray-100 animate-pulse rounded-md"></div>
                  ) : (
                    <Bar data={conversionChartData} options={chartOptions} />
                  )}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
