"use client"

import Link from "next/link"
import { motion } from "framer-motion"
import AnimatedButton from "@/components/animated-button"

export default function HeroSection() {
  return (
    <section className="relative h-[80vh] min-h-[600px] overflow-hidden">
      {/* Hero image with subtle zoom effect */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
      >
        <img
          src="https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1800&auto=format&fit=crop"
          alt="Person wearing sunglasses at the beach"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Content overlay with darker gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-transparent z-5"></div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-24">
        <div className="max-w-xl">
          <motion.p
            className="text-white text-lg md:text-xl mb-2"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            End of Summer Sale
          </motion.p>
          <motion.h1
            className="text-white text-5xl md:text-7xl font-bold mb-8"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            15% Off Glasses & Sunnies
          </motion.h1>
          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <AnimatedButton asChild className="bg-black text-white hover:bg-gray-800">
              <Link href="/glasses">Shop Glasses</Link>
            </AnimatedButton>
            <AnimatedButton asChild className="bg-black text-white hover:bg-gray-800">
              <Link href="/sunglasses">Shop Sun</Link>
            </AnimatedButton>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
