# Library Page Testing Guide

## Overview
This document provides comprehensive testing steps for the Library page to verify Supabase connection and functionality.

## Components to Test

### 1. Library Page (`src/app/library/page.tsx`)
**Path:** `/library`
**Authentication:** Required

### 2. getUserLibrary Action (`src/app/actions/reader-actions.ts`)
**Function:** `getUserLibrary()`

---

## Test Cases

### Test 1: Authentication Check
**Expected Behavior:**
- Unauthenticated users should be redirected to `/login`
- Authenticated users should see their library dashboard

**Steps:**
1. Visit `/library` while logged out
2. Should redirect to `/login`
3. Log in with valid credentials
4. Should redirect back to `/library`

---

### Test 2: Stats Cards Display
**Expected Data:**
- **Coin Balance**: Current user's coin balance
- **Favorites**: Count of favorited series
- **Reading Progress**: Count of series with reading progress
- **Transactions**: Count of coin transactions

**Steps:**
1. Login to your account
2. Navigate to `/library`
3. Check the 4 stats cards at the top
4. Verify numbers match your account data

**Supabase Query Check:**
```sql
-- Coin Balance
SELECT coin_balance FROM profiles WHERE id = '[your-user-id]';

-- Favorites Count
SELECT COUNT(*) FROM favorites WHERE user_id = '[your-user-id]';

-- Reading Progress Count
SELECT COUNT(DISTINCT series_id) FROM reading_progress WHERE user_id = '[your-user-id]';

-- Transactions Count
SELECT COUNT(*) FROM transactions WHERE user_id = '[your-user-id]';
```

---

### Test 3: Continue Reading Tab
**Expected Behavior:**
- Shows series with recent reading progress
- Displays last read chapter
- Shows progress percentage
- "Continue Reading" button navigates to last chapter

**Steps:**
1. Click on "Continue Reading" tab
2. Verify series with reading progress appear
3. Click "Continue Reading" button
4. Should navigate to `/read/[seriesId]/[chapterNumber]`
5. Verify it's the correct chapter you last read

**Supabase Query:**
```sql
SELECT 
  rp.*,
  s.title,
  s.cover_url,
  c.chapter_number,
  c.title as chapter_title
FROM reading_progress rp
JOIN series s ON s.id = rp.series_id
LEFT JOIN chapters c ON c.id = rp.last_chapter_id
WHERE rp.user_id = '[your-user-id]'
ORDER BY rp.updated_at DESC;
```

---

### Test 4: Favorites Tab
**Expected Behavior:**
- Shows all favorited series
- Each series card displays title, author, cover, stats
- Clicking card navigates to series page
- Unfavorite button removes from list

**Steps:**
1. Click on "Favorites" tab
2. Verify favorited series appear
3. Click on a series card
4. Should navigate to `/series/[id]`
5. Go back to library
6. Test unfavorite functionality (if available)

**Supabase Query:**
```sql
SELECT 
  f.*,
  s.title,
  s.cover_url,
  s.synopsis,
  s.content_type,
  p.display_name as author_name,
  (SELECT COUNT(*) FROM chapters WHERE series_id = s.id) as chapter_count
FROM favorites f
JOIN series s ON s.id = f.series_id
LEFT JOIN profiles p ON p.id = s.author_id
WHERE f.user_id = '[your-user-id]'
ORDER BY f.created_at DESC;
```

---

### Test 5: History Tab
**Expected Behavior:**
- Shows all series you've read (even non-favorited)
- Sorted by most recent activity
- Displays last read date
- Clicking navigates to series page

**Steps:**
1. Click on "History" tab
2. Verify reading history appears
3. Check order (most recent first)
4. Click on a series
5. Should navigate to `/series/[id]`

**Supabase Query:**
```sql
SELECT DISTINCT ON (rp.series_id)
  rp.*,
  s.title,
  s.cover_url,
  s.content_type,
  p.display_name as author_name
FROM reading_progress rp
JOIN series s ON s.id = rp.series_id
LEFT JOIN profiles p ON p.id = s.author_id
WHERE rp.user_id = '[your-user-id]'
ORDER BY rp.series_id, rp.updated_at DESC;
```

---

### Test 6: Quick Actions
**Expected Buttons:**
- **Buy Coins**: Navigate to `/wallet/buy-coins`
- **Browse Series**: Navigate to `/browse`
- **View Wallet**: Navigate to `/wallet`

**Steps:**
1. Click "Buy Coins" button
2. Should navigate to `/wallet/buy-coins`
3. Go back to library
4. Click "Browse Series" button
5. Should navigate to `/browse`
6. Go back to library
7. Click "View Wallet" button
8. Should navigate to `/wallet`

---

### Test 7: Loading States
**Expected Behavior:**
- Shows loading spinner while fetching data
- Shows "Loading..." text
- Transitions smoothly to content

**Steps:**
1. Clear browser cache
2. Navigate to `/library`
3. Should see loading state briefly
4. Content should appear after data loads

---

### Test 8: Error Handling
**Expected Behavior:**
- If Supabase query fails, show error message
- Should not crash the page
- Should provide retry option or message

**Steps:**
1. Test with intentionally broken query (dev only)
2. Verify error message appears
3. Check console for error logs

---

