# 🚀 Apply Database Migration - Step by Step

## ✅ TypeScript Error Fixed!
Build is now successful. Now we need to apply the database migration.

## 📋 Step-by-Step Migration Instructions

### Step 1: Open Supabase Dashboard
Go to: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry

### Step 2: Open SQL Editor
1. Click on **"SQL Editor"** in the left sidebar
2. Click **"New query"** button (top right)

### Step 3: Copy the Migration SQL
Open this file in VS Code:
```
supabase/migrations/20251027_atomic_wallet_operations.sql
```

**OR** copy from below:

```sql
-- COPY EVERYTHING FROM THE FILE: 
-- supabase/migrations/20251027_atomic_wallet_operations.sql
```

### Step 4: Paste and Run
1. Paste the entire SQL into the editor
2. Click the **"RUN"** button (or press Ctrl+Enter)
3. Wait for "Success. No rows returned" message

### Step 5: Verify Functions Created
Run this query to verify:

```sql
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_type = 'FUNCTION' 
  AND routine_schema = 'public'
  AND routine_name IN ('deduct_coins', 'add_coins', 'process_tip', 'unlock_premium_chapter');
```

You should see 4 functions listed.

### Step 6: Test Tipping
```bash
node scripts/test-tip-actual.mjs
```

---

## 🎯 Quick Copy-Paste Instructions

If you want to do it quickly:

1. **Open**: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/editor
2. **Click**: SQL Editor → New query
3. **Open**: `supabase/migrations/20251027_atomic_wallet_operations.sql` in VS Code
4. **Copy**: All content (Ctrl+A, Ctrl+C)
5. **Paste**: Into Supabase SQL Editor (Ctrl+V)
6. **Run**: Click RUN button or press Ctrl+Enter
7. **Test**: `node scripts/test-tip-actual.mjs`

---

## ✅ What This Migration Does

Creates 4 atomic database functions:

1. **`deduct_coins(user_id, amount)`**
   - Atomically deducts coins with balance check
   - Prevents negative balances
   - No race conditions

2. **`add_coins(user_id, amount, add_to_earned)`**
   - Atomically adds coins
   - Creates wallet if doesn't exist
   - Updates total_earned if needed

3. **`process_tip(sender_id, recipient_id, amount, series_id, chapter_id)`**
   - Complete tip transaction in one atomic operation
   - Automatic rollback on any failure
   - Creates transaction records

4. **`unlock_premium_chapter(user_id, chapter_id, author_id, price)`**
   - Complete unlock transaction atomically
   - Transfers coins from buyer to author
   - Creates unlock record and transactions

---

## 🔍 Troubleshooting

### If you see "function already exists" error:
This is OK! It means the functions are already created. You can skip the migration.

### If you see permission errors:
Make sure you're using your Supabase account with owner/admin access.

### If functions don't work after migration:
1. Check Supabase logs for errors
2. Verify functions exist (run verification query above)
3. Try re-running the migration

---

## 🧪 Testing After Migration

```bash
# Test tipping
node scripts/test-tip-actual.mjs

# Should see:
# ✅ Tip completed successfully!
# 📊 Changes:
#   Sender: 1890 → 1880 (-10)
#   Recipient: 1470 → 1480 (+10)
```

---

## 📞 Need Help?

If the migration fails or you get errors:
1. Copy the error message
2. Check Supabase logs (Dashboard → Logs → PostgreSQL)
3. Share the error and I'll help debug

---

**Next Command After Migration:**
```bash
node scripts/test-tip-actual.mjs
```

This will test the new atomic tipping system! 🎉
