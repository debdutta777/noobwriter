-- ADD SLUG GENERATION FUNCTION AND TRIGGER
-- This ensures slug is always generated even if not provided

-- 1. Create function to generate slug from title
CREATE OR REPLACE FUNCTION generate_slug_from_title()
RETURNS TRIGGER AS $$
BEGIN
  -- Only generate slug if it's NULL
  IF NEW.slug IS NULL THEN
    NEW.slug := LOWER(
      REGEXP_REPLACE(
        REGEXP_REPLACE(NEW.title, '[^a-zA-Z0-9]+', '-', 'g'),
        '^-+|-+$', '', 'g'
      )
    ) || '-' || EXTRACT(EPOCH FROM NOW())::BIGINT;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS generate_slug_trigger ON series;

CREATE TRIGGER generate_slug_trigger
BEFORE INSERT ON series
FOR EACH ROW
EXECUTE FUNCTION generate_slug_from_title();

-- 3. Fix any existing NULL slugs
UPDATE series
SET slug = LOWER(
  REGEXP_REPLACE(
    REGEXP_REPLACE(title, '[^a-zA-Z0-9]+', '-', 'g'),
    '^-+|-+$', '', 'g'
  )
) || '-' || EXTRACT(EPOCH FROM created_at)::BIGINT
WHERE slug IS NULL;

-- 4. Verification
SELECT 
  id,
  title,
  slug,
  CASE 
    WHEN slug IS NULL THEN '❌ NULL SLUG'
    ELSE '✅ HAS SLUG'
  END as status
FROM series
LIMIT 5;

-- Check if trigger exists
SELECT 
  trigger_name,
  event_manipulation,
  action_timing
FROM information_schema.triggers
WHERE trigger_name = 'generate_slug_trigger';
