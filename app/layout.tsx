'use client';

import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { CartProvider } from '@/context/cart-context';
import { SessionProvider } from '@/components/session-provider';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Toaster } from 'sonner';
import { usePathname } from 'next/navigation';

const inter = Inter({ subsets: ['latin'] });

const metadata: Metadata = {
  title: 'Lens Aura | Premium Eyewear at Surprising Prices',
  description:
    'Shop prescription glasses, sunglasses and contact lenses. Book an eye test online.',
  generator: 'v0.dev',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <html lang="en">
      <head>
        <script src="https://js.stripe.com/v3/" async></script>
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <CartProvider>
            {!isAdminRoute && <Navbar />}
            <main>{children}</main>
            {!isAdminRoute && <Footer />}
            <Toaster />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
