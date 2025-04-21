"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function ContactLensHero() {
  return (
    <section className="relative bg-[#f5f2ee] py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Contact Lenses</h1>
            <p className="text-lg md:text-xl text-gray-700 mb-8">
              All your favourite contact lens brands at competitive prices including Acuvue Oasys, Dailies Total 1 and
              Biofinity. Whether you need daily, bi-weekly, or monthly lenses, we have options to suit your lifestyle
              and vision needs.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button asChild className="bg-black text-white hover:bg-gray-800">
                <Link href="#products">Shop Contact Lenses</Link>
              </Button>
              <Button asChild variant="outline" className="border-black text-black hover:bg-gray-100">
                <Link href="#book">Book an Eye Test</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="aspect-square rounded-2xl overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=1000&auto=format&fit=crop"
                alt="Person holding a contact lens"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -bottom-6 -right-6 bg-white p-4 rounded-lg shadow-lg max-w-xs">
              <p className="font-medium text-sm">
                "Contact lenses have transformed my daily life. I can see clearly without the hassle of glasses."
              </p>
              <p className="text-sm text-gray-500 mt-2">— Sarah, Bailey Nelson Customer</p>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
