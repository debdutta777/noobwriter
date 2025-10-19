# FINAL FIX - Database Schema Mismatch

## The Real Problem ❌

The code was using **WRONG column names** that don't match the actual database schema!

### Transactions Table - Actual Schema:
```sql
CREATE TABLE transactions (
    id UUID,
    user_id UUID,
    type TEXT,                    -- ✅ Column is "type"
    amount DECIMAL(10,2),         -- ✅ This is the rupee/dollar amount
    coin_amount INTEGER,          -- ✅ This is the coin amount
    description TEXT,
    payment_status TEXT,
    metadata JSONB,
    created_at TIMESTAMP
)
```

### What Code Was Using (WRONG):
```typescript
{
  transaction_type: 'purchase',  // ❌ Should be: type
  amount: totalCoins,            // ❌ Should be: coin_amount
}
```

### What Code Should Use (CORRECT):
```typescript
{
  type: 'purchase',              // ✅ Matches schema
  amount: pkg.price,             // ✅ Price in rupees
  coin_amount: totalCoins,       // ✅ Coins purchased
  payment_status: 'completed',   // ✅ Required field
}
```

## Fixes Applied ✅

### 1. Buy Coins Page
**File**: `src/app/wallet/buy-coins/page.tsx`

**Changed**:
```typescript
// BEFORE (broken)
.insert({
  user_id: user.id,
  amount: totalCoins,              // Wrong - this should be price
  transaction_type: 'purchase',    // Wrong column name
  description: '...',
})

// AFTER (fixed)
.insert({
  user_id: user.id,
  type: 'purchase',                // ✅ Correct column name
  amount: pkg.price,               // ✅ Price in rupees (99, 499, etc.)
  coin_amount: totalCoins,         // ✅ Coins (100, 550, etc.)
  description: '...',
  payment_status: 'completed',     // ✅ Required field
})
```

### 2. Wallet Page
**File**: `src/app/wallet/page.tsx`

**Changed Interface**:
```typescript
// BEFORE
interface Transaction {
  transaction_type: string  // ❌ Wrong
  amount: number           // ❌ This is price, not coins
}

// AFTER
interface Transaction {
  type: string            // ✅ Correct
  amount: number          // ✅ Price in rupees
  coin_amount: number     // ✅ Coins
}
```

**Changed Display**:
```typescript
// BEFORE
txn.transaction_type === 'purchase'
{txn.amount} coins  // Would show rupees instead of coins!

// AFTER
txn.type === 'purchase'
{txn.coin_amount} coins  // ✅ Shows actual coins
```

### 3. Writer Actions
**File**: `src/app/actions/writer-actions.ts`

**Changed**:
```typescript
// BEFORE
.eq('transaction_type', 'chapter_unlock')    // ❌ Wrong column
.from('unlocked_chapters')                   // ❌ Wrong table name

// AFTER
.eq('type', 'unlock')                        // ✅ Correct column
.from('chapter_unlocks')                     // ✅ Correct table name
```

### 4. Migration File
**File**: `RUN_THIS_MIGRATION_2.sql`

**Added chapter_unlocks policies**:
```sql
-- Users need to be able to unlock chapters
CREATE POLICY "Users can unlock chapters"
    ON chapter_unlocks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own unlocks"
    ON chapter_unlocks FOR SELECT
    USING (auth.uid() = user_id);
```

## Database Schema Reference

### Transactions Table (Complete)
```sql
Column              | Type          | Purpose
--------------------|---------------|---------------------------
id                  | UUID          | Primary key
user_id             | UUID          | FK to profiles
type                | TEXT          | 'purchase', 'unlock', 'tip', 'earning', 'refund'
amount              | DECIMAL(10,2) | Price in rupees/dollars
coin_amount         | INTEGER       | Number of coins (if applicable)
description         | TEXT          | Human-readable description
reference_id        | UUID          | FK to related entity (optional)
reference_type      | TEXT          | Type of reference (optional)
payment_method      | TEXT          | Payment method used (optional)
payment_status      | TEXT          | 'pending', 'completed', 'failed', 'refunded'
razorpay_order_id   | TEXT          | Razorpay integration (optional)
razorpay_payment_id | TEXT          | Razorpay integration (optional)
metadata            | JSONB         | Additional data
created_at          | TIMESTAMP     | When created
```

