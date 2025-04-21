"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { AdminSession } from "@/types/admin"
import { mockAdminUsers } from "@/lib/admin-data"

interface AdminAuthContextType {
  session: AdminSession | null
  status: "loading" | "authenticated" | "unauthenticated"
  signIn: (email: string, password: string) => Promise<boolean>
  signOut: () => void
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AdminSession | null>(null)
  const [status, setStatus] = useState<"loading" | "authenticated" | "unauthenticated">("loading")
  const router = useRouter()
  const pathname = usePathname()

  // Check for existing session on mount
  useEffect(() => {
    const storedSession = localStorage.getItem("adminSession")
    if (storedSession) {
      try {
        const parsedSession = JSON.parse(storedSession)
        // Check if session is expired
        if (new Date(parsedSession.expires) > new Date()) {
          setSession(parsedSession)
          setStatus("authenticated")
        } else {
          localStorage.removeItem("adminSession")
          setStatus("unauthenticated")
        }
      } catch (error) {
        console.error("Failed to parse stored session:", error)
        localStorage.removeItem("adminSession")
        setStatus("unauthenticated")
      }
    } else {
      setStatus("unauthenticated")
    }
  }, [])

  // Redirect to login if not authenticated and not already on login page
  useEffect(() => {
    if (status === "unauthenticated" && pathname !== "/admin/login") {
      router.push("/admin/login")
    }
  }, [status, pathname, router])

  const signIn = async (email: string, password: string): Promise<boolean> => {
    // In a real app, you would validate credentials against your backend
    // For this demo, we'll use mock data and accept any password
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000))

      const user = mockAdminUsers.find((u) => u.email === email)
      if (!user) {
        return false
      }

      // Create session with expiry 24 hours from now
      const newSession: AdminSession = {
        user,
        expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
      }

      // Store session in localStorage
      localStorage.setItem("adminSession", JSON.stringify(newSession))
      setSession(newSession)
      setStatus("authenticated")
      return true
    } catch (error) {
      console.error("Sign in error:", error)
      return false
    }
  }

  const signOut = () => {
    localStorage.removeItem("adminSession")
    setSession(null)
    setStatus("unauthenticated")
    router.push("/admin/login")
  }

  return <AdminAuthContext.Provider value={{ session, status, signIn, signOut }}>{children}</AdminAuthContext.Provider>
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error("useAdminAuth must be used within an AdminAuthProvider")
  }
  return context
}
