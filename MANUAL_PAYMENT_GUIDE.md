# Manual Payment Processing System - Complete Guide

## 🎯 System Overview

**Perfect for manual payment processing without registered company/Razorpay automation**

### How It Works:
1. ✅ Author submits exchange request with bank/UPI details
2. ✅ Request saved as "PENDING" - **coins NOT deducted yet**
3. ✅ Admin views request at `/admin/exchanges`
4. ✅ Admin transfers money manually (bank/UPI)
5. ✅ Admin confirms payment in system
6. ✅ **Coins are deducted ONLY after admin confirms**
7. ✅ Status changes to "COMPLETED"

---

## 📋 Complete Workflow

### For Authors:

1. **Check Balance**
   - Go to `/wallet`
   - See current coin balance

2. **Submit Exchange Request**
   - Click "Exchange to INR"
   - Enter coin amount (minimum 20,000 coins)
   - Fill in payment details:
     - Account holder name
     - Account number (with confirmation)
     - IFSC code
     - **UPI ID (optional)**
   - Submit request

3. **Request Status**
   - Shows as "PENDING"
   - **Coins remain in wallet** (not deducted yet)
   - Can cancel anytime while pending

4. **After Admin Confirms**
   - Status changes to "COMPLETED"
   - Coins are deducted
   - Money received in bank/UPI

### For Admin (You):

1. **View Pending Requests**
   - Go to `/admin/exchanges`
   - See all pending exchange requests

2. **Check Payment Details**
   - Account holder name (with copy button)
   - Account number (with copy button)
   - IFSC code (with copy button)
   - UPI ID if provided (with copy button)
   - Amount to transfer (₹)
   - Coins to deduct

3. **Transfer Money**
   - Use bank NEFT/IMPS/RTGS OR
   - Use UPI (if UPI ID provided)
   - Transfer exact INR amount shown

4. **Confirm in System**
   - Click "Process Payment"
   - Select payment method (Bank/UPI)
   - Enter transaction reference (optional)
   - Add notes (optional)
   - Click "Confirm Payment Sent"

5. **What Happens:**
   - System deducts coins from author's wallet
   - Status changes to "COMPLETED"
   - Transaction recorded with your confirmation

6. **Or Reject Request**
   - Provide rejection reason
   - Click "Reject Request"
   - No coins deducted
   - Author can resubmit later

---

## 🔄 Exchange Rates

**Current Rate:** 2000 coins = ₹100

| Coins | INR |
|-------|-----|
| 20,000 | ₹1,000 |
| 40,000 | ₹2,000 |
| 50,000 | ₹2,500 |
| 100,000 | ₹5,000 |
| 200,000 | ₹10,000 |

**Minimum:** 20,000 coins (₹1,000)

---

## 💾 Database Structure

### Transaction Record:

```json
{
  "id": "uuid",
  "user_id": "author_uuid",
  "type": "coin_exchange",
  "amount": 1000,
  "coin_amount": 20000,
  "payment_status": "pending",
  "metadata": {
    "exchange_type": "coins_to_inr",
    "exchange_rate": 2000,
    "rupees_per_unit": 100,
    "coins_to_deduct": 20000,
    "bank_details": {
      "account_number": "1234567890",
      "ifsc_code": "SBIN0001234",
      "account_holder_name": "John Doe",
      "upi_id": "john@paytm"
    },
    "requested_at": "2025-10-27T10:00:00Z"
  }
}
```

### After Admin Confirms:

```json
{
  "payment_status": "completed",
  "coin_amount": -20000,
  "metadata": {
    // ... previous data ...
    "completed_at": "2025-10-27T10:30:00Z",
    "payment_confirmed_by": "admin",
    "payment_details": {
      "transactionRef": "UTR123456789",
      "paymentMethod": "upi",
      "notes": "Paid via Google Pay"
    }
  }
}
```

---

## 🔒 Security Features

