import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram-utils';

export async function POST(req: NextRequest) {
  try {
    const { testMessage, testType = 'simple' } = await req.json();

    // Verify configuration first
    const configCheck = TelegramService.verifyConfiguration();
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

    let success = false;

    switch (testType) {
      case 'simple':
        success = await TelegramService.sendTestMessage(testMessage);
        break;
      case 'contact':
        // Test contact form notification
        const sampleContactData = {
          name: 'Test Customer',
          email: 'test@example.com',
          subject: 'product-recommendation',
          message:
            testMessage ||
            'This is a test contact form submission to verify Telegram integration.',
        };
        success = await TelegramService.sendContactFormNotification(
          sampleContactData
        );
        break;
      case 'order':
        // Test order notification
        const sampleOrder = {
          orderNumber: 'TEST-' + Date.now(),
          totalAmount: 189.98,
          paymentStatus: 'paid',
          paymentMethod: 'Stripe',
          customerEmail: 'test@example.com',
          customerPhone: '+61 400 000 000',
          stripeSessionId: 'cs_test_' + Date.now(),
          paymentIntent: 'pi_test_' + Date.now(),
          createdAt: new Date(),
          items: [
            {
              name: 'Signature Sunglasses - Classic Black',
              color: 'Black',
              quantity: 1,
              price: 89.99,
            },
            {
              name: 'Essentials Sunglasses - Tortoise',
              color: 'Tortoise',
              quantity: 2,
              price: 49.99,
            },
          ],
          shippingAddress: {
            firstName: 'Test',
            lastName: 'Customer',
            street: '123 Test Street',
            city: 'Sydney',
            state: 'NSW',
            postalCode: '2000',
            country: 'Australia',
          },
        };
        success = await TelegramService.sendPaymentNotification(sampleOrder);
        break;
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid test type. Must be one of: simple, contact, order',
          },
          { status: 400 }
        );
    }

    if (success) {
      return NextResponse.json({
        success: true,
        message: `Test ${testType} message sent to Telegram successfully`,
        testType,
        timestamp: new Date().toISOString(),
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to send test message to Telegram',
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Error sending test message to Telegram:', error);
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

export async function GET() {
  try {
    // Check Telegram configuration
    const configCheck = TelegramService.verifyConfiguration();

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
      message: 'Telegram configuration is valid',
      config: {
        hasBotToken: !!process.env.TELEGRAM_BOT_TOKEN,
        hasGroupId: !!process.env.TELEGRAM_GROUP_ID,
        botTokenLength: process.env.TELEGRAM_BOT_TOKEN?.length || 0,
      },
      usage: {
        method: 'POST',
        body: {
          testMessage: 'Your custom test message here',
          testType: 'simple | contact | order',
        },
      },
    });
  } catch (error) {
    console.error('Telegram configuration check error:', error);
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
