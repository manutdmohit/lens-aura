'use client';

import type React from 'react';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/cart-context';
import AnimatedButton from '@/components/animated-button';
import CartDropdown from '@/components/cart-dropdown';
import Image from 'next/image';

// Mega menu data
const glassesMenuData = {
  title: 'Glasses',
  mainLink: '/glasses',
  featuredLinks: [
    {
      title: 'New Arrivals',
      href: '/glasses/new-arrivals',
      image: '/images/glasses/new-arrivals.jpg',
    },
    {
      title: "Women's Glasses",
      href: '/glasses/womens',
      image: '/images/glasses/womens-glasses.jpg',
    },
    {
      title: "Men's Glasses",
      href: '/glasses/mens',
      image: '/images/glasses/mens-glasses.jpg',
    },
  ],
  additionalLinks: [
    { title: 'All Glasses', href: '/glasses' },
    { title: "Men's Glasses", href: '/glasses/mens' },
    { title: "Women's Glasses", href: '/glasses/womens' },
  ],
};

const sunglassesMenuData = {
  title: 'Sunglasses',
  mainLink: '/sunglasses',
  featuredLinks: [
    {
      title: 'New Arrivals',
      href: '/sunglasses/new-arrivals',
      image:
        'https://images.unsplash.com/photo-1511499767150-a48a237f0083?q=80&w=1000&auto=format&fit=crop',
    },
    {
      title: "Women's Sunglasses",
      href: '/sunglasses/womens',
      image:
        'https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=1000&auto=format&fit=crop',
    },
    {
      title: "Men's Sunglasses",
      href: '/sunglasses/mens',
      image: '/images/sunglasses/mens-sunglass.jpg',
    },
  ],
  additionalLinks: [
    { title: 'All Sunglasses', href: '/sunglasses' },
    { title: "Men's Sunglasses", href: '/sunglasses/mens' },
    { title: "Women's Sunglasses", href: '/sunglasses/womens' },
  ],
};

const contactsMenuData = {
  title: 'Contacts',
  mainLink: '/contacts',
  featuredLinks: [
    {
      title: 'Daily Disposable',
      href: '/contacts/daily',
      image: '/images/contact-lens/daily-disposable.jpg',
    },
    {
      title: 'Monthly Lenses',
      href: '/contacts/monthly',
      image: '/images/contact-lens/monthly-disposable.jpg',
    },
    {
      title: 'Colored Contacts',
      href: '/contacts/colored',
      image: '/images/contact-lens/colorful-contacts.jpg',
    },
  ],
  additionalLinks: [
    { title: 'All Contact Lenses', href: '/contacts' },
    { title: 'Contact Lens Care', href: '/contacts/care' },
    { title: 'For Astigmatism', href: '/contacts/astigmatism' },
    { title: 'Multifocal Contacts', href: '/contacts/multifocal' },
    { title: 'Contact Lens Brands', href: '/contacts/brands' },
  ],
};

const accessoriesMenuData = {
  title: 'Accessories',
  mainLink: '/accessories',
  featuredLinks: [
    {
      title: 'New Arrivals',
      href: '/accessories/new-arrivals',
      image: '/images/accessories.jpg',
    },
    {
      title: 'Cases & Storage',
      href: '/accessories/cases',
      image: '/images/accessories/cases.jpg',
    },
    {
      title: 'Cleaning Products',
      href: '/accessories/cleaning',
      image: '/images/accessories/cleaning.jpg',
    },
  ],
  additionalLinks: [
    { title: 'All Accessories', href: '/accessories' },
    { title: 'Cases & Storage', href: '/accessories/cases' },
    { title: 'Cleaning Products', href: '/accessories/cleaning' },
  ],
};

// Array of all menu data for easier iteration
const allMenuData = [
  { id: 'glasses', ...glassesMenuData },
  { id: 'sunglasses', ...sunglassesMenuData },
];

