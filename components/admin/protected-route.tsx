'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/admin-auth-context';
import { hasPermission } from '@/lib/rbac';

interface ProtectedRouteProps {
  children: ReactNode;
  resource?: string;
  action?: 'create' | 'read' | 'update' | 'delete' | 'manage';
}

export default function ProtectedRoute({
  children,
  resource,
  action = 'read',
}: ProtectedRouteProps) {
  const { session, status } = useAdminAuth();
  const router = useRouter();

  useEffect(() => {
    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      router.push('/admin/login');
      return;
    }

    // If authenticated but doesn't have permission, redirect to dashboard
    if (
      status === 'authenticated' &&
      session?.user &&
      resource &&
      !hasPermission(session.user.role, resource, action)
    ) {
      router.push('/admin');
    }
  }, [status, session, resource, action, router]);

  // Show nothing while checking authentication
  if (status === 'loading') {
    return null;
  }

  // If authenticated and has permission (or no permission check required), show children
  if (
    status === 'authenticated' &&
    (!resource ||
      (session?.user && hasPermission(session.user.role, resource, action)))
  ) {
    return <>{children}</>;
  }

  // Otherwise show nothing
  return null;
}
