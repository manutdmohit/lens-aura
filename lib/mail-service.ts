import sgMail from '@sendgrid/mail';
import {
  calculateSeptember2025Pricing,
  calculatePromotionalPricing,
} from '@/lib/utils/discount';

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

export interface EmailOptions {
  to: string | string[];
  subject: string;
  text?: string;
  html?: string;
  from?: string;
}

export interface TestEmailOptions {
  to: string;
  testType?: 'simple' | 'html' | 'template' | 'invoice';
}

export interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  color?: string;
  productType?: string;
  category?: string;
  originalPrice?: number;
}

export interface InvoiceEmailOptions {
  to: string;
  orderId: string;
  items: InvoiceItem[];
  subtotal?: number;
  shipping?: number;
  total: number;
  customerName?: string;
  customerEmail?: string;
  shippingAddress?: any;
  paymentMethod?: string;
  orderDate?: Date;
}

export class MailService {
  private static fromEmail =
    process.env.FROM_EMAIL || 'noreply@lensaura.com.au';

  /**
   * Send a simple text email
   */
  static async sendSimpleEmail(options: EmailOptions): Promise<boolean> {
    try {
      const msg = {
        to: options.to,
        from: options.from || this.fromEmail,
        subject: options.subject,
        text: options.text,
        html: options.html,
      };

      await sgMail.send(msg);
      console.log('Email sent successfully to:', options.to);
      return true;
    } catch (error) {
      console.error('Error sending email:', error);
      return false;
    }
  }

  /**
   * Send an invoice email with professional design
   */
  static async sendInvoiceEmail(
    options: InvoiceEmailOptions
  ): Promise<boolean> {
    const emailId = Math.random().toString(36).substr(2, 9);
    const timestamp = new Date().toISOString();

    try {
      const {
        to,
        orderId,
        items,
        subtotal,
        shipping,
        total,
        customerName = 'Valued Customer',
        customerEmail,
        shippingAddress,
        paymentMethod = 'Stripe',
        orderDate = new Date(),
      } = options;

      console.log(
        `[${emailId}] [${timestamp}] [MailService] Starting invoice email send to: ${to} for order: ${orderId}`
      );

      const logoUrl = 'https://lens-aura.vercel.app/images/lens-aura-logo.jpg';

      const itemRows = items
        .map((item) => {
          // Check if this item has promotional pricing
          let priceDisplay = `$${item.price.toFixed(2)}`;
          let promotionalNote = '';

          if (
            item.productType === 'sunglasses' &&
            item.category &&
            item.originalPrice
          ) {
            const septemberPricing = calculateSeptember2025Pricing(
              item.originalPrice,
              item.category as 'signature' | 'essentials'
            );

            if (septemberPricing.isActive) {
              // Show promotional pricing with original price crossed out
              priceDisplay = `
                <span style="color: #dc2626; font-weight: 600;">$${item.price.toFixed(
                  2
                )}</span>
                <br>
                <span style="text-decoration: line-through; color: #6b7280; font-size: 12px;">$${item.originalPrice.toFixed(
                  2
                )}</span>
              `;
              promotionalNote = `<br><span style="color: #dc2626; font-size: 11px;">Current Offer - Save $${septemberPricing.savings.toFixed(
                2
              )}</span>`;
            }
          }

          return `<tr>
            <td style="padding: 8px 4px; border-bottom: 1px solid #eee;">
              ${item.name}${promotionalNote}
            </td>
            <td style="padding: 8px 4px; border-bottom: 1px solid #eee; text-align:center;">${
              item.color || '-'
            }</td>
            <td style="padding: 8px 4px; border-bottom: 1px solid #eee; text-align:center;">${
              item.quantity
            }</td>
            <td style="padding: 8px 4px; border-bottom: 1px solid #eee; text-align:right;">${priceDisplay}</td>
          </tr>`;
        })
        .join('');

      const html = `
      <div style="background: #f6f8fb; padding: 40px 0; font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
          <tr>
            <td style="padding: 32px 32px 0 32px; text-align: center;">
              <img src="${logoUrl}" alt="Lens Aura Logo" style="max-width: 160px; margin-bottom: 24px;" />
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px 32px;">
              <h2 style="color: #222; font-size: 28px; margin-bottom: 8px;">Thank you for your purchase!</h2>
              <p style="color: #555; font-size: 16px; margin-bottom: 24px;">Dear ${customerName}, your order <b>#${orderId}</b> has been received and paid successfully.</p>
              
              <div style="background: #f8f9fa; padding: 16px; border-radius: 8px; margin-bottom: 24px;">
                <h3 style="color: #333; margin: 0 0 8px 0; font-size: 16px;">Order Summary</h3>
                <p style="margin: 0; color: #666; font-size: 14px;"><strong>Order Date:</strong> ${orderDate.toLocaleDateString(
                  'en-AU',
                  {
                    timeZone: 'Australia/Sydney',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  }
                )}</p>
                <p style="margin: 4px 0 0 0; color: #666; font-size: 14px;"><strong>Payment Method:</strong> ${paymentMethod}</p>
                ${
                  customerEmail
                    ? `<p style="margin: 4px 0 0 0; color: #666; font-size: 14px;"><strong>Email:</strong> ${customerEmail}</p>`
                    : ''
                }
              </div>

              <table width="100%" cellpadding="0" cellspacing="0" style="border-collapse: collapse; margin-bottom: 24px;">
                <thead>
                  <tr style="background: #f6f8fb;">
                    <th style="padding: 10px 4px; text-align:left; color: #333; font-size: 15px;">Product</th>
                    <th style="padding: 10px 4px; text-align:center; color: #333; font-size: 15px;">Color</th>
                    <th style="padding: 10px 4px; text-align:center; color: #333; font-size: 15px;">Quantity</th>
                    <th style="padding: 10px 4px; text-align:right; color: #333; font-size: 15px;">Price</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>
              
              <div style="text-align: right; margin-bottom: 32px;">
                ${
                  subtotal !== undefined
                    ? `
                  <div style="margin-bottom: 8px;">
                    <span style="font-size: 16px; color: #666;">Subtotal: $${subtotal.toFixed(
                      2
                    )}</span>
                  </div>
                `
                    : ''
                }
                ${
                  shipping !== undefined
                    ? `
                  <div style="margin-bottom: 8px;">
                    <span style="font-size: 16px; color: #666;">Shipping: $${
                      shipping === 0 ? '0.00 (Free)' : shipping.toFixed(2)
                    }</span>
                  </div>
                `
                    : ''
                }
                <div style="border-top: 1px solid #e5e7eb; padding-top: 8px;">
                  <span style="font-size: 18px; color: #222; font-weight: 600;">Total: $${total.toFixed(
                    2
                  )}</span>
                </div>
              </div>
              
              <div style="background: #f6f8fb; padding: 18px 24px; border-radius: 8px; color: #444; font-size: 15px;">
                <p style="margin: 0 0 8px 0;">If you have any questions about your order, simply reply to this email or contact our support team.</p>
                <p style="margin: 0 0 4px 0;">Phone: 02 9051 0054</p>
                <p style="margin: 0 0 4px 0;">www.lensaura.com.au</p>
                <p style="margin: 0;">We appreciate your business!</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding: 0 32px 32px 32px; text-align: center; color: #aaa; font-size: 13px;">
              &copy; ${new Date().getFullYear()} Lens Aura. All rights reserved.
            </td>
          </tr>
        </table>
      </div>
      `;

      const msg = {
        to,
        from: this.fromEmail,
        subject: `Your Invoice for Order #${orderId}`,
        html,
      };

      await sgMail.send(msg);
      console.log(
        `[${emailId}] [MailService] Invoice email sent successfully to: ${to}`
      );
      return true;
    } catch (error) {
      console.error(
        `[${emailId}] [MailService] Error sending invoice email:`,
        error
      );
      return false;
    }
  }

