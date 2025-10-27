# Quick Migration Guide

## ⚠️ CRITICAL: Apply These Migrations Immediately

You have **2 migrations** that need to be applied in Supabase Dashboard to fix critical functionality.

---

## Migration 1: Tipping System Fix

**File:** `supabase/migrations/20251027_atomic_wallet_operations.sql`

**What it fixes:** 
- "Failed to create recipient wallet" error
- Race conditions in wallet operations
- Transaction rollback mechanism

### Steps to Apply:

1. Open your file: `c:\Users\DEBDUTTA\Desktop\Noobwriter\supabase\migrations\20251027_atomic_wallet_operations.sql`

2. Copy ALL 271 lines

3. Go to: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql/new

4. Paste the SQL

5. Click **Run** (or press Ctrl+Enter)

6. You should see: "Success. No rows returned"

### Verification Query:
```sql
SELECT proname FROM pg_proc WHERE proname IN (
  'deduct_coins', 
  'add_coins', 
  'process_tip', 
  'unlock_premium_chapter'
);
```

**Expected result:** 4 rows showing all 4 function names

---

## Migration 2: Rating System Fix

**File:** `supabase/migrations/20251028_fix_rating_upsert_policy.sql`

**What it fixes:** 
- Cannot give review to novels from reader side
- Upsert operation permission issues

### Steps to Apply:

1. Open your file: `c:\Users\DEBDUTTA\Desktop\Noobwriter\supabase\migrations\20251028_fix_rating_upsert_policy.sql`

2. Copy ALL the content

3. Go to: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql/new

4. Paste the SQL

5. Click **Run** (or press Ctrl+Enter)

6. You should see: "Success. No rows returned"

### Verification Query:
```sql
SELECT 
  policyname,
  cmd,
  qual IS NOT NULL as has_using,
  with_check IS NOT NULL as has_check
FROM pg_policies 
WHERE tablename = 'ratings';
```

**Expected result:** Should show policies for SELECT, INSERT, UPDATE, DELETE

---

## Testing After Migration

### Test Tipping (After Migration 1):
1. Go to any series detail page
2. Click "Tip Author" button
3. Enter amount (e.g., 100 coins)
4. Submit
5. Should see success message
6. Check your coin balance decreased
7. Check author's balance increased

### Test Reviews (After Migration 2):
1. Go to any series detail page
2. Click "Reviews" tab
3. Click star rating (1-5 stars)
4. Write a review (optional)
5. Click submit
6. Should see success message
7. Your review should appear in the list
8. Try editing your review - should also work

---

## Troubleshooting

### If Migration Fails:

**Error: "relation already exists"**
- The migration was already applied
- Check verification queries to confirm

**Error: "permission denied"**
- Make sure you're logged in as project owner
- Check you're in the correct project

**Error: "syntax error"**
- Make sure you copied the ENTIRE file
- Don't modify the SQL

### If Tipping Still Doesn't Work:
1. Check browser console for errors
2. Verify functions exist with verification query
3. Check Supabase logs: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/logs/explorer
4. Try rebuilding: `npm run build`

### If Reviews Still Don't Work:
1. Check browser console for errors
2. Verify policies with verification query
3. Check Supabase logs
4. Try in incognito mode (clear cache)

---

## After Applying Both Migrations:

1. ✅ Tipping should work perfectly
2. ✅ Reviews should work perfectly
3. ✅ No more "Failed to create recipient wallet" errors
4. ✅ No more rating submission errors

---

## Quick Commands

### View Supabase Logs:
```bash
# In your terminal (optional)
npx -y @supabase/mcp-server-supabase@latest --project-ref=gkhsrwebwdabzmojefry
```

### Rebuild Project:
```bash
npm run build
```

### Run Development Server:
```bash
npm run dev
```

---

## Success Indicators:

After applying migrations, you should see:

- [x] 4 new database functions created
- [x] Updated RLS policies for ratings
- [x] No errors when tipping
- [x] No errors when submitting reviews
- [x] Transactions appear in database
- [x] Balances update correctly

---

## Need Help?

1. Check `FEATURE_UPDATES_SUMMARY.md` for detailed information
2. Check Supabase Dashboard logs
3. Check browser console (F12)
4. Verify migrations were applied with verification queries

---

**IMPORTANT:** Apply these migrations as soon as possible. They fix critical functionality that's currently broken in production.
