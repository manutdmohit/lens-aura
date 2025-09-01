import { NextRequest, NextResponse } from 'next/server';
import { 
  sendPaymentNotification, 
  sendPaymentStatusUpdate, 
  sendPaymentFailureNotification,
  sendOrderCancellationNotification,
  sendRefundNotification 
} from '@/lib/telegram-utils';

export async function POST(req: NextRequest) {
  try {
    const { testType = 'success' } = await req.json();

    // Mock order data for testing
    const mockOrder = {
      orderNumber: 'LA-123456-7890',
      totalAmount: 299.99,
      paymentStatus: 'paid',
      paymentMethod: 'Stripe',
      customerEmail: 'test@example.com',
      customerPhone: '+61412345678',
      stripeSessionId: 'cs_test_1234567890',
      paymentIntent: 'pi_test_1234567890',
      createdAt: new Date(),
      items: [
        {
          name: 'Classic Aviator Sunglasses',
          color: 'Gold',
          quantity: 1,
          price: 199.99
        },
        {
          name: 'Premium Lens Cleaning Kit',
          color: 'Clear',
          quantity: 1,
          price: 100.00
        }
      ],
      shippingAddress: {
        firstName: 'John',
        lastName: 'Doe',
        street: '123 Test Street',
        city: 'Sydney',
        state: 'NSW',
        postalCode: '2000',
        country: 'Australia'
      }
    };

    let result;
    let message;

    switch (testType) {
      case 'success':
        result = await sendPaymentNotification(mockOrder);
        message = 'Payment success notification test';
        break;
      
      case 'status-update':
        result = await sendPaymentStatusUpdate(mockOrder, 'paid', 'Payment completed successfully');
        message = 'Payment status update notification test';
        break;
      
      case 'failure':
        result = await sendPaymentFailureNotification(mockOrder, 'Card declined - insufficient funds');
        message = 'Payment failure notification test';
        break;
      
      case 'cancellation':
        result = await sendOrderCancellationNotification(mockOrder, 'Customer requested cancellation');
        message = 'Order cancellation notification test';
        break;
      
      case 'refund':
        result = await sendRefundNotification(mockOrder, 299.99, 'Customer requested refund');
        message = 'Refund notification test';
        break;
      
      default:
        return NextResponse.json(
          {
            success: false,
            message: 'Invalid test type. Use: success, status-update, failure, cancellation, or refund',
          },
          { status: 400 }
        );
    }

    return NextResponse.json({
      success: true,
      message: `${message} sent to Telegram successfully`,
      testType,
      result,
    });
  } catch (error) {
    console.error('Error sending test payment notification to Telegram:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send test payment notification to Telegram',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to send test payment notifications to Telegram',
    availableTests: [
      'success - Test payment success notification',
      'status-update - Test payment status update',
      'failure - Test payment failure notification',
      'cancellation - Test order cancellation notification',
      'refund - Test refund notification'
    ],
    example: {
      method: 'POST',
      body: {
        testType: 'success' // or 'status-update', 'failure', 'cancellation', 'refund'
      },
    },
  });
}
