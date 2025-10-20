-- ============================================
-- COMPREHENSIVE FIX FOR ALL SCHEMA ISSUES
-- Run this to fix: chapters, series columns
-- ============================================

-- ===========================
-- 1. FIX SERIES TABLE COLUMNS
-- ===========================

-- Add view_count column as alias for total_views (for compatibility)
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS views INTEGER DEFAULT 0;

-- Sync views with total_views
UPDATE series
SET views = COALESCE(total_views, 0)
WHERE views = 0 OR views IS NULL;

-- Add trigger to keep both columns in sync
CREATE OR REPLACE FUNCTION sync_series_views()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.views IS DISTINCT FROM OLD.views THEN
    NEW.total_views := NEW.views;
  ELSIF NEW.total_views IS DISTINCT FROM OLD.total_views THEN
    NEW.views := NEW.total_views;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_views_trigger ON series;

CREATE TRIGGER sync_views_trigger
BEFORE UPDATE ON series
FOR EACH ROW
EXECUTE FUNCTION sync_series_views();

-- Add cover_url column if missing (some code uses this)
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS cover_url TEXT;

-- Sync cover_url with cover_image_url
UPDATE series
SET cover_url = cover_image_url
WHERE cover_url IS NULL AND cover_image_url IS NOT NULL;

UPDATE series
SET cover_image_url = cover_url
WHERE cover_image_url IS NULL AND cover_url IS NOT NULL;

-- Add synopsis column if missing (some code uses this instead of description)
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS synopsis TEXT;

-- Sync synopsis with description
UPDATE series
SET synopsis = description
WHERE synopsis IS NULL AND description IS NOT NULL;

UPDATE series
SET description = synopsis
WHERE description IS NULL AND synopsis IS NOT NULL;

-- Create trigger to keep synopsis and description in sync
CREATE OR REPLACE FUNCTION sync_series_description()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.synopsis IS DISTINCT FROM OLD.synopsis THEN
    NEW.description := NEW.synopsis;
  ELSIF NEW.description IS DISTINCT FROM OLD.description THEN
    NEW.synopsis := NEW.description;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_description_trigger ON series;

CREATE TRIGGER sync_description_trigger
BEFORE UPDATE ON series
FOR EACH ROW
EXECUTE FUNCTION sync_series_description();

-- Add is_published column if missing
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;

-- Sync is_published with status
UPDATE series
SET is_published = (status = 'ongoing' OR status = 'completed')
WHERE is_published = false OR is_published IS NULL;

-- Add total_ratings column if missing
ALTER TABLE series
  ADD COLUMN IF NOT EXISTS total_ratings INTEGER DEFAULT 0;

-- ===========================
-- 2. FIX CHAPTERS TABLE COLUMNS
-- ===========================

-- Add published_at column if missing
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- Set published_at for published chapters
UPDATE chapters
SET published_at = COALESCE(published_at, created_at)
WHERE is_published = true AND published_at IS NULL;

-- Add unlock_cost column if missing (some code uses this instead of coin_price)
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS unlock_cost INTEGER;

-- Sync coin_price and unlock_cost
UPDATE chapters
SET unlock_cost = coin_price
WHERE unlock_cost IS NULL AND coin_price IS NOT NULL;

UPDATE chapters
SET coin_price = unlock_cost
WHERE coin_price IS NULL AND unlock_cost IS NOT NULL;

-- Add word_count column if missing (already exists but ensure it's there)
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- Create function to calculate word count
CREATE OR REPLACE FUNCTION calculate_word_count()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.content IS NOT NULL THEN
    NEW.word_count := array_length(
      regexp_split_to_array(
        regexp_replace(NEW.content, '\s+', ' ', 'g'), 
        ' '
      ), 
      1
    );
  ELSE
    NEW.word_count := 0;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for word count
DROP TRIGGER IF EXISTS update_word_count ON chapters;

CREATE TRIGGER update_word_count
BEFORE INSERT OR UPDATE ON chapters
FOR EACH ROW
EXECUTE FUNCTION calculate_word_count();

-- Update existing chapters' word counts
UPDATE chapters
SET content = content
WHERE word_count IS NULL OR word_count = 0;

-- ===========================
-- 3. VERIFICATION QUERIES
-- ===========================

-- Check series columns
SELECT 
  'SERIES TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'series'
  AND column_name IN (
    'views', 'total_views', 'cover_url', 'cover_image_url', 
    'synopsis', 'description', 'is_published', 'status',
    'total_ratings', 'average_rating'
  )
ORDER BY column_name;

-- Check chapters columns
SELECT 
  'CHAPTERS TABLE' as table_name,
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'chapters'
  AND column_name IN (
    'published_at', 'unlock_cost', 'coin_price', 
    'word_count', 'is_published', 'view_count'
  )
ORDER BY column_name;

-- Check sample series data
SELECT 
  id,
  title,
  status,
  is_published,
  views,
  total_views,
  cover_url,
  cover_image_url,
  LEFT(synopsis, 50) as synopsis_preview,
  LEFT(description, 50) as description_preview
FROM series
LIMIT 3;

-- Check sample chapters data
SELECT 
  id,
  title,
  chapter_number,
  is_published,
  published_at,
  coin_price,
  unlock_cost,
  word_count,
  view_count
FROM chapters
LIMIT 5;

-- ===========================
-- 4. SUCCESS MESSAGE
-- ===========================

DO $$
BEGIN
  RAISE NOTICE '✓ Schema fixes completed successfully!';
  RAISE NOTICE '✓ Series table: Added views, cover_url, synopsis, is_published columns';
  RAISE NOTICE '✓ Chapters table: Added published_at, unlock_cost, word_count columns';
  RAISE NOTICE '✓ Triggers created to keep columns in sync';
  RAISE NOTICE '✓ Please verify the output above';
END $$;
