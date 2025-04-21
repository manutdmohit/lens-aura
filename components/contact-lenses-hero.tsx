"use client"

import { motion } from "framer-motion"

export default function ContactLensesHero() {
  return (
    <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
      {/* Hero image with subtle zoom effect */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 10, ease: "easeOut" }}
      >
        <img
          src="https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=1800&auto=format&fit=crop"
          alt="Person with contact lens"
          className="w-full h-full object-cover"
        />
      </motion.div>

      {/* Content overlay with darker gradient for better text visibility */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-transparent z-5"></div>

      {/* Content overlay */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 md:px-12 lg:px-24">
        <div className="max-w-xl">
          <motion.h1
            className="text-white text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Contact Lenses
          </motion.h1>
          <motion.p
            className="text-white text-lg md:text-xl"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            All your favourite contact lens brands at competitive prices including Acuvue Oasys, Dailies Total 1 and
            Biofinity.
          </motion.p>
        </div>
      </div>
    </section>
  )
}
