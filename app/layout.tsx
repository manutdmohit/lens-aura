import type React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/components/theme-provider';
import { CartProvider } from '@/context/cart-context';
import { SessionProvider } from '@/components/session-provider';
import Navbar from '@/components/navbar';
import Footer from '@/components/footer';
import { Toaster } from 'sonner';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
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
  return (
    <html lang="en">
      <head>
        {/* Add Stripe.js script */}
        <script src="https://js.stripe.com/v3/" async></script>
      </head>
      <body className={inter.className}>
        <SessionProvider>
          <CartProvider>
            <Navbar />
            <main>{children}</main>
            <Footer />
            <Toaster />
          </CartProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
