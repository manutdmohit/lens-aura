import type { AdminUser, DashboardStats, SalesData, ProductPerformance, AdminNotification } from "@/types/admin"

// Mock admin users
export const mockAdminUsers: AdminUser[] = [
  {
    id: "1",
    email: "admin@baileynelson.com",
    name: "Admin User",
    role: "admin",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop",
    createdAt: new Date("2023-01-01"),
    lastLogin: new Date("2023-04-15"),
  },
  {
    id: "2",
    email: "editor@baileynelson.com",
    name: "Editor User",
    role: "editor",
    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=100&auto=format&fit=crop",
    createdAt: new Date("2023-02-15"),
    lastLogin: new Date("2023-04-10"),
  },
  {
    id: "3",
    email: "viewer@baileynelson.com",
    name: "Viewer User",
    role: "viewer",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop",
    createdAt: new Date("2023-03-10"),
    lastLogin: new Date("2023-04-05"),
  },
]

// Mock dashboard stats
export const mockDashboardStats: DashboardStats = {
  totalSales: 125750.5,
  totalOrders: 1250,
  totalUsers: 3500,
  totalProducts: 120,
  conversionRate: 3.2,
  averageOrderValue: 100.6,
}

// Mock sales data for charts
export const mockSalesData: SalesData[] = [
  { date: "Jan", amount: 8500 },
  { date: "Feb", amount: 9200 },
  { date: "Mar", amount: 10500 },
  { date: "Apr", amount: 9800 },
  { date: "May", amount: 11200 },
  { date: "Jun", amount: 12500 },
  { date: "Jul", amount: 13800 },
  { date: "Aug", amount: 14200 },
  { date: "Sep", amount: 13500 },
  { date: "Oct", amount: 12800 },
  { date: "Nov", amount: 15200 },
  { date: "Dec", amount: 16500 },
]

// Mock product performance data
export const mockProductPerformance: ProductPerformance[] = [
  {
    id: "1",
    name: "Archer",
    sales: 250,
    revenue: 23750,
    views: 5000,
    conversionRate: 5,
  },
  {
    id: "2",
    name: "Bailey",
    sales: 220,
    revenue: 20900,
    views: 4800,
    conversionRate: 4.6,
  },
  {
    id: "3",
    name: "Carter",
    sales: 180,
    revenue: 22500,
    views: 3800,
    conversionRate: 4.7,
  },
  {
    id: "4",
    name: "Dexter",
    sales: 210,
    revenue: 26250,
    views: 4200,
    conversionRate: 5,
  },
  {
    id: "5",
    name: "Ellis",
    sales: 150,
    revenue: 14250,
    views: 3500,
    conversionRate: 4.3,
  },
]

// Mock notifications
export const mockNotifications: AdminNotification[] = [
  {
    id: "1",
    title: "New Order",
    message: "Order #12345 has been placed",
    type: "info",
    read: false,
    createdAt: new Date("2023-04-15T10:30:00"),
  },
  {
    id: "2",
    title: "Low Stock Alert",
    message: "Product 'Archer' is running low on stock",
    type: "warning",
    read: false,
    createdAt: new Date("2023-04-14T15:45:00"),
  },
  {
    id: "3",
    title: "Payment Failed",
    message: "Payment for order #12340 has failed",
    type: "error",
    read: true,
    createdAt: new Date("2023-04-13T09:15:00"),
  },
  {
    id: "4",
    title: "New User Registered",
    message: "A new user has registered: john.doe@example.com",
    type: "info",
    read: true,
    createdAt: new Date("2023-04-12T14:20:00"),
  },
  {
    id: "5",
    title: "Promotion Started",
    message: "Summer Sale promotion has started",
    type: "success",
    read: true,
    createdAt: new Date("2023-04-11T08:00:00"),
  },
]

// Get admin users
export async function getAdminUsers(): Promise<AdminUser[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500))
  return mockAdminUsers
}

// Get admin user by ID
export async function getAdminUserById(id: string): Promise<AdminUser | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300))
  return mockAdminUsers.find((user) => user.id === id) || null
}

// Get dashboard stats
export async function getDashboardStats(): Promise<DashboardStats> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800))
  return mockDashboardStats
}

// Get sales data
export async function getSalesData(): Promise<SalesData[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600))
  return mockSalesData
}

// Get product performance data
export async function getProductPerformance(): Promise<ProductPerformance[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 700))
  return mockProductPerformance
}

// Get notifications
export async function getNotifications(): Promise<AdminNotification[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 400))
  return mockNotifications
}
