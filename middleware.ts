import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // Get response
  const response = NextResponse.next();

  // Add Content-Security-Policy header
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com; connect-src 'self' https://api.stripe.com https://api.cloudinary.com; frame-src 'self' https://js.stripe.com https://hooks.stripe.com; img-src 'self' data: https://*.stripe.com https://res.cloudinary.com https://images.unsplash.com https://images.pexels.com https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline';"
  );

  return response;
}

// Only run middleware on specific paths
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
