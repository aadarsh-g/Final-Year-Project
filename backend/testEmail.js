// Test Email Configuration
require('dotenv').config();
const { testEmailConfig, sendVerificationOTP } = require('./services/emailService');

console.log('\n🔍 Testing Email Configuration...\n');

console.log('Environment Variables:');
console.log('EMAIL_HOST:', process.env.EMAIL_HOST || '❌ NOT SET');
console.log('EMAIL_PORT:', process.env.EMAIL_PORT || '❌ NOT SET');
console.log('EMAIL_USER:', process.env.EMAIL_USER || '❌ NOT SET');
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '✅ SET (hidden)' : '❌ NOT SET');
console.log('EMAIL_FROM:', process.env.EMAIL_FROM || '❌ NOT SET');
console.log('');

// Test connection
testEmailConfig().then(async (success) => {
  if (success) {
    console.log('✅ Email server connection successful!\n');
    
    // Try sending a test email
    console.log('📧 Sending test OTP email...\n');
    try {
      const testOTP = '123456';
      await sendVerificationOTP(
        process.env.EMAIL_USER, // Send to yourself for testing
        'Test User',
        testOTP
      );
      console.log('✅ Test email sent successfully!');
      console.log('📬 Check your inbox:', process.env.EMAIL_USER);
      console.log('🔢 Test OTP:', testOTP);
    } catch (error) {
      console.error('❌ Failed to send test email:', error.message);
    }
  } else {
    console.error('❌ Email server connection failed!');
    console.error('\n🔧 Common Fixes:');
    console.error('1. Check EMAIL_USER and EMAIL_PASS in .env');
    console.error('2. Use App Password (not regular Gmail password)');
    console.error('3. Enable 2-Factor Authentication first');
    console.error('4. Get App Password: https://myaccount.google.com/apppasswords');
  }
  
  process.exit(0);
}).catch(error => {
  console.error('❌ Error:', error.message);
  process.exit(1);
});
