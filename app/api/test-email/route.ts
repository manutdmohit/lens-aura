import { NextRequest, NextResponse } from 'next/server';
import MailService from '@/lib/mail-service';

export async function GET() {
  try {
    // Verify configuration
    const configCheck = await MailService.verifyConfiguration();

    if (!configCheck.valid) {
      return NextResponse.json(
        {
          success: false,
          error: 'Configuration error',
          details: configCheck.error,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'SendGrid configuration is valid',
      config: {
        hasApiKey: !!process.env.SENDGRID_API_KEY,
        fromEmail: process.env.FROM_EMAIL,
        apiKeyLength: process.env.SENDGRID_API_KEY?.length || 0,
      },
    });
  } catch (error) {
    console.error('Configuration check error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to verify configuration',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to, testType = 'simple' } = body;

    // Debug logging
    console.log('Received email test request:', { to, testType, body });

    // Validate required fields
    if (!to) {
      return NextResponse.json(
        { success: false, error: 'Email address (to) is required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(to)) {
      return NextResponse.json(
        {
          success: false,
          error: 'Invalid email address format',
          details: {
            providedEmail: to,
            expectedFormat: 'user@domain.com',
            validationRegex: emailRegex.toString(),
          },
        },
        { status: 400 }
      );
    }

    // Validate test type
    const validTestTypes = ['simple', 'html', 'template', 'invoice'];
    if (!validTestTypes.includes(testType)) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid test type. Must be one of: simple, html, template, invoice',
        },
        { status: 400 }
      );
    }

    // Send test email
    const success = await MailService.sendTestEmail({ to, testType });

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test email sent successfully to ${to}`,
        testType,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send test email',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Test email error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
