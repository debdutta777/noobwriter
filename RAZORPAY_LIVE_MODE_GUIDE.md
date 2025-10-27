# Razorpay Live Mode Configuration Guide

## Overview
This guide will help you switch from Razorpay **Test Mode** to **Live Mode** for production deployment.

---

## 🔴 CRITICAL: What You MUST Change Manually

### 1. **Razorpay Dashboard Settings** (MOST IMPORTANT)

#### Step 1: Log into Razorpay Dashboard
- Go to: https://dashboard.razorpay.com/
- Switch from **Test Mode** to **Live Mode** (toggle in top right)

#### Step 2: Generate Live API Keys
1. Navigate to **Settings** → **API Keys**
2. Click **Generate Live API Keys**
3. You'll receive:
   - **Key ID** (starts with `rzp_live_`)
   - **Key Secret** (starts with different characters)

⚠️ **IMPORTANT**: Keep these keys secure and NEVER commit them to Git!

#### Step 3: Update Environment Variables
Replace your `.env` file with **LIVE KEYS**:

```bash
# OLD TEST KEYS (Remove these)
# NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxx
# RAZORPAY_KEY_SECRET=test_secret_xxxxxxxxxxxx

# NEW LIVE KEYS (Use these)
NEXT_PUBLIC_RAZORPAY_KEY_ID=rzp_live_xxxxxxxxxxxx
RAZORPAY_KEY_SECRET=your_live_secret_key_here
RAZORPAY_WEBHOOK_SECRET=your_live_webhook_secret_here
```

---

### 2. **Configure Razorpay Webhooks** (CRITICAL)

Webhooks notify your server when payments succeed/fail.

#### Step 1: Create Webhook in Razorpay Dashboard
1. Go to **Settings** → **Webhooks**
2. Click **Create New Webhook**
3. Enter your webhook URL:
   ```
   https://yourdomain.com/api/razorpay/webhook
   ```
4. Select events to listen to:
   - ✅ `payment.authorized`
   - ✅ `payment.captured`
   - ✅ `payment.failed`
   - ✅ `order.paid`
   - ✅ `subscription.activated`
   - ✅ `subscription.charged`
   - ✅ `subscription.cancelled`

5. Click **Create Webhook**
6. Copy the **Webhook Secret** and add to `.env`:
   ```bash
   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxxx
   ```

---

### 3. **Update Payment Gateway URLs** (If Applicable)

