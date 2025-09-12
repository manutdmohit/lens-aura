'use client';

import type React from 'react';

import { useState, useEffect, useCallback, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import AnimatedButton from '@/components/animated-button';
import CartDropdown from '@/components/cart-dropdown';
import Image from 'next/image';

// Mega menu data
const signatureSunglassesMenuData = {
  title: 'Signature Sunglasses',
  mainLink: '/sunglasses/signature',
  featuredLinks: [
    {
      title: 'New Arrivals',
      href: '/sunglasses/signature/new-arrivals',
      image: '/images/sunglasses/new-arrivals.jpg',
    },
    {
      title: "Women's",
      href: '/sunglasses/signature/womens',
      image: '/images/sunglasses/womens-premium.jpg',
    },
    {
      title: "Men's",
      href: '/sunglasses/signature/mens',
      image: '/images/sunglasses/mens-premium.jpg',
    },
  ],
  additionalLinks: [
    { title: 'All Glasses', href: '/sunglasses/signature' },
    { title: 'Womens', href: '/sunglasses/signature/womens' },
    { title: 'Mens', href: '/sunglasses/signature/mens' },
  ],
};

const essentialsSunglassesMenuData = {
  title: 'Essentials Sunglasses',
  mainLink: '/sunglasses/essentials',
  featuredLinks: [
    {
      title: 'New Arrivals',
      href: '/sunglasses/essentials/new-arrivals',
      image: '/images/sunglasses/standard-new-arrivals.jpg',
    },
    {
      title: "Women's",
      href: '/sunglasses/essentials/womens',
      image: '/images/sunglasses/womens-standard.jpg',
    },
    {
      title: "Men's",
      href: '/sunglasses/essentials/mens',
      image: '/images/sunglasses/mens-standard.jpg',
    },
  ],
  additionalLinks: [
    { title: 'All Glasses', href: '/sunglasses/essentials' },
    { title: 'Womens', href: '/sunglasses/essentials/womens' },
    { title: 'Mens', href: '/sunglasses/essentials/mens' },
  ],
};

// Array of all menu data for easier iteration
const allMenuData = [
  { id: 'signature-sunglasses', ...signatureSunglassesMenuData },
  { id: 'essentials-sunglasses', ...essentialsSunglassesMenuData },
];

export default function Navbar() {
  // Simplified state management with stable hover control
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<string[]>([]);
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Update the toggleMobileMenu function
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Reset expanded menus and mega menu state when closing the mobile menu
    if (mobileMenuOpen) {
      setExpandedMobileMenus([]);
      setActiveMenu(null);
    }
  };

  const toggleMobileSubmenu = (menuId: string) => {
    setExpandedMobileMenus((prev) => {
      if (prev.includes(menuId)) {
        return prev.filter((id) => id !== menuId);
      } else {
        return [...prev, menuId];
      }
    });
  };

  // Close mega menu when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      setActiveMenu(null);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  // Pure CSS hover navigation item with React state backup
  const renderNavItem = (title: string, href: string, menuId: string) => (
    <div className="h-full flex items-center relative group hover-trigger">
      <div className="h-full flex items-center cursor-pointer">
        <Link
          href={href}
          className={`flex items-center h-full px-4 text-lg relative font-['Poppins'] transition-all duration-200 rounded-t-lg ${
            activeMenu === menuId
              ? 'text-[#8B4513] bg-white shadow-md border-l border-r border-t border-gray-100'
              : 'text-[#592F25] hover:text-[#8B4513] hover:bg-amber-50'
          }`}
          onMouseEnter={() => {
            if (closeTimeoutRef.current) {
              clearTimeout(closeTimeoutRef.current);
              closeTimeoutRef.current = null;
            }
            setActiveMenu(menuId);
          }}
          onMouseLeave={() => {
            closeTimeoutRef.current = setTimeout(() => {
              setActiveMenu(null);
            }, 100);
          }}
          onClick={() => setActiveMenu(null)}
        >
          <span>{title}</span>
          <ChevronDown
            className={`ml-1 h-4 w-4 transition-transform duration-200 ${
              activeMenu === menuId ? 'rotate-180 text-[#8B4513]' : ''
            } group-hover:text-[#8B4513]`}
            aria-hidden="true"
          />
          <span
            className={`absolute -bottom-0 left-0 h-0.5 bg-[#8B4513] transition-all duration-300 ${
              activeMenu === menuId ? 'w-full' : 'w-0 group-hover:w-full'
            }`}
          />
        </Link>
      </div>
    </div>
  );

  // Function to render a simple nav link with improved styling
  const renderNavLink = (title: string, href: string) => (
    <div className="h-full flex items-center">
      <Link
        href={href}
        className="flex items-center h-full px-4 text-lg text-[#592F25] hover:text-[#8B4513] relative group font-['Poppins']"
      >
        {title}
        <span className="absolute -bottom-0 left-0 w-0 h-0.5 bg-[#8B4513] group-hover:w-full transition-all duration-300"></span>
      </Link>
    </div>
  );

  const navVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0 },
  };

  const mobileMenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.4,
        staggerChildren: 0.07,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: {
        duration: 0.3,
        when: 'afterChildren',
        staggerChildren: 0.05,
        staggerDirection: -1,
      },
    },
  };

  const mobileSubmenuVariants = {
    hidden: { opacity: 0, height: 0 },
    visible: {
      opacity: 1,
      height: 'auto',
      transition: {
        duration: 0.3,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.2 },
    },
  };

  // Update mega menu render function with proper event handling
  const renderMegaMenu = (data: typeof signatureSunglassesMenuData) => (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{
        duration: 0.3,
        staggerChildren: 0.05,
      }}
      className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Featured Categories with Images */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-3 lg:gap-2">
          {data.featuredLinks.map((link: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.3,
                delay: index * 0.1,
              }}
            >
              <Link
                href={link.href}
                className="group transform transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg rounded-lg overflow-hidden"
                onClick={() => setActiveMenu(null)}
              >
                <div className="aspect-[4/3] h-24 sm:h-28 lg:h-32 overflow-hidden rounded-lg bg-gray-100 relative">
                  {link.image ? (
                    <img
                      src={link.image || '/placeholder.svg'}
                      alt={link.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center bg-gray-200">
                      <span className="text-gray-500">{link.title}</span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                    <h3 className="text-base font-medium text-white p-2">
                      {link.title}
                    </h3>
                  </div>
                </div>
                <h3 className="mt-2 text-base font-medium group-hover:text-indigo-600 transition-colors duration-200">
                  {link.title}
                </h3>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Additional Links */}
        <div className="space-y-4">
          <h3 className="font-medium text-lg text-gray-900 mb-4">
            Quick Links
          </h3>
          {data.additionalLinks.map((link: any, index: number) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{
                duration: 0.3,
                delay: 0.2 + index * 0.05,
              }}
            >
              <Link
                href={link.href}
                className="block text-base text-gray-700 hover:text-indigo-600 transition-colors duration-200 py-1 border-b border-gray-100 hover:border-indigo-200"
                onClick={() => setActiveMenu(null)}
              >
                {link.title}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Modern mobile menu item with beautiful design
  const renderModernMobileMenuItem = (
    menuData: typeof signatureSunglassesMenuData & { id: string }
  ) => {
    const isExpanded = expandedMobileMenus.includes(menuData.id);

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* Main menu item */}
        <div className="flex items-center justify-between p-3">
          <Link
            href={menuData.mainLink}
            className="flex-grow flex items-center space-x-3"
            onClick={(e) => {
              if (isExpanded) {
                e.preventDefault();
              } else {
                toggleMobileMenu();
              }
            }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-amber-100 to-orange-100 rounded-lg flex items-center justify-center">
              <svg
                className="w-4 h-4 text-amber-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                />
              </svg>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-sm">
                {menuData.title}
              </h3>
              <p className="text-xs text-gray-500">Explore our collection</p>
            </div>
          </Link>
          <button
            type="button"
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
            onClick={() => toggleMobileSubmenu(menuData.id)}
            aria-expanded={isExpanded}
            aria-label={`Toggle ${menuData.title} submenu`}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-5 w-5 text-gray-600" />
            </motion.div>
          </button>
        </div>

        {/* Submenu */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: 'auto',
                transition: {
                  height: { duration: 0.4, ease: 'easeOut' },
                  opacity: { duration: 0.3, delay: 0.1 },
                },
              }}
              exit={{
                opacity: 0,
                height: 0,
                transition: {
                  height: { duration: 0.3 },
                  opacity: { duration: 0.2 },
                },
              }}
              className="bg-gray-50 border-t border-gray-100 overflow-hidden"
            >
              <div className="p-3 space-y-3">
                {/* Featured Categories */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-1.5 h-1.5 bg-amber-400 rounded-full mr-2"></div>
                    Featured Categories
                  </h4>
                  <div className="grid grid-cols-1 gap-1.5">
                    {menuData.featuredLinks.map((link, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.1 + index * 0.05,
                          duration: 0.3,
                        }}
                      >
                        <Link
                          href={link.href}
                          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group"
                          onClick={toggleMobileMenu}
                        >
                          <div className="w-6 h-6 bg-gradient-to-br from-amber-200 to-orange-200 rounded-md flex items-center justify-center group-hover:from-amber-300 group-hover:to-orange-300 transition-all">
                            <ChevronRight className="h-3 w-3 text-amber-700" />
                          </div>
                          <span className="font-medium text-sm text-gray-700 group-hover:text-gray-900">
                            {link.title}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Additional Links */}
                <div>
                  <h4 className="text-xs font-semibold text-gray-700 mb-2 flex items-center">
                    <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mr-2"></div>
                    More Options
                  </h4>
                  <div className="space-y-1">
                    {menuData.additionalLinks.map((link, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.2 + index * 0.05,
                          duration: 0.3,
                        }}
                      >
                        <Link
                          href={link.href}
                          className="flex items-center space-x-2 p-1.5 rounded-md hover:bg-white hover:shadow-sm transition-all duration-200 group"
                          onClick={toggleMobileMenu}
                        >
                          <div className="w-5 h-5 bg-gray-200 rounded-sm flex items-center justify-center group-hover:bg-gray-300 transition-colors">
                            <ChevronRight className="h-2.5 w-2.5 text-gray-600" />
                          </div>
                          <span className="text-xs text-gray-600 group-hover:text-gray-800">
                            {link.title}
                          </span>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <header className="bg-white fixed top-0 left-0 right-0 z-50 w-full">
      {/* Top Bar */}
      <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-red-600 text-sm h-10 text-white font-medium shadow-md relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer md:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex justify-between items-center h-full">
            <div className="flex items-center space-x-4">
              <span className="flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
                Free shipping on orders over $60
              </span>
              <span className="hidden sm:inline">|</span>
              <span className="hidden sm:flex items-center">
                <svg
                  className="w-4 h-4 mr-1"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  ></path>
                </svg>
                30-day returns, read our return policy for more info
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="shadow-sm relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex justify-between items-center h-20 sm:h-24 md:h-20">
            {/* Logo */}
            <div className="hidden md:flex items-center gap-4">
              <Link
                href="/"
                className="flex items-center py-2 space-x-3 sm:space-x-4 relative z-10"
              >
                <div className="flex-shrink-0 ml-1 drop-shadow-[0_0_10px_rgba(242,211,153,0.1)]">
                  <Image
                    src="/images/5f15c03f-d5f5-4e0c-884e-f7942fc6be2a.png"
                    alt="Lens Aura Logo"
                    width={150}
                    height={150}
                    className="h-24 sm:h-28 md:h-20 w-auto object-contain drop-shadow-[0_0_15px_rgba(242,211,153,0.15)]"
                    priority
                  />
                </div>
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center w-full">
              <div className="w-1/4">
                <Link href="/" className="flex items-center">
                  <div className="flex-shrink-0">
                    <Image
                      src="/images/5f15c03f-d5f5-4e0c-884e-f7942fc6be2a.png"
                      alt="Lens Aura Logo"
                      width={120}
                      height={120}
                      className="h-16 object-contain"
                      priority
                    />
                  </div>
                </Link>
              </div>
              <div className="w-2/4 flex justify-center">
                <span className="text-lg font-extrabold text-[#592F25] font-['Playfair_Display']">
                  Lens Aura
                </span>
              </div>
              <div className="w-1/4 flex justify-end items-center space-x-3">
                <div className="relative">
                  <CartDropdown />
                </div>
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                  onClick={toggleMobileMenu}
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle menu"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                  >
                    {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
                  </motion.div>
                </button>
              </div>
            </div>

            {/* Desktop navigation */}
            <motion.nav
              className="hidden md:flex h-full items-center"
              initial="hidden"
              animate="visible"
              variants={navVariants}
            >
              <div
                className="flex h-full space-x-3 lg:space-x-6"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div variants={itemVariants} className="h-full">
                  {renderNavItem(
                    'Signature Sunglasses',
                    '/sunglasses/signature',
                    'signature-sunglasses'
                  )}
                </motion.div>
                <motion.div variants={itemVariants} className="h-full">
                  {renderNavItem(
                    'Essentials Sunglasses',
                    '/sunglasses/essentials',
                    'essentials-sunglasses'
                  )}
                </motion.div>
                <motion.div variants={itemVariants} className="h-full">
                  {renderNavLink('Contact Us', '/contact')}
                </motion.div>
              </div>
            </motion.nav>

            {/* Desktop Cart */}
            <motion.div
              className="hidden md:flex items-center h-full"
              initial="hidden"
              animate="visible"
              variants={navVariants}
            >
              <motion.div
                variants={itemVariants}
                className="h-full flex items-center gap-4"
              >
                <CartDropdown />
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Mega Menu - Now inside the navbar container */}
        <AnimatePresence>
          {activeMenu && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{
                duration: 0.2,
                ease: 'easeOut',
              }}
              className="absolute left-0 w-full z-50 bg-white shadow-xl border-t border-gray-100"
              style={{
                top: '100%',
                marginTop: '0px',
              }}
              onMouseEnter={() => {
                if (closeTimeoutRef.current) {
                  clearTimeout(closeTimeoutRef.current);
                  closeTimeoutRef.current = null;
                }
              }}
              onMouseLeave={() => {
                closeTimeoutRef.current = setTimeout(() => {
                  setActiveMenu(null);
                }, 100);
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {activeMenu === 'signature-sunglasses' &&
                renderMegaMenu(signatureSunglassesMenuData)}
              {activeMenu === 'essentials-sunglasses' &&
                renderMegaMenu(essentialsSunglassesMenuData)}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Mobile menu overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 md:hidden"
              onClick={toggleMobileMenu}
            />

            {/* Mobile menu */}
            <motion.div
              className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 md:hidden flex flex-col"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{
                type: 'spring',
                damping: 25,
                stiffness: 200,
              }}
            >
              {/* Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gradient-to-r from-amber-50 to-orange-50 flex-shrink-0">
                <div className="flex items-center space-x-3">
                  <Image
                    src="/images/lens-aura-updated- logo.jpg"
                    alt="Lens Aura Logo"
                    width={120}
                    height={40}
                    className="h-10 w-auto object-contain"
                    priority
                  />
                  <span className="text-lg font-bold text-gray-900">
                    Lens Aura
                  </span>
                </div>
                <button
                  onClick={toggleMobileMenu}
                  className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X size={24} className="text-gray-600" />
                </button>
              </div>

              {/* Navigation */}
              <div className="flex-1 overflow-y-auto min-h-0">
                <nav className="p-6 space-y-2">
                  {allMenuData.map((menuData, index) => (
                    <motion.div
                      key={menuData.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="mb-4"
                    >
                      {renderModernMobileMenuItem(menuData)}
                    </motion.div>
                  ))}

                  {/* Contact Us */}
                  <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: allMenuData.length * 0.1 }}
                    className="mt-6 pt-4 border-t border-gray-100"
                  >
                    <Link
                      href="/contact"
                      className="flex items-center space-x-2 p-3 rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
                      onClick={toggleMobileMenu}
                    >
                      <div className="w-6 h-6 bg-white/20 rounded-md flex items-center justify-center">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                      <span className="text-sm">Contact Us</span>
                    </Link>
                  </motion.div>
                </nav>
              </div>

              {/* Footer */}
              <div className="p-6 border-t border-gray-100 bg-gray-50 flex-shrink-0">
                <div className="text-center">
                  <p className="text-sm text-gray-500">
                    Free shipping on orders over $60
                  </p>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
