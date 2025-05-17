import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { z } from 'zod';
import jwt from 'jsonwebtoken';

// Define JWT payload type
interface JWTPayload {
  role: 'admin' | 'superadmin' | 'user';
  email: string;
  sub: string;
  iat: number;
  exp: number;
}

// Authentication middleware
export async function authenticate(req: NextRequest) {
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!session) {
    return NextResponse.json(
      { error: 'Unauthorized: Please log in to access this resource' },
      { status: 401 }
    );
  }

  return session;
}

// Admin authentication middleware
export async function authenticateAdmin(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = authHeader?.split(' ')[1]; // Bearer <token>

  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const decoded = jwt.verify(token, process.env.NEXTAUTH_SECRET!) as JWTPayload;

    if (decoded.role !== 'admin' && decoded.role !== 'superadmin') {
      return NextResponse.json(
        { error: 'Forbidden: Admin access required' },
        { status: 403 }
      );
    }

    return decoded;
  } catch (err) {
    console.error('JWT verification failed:', err);
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
}

// Validation middleware
export function validateRequest<T>(schema: z.ZodType<T>, data: unknown) {
  try {
    return { data: schema.parse(data), error: null };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        data: null,
        error: { message: 'Validation error', details: error.errors },
      };
    }
    return {
      data: null,
      error: { message: 'Invalid request data', details: [] },
    };
  }
}

// Error handler
export function handleError(error: unknown) {
  console.error('API Error:', error);

  if (error instanceof Error) {
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }

  return NextResponse.json(
    { error: 'An unexpected error occurred' },
    { status: 500 }
  );
}

// Database connection error handler
export function handleDbConnectionError(error: unknown) {
  console.error('Database Connection Error:', error);
  return NextResponse.json(
    { error: 'Database connection error. Please try again later.' },
    { status: 503 }
  );
}
