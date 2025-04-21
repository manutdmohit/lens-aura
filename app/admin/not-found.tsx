"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import AdminLayout from "@/components/admin/admin-layout"
import { useAdminAuth } from "@/context/admin-auth-context"

export default function AdminNotFound() {
  const { status } = useAdminAuth()

  // If not authenticated, the AdminLayout will handle the redirect to login
  if (status !== "authenticated") {
    return null
  }

  return (
    <AdminLayout>
      <div className="flex items-center justify-center min-h-[80vh]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="border-2 border-gray-200 shadow-lg">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-4">
                <div className="h-20 w-20 rounded-full bg-gray-100 flex items-center justify-center">
                  <AlertCircle className="h-10 w-10 text-gray-500" />
                </div>
              </div>
              <CardTitle className="text-3xl font-bold">404</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <h2 className="text-xl font-medium">Page Not Found</h2>
              <p className="text-gray-500">
                The page you're looking for doesn't exist or you don't have permission to access it.
              </p>
            </CardContent>
            <CardFooter className="flex justify-center pb-6">
              <Button asChild className="bg-black text-white hover:bg-gray-800">
                <Link href="/admin" className="flex items-center">
                  <Home className="mr-2 h-4 w-4" />
                  Back to Dashboard
                </Link>
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    </AdminLayout>
  )
}
