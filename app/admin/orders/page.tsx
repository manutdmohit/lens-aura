"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Search, MoreHorizontal, Download, Filter, Eye, FileText, Calendar, CreditCard } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import AdminLayout from "@/components/admin/admin-layout"
import ProtectedRoute from "@/components/admin/protected-route"

// Mock orders data
const mockOrders = [
  {
    id: "ORD-12345",
    customer: "John Doe",
    email: "john.doe@example.com",
    date: "2023-04-15",
    status: "completed",
    payment: "credit_card",
    total: 125.0,
  },
  {
    id: "ORD-12344",
    customer: "Jane Smith",
    email: "jane.smith@example.com",
    date: "2023-04-14",
    status: "processing",
    payment: "paypal",
    total: 250.0,
  },
  {
    id: "ORD-12343",
    customer: "Robert Johnson",
    email: "robert.johnson@example.com",
    date: "2023-04-14",
    status: "completed",
    payment: "credit_card",
    total: 95.0,
  },
  {
    id: "ORD-12342",
    customer: "Emily Davis",
    email: "emily.davis@example.com",
    date: "2023-04-13",
    status: "pending",
    payment: "credit_card",
    total: 125.0,
  },
  {
    id: "ORD-12341",
    customer: "Michael Wilson",
    email: "michael.wilson@example.com",
    date: "2023-04-12",
    status: "cancelled",
    payment: "paypal",
    total: 250.0,
  },
  {
    id: "ORD-12340",
    customer: "Sarah Brown",
    email: "sarah.brown@example.com",
    date: "2023-04-11",
    status: "completed",
    payment: "credit_card",
    total: 95.0,
  },
  {
    id: "ORD-12339",
    customer: "David Miller",
    email: "david.miller@example.com",
    date: "2023-04-10",
    status: "completed",
    payment: "credit_card",
    total: 125.0,
  },
  {
    id: "ORD-12338",
    customer: "Jennifer Taylor",
    email: "jennifer.taylor@example.com",
    date: "2023-04-09",
    status: "processing",
    payment: "paypal",
    total: 250.0,
  },
]

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState(mockOrders)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    // Simulate API call
    const timer = setTimeout(() => {
      setLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.email.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "processing":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getPaymentIcon = (payment: string) => {
    switch (payment) {
      case "credit_card":
        return <CreditCard className="h-4 w-4 text-gray-500" />
      case "paypal":
        return <CreditCard className="h-4 w-4 text-blue-500" />
      default:
        return <CreditCard className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <ProtectedRoute resource="orders" action="read">
      <AdminLayout>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold">Orders</h1>
              <p className="text-gray-500">Manage customer orders</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Button variant="outline" className="flex items-center gap-1">
                <Download className="h-4 w-4" />
                Export Orders
              </Button>
              <Button variant="outline" className="flex items-center gap-1">
                <FileText className="h-4 w-4" />
                Generate Report
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <CardTitle>All Orders</CardTitle>
                  <CardDescription>A list of all customer orders</CardDescription>
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
                  <Select defaultValue="all" value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-full sm:w-[150px]">
                      <div className="flex items-center gap-2">
                        <Filter className="h-4 w-4" />
                        <SelectValue placeholder="Filter" />
                      </div>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="processing">Processing</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
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
                    <div className="flex-1">Payment</div>
                    <div className="flex-1 text-right">Total</div>
                    <div className="w-10"></div>
                  </div>
                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">No orders found matching your search.</div>
                  ) : (
                    filteredOrders.map((order, index) => (
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
                          <div className="text-sm text-gray-500">{order.email}</div>
                        </div>
                        <div className="flex-1 flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          {new Date(order.date).toLocaleDateString()}
                        </div>
                        <div className="flex-1">
                          <Badge variant="outline" className={getStatusBadgeColor(order.status)}>
                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                          </Badge>
                        </div>
                        <div className="flex-1 flex items-center">
                          {getPaymentIcon(order.payment)}
                          <span className="ml-2 capitalize">{order.payment.replace("_", " ")}</span>
                        </div>
                        <div className="flex-1 text-right font-medium">${order.total.toFixed(2)}</div>
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
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem className="cursor-pointer">
                                <FileText className="h-4 w-4 mr-2" />
                                Download Invoice
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
  )
}
