// Function to send payment notification to Telegram
export async function sendPaymentNotification(order: any, paymentDetails?: any) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;

  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID not configured');
    return false;
  }

  try {
    // Format items for display
    const itemsList = order.items
      .map((item: any) => 
        `• ${item.name} (${item.color}) - Qty: ${item.quantity} - $${item.price.toFixed(2)}`
      )
      .join('\n');

    // Format shipping address
    const address = order.shippingAddress;
    const addressText = address 
      ? `${address.street || ''}\n${address.city || ''}, ${address.state || ''} ${address.postalCode || ''}\n${address.country || 'Australia'}`
      : 'Not provided';

    // Format customer details
    const customerName = address 
      ? `${address.firstName || ''} ${address.lastName || ''}`.trim() || 'Not provided'
      : 'Not provided';

    // Create the message
    const message = `
<b>💳 New Payment Received!</b>

🛒 <b>Order Details:</b>
• Order #: ${order.orderNumber}
• Amount: $${order.totalAmount.toFixed(2)}
• Status: ${order.paymentStatus.toUpperCase()}
• Payment Method: ${order.paymentMethod || 'Stripe'}

👤 <b>Customer Details:</b>
• Name: ${customerName}
• Email: ${order.customerEmail || 'Not provided'}
• Phone: ${order.customerPhone || 'Not provided'}

📍 <b>Shipping Address:</b>
${addressText}

📦 <b>Items Ordered:</b>
${itemsList}

💳 <b>Payment Information:</b>
• Stripe Session ID: ${order.stripeSessionId}
• Payment Intent: ${order.paymentIntent || 'Not available'}
• Created: ${new Date(order.createdAt).toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}

🔗 <b>Quick Actions:</b>
• View order: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'}/admin/orders
• Contact customer: ${order.customerEmail ? `mailto:${order.customerEmail}` : 'Email not available'}
• Call customer: ${order.customerPhone ? `tel:${order.customerPhone}` : 'Phone not available'}
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

    console.log('Payment notification sent to Telegram successfully');
    return true;
  } catch (error) {
    console.error('Error sending payment notification to Telegram:', error);
    return false;
  }
}

// Function to send payment status update to Telegram
export async function sendPaymentStatusUpdate(order: any, status: string, additionalInfo?: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;

  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID not configured');
    return false;
  }

  try {
    const statusEmoji = status === 'paid' ? '✅' : status === 'failed' ? '❌' : '⏳';
    
    const message = `
<b>${statusEmoji} Payment Status Update</b>

🛒 <b>Order:</b> ${order.orderNumber}
💰 <b>Amount:</b> $${order.totalAmount.toFixed(2)}
📊 <b>Status:</b> ${status.toUpperCase()}
👤 <b>Customer:</b> ${order.customerEmail || 'Not provided'}

${additionalInfo ? `ℹ️ <b>Additional Info:</b>\n${additionalInfo}\n` : ''}

⏰ <b>Updated:</b> ${new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}

🔗 <b>View Order:</b> ${process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'}/admin/orders
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

    console.log('Payment status update sent to Telegram successfully');
    return true;
  } catch (error) {
    console.error('Error sending payment status update to Telegram:', error);
    return false;
  }
}

// Function to send payment failure notification to Telegram
export async function sendPaymentFailureNotification(order: any, errorDetails?: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_GROUP_ID;

  if (!botToken || !chatId) {
    console.error('Telegram bot token or chat ID not configured');
    return false;
  }

  try {
    // Format items for display
    const itemsList = order.items
      .map((item: any) => 
        `• ${item.name} (${item.color}) - Qty: ${item.quantity} - $${item.price.toFixed(2)}`
      )
      .join('\n');

    const message = `
<b>❌ Payment Failed!</b>

🛒 <b>Order Details:</b>
• Order #: ${order.orderNumber}
• Amount: $${order.totalAmount.toFixed(2)}
• Status: ${order.paymentStatus.toUpperCase()}
• Payment Method: ${order.paymentMethod || 'Stripe'}

👤 <b>Customer Details:</b>
• Email: ${order.customerEmail || 'Not provided'}
• Phone: ${order.customerPhone || 'Not provided'}

📦 <b>Items Ordered:</b>
${itemsList}

💳 <b>Payment Information:</b>
• Stripe Session ID: ${order.stripeSessionId}
• Payment Intent: ${order.paymentIntent || 'Not available'}

${errorDetails ? `⚠️ <b>Error Details:</b>\n${errorDetails}\n` : ''}

⏰ <b>Failed:</b> ${new Date().toLocaleString('en-AU', {
    timeZone: 'Australia/Sydney',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })}

🔗 <b>Quick Actions:</b>
• View order: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'}/admin/orders
• Contact customer: ${order.customerEmail ? `mailto:${order.customerEmail}` : 'Email not available'}
• Call customer: ${order.customerPhone ? `tel:${order.customerPhone}` : 'Phone not available'}
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

    console.log('Payment failure notification sent to Telegram successfully');
    return true;
  } catch (error) {
    console.error('Error sending payment failure notification to Telegram:', error);
    return false;
  }
}

// Function to send order cancellation notification to Telegram
export async function sendOrderCancellationNotification(order: any, reason?: string) {
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

🔗 <b>View Order:</b> ${process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'}/admin/orders
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

    console.log('Order cancellation notification sent to Telegram successfully');
    return true;
  } catch (error) {
    console.error('Error sending order cancellation notification to Telegram:', error);
    return false;
  }
}

// Function to send refund notification to Telegram
export async function sendRefundNotification(order: any, refundAmount: number, reason?: string) {
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
• View order: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://lensaura.com.au'}/admin/orders
• Contact customer: ${order.customerEmail ? `mailto:${order.customerEmail}` : 'Email not available'}
• Call customer: ${order.customerPhone ? `tel:${order.customerPhone}` : 'Phone not available'}
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
