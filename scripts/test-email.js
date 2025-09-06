// Simple script to test SendGrid email functionality
// Run with: node scripts/test-email.js

const sgMail = require('@sendgrid/mail');

// Load environment variables manually
const fs = require('fs');
const path = require('path');

function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  const envLocalPath = path.join(__dirname, '..', '.env.local');

  let envContent = '';

  if (fs.existsSync(envLocalPath)) {
    envContent = fs.readFileSync(envLocalPath, 'utf8');
  } else if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
  }

  envContent.split('\n').forEach((line) => {
    const [key, ...valueParts] = line.split('=');
    if (key && valueParts.length > 0) {
      process.env[key.trim()] = valueParts.join('=').trim();
    }
  });
}

loadEnvFile();

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

async function testEmail() {
  try {
    // Check environment variables
    console.log('🔍 Checking environment variables...');
    console.log(
      'SENDGRID_API_KEY:',
      process.env.SENDGRID_API_KEY ? '✅ Set' : '❌ Not set'
    );
    console.log('FROM_EMAIL:', process.env.FROM_EMAIL || '❌ Not set');

    if (!process.env.SENDGRID_API_KEY) {
      throw new Error('SENDGRID_API_KEY is not set in environment variables');
    }

    if (!process.env.FROM_EMAIL) {
      throw new Error('FROM_EMAIL is not set in environment variables');
    }

    // Test email data
    const testEmail = process.argv[2] || 'test@example.com';
    console.log(`\n📧 Sending test email to: ${testEmail}`);

    const msg = {
      to: testEmail,
      from: process.env.FROM_EMAIL,
      subject: '🧪 SendGrid Test Email - Direct Script',
      text: `Hello! This is a test email from Lens Aura.\n\nSent at: ${new Date().toISOString()}\n\nIf you received this email, SendGrid is working correctly!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333;">🧪 SendGrid Test Email - Direct Script</h2>
          <p>Hello! This is a test email from <strong>Lens Aura</strong>.</p>
          <p><strong>Sent at:</strong> ${new Date().toISOString()}</p>
          <p>If you received this email, SendGrid is working correctly! ✅</p>
          <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
          <p style="color: #666; font-size: 12px;">This is a test email from the Lens Aura mail service script.</p>
        </div>
      `,
    };

    console.log('📤 Sending email...');
    await sgMail.send(msg);
    console.log('✅ Email sent successfully!');
  } catch (error) {
    console.error('❌ Error sending email:', error);

    if (error.response) {
      console.error('SendGrid API Error Details:');
      console.error('Status:', error.response.status);
      console.error('Body:', error.response.body);
    }
  }
}

// Run the test
testEmail();
