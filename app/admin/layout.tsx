'use client';

import type React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { Toaster } from 'sonner';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <SessionProvider>
      <AdminAuthProvider>
        {' '}
        <main>{children}</main>
        <Toaster />
      </AdminAuthProvider>
    </SessionProvider>
  );
}
