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
  const { data: sessionData, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();

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

  // 👇 Safer redirection
  useEffect(() => {
    if (status === 'unauthenticated' && pathname !== '/admin/login') {
      router.push('/admin/login');
    }
    if (status === 'authenticated' && pathname === '/admin/login') {
      router.push('/admin');
    }
  }, [status, pathname, router]);

  const signIn = async (email: string, password: string): Promise<boolean> => {
    const result = await nextAuthSignIn('credentials', {
      redirect: false,
      email,
      password,
    });

    return result?.ok ?? false;
  };

  const signOut = () => {
    nextAuthSignOut({ callbackUrl: '/admin/login' });
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
