import sgMail from '@sendgrid/mail';

sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

interface InvoiceItem {
  name: string;
  quantity: number;
  price: number;
  color?: string;
}

export async function sendInvoiceEmail({
  to,
  orderId,
  items,
  total,
}: {
  to: string;
  orderId: string;
  items: InvoiceItem[];
  total: number;
}) {
  const logoUrl = 'https://lens-aura.vercel.app/images/logo.png'; // <-- Replace with your real logo URL

  const itemRows = items
    .map(
      (item) =>
        `<tr>
          <td style="padding: 8px 4px; border-bottom: 1px solid #eee;">${item.name}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #eee; text-align:center;">${item.color || '-'}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #eee; text-align:center;">${item.quantity}</td>
          <td style="padding: 8px 4px; border-bottom: 1px solid #eee; text-align:right;">$${item.price.toFixed(2)}</td>
        </tr>`
    )
    .join('');

  const html = `
  <div style="background: #f6f8fb; padding: 40px 0; font-family: 'Segoe UI', 'Roboto', Arial, sans-serif;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: 0 auto; background: #fff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.04); overflow: hidden;">
      <tr>
        <td style="padding: 32px 32px 0 32px; text-align: center;">
          <img src="${logoUrl}" alt="Company Logo" style="max-width: 160px; margin-bottom: 24px;" />
        </td>
      </tr>
      <tr>
        <td style="padding: 0 32px 32px 32px;">
          <h2 style="color: #222; font-size: 28px; margin-bottom: 8px;">Thank you for your purchase!</h2>
          <p style="color: #555; font-size: 16px; margin-bottom: 24px;">Your order <b>#${orderId}</b> has been received and paid successfully.</p>
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
            <span style="font-size: 18px; color: #222; font-weight: 600;">Total: $${total.toFixed(2)}</span>
          </div>
          <div style="background: #f6f8fb; padding: 18px 24px; border-radius: 8px; color: #444; font-size: 15px;">
            <p style="margin: 0 0 8px 0;">If you have any questions about your order, simply reply to this email or contact our support team.</p>
            <p style="margin: 0;">www.lens-aura.vercel.app</p>
            <p style="margin: 0;">We appreciate your business!</p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding: 0 32px 32px 32px; text-align: center; color: #aaa; font-size: 13px;">
          &copy; ${new Date().getFullYear()} Lens Aura.  All rights reserved.
        </td>
      </tr>
    </table>
  </div>
  `;

  const msg = {
    to,
    from: process.env.FROM_EMAIL!,
    subject: `Your Invoice for Order #${orderId}`,
    html,
  };
  console.log('SendGrid email payload:', msg); // For debugging
  try {
    await sgMail.send(msg);
  } catch (e: any) {
    console.error('SendGrid error:', e.response?.body || e);
    throw e;
  }
} 