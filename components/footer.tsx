'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import {
  ArrowUp,
  Facebook,
  Instagram,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
  Sun,
  Shield,
  Star,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimatedSection from '@/components/animated-section';

const TikTokIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
  </svg>
);

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast.error('Invalid email', {
        description: 'Please enter a valid email address.',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast.success('Thank you for subscribing!', {
      description: "You've been added to our newsletter.",
    });

    setEmail('');
    setIsSubmitting(false);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const socialIconVariants = {
    hover: {
      y: -3,
      scale: 1.1,
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 10,
      },
    },
  };

  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23ffffff%22%20fill-opacity%3D%220.1%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')]"></div>
      </div>

      {/* Main Footer Content */}
      <div className="relative max-w-7xl mx-auto px-6 py-16 sm:px-8 lg:px-12">
        {/* Top Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 mb-16">
          {/* Brand & Newsletter - Spans 4 columns */}
          <AnimatedSection direction="up" delay={0.1} className="lg:col-span-4">
            <div className="space-y-8">
              {/* Brand Section */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gradient-to-r from-amber-400 to-orange-500 rounded-lg">
                    <Sun className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                    Lens Aura
                  </h3>
                </div>
                <p className="text-slate-300 leading-relaxed">
                  Premium sunglasses at surprising prices. Made from premium
                  materials with advanced UV protection and high-quality
                  polarized lenses for ultimate style and protection.
                </p>

                {/* Feature Badges */}
                <div className="flex flex-wrap gap-2 pt-2">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    <Shield className="w-3 h-3 mr-1" />
                    UV Protection
                  </span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                    <Star className="w-3 h-3 mr-1" />
                    Polarized
                  </span>
                </div>
              </div>

              {/* Newsletter Section */}
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white">
                  Stay in the Loop
                </h4>
                <p className="text-sm text-slate-400">
                  Get early access to new collections and exclusive offers.
                </p>
                <form onSubmit={handleNewsletterSubmit} className="space-y-3">
                  <div className="flex">
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-400 rounded-r-none focus:border-amber-500 focus:ring-amber-500/20"
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 rounded-l-none border-0"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 1,
                              ease: 'linear',
                            }}
                            className="w-4 h-4"
                          >
                            ⏳
                          </motion.div>
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  </div>
                  <p className="text-xs text-slate-500">
                    By subscribing, you agree to our Privacy Policy and consent
                    to receive updates.
                  </p>
                </form>
              </div>
            </div>
          </AnimatedSection>

          {/* Navigation Links - Spans 8 columns */}
          <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Shop Links */}
            <AnimatedSection direction="up" delay={0.2}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Sun className="w-5 h-5 text-amber-400" />
                  Shop
                </h4>
                <ul className="space-y-3">
                  {[
                    { href: '/sunglasses', label: 'All Sunglasses' },
                    {
                      href: '/sunglasses/signature',
                      label: 'Signature Collection',
                    },
                    {
                      href: '/sunglasses/essentials',
                      label: 'Essentials Collection',
                    },
                    { href: '/sunglasses/new-arrivals', label: 'New Arrivals' },
                  ].map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="flex items-center text-slate-300 hover:text-amber-400 transition-colors group"
                      >
                        <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="group-hover:translate-x-1 transition-transform">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Help Links */}
            <AnimatedSection direction="up" delay={0.3}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Support
                </h4>
                <ul className="space-y-3">
                  {[
                    { href: '/about', label: 'About Us' },
                    { href: '/contact', label: 'Contact Us' },
                    { href: '/faq', label: 'FAQs' },
                    { href: '/returns', label: 'Returns Policy' },
                  ].map((link, index) => (
                    <li key={index}>
                      <Link
                        href={link.href}
                        className="flex items-center text-slate-300 hover:text-blue-400 transition-colors group"
                      >
                        <ChevronRight className="h-4 w-4 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <span className="group-hover:translate-x-1 transition-transform">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </AnimatedSection>

            {/* Contact Info */}
            <AnimatedSection direction="up" delay={0.4}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Phone className="w-5 h-5 text-green-400" />
                  Contact
                </h4>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <Phone className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">+61 402 564 501</p>
                      <p className="text-sm text-slate-400">Call us anytime</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Mail className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <Link
                        href="mailto:info@lensaura.com.au"
                        className="font-medium text-white hover:text-amber-400 transition-colors"
                      >
                        info@lensaura.com.au
                      </Link>
                      <p className="text-sm text-slate-400">Email support</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-5 w-5 text-slate-400 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-white">Business Hours</p>
                      <p className="text-sm text-slate-400">
                        Mon-Fri: 8:30am - 5:30pm AEST
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Middle Section - Social & Payment */}
        <div className="border-t border-slate-700/50 pt-12 pb-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-8">
            {/* Social Media */}
            <AnimatedSection direction="up" delay={0.5}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white text-center lg:text-left">
                  Follow Our Journey
                </h4>
                <div className="flex justify-center lg:justify-start space-x-4">
                  {[
                    {
                      Icon: Instagram,
                      href: 'https://www.instagram.com/lensaura2025/',
                      label: 'Instagram',
                    },
                    {
                      Icon: Facebook,
                      href: 'https://www.facebook.com/profile.php?id=61576288738117',
                      label: 'Facebook',
                    },
                    {
                      Icon: TikTokIcon,
                      href: 'https://www.tiktok.com/@lensaura2025',
                      label: 'TikTok',
                    },
                  ].map(({ Icon, href, label }, i) => (
                    <motion.div
                      key={i}
                      variants={socialIconVariants}
                      whileHover="hover"
                    >
                      <Link
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={label}
                        className="block p-3 rounded-xl bg-slate-800/50 text-slate-300 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all duration-300 border border-slate-700/50 hover:border-amber-500/50"
                      >
                        <Icon className="h-5 w-5" />
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>

            {/* Payment Methods */}
            <AnimatedSection direction="up" delay={0.6}>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-white text-center lg:text-right">
                  Secure Payment
                </h4>
                <div className="flex flex-wrap justify-center lg:justify-end gap-3">
                  {[
                    {
                      name: 'Visa',
                      image: '/images/cards/visa-card.jpg',
                      alt: 'Visa Card',
                      bgColor: 'bg-blue-600',
                    },
                    {
                      name: 'Mastercard',
                      image: '/images/cards/master-card.jpg',
                      alt: 'Mastercard',
                      bgColor: 'bg-gradient-to-r from-red-600 to-orange-500',
                    },
                    {
                      name: 'American Express',
                      image: '/images/cards/american-express.jpg',
                      alt: 'American Express',
                      bgColor: 'bg-green-600',
                    },
                  ].map((card, i) => (
                    <motion.div
                      key={i}
                      whileHover={{ y: -2, scale: 1.05 }}
                      className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 hover:border-amber-500/50 transition-colors"
                    >
                      <div className="w-12 h-8 rounded overflow-hidden bg-white flex items-center justify-center">
                        <img
                          src={card.image}
                          alt={card.alt}
                          className="w-full h-full object-contain p-1"
                          loading="lazy"
                        />
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </AnimatedSection>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-700/50 pt-8">
          <div className="flex flex-col lg:flex-row justify-between items-center gap-4">
            {/* Copyright */}
            <AnimatedSection direction="up" delay={0.7}>
              <p className="text-sm text-slate-400 text-center lg:text-left">
                © {new Date().getFullYear()} Lens Aura. All rights reserved.
              </p>
            </AnimatedSection>

            {/* Back to Top */}
            <AnimatedSection direction="up" delay={0.8}>
              <motion.button
                onClick={scrollToTop}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center space-x-2 px-4 py-2 rounded-lg bg-slate-800/50 text-slate-300 hover:bg-gradient-to-r hover:from-amber-500 hover:to-orange-500 hover:text-white transition-all duration-300 border border-slate-700/50 hover:border-amber-500/50"
              >
                <ArrowUp className="h-4 w-4" />
                <span className="text-sm font-medium">Back to Top</span>
              </motion.button>
            </AnimatedSection>
          </div>
        </div>
      </div>
    </footer>
  );
}