### Test 9: Empty States
**Expected Behavior:**
- **No Favorites**: "You haven't favorited any series yet" message
- **No Reading Progress**: "Start reading to see your progress" message
- **No History**: "Your reading history is empty" message

**Steps:**
1. Test with a new account (no data)
2. Visit each tab
3. Verify empty state messages appear
4. Check that CTAs work (Browse button, etc.)

---

### Test 10: Responsive Design
**Expected Behavior:**
- Mobile: Cards stack vertically
- Tablet: 2 columns
- Desktop: Grid layout
- Tabs work on all screen sizes

**Steps:**
1. Test on mobile viewport (375px)
2. Test on tablet viewport (768px)
3. Test on desktop viewport (1280px)
4. Verify tabs are accessible and work properly

---

## Manual Supabase Connection Test

### Via Supabase Dashboard
1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project: `gkhsrwebwdabzmojefry`
3. Go to SQL Editor
4. Run these test queries:

```sql
-- Test 1: Check if profiles table is accessible
SELECT * FROM profiles LIMIT 5;

-- Test 2: Check if reading_progress table is accessible
SELECT * FROM reading_progress LIMIT 5;

-- Test 3: Check if favorites table is accessible
SELECT * FROM favorites LIMIT 5;

-- Test 4: Check if series table is accessible
SELECT * FROM series LIMIT 5;

-- Test 5: Test getUserLibrary query (replace [your-user-id])
SELECT 
  (SELECT coin_balance FROM profiles WHERE id = '[your-user-id]') as coins,
  (SELECT COUNT(*) FROM favorites WHERE user_id = '[your-user-id]') as favorites_count,
  (SELECT COUNT(DISTINCT series_id) FROM reading_progress WHERE user_id = '[your-user-id]') as progress_count,
  (SELECT COUNT(*) FROM transactions WHERE user_id = '[your-user-id]') as transactions_count;
```

### Via Application Logs
1. Open browser DevTools (F12)
2. Go to Console tab
3. Navigate to `/library`
4. Check for:
   - ✅ No errors in console
   - ✅ Successful Supabase queries
   - ✅ Data loaded properly
   - ❌ Any 401 (Unauthorized) errors
   - ❌ Any 500 (Server) errors

---

## RLS Policy Verification

### Required Policies for Library Page

#### profiles table
- Users can read their own profile
```sql
CREATE POLICY "Users can read own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);
```

#### reading_progress table
- Users can read their own progress
```sql
CREATE POLICY "Users can read own progress"
ON reading_progress FOR SELECT
USING (auth.uid() = user_id);
```

#### favorites table
- Users can read their own favorites
```sql
CREATE POLICY "Users can read own favorites"
ON favorites FOR SELECT
USING (auth.uid() = user_id);
```

#### transactions table
- Users can read their own transactions
```sql
CREATE POLICY "Users can read own transactions"
ON transactions FOR SELECT
USING (auth.uid() = user_id);
```

### Check RLS Policies
Run this in Supabase SQL Editor:
```sql
SELECT 
  schemaname,
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'reading_progress', 'favorites', 'transactions')
ORDER BY tablename, policyname;
```

---

## Expected Results Summary

### ✅ Success Indicators
- [ ] Page loads without errors
- [ ] All 4 stats cards show correct numbers
- [ ] Tabs switch without issues
- [ ] Continue Reading tab shows progress with correct chapters
- [ ] Favorites tab shows favorited series
- [ ] History tab shows reading history
- [ ] Quick action buttons navigate correctly
- [ ] Loading states work properly
- [ ] No console errors
- [ ] Responsive on all screen sizes

### ❌ Failure Indicators
- [ ] Page crashes or shows blank screen
- [ ] "Unauthorized" or "Access Denied" errors
- [ ] Stats cards show 0 despite having data
- [ ] Tabs don't switch or show errors
- [ ] Cannot click on series cards
- [ ] Buttons don't navigate
- [ ] Infinite loading spinner
- [ ] Console shows Supabase errors

---

## Troubleshooting Common Issues

### Issue: "Unauthorized" Error
**Solution:**
1. Check if user is logged in (`supabase.auth.getUser()`)
2. Verify RLS policies exist for all tables
3. Check if session is valid

### Issue: Data Not Loading
**Solution:**
1. Check Supabase connection (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
2. Verify getUserLibrary() function exists in reader-actions.ts
3. Check network tab for failed requests
4. Verify tables have data

### Issue: Stats Show 0 Despite Having Data
**Solution:**
1. Run manual queries in Supabase dashboard
2. Check RLS policies allow reading own data
3. Verify user_id matches auth.uid()
4. Check for data type mismatches

---

## Next Steps After Testing

1. **If all tests pass:** ✅
   - Library page is properly connected to Supabase
   - All functionality works as expected
   - Ready for production use

2. **If tests fail:** ❌
   - Document which specific test failed
   - Check error messages in console
   - Verify Supabase connection and RLS policies
   - Fix issues and re-test

3. **Performance Optimization:**
   - Add caching for library data
   - Implement pagination for large libraries
   - Add real-time updates using Supabase subscriptions

---

## Contact & Support

If you encounter issues that aren't covered in this guide:
1. Check Supabase logs in dashboard
2. Check application logs in browser console
3. Verify environment variables are set correctly
4. Check that database migrations have run successfully
