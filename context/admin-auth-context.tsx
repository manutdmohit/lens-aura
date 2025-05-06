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
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(
  undefined
);

export function AdminAuthProvider({ children }: { children: ReactNode }) {
  const { data: sessionData, status: nextAuthStatus } = useSession();
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>(nextAuthStatus);
  const router = useRouter();
  const pathname = usePathname();

  // Update status when nextAuthStatus changes
  useEffect(() => {
    setStatus(nextAuthStatus);
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
    if (status === 'loading') return;

    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    } else if (status === 'authenticated' && pathname === '/admin/login') {
      router.push('/admin');
      router.refresh();
    }
  }, [status, pathname, router]);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    try {
      const result = await nextAuthSignIn('credentials', {
        redirect: false,
        email,
        password,
      });

      if (result?.ok) {
        setStatus('authenticated');
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
      await nextAuthSignOut({ redirect: false });
      setStatus('unauthenticated');
      router.push('/admin/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <AdminAuthContext.Provider value={{ session, status, signIn, signOut }}>
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
