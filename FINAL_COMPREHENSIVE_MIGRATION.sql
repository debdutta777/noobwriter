-- COMPREHENSIVE SCHEMA FIX - Based on actual database state
-- Run this ONE migration to fix all schema mismatches

-- 1. Add synopsis column as alias to description
-- Your code uses 'synopsis' but database has 'description'
ALTER TABLE series 
  ADD COLUMN IF NOT EXISTS synopsis TEXT;

-- 2. Sync synopsis with description for existing data
UPDATE series
SET synopsis = description
WHERE synopsis IS NULL AND description IS NOT NULL;

-- 3. Sync description with synopsis for any future data
UPDATE series
SET description = synopsis
WHERE description IS NULL AND synopsis IS NOT NULL;

-- 4. Create trigger to keep synopsis and description in sync
CREATE OR REPLACE FUNCTION sync_series_synopsis_description()
RETURNS TRIGGER AS $$
BEGIN
  -- When synopsis is updated, update description
  IF NEW.synopsis IS DISTINCT FROM OLD.synopsis THEN
    NEW.description = NEW.synopsis;
  END IF;
  
  -- When description is updated, update synopsis
  IF NEW.description IS DISTINCT FROM OLD.description THEN
    NEW.synopsis = NEW.description;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS sync_synopsis_description ON series;

CREATE TRIGGER sync_synopsis_description
BEFORE UPDATE ON series
FOR EACH ROW
EXECUTE FUNCTION sync_series_synopsis_description();

-- 5. Verification queries
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'series' 
  AND column_name IN ('synopsis', 'description', 'is_published', 'cover_url', 'status')
ORDER BY column_name;

-- Check if data is synced
SELECT 
  id,
  title,
  LEFT(COALESCE(synopsis, ''), 50) as synopsis_preview,
  LEFT(COALESCE(description, ''), 50) as description_preview,
  CASE 
    WHEN synopsis = description THEN 'SYNCED'
    WHEN synopsis IS NULL AND description IS NOT NULL THEN 'NEEDS SYNC'
    WHEN description IS NULL AND synopsis IS NOT NULL THEN 'NEEDS SYNC'
    ELSE 'OK'
  END as sync_status
FROM series
LIMIT 5;

-- Summary of what we have
SELECT
  'series' as table_name,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'synopsis') as has_synopsis,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'description') as has_description,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'is_published') as has_is_published,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'cover_url') as has_cover_url,
  EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'status') as has_status;
