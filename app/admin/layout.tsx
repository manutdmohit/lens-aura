// This directive ensures that this file is treated as a client component in Next.js
'use client';

import type React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { Toaster } from 'sonner';

/**
 * AdminLayout is a layout component for the admin section.
 *
 * @param {Object} props - The props for the component.
 * @param {React.ReactNode} props.children - The content to be displayed within the layout.
 * This is typically the admin page content.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminAuthProvider>
        <main>{children}</main>
        <Toaster />
      </AdminAuthProvider>
    </SessionProvider>
  );
}
