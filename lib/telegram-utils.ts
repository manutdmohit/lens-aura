// Enhanced Telegram Service Class
export class TelegramService {
  private static botToken = process.env.TELEGRAM_BOT_TOKEN;
  private static chatId = process.env.TELEGRAM_GROUP_ID;

  /**
   * Verify Telegram configuration
   */
  static verifyConfiguration(): { valid: boolean; error?: string } {
    if (!this.botToken) {
      return { valid: false, error: 'TELEGRAM_BOT_TOKEN is not set' };
    }
    if (!this.chatId) {
      return { valid: false, error: 'TELEGRAM_GROUP_ID is not set' };
    }
    return { valid: true };
  }

  /**
   * Send a message to Telegram
   */
  private static async sendMessage(
    message: string,
    parseMode: 'HTML' | 'Markdown' = 'HTML'
  ): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      console.error('Telegram bot token or chat ID not configured');
      return false;
    }

    try {
      const response = await fetch(
        `https://api.telegram.org/bot${this.botToken}/sendMessage`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            chat_id: this.chatId,
            text: message,
            parse_mode: parseMode,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          `Telegram API error: ${response.status} - ${JSON.stringify(
            errorData
          )}`
        );
      }

      console.log('Message sent to Telegram successfully');
      return true;
    } catch (error) {
      console.error('Error sending message to Telegram:', error);
      return false;
    }
  }

  /**
   * Send payment notification to Telegram
   */
  static async sendPaymentNotification(
    order: any,
    paymentDetails?: any
  ): Promise<boolean> {
    const configCheck = this.verifyConfiguration();
    if (!configCheck.valid) {
      console.error('Telegram configuration error:', configCheck.error);
      return false;
    }

    try {
      // Format items for display with enhanced styling
      const itemsList = order.items
        .map((item: any, index: number) => {
          const itemTotal = item.price * item.quantity;
          return `${index + 1}. <b>${item.name}</b>
   🎨 Color: ${item.color || 'N/A'}
   📦 Qty: ${item.quantity}
   💰 Price: $${item.price.toFixed(2)} each
   💵 Total: $${itemTotal.toFixed(2)}`;
        })
        .join('\n\n');

      // Format shipping address
      const address = order.shippingAddress;
      const addressText = address
        ? `🏠 ${address.street || ''}
🏙️ ${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}
🌏 ${address.country || 'Australia'}`
        : '❌ Not provided';

      // Format customer details
      const customerName = address
        ? `${address.firstName || ''} ${address.lastName || ''}`.trim() ||
          'Not provided'
        : 'Not provided';

      // Calculate savings if promotional pricing is applied
      const totalSavings =
        order.items?.reduce((savings: number, item: any) => {
          if (item.originalPrice && item.originalPrice > item.price) {
            return savings + (item.originalPrice - item.price) * item.quantity;
          }
          return savings;
        }, 0) || 0;

      // Create enhanced message
      const message = `
🎉 <b>NEW ORDER RECEIVED!</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛒 <b>ORDER DETAILS</b>
📋 Order #: <code>${order.orderNumber}</code>
💰 Total Amount: <b>$${order.totalAmount.toFixed(2)}</b>
${totalSavings > 0 ? `💸 Savings: <b>$${totalSavings.toFixed(2)}</b>` : ''}
✅ Status: <b>${order.paymentStatus.toUpperCase()}</b>
💳 Payment: ${order.paymentMethod || 'Stripe'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>CUSTOMER INFORMATION</b>
👨‍💼 Name: <b>${customerName}</b>
📧 Email: <code>${order.customerEmail || 'Not provided'}</code>
📱 Phone: <code>${order.customerPhone || 'Not provided'}</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📍 <b>SHIPPING ADDRESS</b>
${addressText}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 <b>ITEMS ORDERED</b>
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 <b>PAYMENT INFORMATION</b>
🔑 Session ID: <code>${order.stripeSessionId}</code>
🎯 Payment Intent: <code>${order.paymentIntent || 'Not available'}</code>
⏰ Created: ${new Date(order.createdAt).toLocaleString('en-AU', {
        timeZone: 'Australia/Sydney',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🔗 <b>QUICK ACTIONS</b>
👁️ <a href="${
        process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'
      }/admin/orders">View Order Details</a>
📧 <a href="mailto:${order.customerEmail || ''}">Email Customer</a>
📞 <a href="tel:${order.customerPhone || ''}">Call Customer</a>
      `.trim();

      return await this.sendMessage(message);
    } catch (error) {
      console.error('Error sending payment notification to Telegram:', error);
      return false;
    }
  }

  /**
   * Send payment status update to Telegram
   */
  static async sendPaymentStatusUpdate(
    order: any,
    status: string,
    additionalInfo?: string
  ): Promise<boolean> {
    const configCheck = this.verifyConfiguration();
    if (!configCheck.valid) {
      console.error('Telegram configuration error:', configCheck.error);
      return false;
    }

    try {
      const statusEmoji =
        status === 'paid' ? '✅' : status === 'failed' ? '❌' : '⏳';
      const statusColor =
        status === 'paid' ? '🟢' : status === 'failed' ? '🔴' : '🟡';

      const message = `
${statusEmoji} <b>PAYMENT STATUS UPDATE</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛒 <b>ORDER INFORMATION</b>
📋 Order #: <code>${order.orderNumber}</code>
💰 Amount: <b>$${order.totalAmount.toFixed(2)}</b>
${statusColor} Status: <b>${status.toUpperCase()}</b>
👤 Customer: <code>${order.customerEmail || 'Not provided'}</code>

${
  additionalInfo
    ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

ℹ️ <b>ADDITIONAL INFORMATION</b>
${additionalInfo}`
    : ''
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ <b>Updated:</b> ${new Date().toLocaleString('en-AU', {
        timeZone: 'Australia/Sydney',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}

🔗 <a href="${
        process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'
      }/admin/orders">View Order Details</a>
      `.trim();

      return await this.sendMessage(message);
    } catch (error) {
      console.error('Error sending payment status update to Telegram:', error);
      return false;
    }
  }

  /**
   * Send payment failure notification to Telegram
   */
  static async sendPaymentFailureNotification(
    order: any,
    errorDetails?: string
  ): Promise<boolean> {
    const configCheck = this.verifyConfiguration();
    if (!configCheck.valid) {
      console.error('Telegram configuration error:', configCheck.error);
      return false;
    }

    try {
      // Format items for display
      const itemsList = order.items
        .map((item: any, index: number) => {
          const itemTotal = item.price * item.quantity;
          return `${index + 1}. <b>${item.name}</b>
   🎨 Color: ${item.color || 'N/A'}
   📦 Qty: ${item.quantity}
   💰 Price: $${item.price.toFixed(2)} each
   💵 Total: $${itemTotal.toFixed(2)}`;
        })
        .join('\n\n');

      const message = `
🚨 <b>PAYMENT FAILED!</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🛒 <b>ORDER DETAILS</b>
📋 Order #: <code>${order.orderNumber}</code>
💰 Amount: <b>$${order.totalAmount.toFixed(2)}</b>
❌ Status: <b>${order.paymentStatus.toUpperCase()}</b>
💳 Payment: ${order.paymentMethod || 'Stripe'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>CUSTOMER INFORMATION</b>
📧 Email: <code>${order.customerEmail || 'Not provided'}</code>
📱 Phone: <code>${order.customerPhone || 'Not provided'}</code>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📦 <b>ITEMS ORDERED</b>
${itemsList}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💳 <b>PAYMENT INFORMATION</b>
🔑 Session ID: <code>${order.stripeSessionId}</code>
🎯 Payment Intent: <code>${order.paymentIntent || 'Not available'}</code>

${
  errorDetails
    ? `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ <b>ERROR DETAILS</b>
${errorDetails}`
    : ''
}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ <b>Failed:</b> ${new Date().toLocaleString('en-AU', {
        timeZone: 'Australia/Sydney',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}

🔗 <b>QUICK ACTIONS</b>
👁️ <a href="${
        process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'
      }/admin/orders">View Order Details</a>
📧 <a href="mailto:${order.customerEmail || ''}">Email Customer</a>
📞 <a href="tel:${order.customerPhone || ''}">Call Customer</a>
      `.trim();

      return await this.sendMessage(message);
    } catch (error) {
      console.error(
        'Error sending payment failure notification to Telegram:',
        error
      );
      return false;
    }
  }

  /**
   * Send contact form notification to Telegram
   */
  static async sendContactFormNotification(contactData: {
    name: string;
    email: string;
    subject: string;
    message: string;
  }): Promise<boolean> {
    const configCheck = this.verifyConfiguration();
    if (!configCheck.valid) {
      console.error('Telegram configuration error:', configCheck.error);
      return false;
    }

    try {
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

      const message = `
📧 <b>NEW CONTACT FORM SUBMISSION</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

👤 <b>CUSTOMER INFORMATION</b>
👨‍💼 Name: <b>${contactData.name}</b>
📧 Email: <code>${contactData.email}</code>
📝 Subject: <b>${getSubjectDisplay(contactData.subject)}</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

💬 <b>MESSAGE</b>
${contactData.message}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ <b>Received:</b> ${new Date().toLocaleString('en-AU', {
        timeZone: 'Australia/Sydney',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })}

🔗 <b>QUICK ACTIONS</b>
📧 <a href="mailto:${contactData.email}">Reply to Customer</a>
🌐 <a href="${
        process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'
      }/contact">View Contact Form</a>
      `.trim();

      return await this.sendMessage(message);
    } catch (error) {
      console.error(
        'Error sending contact form notification to Telegram:',
        error
      );
      return false;
    }
  }

  /**
   * Send test message to Telegram
   */
  static async sendTestMessage(testMessage?: string): Promise<boolean> {
    const configCheck = this.verifyConfiguration();
    if (!configCheck.valid) {
      console.error('Telegram configuration error:', configCheck.error);
      return false;
    }

    try {
      const message = `
🧪 <b>TELEGRAM INTEGRATION TEST</b>

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

${testMessage || 'This is a test message from the Lens Aura Telegram service.'}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

⏰ <b>Test Time:</b> ${new Date().toLocaleString('en-AU', {
        timeZone: 'Australia/Sydney',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })}

✅ <b>Status:</b> Telegram integration is working correctly!
      `.trim();

      return await this.sendMessage(message);
    } catch (error) {
      console.error('Error sending test message to Telegram:', error);
      return false;
    }
  }
}

// Legacy function exports for backward compatibility
export async function sendPaymentNotification(
  order: any,
  paymentDetails?: any
) {
  return TelegramService.sendPaymentNotification(order, paymentDetails);
}

export async function sendPaymentStatusUpdate(
  order: any,
  status: string,
  additionalInfo?: string
) {
  return TelegramService.sendPaymentStatusUpdate(order, status, additionalInfo);
}

export async function sendPaymentFailureNotification(
  order: any,
  errorDetails?: string
) {
  return TelegramService.sendPaymentFailureNotification(order, errorDetails);
}

export async function sendOrderCancellationNotification(
  order: any,
  reason?: string
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;

  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID not configured');
    return false;
  }

  try {
    const message = `
<b>🚫 Order Cancelled</b>

🛒 <b>Order Details:</b>
• Order #: ${order.orderNumber}
• Amount: $${order.totalAmount.toFixed(2)}
• Status: CANCELLED
• Payment Method: ${order.paymentMethod || 'Stripe'}

👤 <b>Customer Details:</b>
• Email: ${order.customerEmail || 'Not provided'}
• Phone: ${order.customerPhone || 'Not provided'}

${reason ? `📝 <b>Reason:</b> ${reason}\n` : ''}

⏰ <b>Cancelled:</b> ${new Date().toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}

🔗 <b>View Order:</b> ${
      process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'
    }/admin/orders
    `.trim();

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

    console.log(
      'Order cancellation notification sent to Telegram successfully'
    );
    return true;
  } catch (error) {
    console.error(
      'Error sending order cancellation notification to Telegram:',
      error
    );
    return false;
  }
}

// Function to send refund notification to Telegram
export async function sendRefundNotification(
  order: any,
  refundAmount: number,
  reason?: string
) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;

  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID not configured');
    return false;
  }

  try {
    const message = `
<b>💰 Refund Processed</b>

🛒 <b>Order Details:</b>
• Order #: ${order.orderNumber}
• Original Amount: $${order.totalAmount.toFixed(2)}
• Refund Amount: $${refundAmount.toFixed(2)}
• Payment Method: ${order.paymentMethod || 'Stripe'}

👤 <b>Customer Details:</b>
• Email: ${order.customerEmail || 'Not provided'}
• Phone: ${order.customerPhone || 'Not provided'}

${reason ? `📝 <b>Refund Reason:</b> ${reason}\n` : ''}

⏰ <b>Refunded:</b> ${new Date().toLocaleString('en-AU', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })}

🔗 <b>Quick Actions:</b>
• View order: ${
      process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'
    }/admin/orders
• Contact customer: ${
      order.customerEmail
        ? `mailto:${order.customerEmail}`
        : 'Email not available'
    }
• Call customer: ${
      order.customerPhone ? `tel:${order.customerPhone}` : 'Phone not available'
    }
    `.trim();

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

    console.log('Refund notification sent to Telegram successfully');
    return true;
  } catch (error) {
    console.error('Error sending refund notification to Telegram:', error);
    return false;
  }
}
