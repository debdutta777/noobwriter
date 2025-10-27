// Test ZeptoMail Configuration
const nodemailer = require('nodemailer');

// ✅ CONFIGURATION ANALYSIS
console.log('🔍 ANALYZING ZEPTOMAIL CONFIGURATION\n');
console.log('═'.repeat(80));

const config = {
  host: "smtp.zeptomail.in",
  port: 587,
  user: "emailapikey",
  pass: "PHtE6r1fRb3qjG579UUH7fSwEs/xPNkr9epieQEWtooQDPIBTE1Rr4oukz/iqUx5UvUWRvGZnd5p5bPP5+6CIWbtYWdMWGqyqK3sx/VYSPOZsbq6x00ZuF0dcEPYU4/sddVs0ifXutbYNA==",
  from: '"Example Team" <noreply@noobwriter.in>',
  to: 'info@noobwriter.in'
};

console.log('📧 SMTP Server Details:');
console.log('─'.repeat(80));
console.log(`Host: ${config.host} ✅ Correct (ZeptoMail SMTP)`);
console.log(`Port: ${config.port} ✅ Correct (STARTTLS)`);
console.log(`Username: ${config.user} ✅ Correct (ZeptoMail auth method)`);
console.log(`Password: ${config.pass.substring(0, 20)}... ✅ Present (${config.pass.length} chars)`);
console.log('');

console.log('📨 Email Details:');
console.log('─'.repeat(80));
console.log(`From: ${config.from} ✅`);
console.log(`To: ${config.to} ✅`);
console.log('');

console.log('⚠️  POTENTIAL ISSUES TO CHECK:');
console.log('─'.repeat(80));
console.log('');

console.log('1. Domain Verification');
console.log('   ├─ Issue: noobwriter.in must be verified in ZeptoMail');
console.log('   ├─ Check: ZeptoMail Dashboard → Email Sending → Domains');
console.log('   └─ Action: Verify domain with DNS records');
console.log('');

console.log('2. Sender Email Authentication');
console.log('   ├─ Issue: noreply@noobwriter.in must be authorized sender');
console.log('   ├─ Check: ZeptoMail Dashboard → Verified Senders');
console.log('   └─ Action: Add and verify this email address');
console.log('');

console.log('3. API Key Validity');
console.log('   ├─ Issue: API key might be expired or revoked');
console.log('   ├─ Check: ZeptoMail Dashboard → API Keys');
console.log('   └─ Action: Verify key is active and has sending permissions');
console.log('');

console.log('4. Account Status');
console.log('   ├─ Issue: ZeptoMail account must be active');
console.log('   ├─ Check: Dashboard for any warnings/suspensions');
console.log('   └─ Action: Ensure billing/verification is complete');
console.log('');

console.log('═'.repeat(80));
console.log('🧪 RUNNING TEST EMAIL SEND...\n');

// Create transporter
const transport = nodemailer.createTransport({
  host: config.host,
  port: config.port,
  secure: false, // true for 465, false for other ports
  auth: {
    user: config.user,
    pass: config.pass
  }
});

// Mail options
const mailOptions = {
  from: config.from,
  to: config.to,
  subject: 'ZeptoMail Test - NoobWriter Configuration',
  html: `
    <h2>Test Email Successful</h2>
    <p>If you receive this email, your ZeptoMail SMTP configuration is working correctly.</p>
    <hr>
    <p><small>Sent via ZeptoMail SMTP - NoobWriter Platform</small></p>
  `,
  text: 'Test email sent successfully. ZeptoMail SMTP is working!'
};

// Send test email
transport.sendMail(mailOptions, (error, info) => {
  console.log('═'.repeat(80));
  if (error) {
    console.log('❌ EMAIL SEND FAILED\n');
    console.log('Error Details:');
    console.log('─'.repeat(80));
    console.log(error);
    console.log('');
    
    console.log('💡 COMMON ZEPTOMAIL ERRORS:\n');
    
    if (error.message.includes('EAUTH') || error.message.includes('authentication')) {
      console.log('❌ Authentication Failed');
      console.log('   ├─ API key is invalid or revoked');
      console.log('   ├─ Fix: Generate new API key in ZeptoMail dashboard');
      console.log('   └─ Dashboard → Settings → API Keys → Create New');
    }
    
    if (error.message.includes('ECONNECTION') || error.message.includes('ETIMEDOUT')) {
      console.log('❌ Connection Failed');
      console.log('   ├─ Network/firewall blocking SMTP port 587');
      console.log('   ├─ Fix: Check firewall settings');
      console.log('   └─ Try port 465 with secure: true');
    }
    
    if (error.message.includes('unverified') || error.message.includes('not authorized')) {
      console.log('❌ Domain/Sender Not Verified');
      console.log('   ├─ noobwriter.in not verified in ZeptoMail');
      console.log('   ├─ Fix: Verify domain in ZeptoMail dashboard');
      console.log('   └─ Dashboard → Domains → Add Domain → Verify DNS');
    }
    
    if (error.message.includes('550') || error.message.includes('rejected')) {
      console.log('❌ Email Rejected');
      console.log('   ├─ Sender address not authorized');
      console.log('   ├─ Fix: Add noreply@noobwriter.in as verified sender');
      console.log('   └─ Dashboard → Verified Senders → Add Email');
    }
    
    console.log('');
    console.log('🔧 NEXT STEPS:');
    console.log('1. Check ZeptoMail dashboard for account status');
    console.log('2. Verify domain ownership (DNS records)');
    console.log('3. Add sender email to verified list');
    console.log('4. Check API key permissions');
    console.log('5. Review ZeptoMail documentation');
    
  } else {
    console.log('✅ EMAIL SENT SUCCESSFULLY!\n');
    console.log('Success Details:');
    console.log('─'.repeat(80));
    console.log('Message ID:', info.messageId);
    console.log('Response:', info.response);
    console.log('');
    console.log('✨ Your ZeptoMail SMTP configuration is working correctly!');
    console.log('');
    console.log('📋 NEXT STEPS FOR SUPABASE:');
    console.log('─'.repeat(80));
    console.log('1. Go to Supabase Dashboard');
    console.log('2. Navigate to: Authentication → Providers → Email');
    console.log('3. Scroll to "SMTP Settings"');
    console.log('4. Fill in:');
    console.log('   ├─ Sender Name: NoobWriter');
    console.log('   ├─ Sender Email: noreply@noobwriter.in');
    console.log('   ├─ SMTP Host: smtp.zeptomail.in');
    console.log('   ├─ SMTP Port: 587');
    console.log('   ├─ SMTP Username: emailapikey');
    console.log('   └─ SMTP Password: [Your API Key]');
    console.log('5. Click "Save"');
    console.log('6. Click "Send Test Email"');
    console.log('');
    console.log('🎉 Once configured, user signups will work perfectly!');
  }
  console.log('═'.repeat(80));
});

// Connection test
transport.verify(function (error, success) {
  console.log('\n📡 SMTP CONNECTION TEST:');
  console.log('─'.repeat(80));
  if (error) {
    console.log('❌ Connection Failed:', error.message);
  } else {
    console.log('✅ Server is ready to accept messages');
    console.log('✅ Authentication successful');
  }
  console.log('');
});
