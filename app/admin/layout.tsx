// This directive ensures that this file is treated as a client component in Next.js
'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { Toaster } from 'sonner';
import { Loader2 } from 'lucide-react';

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
  const [isClient, setIsClient] = useState(false);

  // This ensures hydration errors are avoided
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <SessionProvider refetchInterval={5} refetchOnWindowFocus={true}>
      <AdminAuthProvider>
        {isClient ? (
          <main>{children}</main>
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}
        <Toaster />
      </AdminAuthProvider>
    </SessionProvider>
  );
}
