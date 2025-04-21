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
      image:
        'https://images.unsplash.com/photo-1591076482161-42ce6da69f67?q=80&w=1000&auto=format&fit=crop',
    },
    {
      title: "Women's Glasses",
      href: '/glasses/womens',
      image:
        'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?q=80&w=1000&auto=format&fit=crop',
    },
    {
      title: "Men's Glasses",
      href: '/glasses/mens',
      image:
        'https://images.unsplash.com/photo-1577744486770-2f42d1e38f29?q=80&w=1000&auto=format&fit=crop',
    },
  ],
  additionalLinks: [
    { title: 'All Glasses', href: '/glasses' },
    { title: 'Bestsellers', href: '/glasses/bestsellers' },
    { title: 'Kids Glasses', href: '/glasses/kids' },
    { title: 'Multifocals', href: '/glasses/multifocals' },
    { title: 'Gifts & Accessories', href: '/glasses/accessories' },
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
      image:
        'https://images.unsplash.com/photo-1625591339971-4c9a87a66871?q=80&w=1000&auto=format&fit=crop',
    },
  ],
  additionalLinks: [
    { title: 'All Sunglasses', href: '/sunglasses' },
    { title: 'Bestsellers', href: '/sunglasses/bestsellers' },
    { title: 'Polarized', href: '/sunglasses/polarized' },
    { title: 'Prescription Sunglasses', href: '/sunglasses/prescription' },
    { title: 'Gifts & Accessories', href: '/sunglasses/accessories' },
  ],
};

