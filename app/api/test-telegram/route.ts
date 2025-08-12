import { NextRequest, NextResponse } from 'next/server';

// Function to send message to Telegram
async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;

  if (!botToken || !chatId) {
    throw new Error('Telegram bot token or chat ID not configured');
  }

  const response = await fetch(
    `https://api.telegram.org/bot${botToken}/sendMessage`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(
      `Telegram API error: ${response.status} - ${JSON.stringify(errorData)}`
    );
  }

  return response.json();
}

export async function POST(req: NextRequest) {
  try {
    const { testMessage = '🧪 Test message from Lens Aura contact system' } =
      await req.json();

    const message = `
<b>🧪 Telegram Integration Test</b>

${testMessage}

⏰ <b>Test Time:</b> ${new Date().toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })}

✅ If you see this message, the Telegram integration is working correctly!
    `.trim();

    const result = await sendTelegramMessage(message);

    return NextResponse.json({
      success: true,
      message: 'Test message sent to Telegram successfully',
      result,
    });
  } catch (error) {
    console.error('Error sending test message to Telegram:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to send test message to Telegram',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Use POST method to send a test message to Telegram',
    example: {
      method: 'POST',
      body: {
        testMessage: 'Your custom test message here',
      },
    },
  });
}
