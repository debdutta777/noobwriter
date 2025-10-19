# Run Migration Instructions

## Option 1: Supabase Dashboard (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Navigate to **SQL Editor** in the left sidebar
4. Click **New Query**
5. Copy and paste the contents of `supabase/migrations/20251019_add_analytics_comments.sql`
6. Click **Run** or press Ctrl+Enter

## Option 2: Using Supabase CLI

If you have Supabase CLI installed:

```bash
# Link to your project (one time setup)
npx supabase link --project-ref gkhsrwebwdabzmojefry

# Run the migration
npx supabase db push

# Or apply specific migration
npx supabase migration up
```

## Option 3: Direct PostgreSQL Connection

Using psql or any PostgreSQL client:

```bash
psql "postgresql://postgres:your-super-secret-password@db.gkhsrwebwdabzmojefry.supabase.co:5432/postgres" < supabase/migrations/20251019_add_analytics_comments.sql
```

## What This Migration Does

✅ Adds `likes` and `word_count` columns to `chapters` table
✅ Creates `comments` table with nested replies support
✅ Creates `ratings` table with 1-5 star system
✅ Sets up Row Level Security policies
✅ Creates triggers to auto-update series stats
✅ Adds indexes for better performance
✅ Adds `total_comments` column to `series` table

## Verification

After running, verify in Supabase Dashboard > Table Editor:
- `chapters` table should have `likes` and `word_count` columns
- `comments` table should exist
- `ratings` table should exist
- `series` table should have `total_comments` column
