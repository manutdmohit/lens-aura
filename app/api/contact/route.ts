import { NextRequest, NextResponse } from 'next/server';
import sgMail from '@sendgrid/mail';
import { TelegramService } from '@/lib/telegram-utils';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

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
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://lens-aura.vercel.app/images/lens-aura-logo.jpg" alt="Lens Aura Logo" style="max-width: 120px; margin-bottom: 15px;" />
          </div>
          <h2 style="color: #333;">Thank you for contacting Lens Aura!</h2>
          <p>Dear ${name},</p>
          <p>We have received your message and will get back to you as soon as possible.</p>
          <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 15px 0;">
            <p><strong>Subject:</strong> ${subject}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
          </div>
          <p>Best regards,<br>Lens Aura Team</p>
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #eee; text-align: center; color: #666; font-size: 14px;">
            <p style="margin: 0 0 5px 0;">Phone: 02 9051 0054</p>
            <p style="margin: 0;">www.lensaura.com.au</p>
          </div>
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
          <div style="text-align: center; margin-bottom: 30px;">
            <img src="https://lens-aura.vercel.app/images/lens-aura-logo.jpg" alt="Lens Aura Logo" style="max-width: 120px; margin-bottom: 15px;" />
          </div>
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

    // Send emails and Telegram message independently
    const results = await Promise.allSettled([
      sgMail.send(customerMsg),
      sgMail.send(adminMsg),
      TelegramService.sendContactFormNotification({
        name,
        email,
        subject,
        message,
      }),
    ]);

    // Check if at least one method succeeded
    const emailSuccess =
      results[0].status === 'fulfilled' && results[1].status === 'fulfilled';
    const telegramSuccess = results[2].status === 'fulfilled';

    if (!emailSuccess && !telegramSuccess) {
      throw new Error('Failed to send message via any method');
    }

    // Log any failures for debugging
    if (results[0].status === 'rejected') {
      console.error('Customer email failed:', results[0].reason);
    }
    if (results[1].status === 'rejected') {
      console.error('Admin email failed:', results[1].reason);
    }
    if (results[2].status === 'rejected') {
      console.error('Telegram message failed:', results[2].reason);
    }

    return NextResponse.json({
      success: true,
      emailSent: emailSuccess,
      telegramSent: telegramSuccess,
    });
  } catch (error) {
    console.error('Error in contact form processing:', error);

    // Check if it's a specific failure or general error
    if (
      error instanceof Error &&
      error.message === 'Failed to send message via any method'
    ) {
      return NextResponse.json(
        { success: false, message: 'Failed to send message via any method' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'Failed to process contact form' },
      { status: 500 }
    );
  }
}
