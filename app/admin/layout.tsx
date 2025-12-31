'use client';

import { useState, useEffect } from 'react';
import type React from 'react';
import { SessionProvider } from 'next-auth/react';
import { AdminAuthProvider } from '@/context/admin-auth-context';
import { Loader2 } from 'lucide-react';
import { usePathname } from 'next/navigation';

declare global {
  interface Window {
    fbq?: any;
    _fbq?: any;
  }
}

const META_PIXEL_ID = '1676326383327587';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);

    if (typeof window === 'undefined') return;

    if (window.fbq) {
      const fbq = window.fbq as (...args: any[]) => void;
      fbq('track', 'PageView');
      return;
    }

    (function (
      f: any,
      b: Document,
      e: 'script',
      v: string,
      n: any,
      t?: HTMLScriptElement,
      s?: Element
    ) {
      if (f.fbq) return;

      n = f.fbq = function () {
        n.callMethod
          ? n.callMethod.apply(n, arguments)
          : n.queue.push(arguments);
      };

      if (!f._fbq) f._fbq = n;

      n.push = n;
      n.loaded = true;
      n.version = '2.0';
      n.queue = [];

      t = b.createElement(e) as HTMLScriptElement;
      t.async = true;
      t.src = v;

      s = b.getElementsByTagName(e)[0];
      s.parentNode!.insertBefore(t, s);
    })(
      window,
      document,
      'script',
      'https://connect.facebook.net/en_US/fbevents.js',
      undefined
    );

    const fbq = window.fbq as (...args: any[]) => void;
    fbq('init', META_PIXEL_ID);
    fbq('track', 'PageView');
  }, []);

  const noHeaderPadding = pathname === '/admin/login';

  return (
    <SessionProvider refetchInterval={5} refetchOnWindowFocus>
      <AdminAuthProvider>
        {isClient ? (
          <>
            {/* Meta Pixel noscript fallback */}
            <noscript>
              <img
                height="1"
                width="1"
                style={{ display: 'none' }}
                src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
                alt=""
              />
            </noscript>

            <div className={noHeaderPadding ? '' : 'pt-header -mt-[112px]'}>
              {children}
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        )}
      </AdminAuthProvider>
    </SessionProvider>
  );
}