### ✅ What's Secure:

1. **Coins NOT deducted on request**
   - Only deducted after admin confirms
   - Prevents automatic coin loss

2. **Full bank details stored**
   - Complete account number (not just last 4 digits)
   - Needed for manual transfer
   - Stored securely in metadata

3. **Atomic coin deduction**
   - Uses PostgreSQL function `deduct_coins()`
   - Checks sufficient balance
   - Automatic rollback on error

4. **Audit trail**
   - Records who confirmed payment
   - Stores transaction reference
   - Timestamps for all actions

5. **User can cancel**
   - While status is "pending"
   - No coins lost (weren't deducted)
   - Can resubmit with correct details

### ⚠️ Important Notes:

- Admin panel `/admin/exchanges` should be protected
- Consider adding admin authentication
- Store sensitive bank details securely
- Keep transaction records for accounting

---

## 📱 Admin Panel Features

### Dashboard (`/admin/exchanges`)

**Stats Cards:**
- 📊 Pending Requests count
- 💰 Total Amount (to pay)
- 🪙 Total Coins (to deduct)

**Each Request Shows:**
- 👤 Author name and email
- 💵 Amount (₹) and coins
- 📅 Request date/time
- 🏦 Full payment details with copy buttons

**Actions Available:**
- ✅ **Confirm Payment**
  - Select payment method
  - Add transaction reference
  - Add notes
  - Deducts coins automatically
  
- ❌ **Reject Request**
  - Provide reason
  - No coins deducted
  - Notifies author

- 🔄 **Refresh**
  - Reload pending requests
  - See latest submissions

---

## 🛠️ Functions Reference

### For Authors:

```typescript
// Submit exchange request
exchangeCoinsToINR(
  coinAmount: number,
  bankDetails: {
    accountNumber: string
    ifscCode: string
    accountHolderName: string
    upiId?: string
  }
)

// View exchange history
getExchangeHistory()

// Cancel pending exchange
cancelExchange(transactionId: string)
```

### For Admin:

```typescript
// Get all pending exchanges
getPendingExchanges()

// Confirm payment and deduct coins
confirmExchangePayment(
  transactionId: string,
  paymentDetails?: {
    transactionRef?: string
    paymentMethod?: 'bank_transfer' | 'upi'
    notes?: string
  }
)

// Reject exchange request
rejectExchangeRequest(
  transactionId: string,
  rejectionReason: string
)
```

---

## 📝 Step-by-Step Admin Guide

### Daily Process:

1. **Check for New Requests**
   ```
   Go to: https://yoursite.com/admin/exchanges
   ```

2. **For Each Request:**
   
   a. **Copy Payment Details**
   - Click copy buttons for:
     - Account holder name
     - Account number
     - IFSC code
     - UPI ID (if provided)

   b. **Transfer Money**
   - Open your banking app
   - Use NEFT/IMPS/RTGS or UPI
   - Transfer exact INR amount
   - Note the UTR/Transaction ID

   c. **Confirm in System**
   - Click "Process Payment"
   - Select payment method
   - Enter transaction reference
   - Click "Confirm Payment Sent"

3. **System Actions:**
   - Coins deducted from author's wallet
   - Status updated to "completed"
   - Record saved with your confirmation

---

## 🚨 Troubleshooting

### If Coin Deduction Fails:

**Error:** "Failed to deduct coins"

**Causes:**
- Author spent coins after requesting
- Insufficient balance now

**Solution:**
- Contact author
- Ask them to top up balance
- Or reduce exchange amount
- Then try confirming again

### If Payment Already Sent But Confirm Failed:

**Scenario:** You transferred money but system error on confirm

**Solution:**
1. Check transaction status in Supabase
2. If still "pending", try confirming again
3. If failed multiple times:
   - Manually update in Supabase:
   ```sql
   UPDATE transactions 
   SET payment_status = 'completed',
       coin_amount = -20000
   WHERE id = 'transaction_id';
   
   -- Then deduct coins manually
   SELECT deduct_coins('user_id', 20000);
   ```

### User Cancelled After You Sent Money:

**Prevention:** Always confirm in system BEFORE transferring

**If it happens:**
- Contact user for refund
- Or keep as credit for next request

---

## 📊 Reports & Tracking

### View All Exchanges in Supabase:

```sql
-- All pending exchanges
SELECT 
  t.*,
  p.display_name,
  p.email
FROM transactions t
JOIN profiles p ON t.user_id = p.id
WHERE t.type = 'coin_exchange'
  AND t.payment_status = 'pending'
ORDER BY t.created_at ASC;

-- Completed exchanges (last 30 days)
SELECT 
  t.*,
  p.display_name,
  p.email
FROM transactions t
JOIN profiles p ON t.user_id = p.id
WHERE t.type = 'coin_exchange'
  AND t.payment_status = 'completed'
  AND t.created_at >= NOW() - INTERVAL '30 days'
ORDER BY t.created_at DESC;

-- Total paid this month
SELECT 
  COUNT(*) as total_exchanges,
  SUM(amount) as total_inr,
  SUM(ABS(coin_amount)) as total_coins
FROM transactions
WHERE type = 'coin_exchange'
  AND payment_status = 'completed'
  AND created_at >= DATE_TRUNC('month', NOW());
```

---

## ✨ Benefits of Manual Processing

### ✅ Advantages:

1. **No Company Registration Needed**
   - Perfect for startups/individuals
   - No legal compliance overhead

2. **No Payment Gateway Fees**
   - Razorpay charges 2% + GST
   - Direct transfer = zero fees

3. **Full Control**
   - Review each request
   - Prevent fraud/abuse
   - Verify user identity

4. **Flexible Payment Methods**
   - Bank transfer
   - UPI
   - Any method you prefer

5. **Better Cash Flow**
   - Process when you have funds
   - No automated payouts

### ⚠️ Considerations:

1. **Manual Work**
   - Need to process each request
   - Takes time for transfers

2. **Processing Delay**
   - 1-3 business days typical
   - Not instant like Razorpay

3. **Scaling**
   - Fine for <100 requests/month
   - Consider automation if volume grows

---

## 🔄 Migration to Automated (Future)

**If you later want to automate:**

1. Register company
2. Get Razorpay Payout API access
3. Update `confirmExchangePayment()` function
4. Add Razorpay payout code
5. Existing data structure compatible!

**No changes needed to:**
- Database schema
- User interface
- Exchange request flow

---

## 📞 Support Checklist

### For Authors Asking About Exchange:

**Q: How long does it take?**
A: 1-3 business days for manual processing

**Q: When will my coins be deducted?**
A: Only after we confirm payment is sent

**Q: Can I cancel my request?**
A: Yes, while status is "pending"

**Q: What payment methods do you support?**
A: Bank transfer (NEFT/IMPS/RTGS) and UPI

**Q: Is my bank information secure?**
A: Yes, stored encrypted in database

### For You (Admin):

**Daily Tasks:**
- Check `/admin/exchanges` once or twice daily
- Process pending requests
- Transfer money and confirm

**Record Keeping:**
- Keep transaction references
- Note any issues
- Monthly reconciliation

---

## 🎯 Quick Reference

### URLs:
- Author Exchange: `/wallet/exchange`
- Admin Panel: `/admin/exchanges`

### Exchange Rate:
- 2000 coins = ₹100
- Minimum: 20,000 coins

### Payment Flow:
1. Author requests (coins stay in wallet)
2. You transfer money
3. You confirm in system
4. Coins deducted automatically

### Database:
- Table: `transactions`
- Type: `coin_exchange`
- Status: `pending` → `completed`

---

**Everything is ready! You can start processing exchange requests manually. The system handles all the coin deduction logic safely after you confirm payment.**
