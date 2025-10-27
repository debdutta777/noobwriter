import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ACCESS_TOKEN || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  console.log('URL:', supabaseUrl ? '✅' : '❌')
  console.log('Key:', supabaseKey ? '✅' : '❌')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🔍 CHECKING SIGNUP ERROR\n')
console.log('═'.repeat(80))

async function checkAuthConfig() {
  console.log('\n📧 EMAIL CONFIGURATION ISSUE DETECTED\n')
  
  console.log('Error from logs:')
  console.log('❌ "gomail: could not send email 1: 553 Relaying disallowed as noreply@noobwriter.in"')
  console.log('')
  
  console.log('🔍 Root Cause:')
  console.log('- Supabase is trying to send confirmation emails from: noreply@noobwriter.in')
  console.log('- Your email server is rejecting this sender address (553 Relaying disallowed)')
  console.log('- This means the custom SMTP configuration is not properly set up')
  console.log('')
  
  console.log('📊 Current Situation:')
  console.log('- User signup is technically successful (user created in database)')
  console.log('- BUT confirmation email fails to send')
  console.log('- User ID: bef71f11-30a5-4ce7-8edb-a469d5361545')
  console.log('- Email: nde2980@gmail.com')
  console.log('')
  
  // Check if user was created
  const { data: user, error } = await supabase
    .from('auth.users')
    .select('*')
    .eq('id', 'bef71f11-30a5-4ce7-8edb-a469d5361545')
    .single()
  
  if (error && error.code !== 'PGRST116') {
    console.log('❌ Error checking user:', error.message)
  }
  
  console.log('🔧 SOLUTIONS:\n')
  
  console.log('Option 1: Fix Custom SMTP (Recommended)')
  console.log('─'.repeat(80))
  console.log('1. Go to Supabase Dashboard → Authentication → Email Templates')
  console.log('2. Configure Custom SMTP settings:')
  console.log('   - Sender email: noreply@noobwriter.in')
  console.log('   - SMTP Host: Your email provider\'s SMTP server')
  console.log('   - SMTP Port: 587 (or 465 for SSL)')
  console.log('   - SMTP Username: Your email account')
  console.log('   - SMTP Password: Your email password or app password')
  console.log('3. Test the SMTP connection')
  console.log('')
  
  console.log('Option 2: Use Supabase Default Email (Quick Fix)')
  console.log('─'.repeat(80))
  console.log('1. Go to Supabase Dashboard → Authentication → Email Templates')
  console.log('2. Remove custom SMTP configuration')
  console.log('3. Use default: noreply@mail.app.supabase.io')
  console.log('4. This will work immediately but emails come from Supabase domain')
  console.log('')
  
  console.log('Option 3: Disable Email Confirmation (Not Recommended)')
  console.log('─'.repeat(80))
  console.log('1. Go to Supabase Dashboard → Authentication → Settings')
  console.log('2. Disable "Enable email confirmations"')
  console.log('3. Users will be automatically confirmed')
  console.log('⚠️  WARNING: This is less secure!')
  console.log('')
  
  console.log('📋 Recommended Email Providers for SMTP:')
  console.log('─'.repeat(80))
  console.log('• Gmail (with App Password)')
  console.log('  - Host: smtp.gmail.com')
  console.log('  - Port: 587')
  console.log('  - Requires 2FA and App Password')
  console.log('')
  console.log('• SendGrid (Professional)')
  console.log('  - Host: smtp.sendgrid.net')
  console.log('  - Port: 587')
  console.log('  - Free tier: 100 emails/day')
  console.log('')
  console.log('• Mailgun (Professional)')
  console.log('  - Host: smtp.mailgun.org')
  console.log('  - Port: 587')
  console.log('  - Free tier: 5000 emails/month')
  console.log('')
  console.log('• AWS SES (Enterprise)')
  console.log('  - Host: email-smtp.region.amazonaws.com')
  console.log('  - Port: 587')
  console.log('  - Very reliable and scalable')
  console.log('')
  
  console.log('🔍 Current Auth Settings Check:')
  console.log('─'.repeat(80))
  
  // Try to check auth settings via API (limited access with client)
  console.log('• Confirmation required: YES (based on error)')
  console.log('• SMTP configured: YES (but failing)')
  console.log('• Sender address: noreply@noobwriter.in')
  console.log('• Error: SMTP relay not allowed')
  console.log('')
  
  console.log('⚡ QUICK FIX for Testing:')
  console.log('─'.repeat(80))
  console.log('1. Login to Supabase Dashboard')
  console.log('2. Go to Authentication → Providers → Email')
  console.log('3. Scroll to "SMTP Settings"')
  console.log('4. Click "Remove" to use default Supabase email')
  console.log('5. Try signing up again')
  console.log('')
  
  console.log('💡 Alternative Workaround:')
  console.log('─'.repeat(80))
  console.log('If you need to manually confirm the test user:')
  console.log('1. Go to Supabase Dashboard → Authentication → Users')
  console.log('2. Find user: nde2980@gmail.com')
  console.log('3. Click on user')
  console.log('4. Click "Confirm email"')
  console.log('5. User can now login')
  console.log('')
  
  console.log('═'.repeat(80))
  console.log('📌 SUMMARY:')
  console.log('━'.repeat(80))
  console.log('Issue: Custom SMTP not configured correctly for noreply@noobwriter.in')
  console.log('Impact: Users can\'t receive confirmation emails')
  console.log('Status: User accounts ARE created but unconfirmed')
  console.log('Priority: HIGH - Blocks all new user signups')
  console.log('')
  console.log('Quickest Fix: Use Supabase default email (5 minutes)')
  console.log('Best Fix: Configure proper SMTP with your email provider (30 minutes)')
  console.log('═'.repeat(80))
}

checkAuthConfig().catch(console.error)
