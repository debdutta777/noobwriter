# 🚀 QUICK DEPLOYMENT GUIDE - Manual Steps Required

## ✅ Code Changes (DONE)
All code changes are complete and tested. Build successful!

---

## ⚠️ MANUAL CONFIGURATION REQUIRED

### 1️⃣ Razorpay Live Mode Setup

#### Step A: Generate Live API Keys
🔗 **Go to:** https://dashboard.razorpay.com/
1. Toggle from **Test Mode** to **Live Mode** (top right)
2. Go to **Settings** → **API Keys**
3. Click **Generate Live Keys**
4. Copy these values:

```bash
# Add to .env file
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_secret_key_here
```

#### Step B: Configure Webhooks
1. Go to **Settings** → **Webhooks**
2. Click **Create New Webhook**
3. Enter URL: `https://noobwriter.in/api/razorpay/webhook`
4. Select events:
   - ✅ payment.authorized
   - ✅ payment.captured  
   - ✅ payment.failed
   - ✅ order.paid
   - ✅ subscription.activated
   - ✅ subscription.charged
   - ✅ subscription.cancelled
5. Copy **Webhook Secret** and add to `.env`:
```bash
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
```

#### Step C: Complete Business Verification
1. Go to **Settings** → **Business Settings**
2. Upload required documents:
   - PAN Card
   - Bank Account Details
   - Business Proof (GST/Certificate)
   - Address Proof
3. Wait for approval (24-48 hours)

#### Step D: Whitelist Domain
1. Go to **Settings** → **Checkout Settings**
2. Under **Domain Whitelist**, add:
   ```
   https://noobwriter.in
   https://www.noobwriter.in
   ```
3. Save

---

### 2️⃣ Supabase Email Configuration (ZeptoMail)

#### Configure SMTP in Supabase Dashboard
🔗 **Go to:** https://supabase.com/dashboard/project/YOUR_PROJECT/auth/providers

1. Navigate to **Authentication** → **Providers** → **Email**
2. Scroll to **SMTP Settings**
3. Enable **Custom SMTP**
4. Enter these values:

```plaintext
Sender Name: NoobWriter
Sender Email: noreply@noobwriter.in

SMTP Host: smtp.zeptomail.in
SMTP Port: 587
SMTP Username: emailapikey
SMTP Password: [Your ZeptoMail API Key - you already have this]

Enable TLS: Yes
```

5. Click **Save**

**Result:** Users will receive confirmation emails when they sign up! 📧

---

### 3️⃣ Environment Variables Checklist

Make sure your `.env` file has all these:

```bash
# Supabase (Already configured)
NEXT_PUBLIC_SUPABASE_URL=https://gkhsrwebwdabzmojefry.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Razorpay LIVE (UPDATE THESE!)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx  # ⚠️ CHANGE THIS
RAZORPAY_KEY_SECRET=your_live_secret_key           # ⚠️ CHANGE THIS
RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx         # ⚠️ CHANGE THIS

# App Configuration
NEXT_PUBLIC_APP_URL=https://noobwriter.in
NEXT_PUBLIC_APP_NAME=NoobWriter
```

---

## 🧪 Testing Before Production

### Test 1: Sign Up Flow
1. Go to `/auth/signup`
2. Create a test account
3. Check you see the email confirmation page ✅
4. Check your email inbox (or spam) ✅
5. Click confirmation link ✅
6. Try to log in ✅

### Test 2: Sign In Flow
1. Go to `/auth/login`
2. Enter credentials
3. Verify redirect to homepage (`/`) ✅
4. Check you can access all pages ✅

### Test 3: Google OAuth
1. Go to `/auth/login`
2. Click "Continue with Google"
3. Complete Google sign-in
4. Verify redirect to homepage (`/`) ✅

### Test 4: Live Payment (AFTER RAZORPAY SETUP)
1. Go to `/wallet` or `/coins/purchase`
2. Select a coin package (use smallest - ₹99)
3. Complete payment with **real** card
4. Verify money is deducted ✅
5. Check coins added to wallet ✅
6. Check transaction in Razorpay dashboard ✅
7. Verify webhook was received (check server logs) ✅

---

## 📋 Deployment Sequence

```
1. Update .env with Razorpay LIVE keys ⚠️ CRITICAL
2. Configure Razorpay webhooks ⚠️ CRITICAL
3. Complete Razorpay business verification ⚠️ REQUIRED
4. Add domain to Razorpay whitelist ⚠️ CRITICAL
5. Configure ZeptoMail SMTP in Supabase ⚠️ REQUIRED
6. Deploy to production
7. Test sign up flow
8. Test sign in flow
9. Test small live payment (₹1-10)
10. Monitor for 24 hours ✅
```

---

## 🔴 CRITICAL WARNINGS

### ⚠️ DO NOT GO LIVE WITHOUT:
- [ ] Razorpay business verification APPROVED
- [ ] Live API keys configured
- [ ] Webhooks configured for production URL
- [ ] Domain whitelisted
- [ ] Test payment completed successfully

### ⚠️ NEVER COMMIT TO GIT:
- RAZORPAY_KEY_SECRET
- RAZORPAY_WEBHOOK_SECRET
- SUPABASE_SERVICE_ROLE_KEY

Keep these in `.env` (already in `.gitignore`)

---

## 📞 Emergency Contacts

### Razorpay Issues
- **Support:** support@razorpay.com
- **Phone:** +91 76529 00880
- **Dashboard:** https://dashboard.razorpay.com/

### Supabase Issues
- **Support:** support@supabase.com
- **Discord:** https://discord.supabase.com
- **Dashboard:** https://supabase.com/dashboard

### ZeptoMail Issues
- **Support:** support@zeptomail.com
- **Dashboard:** https://www.zoho.com/zeptomail/

---

## ✅ Current Status

**Code:** ✅ Ready  
**Build:** ✅ Successful  
**Authentication:** ✅ Updated  
**Email Confirmation:** ✅ Created  
**Razorpay Config:** ⏳ Needs manual setup  
**Email SMTP:** ⏳ Needs manual setup  

---

## 🎯 Next Steps

1. **RIGHT NOW:** Update `.env` with Razorpay LIVE keys
2. **TODAY:** Configure Razorpay webhooks and domain whitelist
3. **TODAY:** Configure ZeptoMail SMTP in Supabase
4. **THIS WEEK:** Complete Razorpay business verification
5. **AFTER APPROVAL:** Test live payment
6. **THEN:** Deploy to production

---

**For detailed instructions, see:**
- `RAZORPAY_LIVE_MODE_GUIDE.md` - Complete Razorpay setup guide
- `AUTH_PAYMENT_UPDATES.md` - Summary of all changes made

**Good luck with your deployment! 🚀**
