-- Create tables for tracking stats if they don't exist

-- Reading progress tracking
CREATE TABLE IF NOT EXISTS reading_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  last_read_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Chapter likes tracking
CREATE TABLE IF NOT EXISTS chapter_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  chapter_id UUID NOT NULL REFERENCES chapters(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, chapter_id)
);

-- Series followers tracking
CREATE TABLE IF NOT EXISTS series_followers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, series_id)
);

-- Add likes column to chapters if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'chapters' AND column_name = 'likes') THEN
    ALTER TABLE chapters ADD COLUMN likes INTEGER NOT NULL DEFAULT 0;
  END IF;
END $$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_reading_progress_chapter ON reading_progress(chapter_id);
CREATE INDEX IF NOT EXISTS idx_chapter_likes_user ON chapter_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_chapter_likes_chapter ON chapter_likes(chapter_id);
CREATE INDEX IF NOT EXISTS idx_series_followers_user ON series_followers(user_id);
CREATE INDEX IF NOT EXISTS idx_series_followers_series ON series_followers(series_id);

-- RLS Policies for reading_progress
ALTER TABLE reading_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own reading progress" ON reading_progress;
CREATE POLICY "Users can view their own reading progress"
ON reading_progress FOR SELECT
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own reading progress" ON reading_progress;
CREATE POLICY "Users can update their own reading progress"
ON reading_progress FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can upsert their own reading progress" ON reading_progress;
CREATE POLICY "Users can upsert their own reading progress"
ON reading_progress FOR UPDATE
USING (auth.uid() = user_id);

-- RLS Policies for chapter_likes
ALTER TABLE chapter_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view chapter likes" ON chapter_likes;
CREATE POLICY "Anyone can view chapter likes"
ON chapter_likes FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can like chapters" ON chapter_likes;
CREATE POLICY "Users can like chapters"
ON chapter_likes FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike chapters" ON chapter_likes;
CREATE POLICY "Users can unlike chapters"
ON chapter_likes FOR DELETE
USING (auth.uid() = user_id);

-- RLS Policies for series_followers
ALTER TABLE series_followers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view series followers" ON series_followers;
CREATE POLICY "Anyone can view series followers"
ON series_followers FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Users can follow series" ON series_followers;
CREATE POLICY "Users can follow series"
ON series_followers FOR INSERT
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unfollow series" ON series_followers;
CREATE POLICY "Users can unfollow series"
ON series_followers FOR DELETE
USING (auth.uid() = user_id);