If you have any hardcoded Razorpay URLs in your code (you shouldn't, but check):

**Test Mode URLs:**
```
https://api.razorpay.com/v1/...
```

**Live Mode URLs:**
```
https://api.razorpay.com/v1/...  (Same, but uses live keys)
```

The URLs remain the same; only the API keys change!

---

### 4. **Business Verification** (MANDATORY for Live Mode)

Razorpay requires business verification before accepting live payments:

#### Required Documents:
1. **Business PAN Card** or **Individual PAN Card**
2. **Bank Account Details** (for settlements)
3. **Business Proof** (one of):
   - GST Certificate
   - Incorporation Certificate
   - Partnership Deed
   - Proprietorship Certificate
4. **Address Proof** (Aadhar/Utility Bill)

#### Verification Process:
1. Go to **Settings** → **Business Settings**
2. Complete all verification steps
3. Wait for Razorpay approval (usually 24-48 hours)

⚠️ **You CANNOT accept live payments until verified!**

---

### 5. **Update Domain Whitelist** (CRITICAL)

Add your production domain to Razorpay whitelist:

1. Go to **Settings** → **Checkout Settings**
2. Under **Domain Whitelist**, add:
   ```
   https://noobwriter.in
   https://www.noobwriter.in
   ```
3. Save changes

⚠️ Payments will fail if domain is not whitelisted!

---

## ✅ What's Already Handled in Code

Good news! The following are already configured correctly in your project:

### 1. **Environment Variable Usage**
```typescript
// src/lib/razorpay/config.ts
export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,  // ✅ Already using env vars
  key_secret: process.env.RAZORPAY_KEY_SECRET,      // ✅ Already using env vars
})
```

### 2. **Dynamic Key Injection**
Frontend Razorpay script automatically uses the key from environment variables:
```javascript
const rzp = new Razorpay({
  key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID, // ✅ No code changes needed
  ...
})
```

### 3. **Webhook Signature Verification**
Already implemented to verify webhook authenticity (prevents fraud).

---

## 🧪 Testing Checklist (Before Going Live)

### Test Mode Testing (Current State)
- [x] Coin purchase flow works
- [x] Payment success redirects properly
- [x] Wallet updates correctly
- [x] Transaction records are saved

### Live Mode Testing (After Switching)
Use these test cards to verify live mode integration:

1. **Small Test Payment** (₹1-10):
   - Use your real debit/credit card
   - Complete actual payment
   - Verify money is deducted
   - Check transaction appears in Razorpay dashboard

2. **Refund Test**:
   - Process a test payment
   - Refund it from Razorpay dashboard
   - Verify refund appears in your bank account

3. **Webhook Test**:
   - Make a payment
   - Check server logs for webhook received
   - Verify webhook signature validation passes

---

## 🔒 Security Best Practices

### 1. **Environment Variables**
Never expose these in client-side code:
- ✅ `NEXT_PUBLIC_RAZORPAY_KEY_ID` (Safe - needed for frontend)
- ❌ `RAZORPAY_KEY_SECRET` (DANGEROUS - server-only!)
- ❌ `RAZORPAY_WEBHOOK_SECRET` (DANGEROUS - server-only!)

### 2. **Server-Side Validation**
Always verify payments on the server:
```typescript
// ✅ CORRECT (already implemented)
const isValid = verifyRazorpaySignature(...)
if (!isValid) throw new Error('Invalid payment')

// ❌ WRONG (never trust client)
// Just check if payment_id exists
```

### 3. **Amount Verification**
Always verify the payment amount matches expected amount:
```typescript
if (order.amount !== expectedAmount) {
  throw new Error('Amount mismatch')
}
```

---

## 📊 Monitoring & Analytics

### 1. **Razorpay Dashboard Metrics**
Monitor these daily:
- Total Transactions
- Success Rate (should be >95%)
- Failed Payments (investigate reasons)
- Refunds (track customer satisfaction)
- Settlement Status (money in bank)

### 2. **Server Logs**
Log these events:
- Payment initiated
- Payment success/failure
- Webhook received
- Any errors

### 3. **Database Queries**
Regularly check:
```sql
-- Total revenue
SELECT SUM(amount) FROM transactions WHERE payment_status = 'completed';

-- Failed payments
SELECT * FROM transactions WHERE payment_status = 'failed';

-- Pending settlements
SELECT * FROM transactions WHERE payment_status = 'pending';
```

---

## 🚨 Common Issues & Solutions

### Issue 1: "API Key is invalid"
**Cause**: Using test key in live mode or vice versa  
**Solution**: Verify `.env` has correct `rzp_live_` key

### Issue 2: "Domain not whitelisted"
**Cause**: Production domain not added to Razorpay  
**Solution**: Add domain in Razorpay Dashboard → Checkout Settings

### Issue 3: "Webhook signature verification failed"
**Cause**: Wrong webhook secret in `.env`  
**Solution**: Copy exact secret from Razorpay Dashboard

### Issue 4: "Payment captured but webhook not received"
**Cause**: Webhook URL unreachable or incorrect  
**Solution**: 
1. Check webhook URL is accessible: `curl https://yourdomain.com/api/razorpay/webhook`
2. Verify webhook is created in Razorpay dashboard
3. Check server logs for errors

### Issue 5: "Money deducted but order not completed"
**Cause**: Webhook processing failed  
**Solution**: Manually reconcile from Razorpay dashboard → Payments → Match payment_id with database

---

## 📝 Deployment Checklist

### Pre-Deployment
- [ ] Switch to Live Mode in Razorpay Dashboard
- [ ] Generate Live API Keys
- [ ] Update `.env` with live keys
- [ ] Complete business verification
- [ ] Add production domain to whitelist
- [ ] Create webhook with production URL
- [ ] Test small payment (₹1) on staging

### Post-Deployment
- [ ] Monitor Razorpay dashboard for first 24 hours
- [ ] Test actual payment on production
- [ ] Verify webhook is received
- [ ] Check settlements are processing
- [ ] Set up daily monitoring alerts

---

## 📞 Support Contacts

### Razorpay Support
- Email: support@razorpay.com
- Phone: +91 76529 00880
- Dashboard: https://dashboard.razorpay.com/

### NoobWriter Dev Team
- Email: info@noobwriter.in

---

## 📌 Quick Reference

| Item | Test Mode | Live Mode |
|------|-----------|-----------|
| Key ID | `rzp_test_xxxxx` | `rzp_live_xxxxx` |
| Payments | Fake (no money) | Real (money deducted) |
| Verification | Not required | **Required** |
| Webhook | Optional | **Mandatory** |
| Domain Whitelist | Not enforced | **Enforced** |

---

## 🎯 Summary

**YOU MUST MANUALLY CHANGE:**
1. ✅ Generate Live API Keys from Razorpay Dashboard
2. ✅ Update `.env` with live keys
3. ✅ Configure webhooks for production URL
4. ✅ Complete business verification
5. ✅ Add production domain to whitelist

**ALREADY HANDLED IN CODE:**
- ✅ Environment variable usage
- ✅ Dynamic key injection
- ✅ Webhook signature verification
- ✅ Payment flow logic

**After completing all steps above, your Razorpay integration will be production-ready! 🚀**

---

**Last Updated:** October 27, 2025  
**Author:** NoobWriter Dev Team
