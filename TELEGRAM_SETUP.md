# Telegram Integration Setup

## Overview

The contact form now sends messages to your Telegram group in addition to email notifications. This provides real-time notifications for new contact form submissions.

## Environment Variables Required

Add these to your `.env.local` file:

```env
TELEGRAM_BOT_TOKEN=your_bot_token_here
TELEGRAM_GROUP_ID=your_group_id_here
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

## How to Get Telegram Bot Token and Group ID

### 1. Create a Telegram Bot

1. Message [@BotFather](https://t.me/botfather) on Telegram
2. Send `/newbot`
3. Follow the instructions to create your bot
4. Copy the bot token (looks like: `123456789:ABCdefGHIjklMNOpqrsTUVwxyz`)

### 2. Get Your Group ID

1. Add your bot to your Telegram group
2. Send a message in the group
3. Visit: `https://api.telegram.org/bot<YOUR_BOT_TOKEN>/getUpdates`
4. Look for the `chat_id` in the response (it will be a negative number for groups)

## Testing the Integration

### Test API Endpoint

You can test the Telegram integration using the test endpoint:

```bash
# Test with default message
curl -X POST http://localhost:3000/api/test-telegram

# Test with custom message
curl -X POST http://localhost:3000/api/test-telegram \
  -H "Content-Type: application/json" \
  -d '{"testMessage": "Custom test message"}'
```

### Test Contact Form

1. Fill out the contact form on your website
2. Submit the form
3. Check your Telegram group for the notification message

## Message Format

The Telegram messages include:

- 📧 Contact form submission header
- 👤 Customer name
- 📧 Customer email
- 📝 Subject (with friendly display names)
- 💬 Customer message
- ⏰ Timestamp (Australian timezone)
- 🔗 Quick action links

## Troubleshooting

### Common Issues

1. **Bot not receiving messages**

   - Make sure the bot is added to the group
   - Verify the group ID is correct (should be negative for groups)
   - Check that the bot has permission to send messages

2. **Environment variables not working**

   - Restart your development server after adding environment variables
   - Verify the variable names are exactly as shown above

3. **API errors**
   - Check the browser console for error messages
   - Verify your bot token is valid
   - Ensure the group ID is correct

### Debug Steps

1. Test the bot manually by sending a message to it
2. Use the test endpoint to verify the integration
3. Check server logs for any error messages
4. Verify environment variables are loaded correctly

## Security Notes

- Keep your bot token secure and never commit it to version control
- The bot token gives full access to your bot, so treat it like a password
- Consider using environment-specific tokens for development/production

## Features

✅ Real-time notifications to Telegram group  
✅ Formatted messages with emojis and HTML formatting  
✅ Customer email and contact details  
✅ Timestamp in Australian timezone  
✅ Quick action links for easy response  
✅ Error handling and logging  
✅ Test endpoint for verification  
✅ Subject mapping for better readability

## Payment Notifications

The system now also sends payment-related notifications to Telegram:

### Payment Success Notifications
- 💳 New payment received notifications
- Complete order details including items, customer info, and shipping address
- Payment method and Stripe session information
- Quick action links for order management

### Payment Status Updates
- ✅ Payment status changes (paid, pending, failed)
- Real-time updates when payment status changes
- Additional context information when available

### Payment Failure Notifications
- ❌ Failed payment notifications
- Error details and troubleshooting information
- Customer contact information for follow-up

### Order Management Notifications
- 🚫 Order cancellation notifications
- 💰 Refund processed notifications
- Complete order history tracking

### Notification Features
- Rich formatting with emojis and HTML
- Australian timezone timestamps
- Quick action links for admin panel access
- Customer contact information for immediate response
- Comprehensive order details for quick assessment
