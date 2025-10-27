# Security Audit Report - Noobwriter Platform

**Date:** October 27, 2025  
**Auditor:** GitHub Copilot  
**Scope:** Server Actions, Admin Client Usage, Wallet Operations, Authentication

---

## 🔴 CRITICAL SECURITY ISSUES

### 1. ❌ `.env` File Committed to Git Repository
**Severity:** CRITICAL  
**File:** `.env`  
**Issue:** The `.env` file contains `SUPABASE_SERVICE_ROLE_KEY` and is committed to the repository.

**Risk:**
- ⚠️ **SERVICE_ROLE_KEY is exposed** in version control
- Anyone with repository access can bypass ALL Row Level Security (RLS) policies
- Complete database access (read, write, delete) for anyone who clones the repo
- Financial fraud: Unlimited coin manipulation, unauthorized payouts

**Evidence:**
```bash
# .gitignore includes .env but file is already tracked
.env  # This is in .gitignore
```

**Current Exposure:**
```env
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Immediate Actions Required:**
1. ⚠️ **ROTATE SERVICE_ROLE_KEY IMMEDIATELY** in Supabase Dashboard
2. Remove `.env` from git history:
   ```bash
   git rm --cached .env
   git commit -m "Remove .env from tracking"
   git push --force
   ```
3. Add to `.gitignore` (already done, but file was tracked before)
4. Use `.env.example` as template only
5. Never commit real credentials again

---

## 🟠 HIGH SEVERITY ISSUES

### 2. ⚠️ No Rate Limiting on Tipping
**Severity:** HIGH  
**File:** `src/app/actions/wallet-actions.ts`  
**Function:** `sendTip()`

**Risk:**
- Spam tipping: Users can send 1 coin tips thousands of times
- DOS attack on database
- Transaction table bloat
- Author notification spam

**Missing Protection:**
- No time-based rate limit (e.g., max 10 tips per minute)
- No cooldown period between tips
- No maximum tips per day per user

**Recommendation:**
```typescript
// Add rate limiting
const RATE_LIMITS = {
  TIP_PER_MINUTE: 10,
  TIP_PER_HOUR: 50,
  TIP_COOLDOWN_SECONDS: 5
}

// Check recent tips
const { data: recentTips } = await supabase
  .from('transactions')
  .select('created_at')
  .eq('user_id', user.id)
  .eq('type', 'tip')
  .gte('created_at', new Date(Date.now() - 60000).toISOString())

if (recentTips && recentTips.length >= RATE_LIMITS.TIP_PER_MINUTE) {
  return { success: false, error: 'Rate limit exceeded. Try again later.' }
}
```

### 3. ⚠️ No Maximum Tip Amount Validation
**Severity:** HIGH  
**File:** `src/app/actions/wallet-actions.ts`  
**Function:** `sendTip()`

**Risk:**
- User accidentally tips entire balance (e.g., 100,000 coins)
- No confirmation for large amounts
- No undo functionality

**Current Validation:**
```typescript
if (amount <= 0) {
  return { success: false, error: 'Invalid tip amount' }
}
// ❌ No maximum check!
```

**Recommendation:**
```typescript
const MAX_TIP_AMOUNT = 10000 // 10,000 coins max per tip

if (amount <= 0 || amount > MAX_TIP_AMOUNT) {
  return { 
    success: false, 
    error: `Tip amount must be between 1 and ${MAX_TIP_AMOUNT} coins` 
  }
}

// For large tips (>1000 coins), require explicit confirmation
if (amount > 1000 && !confirmLargeTip) {
  return { 
    success: false, 
    error: 'Large tip requires confirmation',
    requiresConfirmation: true
  }
}
```

### 4. ⚠️ Race Condition in Wallet Updates
**Severity:** HIGH  
**File:** `src/app/actions/wallet-actions.ts`  
**Function:** `sendTip()`, `unlockPremiumChapter()`

**Risk:**
- Two simultaneous tips/unlocks can cause incorrect balance
- User spends same coins twice (double-spending)
- Database inconsistency

**Current Implementation:**
```typescript
// ❌ Not atomic - race condition possible
const { data: senderWallet } = await supabase
  .from('wallets')
  .select('coin_balance')
  .eq('user_id', user.id)
  .single()

// Time gap - another operation could happen here

await supabase
  .from('wallets')
  .update({ coin_balance: senderWallet.coin_balance - amount })
  .eq('user_id', user.id)
