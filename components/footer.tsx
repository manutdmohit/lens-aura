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
  Music,
  ChevronRight,
  Phone,
  Mail,
  MapPin,
  Clock,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import AnimatedSection from '@/components/animated-section';

const TikTokIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="currentColor"
    className="h-5 w-5"
  >
    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
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
      transition: {
        type: 'spring',
        stiffness: 500,
        damping: 10,
      },
    },
  };

  return (
    <footer className="bg-[#F2D399] text-gray-800">
      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
          {/* Column 1: About & Newsletter */}
          <AnimatedSection direction="up" delay={0.1}>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold mb-4">Lens Aura</h3>
                <p className="text-sm">
                  Premium eyewear at surprising prices. Designed in-house,
                  handcrafted from quality materials.
                </p>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-3">
                  Join Our Newsletter
                </h4>
                <form onSubmit={handleNewsletterSubmit} className="space-y-2">
                  <div className="flex">
                    <Input
                      type="email"
                      placeholder="Your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="text-gray-800 rounded-r-none outline-0 focus:outline-0 focus:ring-0"
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        type="submit"
                        disabled={isSubmitting}
                        className="bg-gray-800 hover:bg-gray-700 rounded-l-none"
                      >
                        {isSubmitting ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              repeat: Number.POSITIVE_INFINITY,
                              duration: 1,
                              ease: 'linear',
                            }}
                          >
                            ...
                          </motion.div>
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                    </motion.div>
                  </div>
                  <p className="text-xs">
                    By subscribing, you agree to our Privacy Policy and consent
                    to receive updates.
                  </p>
                </form>
              </div>
            </div>
          </AnimatedSection>

          {/* Column 2: Shop */}
          <AnimatedSection direction="up" delay={0.2}>
            <h4 className="text-lg font-medium mb-4">Shop</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/glasses"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Glasses
                </Link>
              </li>
              <li>
                <Link
                  href="/sunglasses"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Sunglasses
                </Link>
              </li>
              <li>
                <Link
                  href="/contacts"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Contact Lenses
                </Link>
              </li>
              <li>
                <Link
                  href="/accessories"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Accessories
                </Link>
              </li>
            </ul>
          </AnimatedSection>

          {/* Column 3: Help */}
          <AnimatedSection direction="up" delay={0.3}>
            <h4 className="text-lg font-medium mb-4">Help</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/about"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Contact Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="flex items-center hover:text-gray-900 transition-colors"
                >
                  <ChevronRight className="h-4 w-4 mr-2" />
                  Returns Policy
                </Link>
              </li>
            </ul>
          </AnimatedSection>

          {/* Column 4: Contact & Social */}
          <AnimatedSection direction="up" delay={0.4}>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium mb-4">Contact Us</h4>
                <div className="space-y-3">
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium">+61 0402 564 501</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock className="h-5 w-5 mr-3 mt-0.5" />
                    <div>
                      <p className="font-medium">Business Hours</p>
                      <p className="text-sm">Monday to Friday: 9am - 5pm AEST</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 mr-3 mt-0.5" />
                    <Link
                      href="mailto:info@lensaura.com.au"
                      className="hover:text-gray-900 transition-colors"
                    >
                      info@lensaura.com.au
                    </Link>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {[
                    { Icon: Instagram, href: 'https://www.instagram.com/lensaura2025/' },
                    { Icon: Facebook, href: 'https://www.facebook.com/profile.php?id=61576288738117' },
                    { Icon: TikTokIcon, href: 'https://www.tiktok.com/@lensaura2025', label: 'TikTok' }
                  ].map(
                    ({ Icon, href, label }, i) => (
                      <motion.div
                        key={i}
                        variants={socialIconVariants}
                        whileHover="hover"
                      >
                        <Link
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={label || Icon.name}
                          className="block p-2 rounded-full bg-gray-800 text-white hover:bg-gray-700 transition-colors"
                        >
                          <Icon className="h-5 w-5" />
                        </Link>
                      </motion.div>
                    )
                  )}
                </div>
              </div>
            </div>
          </AnimatedSection>
        </div>

        {/* Payment Methods */}
        <AnimatedSection
          direction="up"
          delay={0.5}
          className="mt-12 pt-8 border-t border-gray-800"
        >
          <h4 className="text-sm font-medium mb-4">Payment Methods</h4>
          <div className="flex flex-wrap gap-4">
            {['Credit Card', 'Visa', 'Mastercard', 'PayPal'].map((alt, i) => (
              <motion.img
                key={i}
                whileHover={{ y: -3 }}
                src="https://cdn.jsdelivr.net/gh/stephenhutchings/typicons.font@ba9ee13f4c5d69f3cc26f23e7d33a83349fdb94e/src/svg/credit-card.svg"
                alt={alt}
                className="h-8 w-8 bg-white p-1 rounded"
              />
            ))}
          </div>
        </AnimatedSection>

        {/* Back to Top */}
        <div className="flex justify-center mt-8">
          <button
            onClick={scrollToTop}
            className="text-sm flex items-center space-x-1 hover:text-gray-900 transition-colors"
          >
            <ArrowUp className="h-4 w-4" />
            <span>Back to Top</span>
          </button>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-700 mt-8">
          © {new Date().getFullYear()} Lens Aura. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
