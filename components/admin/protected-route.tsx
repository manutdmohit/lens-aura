'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminAuth } from '@/context/admin-auth-context';
import { hasPermission } from '@/lib/rbac';
import { Loader2 } from 'lucide-react';
import type { UserRole } from '@/types/admin';

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
  const { session, status, isInitialized } = useAdminAuth();
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  // Check if a role is valid
  const isValidRole = (role: string): role is UserRole => {
    return ['admin', 'editor', 'viewer'].includes(role);
  };

  // Debug logging
  useEffect(() => {
    console.log('ProtectedRoute status:', status);
    console.log('ProtectedRoute session:', session);
    console.log('ProtectedRoute isInitialized:', isInitialized);
  }, [status, session, isInitialized]);

  useEffect(() => {
    // Wait for authentication to initialize
    if (!isInitialized) return;

    // If not authenticated, redirect to login
    if (status === 'unauthenticated') {
      console.log('ProtectedRoute: User not authenticated, redirecting to login');
      window.location.href = '/admin/login';
      return;
    }

    // If session is available but not authenticated yet, wait
    if (status === 'loading') {
      return;
    }

    // If authenticated but doesn't have permission, redirect to dashboard
    if (
      status === 'authenticated' &&
      session?.user &&
      resource
    ) {
      const userRole = session.user.role;
      
      if (!isValidRole(userRole)) {
        console.log('ProtectedRoute: Invalid role, redirecting to dashboard');
        window.location.href = '/admin';
        return;
      }
      
      if (!hasPermission(userRole as UserRole, resource, action)) {
        console.log('ProtectedRoute: Insufficient permissions, redirecting to dashboard');
        window.location.href = '/admin';
        return;
      }
    }

    // If authenticated and has permission, set authorized to true
    if (
      status === 'authenticated' &&
      (!resource ||
        (session?.user && isValidRole(session.user.role) && 
         hasPermission(session.user.role as UserRole, resource, action)))
    ) {
      console.log('ProtectedRoute: User is authorized');
      setIsAuthorized(true);
    }
  }, [status, session, resource, action, router, isInitialized]);

  // Show a loading spinner while checking authentication or during transitions
  if (!isInitialized || status === 'loading' || isAuthorized === null) {
    console.log('ProtectedRoute: Showing loading spinner');
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // If authorized, show children
  if (isAuthorized) {
    console.log('ProtectedRoute: Rendering protected content');
    return <>{children}</>;
  }

  // Otherwise show nothing
  console.log('ProtectedRoute: Not authorized, returning null');
  return null;
}
