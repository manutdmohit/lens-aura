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
import { cn } from '@/lib/utils';

const inter = Inter({ subsets: ['latin'] });

const metadata: Metadata = {
  title: 'Lens Aura | Premium Eyewear at Surprising Prices',
  description:
    'Shop prescription glasses, sunglasses and contact lenses. Book an eye test online.',
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
      <body
        className={cn(
          'min-h-screen bg-background font-sans antialiased',
          inter.className
        )}
        suppressHydrationWarning
      >
        <SessionProvider>
          <CartProvider>
            {!isAdminRoute && <Navbar />}
            <main className="min-h-screen">{children}</main>
            {!isAdminRoute && <Footer />}
            <Toaster />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