const contactsMenuData = {
  title: 'Contacts',
  mainLink: '/contacts',
  featuredLinks: [
    {
      title: 'Daily Disposable',
      href: '/contacts/daily',
      image:
        'https://images.unsplash.com/photo-1616296425622-4560a2ad2b82?q=80&w=1000&auto=format&fit=crop',
    },
    {
      title: 'Monthly Lenses',
      href: '/contacts/monthly',
      image:
        'https://images.unsplash.com/photo-1583195764036-6dc248ac07d9?q=80&w=1000&auto=format&fit=crop',
    },
    {
      title: 'Colored Contacts',
      href: '/contacts/colored',
      image:
        'https://images.unsplash.com/photo-1584036553516-bf83210aa16c?q=80&w=1000&auto=format&fit=crop',
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

// Array of all menu data for easier iteration
const allMenuData = [
  { id: 'glasses', ...glassesMenuData },
  { id: 'sunglasses', ...sunglassesMenuData },
  { id: 'contacts', ...contactsMenuData },
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
  };

  // Update the handleMenuMouseLeave function to check if we're hovering the mega menu
  const handleMenuMouseLeave = () => {
    // Only close the menu if we're not hovering the mega menu content
    if (!isHoveringMegaMenu) {
      setActiveMenu(null);
    }
  };

  // Add handlers for the mega menu mouse events
  const handleMegaMenuMouseEnter = () => {
    setIsHoveringMegaMenu(true);
  };

  const handleMegaMenuMouseLeave = () => {
    setIsHoveringMegaMenu(false);
    setActiveMenu(null);
  };

  // Update the renderNavItem function to use our new hover logic
  const renderNavItem = (title: string, href: string, menuId: string) => (
    <div
      className="h-full"
      onMouseEnter={(e) => handleMenuMouseEnter(menuId, e)}
      onMouseLeave={handleMenuMouseLeave}
    >
      <Link
        href={href}
        className="flex items-center h-full px-4 text-base text-gray-700 hover:text-black"
      >
        <span>{title}</span>
        <ChevronDown
          className={`ml-1 h-4 w-4 transition-transform ${
            activeMenu === menuId ? 'rotate-180' : ''
          }`}
          aria-hidden="true"
        />
      </Link>
    </div>
  );

  // Function to render a simple nav link
  const renderNavLink = (title: string, href: string) => (
    <Link
      href={href}
      className="flex items-center h-full px-4 text-base text-gray-700 hover:text-black"
    >
      {title}
    </Link>
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
        duration: 0.3,
        staggerChildren: 0.05,
        delayChildren: 0.1,
      },
    },
    exit: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3 },
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

  // Function to render the mega menu content
  const renderMegaMenu = (data: typeof glassesMenuData) => (
    <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Featured Categories with Images */}
        <div className="md:col-span-3 grid grid-cols-1 sm:grid-cols-3 gap-6">
          {data.featuredLinks.map((link, index) => (
            <Link key={index} href={link.href} className="group">
              <div className="aspect-square overflow-hidden rounded-lg bg-gray-100">
                {link.image ? (
                  <img
                    src={link.image || '/placeholder.svg'}
                    alt={link.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                ) : (
                  <div className="h-full w-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500">{link.title}</span>
                  </div>
                )}
              </div>
              <h3 className="mt-3 text-lg font-medium">{link.title}</h3>
              {/* {link.description && (
                <p className="mt-1 text-sm text-gray-500">{link.description}</p>
              )} */}
            </Link>
          ))}
        </div>

        {/* Additional Links */}
        <div className="space-y-4">
          {data.additionalLinks.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="block text-base hover:text-black hover:underline underline-offset-4"
            >
              {link.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );

  // Function to render mobile menu item with submenu
  const renderMobileMenuItem = (
    menuData: typeof glassesMenuData & { id: string }
  ) => {
    const isExpanded = expandedMobileMenus.includes(menuData.id);

    return (
      <div
        key={menuData.id}
        className="border-b border-gray-200 last:border-b-0"
      >
        <div className="flex items-center justify-between">
          <Link
            href={menuData.mainLink}
            className="flex-grow px-3 py-3 text-base font-medium text-gray-700 hover:text-gray-900"
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
            className="p-3 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={() => toggleMobileSubmenu(menuData.id)}
            aria-expanded={isExpanded}
            aria-label={`Toggle ${menuData.title} submenu`}
          >
            <ChevronDown
              className={`h-5 w-5 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              aria-hidden="true"
            />
          </button>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={mobileSubmenuVariants}
              className="bg-gray-50 overflow-hidden"
            >
              <div className="px-4 py-3 space-y-4">
                {/* Featured Categories */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    Featured Categories
                  </h4>
                  <ul className="space-y-2">
                    {menuData.featuredLinks.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="flex items-center py-2 text-base text-gray-700 hover:text-black"
                          onClick={toggleMobileMenu}
                        >
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-400" />
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Additional Links */}
                <div>
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                    More Options
                  </h4>
                  <ul className="space-y-2">
                    {menuData.additionalLinks.map((link, index) => (
                      <li key={index}>
                        <Link
                          href={link.href}
                          className="flex items-center py-2 text-base text-gray-700 hover:text-black"
                          onClick={toggleMobileMenu}
                        >
                          <ChevronRight className="h-4 w-4 mr-2 text-gray-400" />
                          {link.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 bg-white border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}

          <Link href="/">
            <Image
              src="/images/logo2.png"
              alt="logo"
              width={150}
              height={100}
              priority
            />
          </Link>

          <motion.div
            className="flex-shrink-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/"
              className="text-2xl md:text-3xl font-serif font-bold"
            >
              Lens Aura
            </Link>

            {/* <div className="px-3 py-3 border-b border-gray-200"> */}
            {/* </div> */}
          </motion.div>
          <div className="md:hidden">
            <CartDropdown />
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700"
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

          {/* Desktop navigation */}
          <motion.nav
            className="hidden md:flex h-full items-center relative"
            initial="hidden"
            animate="visible"
            variants={navVariants}
          >
            <div className="flex h-full" onClick={(e) => e.stopPropagation()}>
              <motion.div variants={itemVariants} className="h-full">
                {renderNavItem('Glasses', '/glasses', 'glasses')}
              </motion.div>
              <motion.div variants={itemVariants} className="h-full">
                {renderNavItem('Sunglasses', '/sunglasses', 'sunglasses')}
              </motion.div>
              <motion.div variants={itemVariants} className="h-full">
                {renderNavItem('Contacts', '/contacts', 'contacts')}
              </motion.div>
              <motion.div variants={itemVariants} className="h-full">
                {renderNavLink('Health Funds', '/health-funds')}
              </motion.div>
              <motion.div variants={itemVariants} className="h-full">
                {renderNavLink('Stores', '/stores')}
              </motion.div>
            </div>
          </motion.nav>

          {/* Cart and Book button */}
          <motion.div
            className="hidden md:flex items-center space-x-4"
            initial="hidden"
            animate="visible"
            variants={navVariants}
          >
            <motion.div variants={itemVariants}>
              <CartDropdown />
            </motion.div>
            <motion.div variants={itemVariants}>
              <AnimatedButton className="bg-black text-white hover:bg-gray-800">
                Book An Eye Test
              </AnimatedButton>
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* Mega Menu - Positioned from the leftmost side of the navigation */}
      <AnimatePresence>
        {activeMenu && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 w-full z-50 bg-white shadow-lg border-t border-gray-200"
            onMouseEnter={handleMegaMenuMouseEnter}
            onMouseLeave={handleMegaMenuMouseLeave}
          >
            {activeMenu === 'glasses' && renderMegaMenu(glassesMenuData)}
            {activeMenu === 'sunglasses' && renderMegaMenu(sunglassesMenuData)}
            {activeMenu === 'contacts' && renderMegaMenu(contactsMenuData)}
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
            <div className="bg-white divide-y divide-gray-200">
              {/* Render menu items with submenus */}
              {allMenuData.map((menuData) => renderMobileMenuItem(menuData))}

              {/* Simple menu items without submenus */}
              <Link
                href="/health-funds"
                className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-gray-900 border-b border-gray-200"
                onClick={toggleMobileMenu}
              >
                Health Funds
              </Link>
              <Link
                href="/stores"
                className="block px-3 py-3 text-base font-medium text-gray-700 hover:text-gray-900 border-b border-gray-200"
                onClick={toggleMobileMenu}
              >
                Stores
              </Link>

              <div className="p-3">
                <Button className="w-full bg-black text-white hover:bg-gray-800">
                  Book An Eye Test
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
