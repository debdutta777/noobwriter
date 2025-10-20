-- Fix Series Table Schema - Add missing columns and migrate data
-- This fixes "is_published column not found" error

-- 1. Add is_published column if it doesn't exist
ALTER TABLE series 
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- 2. Migrate data from status column to is_published
-- Set is_published = true where status = 'published'
UPDATE series
SET is_published = true
WHERE status = 'published' AND is_published = false;

-- 3. Ensure status column exists (in case it's missing)
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft';

-- 4. Add check constraint to ensure valid status values
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'series_status_check'
  ) THEN
    ALTER TABLE series 
    ADD CONSTRAINT series_status_check 
    CHECK (status IN ('draft', 'published', 'completed', 'hiatus', 'cancelled'));
  END IF;
END $$;

-- 5. Create index on is_published for faster queries
CREATE INDEX IF NOT EXISTS idx_series_is_published ON series(is_published);

-- 6. Create composite index for common queries
CREATE INDEX IF NOT EXISTS idx_series_published_updated ON series(is_published, updated_at DESC);

-- 7. Update any NULL values to defaults
UPDATE series
SET status = 'draft'
WHERE status IS NULL;

UPDATE series
SET is_published = false
WHERE is_published IS NULL;

-- 8. Verification queries

-- Check series table structure
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'series' 
  AND column_name IN ('status', 'is_published', 'cover_url', 'cover_image_url')
ORDER BY column_name;

-- Check series counts by status
SELECT 
  status,
  is_published,
  COUNT(*) as count
FROM series
GROUP BY status, is_published
ORDER BY status, is_published;

-- Check if any series need attention
SELECT id, title, status, is_published
FROM series
WHERE (status = 'published' AND is_published = false)
   OR (status != 'published' AND is_published = true)
LIMIT 10;
