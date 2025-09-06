// Simple script to validate email format
// Run with: node scripts/validate-email.js your-email@example.com

function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function testEmailValidation() {
  const testEmail = process.argv[2];

  if (!testEmail) {
    console.log('Usage: node scripts/validate-email.js your-email@example.com');
    console.log('\nTesting with common email formats:');

    const testEmails = [
      'test@example.com',
      'user.name@domain.co.uk',
      'user+tag@example.org',
      'invalid-email',
      'user@',
      '@domain.com',
      'user@domain',
      'user name@domain.com',
    ];

    testEmails.forEach((email) => {
      const isValid = validateEmail(email);
      console.log(`${email}: ${isValid ? '✅ Valid' : '❌ Invalid'}`);
    });
    return;
  }

  const isValid = validateEmail(testEmail);
  console.log(`Email: ${testEmail}`);
  console.log(`Valid: ${isValid ? '✅ Yes' : '❌ No'}`);

  if (!isValid) {
    console.log('\nEmail format requirements:');
    console.log('- Must contain @ symbol');
    console.log('- Must have text before @');
    console.log('- Must have text after @');
    console.log('- Must have a dot (.) in the domain part');
    console.log('- No spaces allowed');
  }
}

testEmailValidation();
