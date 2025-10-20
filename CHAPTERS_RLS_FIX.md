# CHAPTERS NOT PUBLISHING - RLS POLICY FIX

## Problem
The error `403 Forbidden` when creating chapters indicates that Row Level Security (RLS) policies on the `chapters` table are preventing inserts.

**Error from Supabase logs:**
```
POST /rest/v1/chapters → 403 Forbidden
Auth user: 24aba03a-a678-4c4f-a53f-5d0e7eae94a7
```

This means the authenticated user doesn't have permission to insert chapters due to missing or incorrect RLS policies.

---

## Solution: Fix RLS Policies

### Option 1: Apply via Supabase SQL Editor (RECOMMENDED)

1. **Go to Supabase SQL Editor:**
   https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql

2. **Copy and paste this SQL:**

```sql
-- Fix RLS policies for chapters table to allow authors to create chapters

-- Drop existing policies if any
DROP POLICY IF EXISTS "Users can view published chapters" ON chapters;
DROP POLICY IF EXISTS "Authors can insert their own chapters" ON chapters;
DROP POLICY IF EXISTS "Authors can update their own chapters" ON chapters;
DROP POLICY IF EXISTS "Authors can delete their own chapters" ON chapters;
DROP POLICY IF EXISTS "Authors can view all their chapters" ON chapters;

-- Enable RLS on chapters table
ALTER TABLE chapters ENABLE ROW LEVEL SECURITY;

-- Policy 1: Anyone can view published chapters
CREATE POLICY "Users can view published chapters"
ON chapters FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM series
    WHERE series.id = chapters.series_id
    AND series.is_published = true
  )
);

-- Policy 2: Authors can view all their own chapters (published or not)
CREATE POLICY "Authors can view all their chapters"
ON chapters FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM series
    WHERE series.id = chapters.series_id
    AND series.author_id = auth.uid()
  )
);

-- Policy 3: Authors can insert chapters for their own series
CREATE POLICY "Authors can insert their own chapters"
ON chapters FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM series
    WHERE series.id = chapters.series_id
    AND series.author_id = auth.uid()
  )
);

-- Policy 4: Authors can update their own chapters
CREATE POLICY "Authors can update their own chapters"
ON chapters FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM series
    WHERE series.id = chapters.series_id
    AND series.author_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM series
    WHERE series.id = chapters.series_id
    AND series.author_id = auth.uid()
  )
);

-- Policy 5: Authors can delete their own chapters
CREATE POLICY "Authors can delete their own chapters"
ON chapters FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM series
    WHERE series.id = chapters.series_id
    AND series.author_id = auth.uid()
  )
);

-- Verify policies were created
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'chapters'
ORDER BY policyname;
```

3. **Click "Run"**

4. **Verify the output** shows 5 policies created:
   - Authors can delete their own chapters
   - Authors can insert their own chapters
   - Authors can update their own chapters
   - Authors can view all their chapters
   - Users can view published chapters

---

## What These Policies Do

### SELECT Policies (Reading):
1. **"Users can view published chapters"** - Anyone can read chapters from published series
2. **"Authors can view all their chapters"** - Authors can see ALL their chapters (even unpublished)

### INSERT Policy (Creating):
3. **"Authors can insert their own chapters"** - Authors can create chapters for their own series
   - Checks: `series.author_id = auth.uid()` (logged-in user owns the series)

### UPDATE Policy (Editing):
4. **"Authors can update their own chapters"** - Authors can edit their own chapters
   - Same ownership check

### DELETE Policy:
5. **"Authors can delete their own chapters"** - Authors can delete their own chapters
   - Same ownership check

---

## How It Works

When you try to create a chapter:

1. **Frontend** sends: `POST /rest/v1/chapters` with chapter data including `series_id`
2. **Supabase RLS** checks: "Does a series exist where `id = chapters.series_id` AND `author_id = auth.uid()`?"
3. **If YES** → Chapter is created ✅
4. **If NO** → Returns 403 Forbidden ❌

**Your case:** The policy was missing, so ALL inserts were blocked.

---

## After Applying the Fix

1. **Refresh your app** (the dev server should still be running)
2. **Try creating a chapter again:**
   - Go to: http://localhost:3000/write/story/[your-series-id]
   - Click "Add Chapter"
   - Fill in title and content
   - Click "Save"

3. **It should work now!** ✅

---

## Verification

To verify the policies are working, check:

1. **In Supabase Dashboard:**
   - Go to: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/auth/policies
   - Select `chapters` table
   - You should see 5 policies listed

2. **In your app:**
   - Create a test chapter
   - Check browser console - should see 201 Created (not 403)
   - Chapter should appear in your dashboard

---

## Why This Happened

Row Level Security (RLS) is a PostgreSQL feature that Supabase uses for data access control. When RLS is enabled on a table without any policies, **ALL operations are blocked by default**.

The `chapters` table likely had RLS enabled but no INSERT policy, causing the 403 error.

---

## Additional Notes

- These policies use `auth.uid()` which returns the currently logged-in user's ID
- The policies check ownership through the `series` table (chapters don't store author_id directly)
- RLS is applied at the database level, so it works for all clients (web, mobile, etc.)
- Even if someone tries to hack the API, they can't create chapters for series they don't own

---

## Files Created

- `supabase/migrations/fix_chapters_rls_policies.sql` - The migration SQL
- `scripts/apply-rls-fix.js` - Script to apply the fix (not needed if using SQL editor)
- `CHAPTERS_RLS_FIX.md` - This guide

---

## Summary

**Problem:** 403 error when creating chapters
**Cause:** Missing RLS INSERT policy on `chapters` table  
**Solution:** Add proper RLS policies via Supabase SQL Editor
**Result:** Authors can now create, edit, and delete chapters for their own series ✅
