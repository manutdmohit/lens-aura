"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import { Home } from "lucide-react"
import { Button } from "@/components/ui/button"
import Navbar from "@/components/navbar"
import Footer from "@/components/footer"

export default function NotFound() {
  return (
    <main className="flex flex-col min-h-screen">
      <Navbar />
      <div className="flex-grow flex items-center justify-center py-16 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full text-center"
        >
          <h1 className="text-8xl font-bold mb-4">404</h1>
          <h2 className="text-2xl font-medium mb-6">Page Not Found</h2>
          <p className="text-gray-600 mb-8">
            The page you're looking for doesn't exist or has been moved. Let's get you back on track.
          </p>
          <div className="space-y-4">
            <Button asChild className="bg-black text-white hover:bg-gray-800 px-8">
              <Link href="/" className="flex items-center justify-center">
                <Home className="mr-2 h-4 w-4" />
                Return Home
              </Link>
            </Button>
            <div>
              <Link href="/glasses" className="text-gray-600 hover:text-black underline underline-offset-4 mr-6">
                Shop Glasses
              </Link>
              <Link href="/sunglasses" className="text-gray-600 hover:text-black underline underline-offset-4">
                Shop Sunglasses
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </main>
  )
}
