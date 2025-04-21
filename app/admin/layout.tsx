"use client"

import type React from "react"

import { AdminAuthProvider } from "@/context/admin-auth-context"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminAuthProvider>{children}</AdminAuthProvider>
}