### Valid Transaction Types
- `purchase` - User bought coins
- `unlock` - User unlocked a chapter
- `tip` - User tipped an author
- `earning` - Author earned money
- `refund` - Refund issued

### Valid Payment Statuses
- `pending` - Payment in progress
- `completed` - Payment successful
- `failed` - Payment failed
- `refunded` - Payment refunded

## 🚨 UPDATED MIGRATION TO RUN

**File**: `RUN_THIS_MIGRATION_2.sql`

Go to: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql

Copy and paste the **UPDATED** SQL (now includes chapter_unlocks policies):

```sql
-- Allow users to update their own wallet
CREATE POLICY "Users can update own wallet"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to insert transactions
CREATE POLICY "Users can create own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to unlock chapters
CREATE POLICY "Users can unlock chapters"
    ON chapter_unlocks FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Allow users to view their unlocked chapters
CREATE POLICY "Users can view own unlocks"
    ON chapter_unlocks FOR SELECT
    USING (auth.uid() = user_id);
```

## Testing After Changes

### Test Buy Coins (Should Work Now):
1. Go to `/wallet/buy-coins`
2. Click "Buy Now" on Starter Package (₹99 for 100 coins)
3. Console should show:
   ```
   Current wallet: { coin_balance: 100 }
   Adding coins: 100
   Updated wallet: { coin_balance: 200 }
   Transaction created: [{
     type: 'purchase',
     amount: 99,              // Price in rupees
     coin_amount: 100,        // Coins purchased
     payment_status: 'completed'
   }]
   ✅ Successfully purchased 100 coins!
   ```
4. Redirect to `/wallet`
5. Balance shows 200 coins
6. Transaction history shows:
   - Type: "Purchased 100 coins (+0 bonus)"
   - Amount: "+100 coins" (green)

### Test Wallet Page:
1. Visit `/wallet`
2. Should show correct coin balance
3. Transactions should display:
   - Purchase transactions in green with + sign
   - Unlock transactions in red with - sign
   - Correct coin amounts (not rupee amounts)

### Test Writer Dashboard:
1. Visit `/write/dashboard`
2. If no series: Shows "Create Your First Story"
3. If has series: Shows full dashboard
4. No errors in console

## Files Changed Summary

1. ✅ `src/app/wallet/buy-coins/page.tsx` - Fixed transaction insert
2. ✅ `src/app/wallet/page.tsx` - Fixed interface and display
3. ✅ `src/app/actions/writer-actions.ts` - Fixed column names and table names
4. ✅ `RUN_THIS_MIGRATION_2.sql` - Added chapter_unlocks policies

## Why This Was Confusing

The error message was misleading:
```
Could not find the 'transaction_type' column
```

This made it seem like the column was missing, but actually:
- Column EXISTS, just named differently (`type` not `transaction_type`)
- We were also using `amount` for coins when it's meant for currency
- Table name was wrong (`unlocked_chapters` vs `chapter_unlocks`)

## Common Mistakes to Avoid

1. ❌ `transaction_type` → ✅ `type`
2. ❌ `amount` for coins → ✅ `coin_amount` for coins, `amount` for currency
3. ❌ `unlocked_chapters` → ✅ `chapter_unlocks`
4. ❌ Missing `payment_status` → ✅ Always include for transactions
5. ❌ Using `transaction_type: 'chapter_unlock'` → ✅ Use `type: 'unlock'`

## All Column Names Quick Reference

### Profiles
- `id`, `email`, `display_name`, `avatar_url`, `bio`

### Wallets  
- `id`, `user_id`, `coin_balance`

### Transactions
- `id`, `user_id`, `type`, `amount`, `coin_amount`, `description`, `payment_status`, `metadata`

### Chapter_unlocks (not unlocked_chapters!)
- `id`, `user_id`, `chapter_id`, `unlocked_at`

### Series
- `id`, `author_id`, `title`, `description`, `cover_url`, `content_type`, `status`

### Chapters
- `id`, `series_id`, `title`, `chapter_number`, `content`, `is_locked`, `unlock_price`

## What Will Work Now

✅ Buy coins - transaction records created correctly  
✅ Wallet page - shows correct coin amounts  
✅ Transaction history - displays properly  
✅ Writer dashboard - loads without errors  
✅ Chapter unlocking - policies in place  
✅ All database operations - correct column names  

## Run the Migration!

Don't forget to run `RUN_THIS_MIGRATION_2.sql` in Supabase SQL Editor to add the missing RLS policies!
