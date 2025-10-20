# 🔧 DATABASE MIGRATION INSTRUCTIONS

## Problem
The application cannot fetch series data because of missing database columns:
- ❌ `series.view_count` does not exist (code expects it, DB has `total_views`)
- ❌ `series.cover_url` might be missing (code expects it, DB has `cover_image_url`)
- ❌ `series.synopsis` might be missing (code expects it, DB has `description`)
- ❌ `chapters.published_at` missing
- ❌ `chapters.unlock_cost` missing (code uses both `coin_price` and `unlock_cost`)

## Solution
Run the comprehensive migration file: **FIX_ALL_SCHEMA_ISSUES.sql**

## Steps to Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Open Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor** (left sidebar)
4. Click **New Query**
5. Copy the entire content of `FIX_ALL_SCHEMA_ISSUES.sql`
6. Paste into the SQL editor
7. Click **Run** (or press Ctrl+Enter)
8. Check for success messages
9. Verify the verification queries at the bottom show all columns

### Option 2: Using Supabase CLI
```bash
# If you have Supabase CLI installed
supabase db push --include-all

# Or run the migration directly
supabase db execute -f FIX_ALL_SCHEMA_ISSUES.sql
```

## What This Migration Does

### 1. Series Table
- ✅ Adds `views` column (synced with `total_views`)
- ✅ Adds `cover_url` column (synced with `cover_image_url`)
- ✅ Adds `synopsis` column (synced with `description`)
- ✅ Adds `is_published` column
- ✅ Creates triggers to keep all columns in sync automatically

### 2. Chapters Table
- ✅ Adds `published_at` column
- ✅ Adds `unlock_cost` column (synced with `coin_price`)
- ✅ Updates `word_count` calculation
- ✅ Creates trigger for automatic word count on save

### 3. Data Sync
- ✅ Copies existing data between old and new column names
- ✅ Ensures no data is lost
- ✅ Backward compatible with old code

## After Migration

The app should now work correctly:
- ✅ Homepage will load series
- ✅ Browse page will show novels
- ✅ Chapter publishing will work
- ✅ Analytics will fetch real data
- ✅ World map will display

## Verification

After running the migration, check the output at the bottom. You should see:
- ✅ All columns listed for series table
- ✅ All columns listed for chapters table
- ✅ Sample data showing both old and new column names with synced values

## If Issues Persist

1. **Check Supabase logs** in Dashboard > Logs
2. **Verify column existence**:
   ```sql
   SELECT column_name FROM information_schema.columns 
   WHERE table_name = 'series';
   ```
3. **Check RLS policies** - ensure they allow SELECT on new columns
4. **Restart your dev server** after migration:
   ```bash
   # Stop the server (Ctrl+C)
   npm run dev
   ```

## Code Changes Made

Already updated in the codebase:
- ✅ `homepage-actions.ts` - Now queries `views` instead of `view_count`
- ✅ `analytics-actions.ts` - Uses correct column names
- ✅ `WorldMap.tsx` - Ready for geographic data
- ✅ `RichTextEditor.tsx` - Integrated into chapter editor

## Next Steps After Migration

1. ✅ Run the migration SQL
2. ✅ Restart dev server
3. ✅ Test homepage - should load series
4. ✅ Test browse page - should show novels
5. ✅ Create a test chapter - should save and publish
6. ✅ Check analytics - should show real data with world map
7. ✅ Deploy to Vercel

---

**Migration File**: `FIX_ALL_SCHEMA_ISSUES.sql`  
**Status**: Ready to run  
**Impact**: No data loss, backward compatible  
**Rollback**: Triggers can be dropped if needed, columns are additive