```

**Recommendation:**
```sql
-- Use PostgreSQL atomic operations
UPDATE wallets 
SET coin_balance = coin_balance - $1,
    updated_at = NOW()
WHERE user_id = $2 
  AND coin_balance >= $1  -- Prevents negative balance
RETURNING coin_balance;
```

Or use Supabase RPC:
```typescript
const { data } = await supabase.rpc('deduct_coins', {
  p_user_id: user.id,
  p_amount: amount
})
```

### 5. ⚠️ No Transaction Rollback on Partial Failure
**Severity:** HIGH  
**File:** `src/app/actions/wallet-actions.ts`  
**Function:** `sendTip()`

**Issue:**
- If recipient transaction insert fails, coins are already transferred
- Manual rollback is attempted but not guaranteed
- No database-level transaction wrapper

**Current Rollback:**
```typescript
if (recipientTxError) {
  console.error('Error creating recipient transaction:', recipientTxError)
  // ❌ Coins already transferred but no transaction record!
}
```

**Recommendation:**
```typescript
// Use database transactions
const { data, error } = await supabase.rpc('process_tip', {
  p_sender_id: user.id,
  p_recipient_id: recipientId,
  p_amount: amount,
  p_series_id: seriesId,
  p_chapter_id: chapterId
})

// PostgreSQL function ensures atomicity
```

---

## 🟡 MEDIUM SEVERITY ISSUES

### 6. ⚠️ Admin Client Used for All Tip Operations
**Severity:** MEDIUM  
**File:** `src/app/actions/wallet-actions.ts`

**Issue:**
- Admin client bypasses ALL RLS policies
- If authentication check is bypassed (bug), entire database is exposed
- Overly permissive for operations that don't require full admin access

**Better Approach:**
```typescript
// Use admin client ONLY for recipient operations
// Use regular client for sender operations (RLS protects their own data)

// ✅ Regular client for sender (RLS applies)
const { data: senderWallet } = await supabase
  .from('wallets')
  .select('coin_balance')
  .eq('user_id', user.id)
  .single()

// ✅ Regular client for sender deduction (RLS ensures it's their wallet)
await supabase
  .from('wallets')
  .update({ coin_balance: senderWallet.coin_balance - amount })
  .eq('user_id', user.id)

// ✅ Admin client ONLY for recipient operations
await adminClient
  .from('wallets')
  .update({ coin_balance: recipientWallet.coin_balance + amount })
  .eq('user_id', recipientId)
```

### 7. ⚠️ No Input Sanitization on User IDs
**Severity:** MEDIUM  
**File:** Multiple server actions

**Risk:**
- SQL injection (low risk with Supabase's parameterized queries)
- UUID validation missing
- Invalid IDs can cause database errors

**Recommendation:**
```typescript
function validateUUID(id: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(id)
}

export async function sendTip(recipientId: string, amount: number, ...) {
  if (!validateUUID(recipientId)) {
    return { success: false, error: 'Invalid recipient ID' }
  }
  // ... rest of function
}
```

### 8. ⚠️ Insufficient Balance Check Can Be Bypassed
**Severity:** MEDIUM  
**File:** `src/app/actions/wallet-actions.ts`

**Issue:**
- Balance check happens before deduction
- Race condition: Multiple simultaneous requests can spend beyond balance

**Current:**
```typescript
if (senderWallet.coin_balance < amount) {
  return { success: false, error: 'Insufficient balance' }
}
// Time gap - balance could change here
await supabase.from('wallets').update(...)
```

**Recommendation:**
```typescript
// Use conditional update
const { data: updatedWallet, error } = await supabase
  .from('wallets')
  .update({ coin_balance: coin_balance - amount })
  .eq('user_id', user.id)
  .gte('coin_balance', amount)  // Only update if balance sufficient
  .select()
  .single()

if (!updatedWallet) {
  return { success: false, error: 'Insufficient balance or concurrent operation' }
}
```

### 9. ⚠️ No Minimum Tip Amount
**Severity:** MEDIUM  
**File:** `src/app/actions/wallet-actions.ts`

**Issue:**
- Users can send 1 coin tips repeatedly
- Creates excessive transaction records
- Spam potential

**Recommendation:**
```typescript
const MIN_TIP_AMOUNT = 10 // Minimum 10 coins

