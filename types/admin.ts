export type UserRole = "admin" | "editor" | "viewer"

export interface AdminUser {
  id: string
  email: string
  name: string
  role: UserRole
  avatar?: string
  createdAt: Date
  lastLogin?: Date
}

export interface Permission {
  id: string
  name: string
  description: string
  resource: string
  action: "create" | "read" | "update" | "delete" | "manage"
}

export interface RolePermission {
  role: UserRole
  permissions: Permission[]
}

export interface AdminSession {
  user: AdminUser
  expires: Date
}

export interface DashboardStats {
  totalSales: number
  totalOrders: number
  totalUsers: number
  totalProducts: number
  conversionRate: number
  averageOrderValue: number
}

export interface SalesData {
  date: string
  amount: number
}

export interface ProductPerformance {
  id: string
  name: string
  sales: number
  revenue: number
  views: number
  conversionRate: number
}

export interface AdminNotification {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  read: boolean
  createdAt: Date
}
