import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;
  const sendgridKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.FROM_EMAIL;

  return NextResponse.json({
    telegram: {
      botToken: botToken ? '✅ Configured' : '❌ Missing',
      chatId: chatId ? '✅ Configured' : '❌ Missing',
    },
    email: {
      sendgridKey: sendgridKey ? '✅ Configured' : '❌ Missing',
      fromEmail: fromEmail ? '✅ Configured' : '❌ Missing',
    },
    environment: {
      nodeEnv: process.env.NODE_ENV,
      siteUrl: process.env.NEXT_PUBLIC_SITE_URL,
    },
  });
}
