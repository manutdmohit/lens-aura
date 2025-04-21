'use client';

import type React from 'react';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowUp,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
  Youtube,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import AnimatedSection from '@/components/animated-section';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid email',
        description: 'Please enter a valid email address.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));

    toast({
      title: 'Thank you for subscribing!',
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
    <footer className="bg-gray-100 text-gray-700">
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
                      className=" text-black rounded-r-none outline-0 focus:outline-0 focus:ring-0"
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
            <ul className="space-y-2">
              <li>
                <Link
                  href="/glasses"
                  className="hover:text-gray-900 transition-colors"
                >
                  Glasses
                </Link>
              </li>
              <li>
                <Link
                  href="/sunglasses"
                  className="hover:text-gray-900 transition-colors"
                >
                  Sunglasses
                </Link>
              </li>
              <li>
                <Link
                  href="/contacts"
                  className="hover:text-gray-900 transition-colors"
                >
                  Contact Lenses
                </Link>
              </li>
              <li>
                <Link
                  href="/accessories"
                  className="hover:text-gray-900 transition-colors"
                >
                  Accessories
                </Link>
              </li>
              <li>
                <Link
                  href="/gift-cards"
                  className="hover:text-gray-900 transition-colors"
                >
                  Gift Cards
                </Link>
              </li>
            </ul>
          </AnimatedSection>

          {/* Column 3: Help */}
          <AnimatedSection direction="up" delay={0.3}>
            <h4 className="text-lg font-medium mb-4">Help</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="hover:text-gray-900 transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/stores"
                  className="hover:text-gray-900 transition-colors"
                >
                  Store Locator
                </Link>
              </li>
              <li>
                <Link
                  href="/health-funds"
                  className="hover:text-gray-900 transition-colors"
                >
                  Health Funds
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="hover:text-gray-900 transition-colors"
                >
                  FAQs
                </Link>
              </li>
              <li>
                <Link
                  href="/returns"
                  className="hover:text-gray-900 transition-colors"
                >
                  Returns Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="hover:text-gray-900 transition-colors"
                >
                  Contact Us
                </Link>
              </li>
            </ul>
          </AnimatedSection>

          {/* Column 4: Contact & Social */}
          <AnimatedSection direction="up" delay={0.4}>
            <div className="space-y-6">
              <div>
                <h4 className="text-lg font-medium mb-4">Contact Us</h4>
                <address className="not-italic space-y-2">
                  <p>1800 GLASSES (1800 452 773)</p>
                  <p>Monday to Friday: 9am - 5pm AEST</p>
                  <p>
                    <Link
                      href="mailto:hello@lensaura.com.au"
                      className="hover:underline"
                    >
                      hello@lensaura.com.au
                    </Link>
                  </p>
                </address>
              </div>

              <div>
                <h4 className="text-lg font-medium mb-4">Follow Us</h4>
                <div className="flex space-x-4">
                  {[Instagram, Facebook, Twitter, Linkedin, Youtube].map(
                    (Icon, i) => (
                      <motion.div
                        key={i}
                        variants={socialIconVariants}
                        whileHover="hover"
                      >
                        <Link
                          href="#"
                          target="_blank"
                          rel="noopener noreferrer"
                          aria-label={Icon.name}
                        >
                          <Icon className="h-5 w-5 hover:text-gray-900 transition-colors" />
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
            className="text-sm flex items-center space-x-1 hover:underline"
          >
            <ArrowUp className="h-4 w-4" />
            <span>Back to Top</span>
          </button>
        </div>

        {/* Copyright */}
        <div className="text-center text-xs text-gray-500 mt-8">
          © {new Date().getFullYear()} Lens Aura. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