export default function Navbar() {
  // First, let's modify the state management to track both the active menu and whether we're hovering the mega menu
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [isHoveringMegaMenu, setIsHoveringMegaMenu] = useState(false);
  const [expandedMobileMenus, setExpandedMobileMenus] = useState<string[]>([]);
  const { itemCount } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Update the toggleMobileMenu function to also reset the mega menu state
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
    // Reset expanded menus and mega menu state when closing the mobile menu
    if (mobileMenuOpen) {
      setExpandedMobileMenus([]);
      setActiveMenu(null);
      setIsHoveringMegaMenu(false);
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
    const handleClickOutside = (e: MouseEvent) => {
      if (activeMenu && !isHoveringMegaMenu) {
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [activeMenu, isHoveringMegaMenu]);

  // Update the handleMenuMouseEnter function
  const handleMenuMouseEnter = (menuId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveMenu(menuId);
    setIsHoveringMegaMenu(true);
  };

  // Update the handleMenuMouseLeave function to check if we're hovering the mega menu
  const handleMenuMouseLeave = () => {
    // Only close the menu if we're not hovering the mega menu content
    setTimeout(() => {
      if (!isHoveringMegaMenu) {
        setActiveMenu(null);
      }
    }, 100);
  };

  // Add handlers for the mega menu mouse events
  const handleMegaMenuMouseEnter = () => {
    setIsHoveringMegaMenu(true);
  };

  const handleMegaMenuMouseLeave = () => {
    setIsHoveringMegaMenu(false);
    setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  // Update renderNavItem with improved style and animation
  const renderNavItem = (title: string, href: string, menuId: string) => (
    <div
      className="h-full flex items-center"
      onMouseEnter={(e) => handleMenuMouseEnter(menuId, e)}
      onMouseLeave={handleMenuMouseLeave}
    >
      <Link
        href={href}
        className="flex items-center h-full px-4 text-lg text-[#592F25] hover:text-[#8B4513] relative group font-['Poppins']"
      >
        <span>{title}</span>
        <ChevronDown
          className={`ml-1 h-4 w-4 transition-transform ${
            activeMenu === menuId ? 'rotate-180 text-[#8B4513]' : ''
          } group-hover:text-[#8B4513]`}
          aria-hidden="true"
        />
        <span className="absolute -bottom-0 left-0 w-0 h-0.5 bg-[#8B4513] group-hover:w-full transition-all duration-300"></span>
      </Link>
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

  // Update mega menu render function for better visual style
  const renderMegaMenu = (data: typeof glassesMenuData) => (
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
          {data.featuredLinks.map((link, index) => (
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
          {data.additionalLinks.map((link, index) => (
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
              >
                {link.title}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );

  // Function to render mobile menu item with submenu
  const renderMobileMenuItem = (
    menuData: typeof glassesMenuData & { id: string }
  ) => {
    const isExpanded = expandedMobileMenus.includes(menuData.id);

    return (
      <div
        key={menuData.id}
        className="border-b border-gray-700 last:border-b-0"
      >
        <div className="flex items-center justify-between">
          <Link
            href={menuData.mainLink}
            className="flex-grow px-3 py-3 text-base font-medium text-white hover:text-indigo-300"
            onClick={(e) => {
              // Prevent navigation if submenu toggle is clicked
              if (isExpanded) {
                e.preventDefault();
              }
            }}
          >
            {menuData.title}
          </Link>
          <button
            type="button"
            className="p-3 text-gray-300 hover:text-[#F2D399] focus:outline-none"
            onClick={() => toggleMobileSubmenu(menuData.id)}
            aria-expanded={isExpanded}
            aria-label={`Toggle ${menuData.title} submenu`}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="h-5 w-5" aria-hidden="true" />
            </motion.div>
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{
                opacity: 1,
                height: 'auto',
                transition: {
                  height: { duration: 0.4 },
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
              className="bg-gray-800 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-4">
                {/* Featured Categories */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                >
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    Featured Categories
                  </h4>
                  <ul className="space-y-2">
                    {menuData.featuredLinks.map((link, index) => (
                      <motion.li
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
                          className="flex items-center py-2 text-base text-gray-300 hover:text-[#F2D399]"
                          onClick={toggleMobileMenu}
                        >
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                          {link.title}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>

                {/* Additional Links */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.3 }}
                >
                  <h4 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-2">
                    More Options
                  </h4>
                  <ul className="space-y-2">
                    {menuData.additionalLinks.map((link, index) => (
                      <motion.li
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{
                          delay: 0.3 + index * 0.05,
                          duration: 0.3,
                        }}
                      >
                        <Link
                          href={link.href}
                          className="flex items-center py-2 text-base text-gray-300 hover:text-[#F2D399]"
                          onClick={toggleMobileMenu}
                        >
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-500" />
                          {link.title}
                        </Link>
                      </motion.li>
                    ))}
                  </ul>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <header className="bg-white">
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
                Free shipping on orders over $50
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
      <div className=" shadow-sm relative">
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
                  {/* Lens Aura */}
                </span>
              </div>
              <div className="w-1/4 flex justify-end items-center space-x-4">
                <CartDropdown />
                <button
                  type="button"
                  className="inline-flex items-center justify-center p-2 rounded-lg text-[#592F25] hover:bg-gray-100 hover:text-[#8B4513] transition-colors font-['Poppins']"
                  onClick={toggleMobileMenu}
                  aria-expanded={mobileMenuOpen}
                  aria-label="Toggle menu"
                >
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: mobileMenuOpen ? 90 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
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
                  {renderNavItem('Glasses', '/glasses', 'glasses')}
                </motion.div>
                <motion.div variants={itemVariants} className="h-full">
                  {renderNavItem('Sunglasses', '/sunglasses', 'sunglasses')}
                </motion.div>
                <motion.div variants={itemVariants} className="h-full">
                  {renderNavLink('Accessories', '/accessories')}
                </motion.div>
                <motion.div variants={itemVariants} className="h-full">
                  {renderNavLink('Contacts', '/contacts')}
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
      </div>

      {/* Mega Menu */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{
              duration: 0.3,
              ease: 'easeOut',
            }}
            className="absolute left-0 w-full z-50 bg-white shadow-lg border-t border-gray-100"
            onMouseEnter={handleMegaMenuMouseEnter}
            onMouseLeave={handleMegaMenuMouseLeave}
            onClick={(e) => e.stopPropagation()}
          >
            {activeMenu === 'glasses' && renderMegaMenu(glassesMenuData)}
            {activeMenu === 'sunglasses' && renderMegaMenu(sunglassesMenuData)}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="md:hidden overflow-hidden"
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={mobileMenuVariants}
          >
            <div className="bg-[#2A2829] divide-y divide-gray-700">
              {allMenuData.map((menuData) => renderMobileMenuItem(menuData))}
              <motion.div
                variants={itemVariants}
                className="border-b border-gray-700 last:border-b-0"
              >
                <Link
                  href="/accessories"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-[#F2D399] hover:bg-gray-800 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Accessories
                </Link>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="border-b border-gray-700 last:border-b-0"
              >
                <Link
                  href="/contacts"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-[#F2D399] hover:bg-gray-800 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Contacts
                </Link>
              </motion.div>
              <motion.div
                variants={itemVariants}
                className="border-b border-gray-700 last:border-b-0"
              >
                <Link
                  href="/contact"
                  className="block px-4 py-3 text-base font-medium text-white hover:text-[#F2D399] hover:bg-gray-800 transition-colors"
                  onClick={toggleMobileMenu}
                >
                  Contact Us
                </Link>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
