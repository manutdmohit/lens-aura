"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { DollarSign, Users, ShoppingBag, ArrowUpRight, ArrowDownRight, TrendingUp } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
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
  Title,
  Tooltip,
  Legend,
} from "chart.js"
import { Line, Bar } from "react-chartjs-2"

// Register ChartJS components
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend)

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [salesData, setSalesData] = useState<SalesData[]>([])
  const [productPerformance, setProductPerformance] = useState<ProductPerformance[]>([])
  const [loading, setLoading] = useState(true)

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
        console.error("Error fetching dashboard data:", error)
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
        backgroundColor: "rgba(59, 130, 246, 0.7)",
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <Tabs defaultValue="today" className="w-[300px]">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="today">Today</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
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
                    <div className="text-2xl font-bold">${stats?.totalSales.toLocaleString()}</div>
                    <div className="flex items-center pt-1 text-sm">
                      <ArrowUpRight className="h-4 w-4 text-green-500 mr-1" />
                      <span className="text-green-500 font-medium">+12.5%</span>
                      <span className="text-gray-500 ml-1">from last month</span>
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
                      <span className="text-gray-500 ml-1">from last month</span>
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
                      <span className="text-gray-500 ml-1">from last month</span>
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
                      <span className="text-gray-500 ml-1">from last month</span>
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
                  <CardTitle>Top Products</CardTitle>
                  <CardDescription>Best selling products</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    {loading ? (
                      <div className="h-full bg-gray-100 animate-pulse rounded-md"></div>
                    ) : (
                      <Bar data={productChartData} options={chartOptions} />
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
                <CardTitle>Recent Orders</CardTitle>
                <CardDescription>Latest customer orders</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className="flex items-center animate-pulse">
                        <div className="h-10 w-10 bg-gray-200 rounded-full"></div>
                        <div className="ml-4 space-y-2 flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                          <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                        </div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center py-3 border-b">
                      <div className="flex-1 font-medium">Order ID</div>
                      <div className="flex-1 font-medium">Customer</div>
                      <div className="flex-1 font-medium">Status</div>
                      <div className="flex-1 font-medium">Date</div>
                      <div className="flex-1 font-medium text-right">Amount</div>
                    </div>
                    <div className="flex items-center py-3 border-b">
                      <div className="flex-1">#ORD-12345</div>
                      <div className="flex-1">John Doe</div>
                      <div className="flex-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                      <div className="flex-1">Apr 15, 2023</div>
                      <div className="flex-1 text-right">$125.00</div>
                    </div>
                    <div className="flex items-center py-3 border-b">
                      <div className="flex-1">#ORD-12344</div>
                      <div className="flex-1">Jane Smith</div>
                      <div className="flex-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          Processing
                        </span>
                      </div>
                      <div className="flex-1">Apr 14, 2023</div>
                      <div className="flex-1 text-right">$250.00</div>
                    </div>
                    <div className="flex items-center py-3 border-b">
                      <div className="flex-1">#ORD-12343</div>
                      <div className="flex-1">Robert Johnson</div>
                      <div className="flex-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Completed
                        </span>
                      </div>
                      <div className="flex-1">Apr 14, 2023</div>
                      <div className="flex-1 text-right">$95.00</div>
                    </div>
                    <div className="flex items-center py-3 border-b">
                      <div className="flex-1">#ORD-12342</div>
                      <div className="flex-1">Emily Davis</div>
                      <div className="flex-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                          Pending
                        </span>
                      </div>
                      <div className="flex-1">Apr 13, 2023</div>
                      <div className="flex-1 text-right">$125.00</div>
                    </div>
                    <div className="flex items-center py-3">
                      <div className="flex-1">#ORD-12341</div>
                      <div className="flex-1">Michael Wilson</div>
                      <div className="flex-1">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          Cancelled
                        </span>
                      </div>
                      <div className="flex-1">Apr 12, 2023</div>
                      <div className="flex-1 text-right">$250.00</div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AdminLayout>
    </ProtectedRoute>
  )
}