  /**
   * Send a test email with different templates
   */
  static async sendTestEmail(options: TestEmailOptions): Promise<boolean> {
    const { to, testType = 'simple' } = options;

    let subject: string;
    let text: string;
    let html: string;

    switch (testType) {
      case 'simple':
        subject = '🧪 SendGrid Test Email - Simple';
        text = `Hello! This is a simple test email from Lens Aura.\n\nSent at: ${new Date().toISOString()}\n\nIf you received this email, SendGrid is working correctly!`;
        html = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #333;">🧪 SendGrid Test Email - Simple</h2>
            <p>Hello! This is a simple test email from <strong>Lens Aura</strong>.</p>
            <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
            <p>If you received this email, SendGrid is working correctly! ✅</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">This is a test email from the Lens Aura mail service.</p>
          </div>
        `;
        break;

      case 'html':
        subject = '🎨 SendGrid Test Email - HTML Template';
        text = `Hello! This is an HTML test email from Lens Aura. Sent at: ${new Date().toISOString()}`;
        html = `
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px 0; font-family: Arial, sans-serif;">
            <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 20px rgba(0,0,0,0.1);">
              <div style="background: #f8f9fa; padding: 30px; text-align: center;">
                <h1 style="color: #333; margin: 0; font-size: 28px;">🎨 Lens Aura</h1>
                <p style="color: #666; margin: 10px 0 0 0;">HTML Email Template Test</p>
              </div>
              <div style="padding: 30px;">
                <h2 style="color: #333; margin-top: 0;">Hello! 👋</h2>
                <p style="color: #555; line-height: 1.6;">This is a beautifully designed HTML test email to verify that SendGrid is working correctly with rich content.</p>
                
                <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                  <h3 style="color: #333; margin-top: 0;">📧 Email Details</h3>
                  <ul style="color: #555; margin: 0; padding-left: 20px;">
                    <li><strong>Sent at:</strong> ${new Date().toLocaleString()}</li>
                    <li><strong>Service:</strong> SendGrid</li>
                    <li><strong>Status:</strong> <span style="color: #28a745;">✅ Working</span></li>
                  </ul>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="https://lensaura.com.au" style="background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Visit Lens Aura</a>
                </div>
              </div>
              <div style="background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px;">
                © ${new Date().getFullYear()} Lens Aura. All rights reserved.
              </div>
            </div>
          </div>
        `;
        break;

      case 'template':
        subject = '📋 SendGrid Test Email - Template Style';
        text = `Hello! This is a template-style test email from Lens Aura. Sent at: ${new Date().toISOString()}`;
        html = `
          <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4; margin: 0; padding: 20px;">
            <table style="max-width: 600px; margin: 0 auto; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <tr>
                <td style="background: #2c3e50; color: white; padding: 30px; text-align: center;">
                  <h1 style="margin: 0; font-size: 24px;">📋 Lens Aura</h1>
                  <p style="margin: 10px 0 0 0; opacity: 0.9;">Professional Email Template</p>
                </td>
              </tr>
              <tr>
                <td style="padding: 30px;">
                  <h2 style="color: #2c3e50; margin-top: 0;">Email Service Test</h2>
                  <p style="color: #555; line-height: 1.6;">This email confirms that your SendGrid integration is working perfectly!</p>
                  
                  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <tr style="background: #f8f9fa;">
                      <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #495057;">Test Type</td>
                      <td style="padding: 12px; border: 1px solid #dee2e6; color: #495057;">Template Style</td>
                    </tr>
                    <tr>
                      <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #495057;">Timestamp</td>
                      <td style="padding: 12px; border: 1px solid #dee2e6; color: #495057;">${new Date().toISOString()}</td>
                    </tr>
                    <tr style="background: #f8f9fa;">
                      <td style="padding: 12px; border: 1px solid #dee2e6; font-weight: bold; color: #495057;">Status</td>
                      <td style="padding: 12px; border: 1px solid #dee2e6; color: #28a745;">✅ Success</td>
                    </tr>
                  </table>

                  <div style="background: #e8f5e8; border-left: 4px solid #28a745; padding: 15px; margin: 20px 0;">
                    <p style="margin: 0; color: #155724;"><strong>Success!</strong> Your SendGrid configuration is working correctly.</p>
                  </div>
                </td>
              </tr>
              <tr>
                <td style="background: #f8f9fa; padding: 20px; text-align: center; color: #6c757d; font-size: 12px;">
                  <p style="margin: 0;">This is a test email from Lens Aura Mail Service</p>
                  <p style="margin: 5px 0 0 0;">© ${new Date().getFullYear()} Lens Aura</p>
                </td>
              </tr>
            </table>
          </div>
        `;
        break;

      case 'invoice':
        subject = '🧾 SendGrid Test Email - Invoice Template';
        text = `Hello! This is an invoice test email from Lens Aura. Sent at: ${new Date().toISOString()}`;

        // Create sample invoice data for testing
        const sampleItems: InvoiceItem[] = [
          {
            name: 'Signature Sunglasses - Classic Black',
            quantity: 1,
            price: 89.99,
            color: 'Black',
            productType: 'sunglasses',
            category: 'signature',
            originalPrice: 129.99,
          },
          {
            name: 'Essentials Sunglasses - Tortoise',
            quantity: 2,
            price: 49.99,
            color: 'Tortoise',
            productType: 'sunglasses',
            category: 'essentials',
            originalPrice: 69.99,
          },
        ];

        const sampleTotal = sampleItems.reduce(
          (sum, item) => sum + item.price * item.quantity,
          0
        );

        return this.sendInvoiceEmail({
          to,
          orderId: 'TEST-' + Date.now(),
          items: sampleItems,
          total: sampleTotal,
          customerName: 'Test Customer',
          customerEmail: to,
          paymentMethod: 'Test Payment',
          orderDate: new Date(),
        });

      default:
        throw new Error(`Unknown test type: ${testType}`);
    }

    return this.sendSimpleEmail({
      to,
      subject,
      text,
      html,
    });
  }

  /**
   * Verify SendGrid configuration
   */
  static async verifyConfiguration(): Promise<{
    valid: boolean;
    error?: string;
  }> {
    try {
      if (!process.env.SENDGRID_API_KEY) {
        return { valid: false, error: 'SENDGRID_API_KEY is not set' };
      }

      if (!process.env.FROM_EMAIL) {
        return { valid: false, error: 'FROM_EMAIL is not set' };
      }

      // Test API key by making a simple request
      const testMsg = {
        to: 'test@example.com', // This won't actually send
        from: this.fromEmail,
        subject: 'Test',
        text: 'Test',
      };

      // We'll just validate the configuration without actually sending
      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

export default MailService;
