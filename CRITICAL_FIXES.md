# Critical Fixes - Buy Coins & Writer Dashboard

## Issues Found

### 1. Buy Coins Purchase Error ❌
**Error**: `Purchase error: {}`  
**Cause**: Missing RLS policies - users can't UPDATE wallets or INSERT transactions

### 2. Writer Dashboard Not Loading ❌
**Cause**: Function checking for non-existent `role` column in profiles table

## Solutions

### Fix 1: Add Missing RLS Policies ✅

**File Created**: `RUN_THIS_MIGRATION_2.sql`

The wallet and transactions tables had SELECT policies but were missing:
- `wallets` - UPDATE policy (users can't add coins without this!)
- `transactions` - INSERT policy (users can't record purchases without this!)

**Migration adds**:
```sql
-- Allow users to update their own wallet balance
CREATE POLICY "Users can update own wallet"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to create transaction records
CREATE POLICY "Users can create own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

### Fix 2: Remove Role Check from Writer Dashboard ✅

**File Modified**: `src/app/actions/writer-actions.ts`

**Before** (broken):
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('display_name, email, role')  // ❌ role column doesn't exist
  .eq('id', user.id)
  .single()

if (!profile || (profile.role !== 'writer' && profile.role !== 'both')) {
  return { data: null, error: 'Not authorized as writer' }  // ❌ Always fails
}
```

**After** (fixed):
```typescript
const { data: profile } = await supabase
  .from('profiles')
  .select('display_name, email')  // ✅ Only existing columns
  .eq('id', user.id)
  .single()

if (!profile) {
  return { data: null, error: 'Profile not found' }
}
// ✅ No role check - if user has series, they can access dashboard
```

### Fix 3: Better Error Handling ✅

**Files Modified**:
- `src/app/wallet/buy-coins/page.tsx` - Added detailed error logging
- `src/app/write/dashboard/page.tsx` - Added error state and display

**Improvements**:
- Console logs show exactly where purchase fails
- Error messages shown to user
- Retry buttons for failed operations
- TypeScript error typing (`catch (error: any)`)

## 🚨 ACTION REQUIRED: Run Migration

### Step 1: Run RLS Policy Migration

**Go to**: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql

**Copy and paste** contents of `RUN_THIS_MIGRATION_2.sql`:

```sql
-- Allow users to update their own wallet (needed for coin purchases)
CREATE POLICY "Users can update own wallet"
    ON wallets FOR UPDATE
    USING (auth.uid() = user_id);

-- Allow users to insert transactions (needed for purchases, unlocks, etc.)
CREATE POLICY "Users can create own transactions"
    ON transactions FOR INSERT
    WITH CHECK (auth.uid() = user_id);
```

**Click** "Run"

### Step 2: Verify Policies Were Created

The migration includes a verification query that should show:

**Wallets policies**:
1. ✅ "Users can view own wallet" (SELECT) - existing
2. ✅ "Users can update own wallet" (UPDATE) - **NEW**

**Transactions policies**:
1. ✅ "Users can view own transactions" (SELECT) - existing
2. ✅ "Users can create own transactions" (INSERT) - **NEW**

## Testing After Migration

### Test Buy Coins:
1. Visit `/wallet/buy-coins`
2. Click "Buy Now" on any package
3. Should see console logs:
   ```
   Current wallet: { coin_balance: 100 }
   Adding coins: 150
   Updated wallet: { coin_balance: 250 }
   Transaction created: [...]
   ```
4. Alert: "Successfully purchased X coins!"
5. Redirect to `/wallet`
6. New balance should show

### Test Writer Dashboard:
1. Visit `/write/dashboard`
2. **If you have NO series**:
   - Should see "Create Your First Story" prompt
   - No errors in console
3. **If you HAVE series**:
   - Should see full dashboard with stats
   - Console log: "Dashboard data result: { data: {...} }"
   - No error messages

## What Each Error Meant

### Before Migration:

**Buy Coins Error**:
```javascript
Purchase error: {}
```
- Empty error because Supabase silently fails on RLS violations
- Wallet UPDATE failed: Policy doesn't exist
- Transaction INSERT failed: Policy doesn't exist

**Writer Dashboard**:
```
"Not authorized as writer"
```
- Checking for `role` column that doesn't exist
- Query returns profile but role check always fails
- Dashboard never loads even if user has series

### After Migration:

**Buy Coins**: ✅ Success
```
Current wallet: { coin_balance: 100 }
Adding coins: 150
Updated wallet: { coin_balance: 250 }
Transaction created: [{ id: '...', amount: 150, ... }]
Successfully purchased 150 coins!
```

**Writer Dashboard**: ✅ Loads
```
Dashboard data result: { 
  data: {
    user: { display_name: '...', email: '...' },
    stats: { totalSeries: 0, ... },
    mySeries: [],
    ...
  }
}
```

## Database Schema Reference

### Profiles Table (public.profiles)
```sql
- id (uuid) PK
- email (text)
- display_name (text)
- avatar_url (text)
- bio (text)
- created_at (timestamp)
- updated_at (timestamp)
```
**Note**: No `role` column exists!

### Wallets Table (public.wallets)
```sql
- id (uuid) PK
- user_id (uuid) FK -> profiles.id
- coin_balance (integer) DEFAULT 0
- created_at (timestamp)
- updated_at (timestamp)
```

### Transactions Table (public.transactions)
```sql
- id (uuid) PK
- user_id (uuid) FK -> profiles.id
- amount (integer)
- transaction_type (text) -- 'purchase', 'unlock', 'earn', 'spend'
- description (text)
- metadata (jsonb)
- created_at (timestamp)
```

## RLS Policy Summary

### Before This Migration:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | ✅ Public | ❌ | ✅ Own | ❌ |
| wallets | ✅ Own | ❌ | ❌ | ❌ |
| transactions | ✅ Own | ❌ | ❌ | ❌ |

### After This Migration:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | ✅ Public | ❌ | ✅ Own | ❌ |
| wallets | ✅ Own | ❌ | ✅ Own | ❌ |
| transactions | ✅ Own | ✅ Own | ❌ | ❌ |

## Files Changed

1. ✅ `src/app/actions/writer-actions.ts`
   - Removed `role` column from profile query
   - Removed role authorization check
   - Writer access now based on having series (checked in UI)

2. ✅ `src/app/wallet/buy-coins/page.tsx`
   - Added detailed error logging
   - Added `.select()` to get updated data
   - Better error messages with specific details

3. ✅ `src/app/write/dashboard/page.tsx`
   - Added error state
   - Added try-catch blocks
   - Show error messages to user
   - Better console logging

4. ✅ `supabase/migrations/20251019_add_wallet_update_policies.sql`
   - New migration file for RLS policies

5. ✅ `RUN_THIS_MIGRATION_2.sql`
   - Easy copy-paste version for Supabase SQL Editor

## Common Issues & Solutions

### Issue: "Purchase error: {}"
**Solution**: Run `RUN_THIS_MIGRATION_2.sql` to add UPDATE/INSERT policies

### Issue: "Not authorized as writer"
**Solution**: Code already fixed - restart dev server

### Issue: Still seeing 406 errors
**Solution**: 
1. Check migration ran successfully
2. Verify user has profile and wallet (run first migration)
3. Log out and log back in
4. Clear browser cache

### Issue: Dashboard shows loading forever
**Solution**: Check browser console for specific error, likely RLS or missing data

## Next Steps

1. ✅ **Run the migration** (most critical!)
2. Test buying coins
3. Test writer dashboard
4. If still issues, check console and share specific errors
5. Consider adding email notifications for purchases
6. Add Razorpay integration for real payments

## Support

If you're still seeing errors after running the migration:
1. Share the browser console logs
2. Share the Supabase SQL Editor output
3. Check Supabase logs at: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/logs
