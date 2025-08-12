import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { LucidePenSquare } from 'lucide-react';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

// Function to send message to Telegram
async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;

  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID not configured');
    return;
  }

  try {
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
      throw new Error(`Telegram API error: ${response.status}`);
    }

    console.log('Message sent to Telegram successfully');
  } catch (error) {
    console.error('Error sending message to Telegram:', error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, subject, message } = await req.json();

    // Send confirmation email to the customer
    const customerMsg = {
      to: email,
      from: process.env.FROM_EMAIL!,
      subject: 'Thank you for contacting Lens Aura',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Thank you for contacting Lens Aura!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          <p>Best regards,<br>Lens Aura Team</p>
        </div>
      `,
    };

    // Send notification email to admin
    const adminMsg = {
      to: 'info@lensaura.com.au',
      from: process.env.FROM_EMAIL!,
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">New Contact Form Submission</h2>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>From:</strong> ${name} (${email})</p>
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
        </div>
      `,
    };

    // Get subject display name
    const getSubjectDisplay = (subject: string) => {
      const subjectMap: { [key: string]: string } = {
        'signature-sunglasses': 'Signature Sunglasses Inquiry',
        'standard-sunglasses': 'Essentials Sunglasses Inquiry',
        'product-recommendation': 'Product Recommendation',
        'order-status': 'Order Status',
        'warranty-support': 'Warranty & Support',
        'size-fitting': 'Size & Fitting',
        other: 'Other',
      };
      return subjectMap[subject] || subject;
    };

    // Format message for Telegram
    const telegramMessage = `
<b>📧 New Contact Form Submission</b>

👤 <b>From:</b> ${name}
📧 <b>Email:</b> ${email}
📝 <b>Subject:</b> ${getSubjectDisplay(subject)}

💬 <b>Message:</b>
${message}

⏰ <b>Time:</b> ${new Date().toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}

🔗 <b>Quick Actions:</b>
• Reply to customer: ${email}
• View contact form: ${
      process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'
    }/contact
    `.trim();

    // Send both emails and Telegram message
    await Promise.all([
      sgMail.send(customerMsg),
      sgMail.send(adminMsg),
      sendTelegramMessage(telegramMessage),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to send message' },
      { status: 500 }
    );
  }
}
