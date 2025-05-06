'use client';

import {
  useSession,
  signIn as nextAuthSignIn,
  signOut as nextAuthSignOut,
} from 'next-auth/react';
import {
  createContext,
  useContext,
  useEffect,
  type ReactNode,
  useMemo,
  useState,
} from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface AdminSession {
  user: {
    id: string;
    email: string | null;
    name: string;
    role: string;
    avatar: string;
    createdAt: Date;
    lastLogin: Date;
  };
  expires: Date;
}

interface AdminAuthContextType {
  session: AdminSession | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (email: string, password: string) => Promise<boolean>;
  signOut: () => void;
  isInitialized: boolean;
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, status: nextAuthStatus, update: updateSession } = useSession();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(nextAuthStatus);
  const [isInitialized, setIsInitialized] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  // Update status when nextAuthStatus changes
  useEffect(() => {
    console.log("NextAuth status changed:", nextAuthStatus);
    setStatus(nextAuthStatus);
    if (nextAuthStatus !== 'loading') {
      setIsInitialized(true);
    }
  }, [nextAuthStatus]);

  const session: AdminSession | null = useMemo(() => {
    if (!sessionData) return null;

    return {
      user: {
        id: sessionData.user.id ?? '',
        email: sessionData.user.email ?? '',
        name: sessionData.user.name ?? '',
        role: sessionData.user.role ?? 'admin',
        avatar:
          sessionData.user.image ??
          'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=100&auto=format&fit=crop',
        createdAt: new Date(),
        lastLogin: new Date(),
      },
      expires: new Date(sessionData.expires),
    };
  }, [sessionData]);

  // Handle redirection based on auth state
  useEffect(() => {
    if (status === 'loading' || !isInitialized) return;

    console.log("Auth state changed:", status, "pathname:", pathname);

    if (status === 'unauthenticated' && pathname && !pathname.includes('/admin/login')) {
      console.log("Redirecting to login page");
      router.push('/admin/login');
    } else if (status === 'authenticated' && pathname && pathname.includes('/admin/login')) {
      console.log("Redirecting to admin dashboard");
      router.push('/admin');
    }
  }, [status, pathname, router, isInitialized]);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      console.log("Attempting sign in with email:", email);
      const result = await nextAuthSignIn('credentials', {
        redirect: false,
        email,
        password,
      });

      console.log("Sign in result:", result);

      if (result?.ok) {
        console.log("Sign in successful, updating session");
        try {
          // Force a session update to ensure fresh data
          await updateSession();
          console.log("Session updated");
        } catch (updateError) {
          console.error("Error updating session:", updateError);
        }
        
        console.log("Redirecting to admin dashboard");
        window.location.href = '/admin'; // Force a hard navigation
        return true;
      }
      return false;
    } catch (error) {
      console.error('Sign in error:', error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      console.log("Signing out");
      await nextAuthSignOut({ redirect: false });
      console.log("Signed out, redirecting to login page");
      setStatus('unauthenticated');
      window.location.href = '/admin/login'; // Force a hard navigation
    } catch (error) {
      console.error('Sign out error:', error);
      // Force navigation even if error occurs
      window.location.href = '/admin/login';
    }
  };

  return (
    <AdminAuthContext.Provider value={{ session, status, signIn, signOut, isInitialized }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext);
  if (!context) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider');
  }
  return context;
}
