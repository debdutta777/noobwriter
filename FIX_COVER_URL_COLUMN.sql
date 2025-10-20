-- Fix cover URL column issue
-- This migration ensures the series table has the correct cover_url column

-- First, check what column exists
DO $$
BEGIN
  -- If cover_image_url exists but not cover_url, rename it
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'series' AND column_name = 'cover_image_url'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'series' AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE series RENAME COLUMN cover_image_url TO cover_url;
    RAISE NOTICE 'Renamed cover_image_url to cover_url';
  END IF;

  -- If neither exists, add cover_url
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'series' AND column_name = 'cover_url'
  ) THEN
    ALTER TABLE series ADD COLUMN cover_url TEXT;
    RAISE NOTICE 'Added cover_url column';
  END IF;
END $$;

-- Verify the column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'series' 
  AND column_name IN ('cover_url', 'cover_image_url')
ORDER BY column_name;

-- Update any existing records that might have cover_image_url
-- (This handles cases where data might exist in the old column)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'series' AND column_name = 'cover_image_url'
  ) THEN
    UPDATE series 
    SET cover_url = cover_image_url 
    WHERE cover_url IS NULL AND cover_image_url IS NOT NULL;
    
    -- Drop the old column after migration
    ALTER TABLE series DROP COLUMN IF EXISTS cover_image_url;
    RAISE NOTICE 'Migrated data from cover_image_url to cover_url';
  END IF;
END $$;
