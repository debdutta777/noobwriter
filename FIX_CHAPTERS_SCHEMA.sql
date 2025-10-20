-- Ensure all required columns exist for chapter publishing

-- 1. Add published_at column if missing
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS published_at TIMESTAMPTZ;

-- 2. Add unlock_cost column if missing (some code uses this instead of coin_price)
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS unlock_cost INTEGER;

-- 3. Sync coin_price and unlock_cost
UPDATE chapters
SET unlock_cost = coin_price
WHERE unlock_cost IS NULL AND coin_price IS NOT NULL;

UPDATE chapters
SET coin_price = unlock_cost
WHERE coin_price IS NULL AND unlock_cost IS NOT NULL;

-- 4. Add word_count column if missing
ALTER TABLE chapters
  ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- 5. Create function to calculate word count
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

-- 6. Create trigger for word count
DROP TRIGGER IF EXISTS update_word_count ON chapters;

CREATE TRIGGER update_word_count
BEFORE INSERT OR UPDATE ON chapters
FOR EACH ROW
EXECUTE FUNCTION calculate_word_count();

-- 7. Update existing chapters' word counts
UPDATE chapters
SET content = content
WHERE word_count IS NULL OR word_count = 0;

-- 8. Verification
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'chapters'
  AND column_name IN ('published_at', 'unlock_cost', 'coin_price', 'word_count', 'is_published')
ORDER BY column_name;

-- Check sample chapters
SELECT 
  id,
  title,
  chapter_number,
  is_published,
  published_at,
  coin_price,
  unlock_cost,
  word_count
FROM chapters
LIMIT 5;