if (amount < MIN_TIP_AMOUNT || amount > MAX_TIP_AMOUNT) {
  return { 
    success: false, 
    error: `Tip must be between ${MIN_TIP_AMOUNT} and ${MAX_TIP_AMOUNT} coins` 
  }
}
```

---

## 🟢 LOW SEVERITY ISSUES

### 10. ℹ️ Verbose Error Messages
**Severity:** LOW  
**File:** Multiple server actions

**Issue:**
- Detailed error messages can reveal database structure
- Helps attackers understand system internals

**Example:**
```typescript
console.error('Error creating recipient wallet:', createError)
return { success: false, error: `Failed to create recipient wallet: ${createError.message}` }
```

**Recommendation:**
```typescript
// Log detailed errors server-side
console.error('Error creating recipient wallet:', createError)

// Return generic message to client
return { success: false, error: 'Unable to process tip. Please try again.' }
```

### 11. ℹ️ No Audit Trail for Admin Operations
**Severity:** LOW  
**File:** `src/lib/supabase/server.ts`

**Issue:**
- Admin client operations not logged
- No way to track who used admin privileges when
- Compliance risk for financial operations

**Recommendation:**
```typescript
export function createAdminClient(operation?: string): SupabaseClient<Database> {
  // Log admin client usage
  console.log(`[ADMIN] Client created for operation: ${operation}`)
  
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    }
  )
}
```

### 12. ℹ️ No Notification for Large Transactions
**Severity:** LOW  
**Issue:** Authors don't know when they receive large tips

**Recommendation:**
- Send email/in-app notification for tips > 1000 coins
- Weekly earnings summary

---

## 🔒 POSITIVE SECURITY MEASURES (Already Implemented)

### ✅ Good Practices Found

1. **Authentication Check First**
   ```typescript
   const { data: { user }, error: authError } = await supabase.auth.getUser()
   if (authError || !user) {
     return { success: false, error: 'Not authenticated' }
   }
   ```

2. **Self-Tipping Prevention**
   ```typescript
   if (user.id === recipientId) {
     return { success: false, error: 'You cannot tip yourself' }
   }
   ```

3. **Balance Validation**
   ```typescript
   if (senderWallet.coin_balance < amount) {
     return { success: false, error: 'Insufficient balance' }
   }
   ```

4. **Positive Amount Validation**
   ```typescript
   if (amount <= 0) {
     return { success: false, error: 'Invalid tip amount' }
   }
   ```

5. **Server-Side Actions Only**
   - All financial operations use `'use server'` directive
   - No client-side wallet manipulation possible

6. **.env in .gitignore**
   - `.env` is in `.gitignore` (though already tracked)

---

## 📋 SECURITY CHECKLIST

### Immediate Actions (Do Now)
- [ ] **CRITICAL:** Rotate `SUPABASE_SERVICE_ROLE_KEY` immediately
- [ ] Remove `.env` from git history
- [ ] Add rate limiting to tipping (10 tips/minute)
- [ ] Add maximum tip amount (10,000 coins)
- [ ] Add minimum tip amount (10 coins)

### Short-Term (This Week)
- [ ] Implement atomic wallet updates (prevent race conditions)
- [ ] Add database transaction wrappers
- [ ] Add UUID validation for all IDs
- [ ] Reduce admin client usage (only for recipient operations)
- [ ] Add large tip confirmation UI

### Medium-Term (This Month)
- [ ] Implement comprehensive audit logging
- [ ] Add transaction rollback mechanism
- [ ] Create database functions for atomic operations
- [ ] Add notification system for large tips
- [ ] Generic error messages for production
- [ ] Security testing suite

### Long-Term (Ongoing)
- [ ] Regular security audits
- [ ] Penetration testing
- [ ] Compliance review for financial operations
- [ ] Bug bounty program
- [ ] Security monitoring and alerts

---

## 💡 RECOMMENDED SECURITY ARCHITECTURE

### Database-Level Security (PostgreSQL Functions)

Create atomic operations that can't be bypassed:

```sql
-- Atomic tip processing function
CREATE OR REPLACE FUNCTION process_tip(
  p_sender_id UUID,
  p_recipient_id UUID,
  p_amount INTEGER,
  p_series_id UUID DEFAULT NULL,
  p_chapter_id UUID DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  new_sender_balance INTEGER,
  new_recipient_balance INTEGER
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_sender_balance INTEGER;
  v_recipient_balance INTEGER;
BEGIN
  -- Start transaction (automatic in function)
  
  -- Validate inputs
  IF p_amount <= 0 OR p_amount > 10000 THEN
    RAISE EXCEPTION 'Invalid tip amount';
  END IF;
  
  IF p_sender_id = p_recipient_id THEN
    RAISE EXCEPTION 'Cannot tip yourself';
  END IF;
  
  -- Atomic deduction with balance check
  UPDATE wallets
  SET coin_balance = coin_balance - p_amount,
      updated_at = NOW()
  WHERE user_id = p_sender_id
    AND coin_balance >= p_amount
  RETURNING coin_balance INTO v_sender_balance;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Insufficient balance';
  END IF;
  
  -- Atomic addition
  UPDATE wallets
  SET coin_balance = coin_balance + p_amount,
      total_earned = total_earned + p_amount,
      updated_at = NOW()
  WHERE user_id = p_recipient_id
  RETURNING coin_balance INTO v_recipient_balance;
  
  -- Create transaction records
  INSERT INTO transactions (user_id, type, amount, coin_amount, description, payment_status, metadata)
  VALUES 
    (p_sender_id, 'tip', -p_amount, -p_amount, 'Tip sent', 'completed', 
     jsonb_build_object('recipient_id', p_recipient_id, 'series_id', p_series_id, 'direction', 'sent')),
    (p_recipient_id, 'tip', p_amount, p_amount, 'Tip received', 'completed',
     jsonb_build_object('sender_id', p_sender_id, 'series_id', p_series_id, 'direction', 'received'));
  
  -- Return results
  RETURN QUERY SELECT TRUE, v_sender_balance, v_recipient_balance;
END;
$$;
```

### Updated Server Action

```typescript
export async function sendTip(recipientId: string, amount: number, seriesId?: string, chapterId?: string) {
  const supabase = await createClient()
  
  // Validate inputs
  if (!validateUUID(recipientId)) {
    return { success: false, error: 'Invalid recipient' }
  }
  
  // Check rate limit
  const rateLimitCheck = await checkRateLimit(user.id, 'tip')
  if (!rateLimitCheck.allowed) {
    return { success: false, error: 'Too many tips. Please wait.' }
  }
  
  // Use database function (atomic, secure)
  const { data, error } = await supabase.rpc('process_tip', {
    p_sender_id: user.id,
    p_recipient_id: recipientId,
    p_amount: amount,
    p_series_id: seriesId,
    p_chapter_id: chapterId
  })
  
  if (error) {
    console.error('[TIP_ERROR]', error)
    return { success: false, error: 'Unable to process tip' }
  }
  
  return { success: true, newBalance: data[0].new_sender_balance }
}
```

---

## 🎯 PRIORITY MATRIX

| Issue | Severity | Effort | Priority | Timeline |
|-------|----------|--------|----------|----------|
| Rotate SERVICE_ROLE_KEY | Critical | Low | 🔴 P0 | Immediately |
| Remove .env from git | Critical | Low | 🔴 P0 | Today |
| Add rate limiting | High | Medium | 🟠 P1 | This week |
| Add max tip amount | High | Low | 🟠 P1 | This week |
| Fix race conditions | High | High | 🟠 P1 | This week |
| Transaction rollback | High | High | 🟠 P1 | This week |
| Reduce admin client | Medium | Medium | 🟡 P2 | Next week |
| UUID validation | Medium | Low | 🟡 P2 | Next week |
| Audit logging | Low | Medium | 🟢 P3 | This month |
| Generic errors | Low | Low | 🟢 P3 | This month |

---

## 📞 INCIDENT RESPONSE

### If Service Role Key is Compromised:

1. **Immediately:**
   - Go to Supabase Dashboard → Settings → API
   - Click "Generate new service role key"
   - Update production environment variables
   - Restart all services

2. **Within 1 hour:**
   - Review all transactions in last 24 hours
   - Check for unauthorized wallet modifications
   - Review user account changes
   - Audit payout requests

3. **Within 24 hours:**
   - Notify affected users (if any unauthorized activity)
   - File incident report
   - Review access logs
   - Update security procedures

---

## ✅ CONCLUSION

**Overall Risk Level:** 🟠 **HIGH** (primarily due to exposed SERVICE_ROLE_KEY)

**Immediate Actions Required:**
1. 🔴 Rotate Supabase SERVICE_ROLE_KEY
2. 🔴 Remove .env from version control
3. 🟠 Implement rate limiting
4. 🟠 Add tip amount limits
5. 🟠 Fix race conditions

**After Fixes:** Risk level should reduce to 🟡 **MEDIUM-LOW**

The tipping feature is functionally working but needs security hardening before production deployment with real money.

---

**Next Steps:** Implement the recommended fixes in priority order and re-test before production launch.
