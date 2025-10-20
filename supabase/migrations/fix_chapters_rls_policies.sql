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
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'chapters'
ORDER BY policyname;
