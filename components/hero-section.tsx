'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import AnimatedButton from '@/components/animated-button';
import {
  Sparkles,
  Glasses,
  Sun,
  ArrowRight,
  BadgePercent,
  ShoppingBag,
} from 'lucide-react';
import Image from 'next/image';

export default function HeroSection() {
  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 60 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: 0.1 * i,
        duration: 0.7,
        ease: 'easeOut',
      },
    }),
  };

  return (
    <section className="relative h-[90vh] min-h-[600px] md:min-h-[700px] overflow-hidden">
      {/* Background video with subtle continuous zoom */}
      <motion.div
        className="absolute inset-0 z-0"
        initial={{ scale: 1.1 }}
        animate={{ scale: [1.1, 1, 1.05, 1] }}
        transition={{ duration: 30, ease: 'easeInOut', repeat: Infinity }}
      >
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
          poster="/images/about-us.jpg"
        >
          <source src="/about-us.mp4" type="video/mp4" />
          {/* Fallback image if video fails to load */}
          <Image
            src="/images/about-us.jpg"
            alt="glasses, sunglasses, and contact lenses"
            className="w-full h-full object-cover"
            width={1800}
            height={1200}
            priority
          />
        </video>
      </motion.div>

      {/* Gradient overlays with animated entrance */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent z-5"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.5 }}
      ></motion.div>

      {/* Animated accent element */}
      <motion.div
        className="absolute bottom-0 left-0 w-full h-1/4 md:h-1/3 z-5 bg-gradient-to-t from-teal-900/40 to-transparent"
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1, delay: 0.5 }}
      ></motion.div>

      {/* Content container */}
      <div className="relative z-10 h-full flex flex-col justify-center px-6 sm:px-10 md:px-16 lg:px-24">
        <div className="max-w-2xl">
          {/* Tagline */}
          <motion.div
            className="flex items-center gap-2 text-amber-300 font-medium text-lg md:text-xl mb-3"
            custom={1}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <Sparkles className="h-5 w-5" />
            <span className="font-serif italic">Your Vision, Elevated</span>
          </motion.div>

          {/* Main heading */}
          <motion.h1
            className="font-display text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold mb-4 tracking-tight"
            custom={2}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <span className="block">Discover Style</span>
            <span className="block mt-1 bg-clip-text text-transparent bg-gradient-to-r from-amber-300 via-yellow-300 to-teal-300">
              Beyond Vision
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            className="font-sans text-teal-100 text-base md:text-lg max-w-lg mb-8"
            custom={3}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            Embrace the perfect blend of fashion and functionality with our
            signature eyewear collection. Designed for those who appreciate
            quality craftsmanship and distinctive style.
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-wrap gap-4"
            custom={4}
            initial="hidden"
            animate="visible"
            variants={fadeInUp}
          >
            <AnimatedButton
              asChild
              className="bg-amber-400 text-gray-900 hover:bg-amber-300 font-medium gap-2 py-6"
            >
              <Link href="/sunglasses/signature">
                <Sun className="h-5 w-5" />
                <span>Signature Sunglasses</span>
              </Link>
            </AnimatedButton>
            <AnimatedButton
              asChild
              className="bg-teal-600 text-white hover:bg-teal-500 font-medium gap-2 py-6"
            >
              <Link href="/sunglasses/essentials">
                <Sun className="h-5 w-5" />
                <span>Essentials Sunglasses</span>
              </Link>
            </AnimatedButton>
          </motion.div>
        </div>
      </div>

      {/* Decorative floating elements (only visible on larger screens) */}
      <div className="absolute right-10 bottom-10 hidden md:block z-10">
        <motion.div
          className="w-32 h-32 rounded-full border border-amber-400/30 backdrop-blur-sm"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 0.6, x: [0, -15, 0, 15, 0] }}
          transition={{
            delay: 1.5,
            duration: 10,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </div>
      <div className="absolute left-1/4 top-1/4 hidden lg:block z-5">
        <motion.div
          className="w-16 h-16 rounded-full border border-teal-400/20 backdrop-blur-sm"
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 0.4, y: [0, 20, 0, -20, 0] }}
          transition={{
            delay: 1.7,
            duration: 12,
            ease: 'easeInOut',
            repeat: Infinity,
          }}
        />
      </div>
    </section>
  );
}
