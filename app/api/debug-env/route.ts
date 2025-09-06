import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Check environment variables
    const envCheck = {
      SENDGRID_API_KEY: {
        exists: !!process.env.SENDGRID_API_KEY,
        length: process.env.SENDGRID_API_KEY?.length || 0,
        startsWith: process.env.SENDGRID_API_KEY?.substring(0, 10) || 'N/A',
        endsWith: process.env.SENDGRID_API_KEY?.substring(-10) || 'N/A',
      },
      FROM_EMAIL: {
        exists: !!process.env.FROM_EMAIL,
        value: process.env.FROM_EMAIL || 'N/A',
      },
      NODE_ENV: process.env.NODE_ENV,
      VERCEL: process.env.VERCEL,
      // Check for other common env files
      allEnvKeys: Object.keys(process.env).filter(
        (key) =>
          key.includes('SENDGRID') ||
          key.includes('EMAIL') ||
          key.includes('FROM')
      ),
    };

    return NextResponse.json({
      success: true,
      message: 'Environment variables check',
      data: envCheck,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check environment variables',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
