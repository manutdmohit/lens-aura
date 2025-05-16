"use client";

import { motion } from "framer-motion";
import { Glasses } from "lucide-react";
import Link from "next/link";

export default function ContactsComingSoon() {
  return (
    <div className="min-h-screen bg-[#f5f2ee]">
      <section className="relative py-20 mt-28 bg-gradient-to-br from-[#F2D399] via-[#f5f2ee] to-[#e9e4f0]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="flex flex-col items-center"
          >
            <div className="bg-white rounded-full shadow-lg p-6 mb-8">
              <Glasses className="h-16 w-16 text-[#B48E4A]" />
            </div>
            <h1 className="text-5xl font-extrabold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[#B48E4A] via-[#362A59] to-[#F2D399]">
              Contact Lenses<br />Coming Soon
            </h1>
            <p className="text-lg text-gray-700 mb-8 max-w-xl mx-auto">
              We're working hard to bring you a curated selection of premium contact lenses. Stay tuned for a world-class experience in vision care, comfort, and style—coming soon to Lens Aura!
            </p>
            <Link href="/" className="inline-block mt-4 px-8 py-3 rounded-full bg-[#1E1C1D] text-white font-semibold text-lg shadow hover:bg-[#362A59] transition-colors">
              Back to Home
            </Link>
          </motion.div>
        </div>
      </section>
    </div>
  );
} 