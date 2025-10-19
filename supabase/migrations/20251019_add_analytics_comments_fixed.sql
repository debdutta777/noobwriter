-- Fixed Migration: Add analytics tracking and comment features
-- Created: 2025-10-19
-- This migration fixes the schema issues

-- Add analytics tracking to chapters
ALTER TABLE chapters 
ADD COLUMN IF NOT EXISTS likes INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS word_count INTEGER DEFAULT 0;

-- Drop existing comments table if it exists with wrong schema
DROP TABLE IF EXISTS comments CASCADE;

-- Create comments table with proper structure
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  series_id UUID REFERENCES series(id) ON DELETE CASCADE,
  chapter_id UUID REFERENCES chapters(id) ON DELETE CASCADE,
  parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  likes INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT comment_target CHECK (
    (series_id IS NOT NULL AND chapter_id IS NULL) OR 
    (series_id IS NULL AND chapter_id IS NOT NULL)
  )
);

-- Drop existing ratings table if it exists
DROP TABLE IF EXISTS ratings CASCADE;

-- Create ratings table
CREATE TABLE ratings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  series_id UUID NOT NULL REFERENCES series(id) ON DELETE CASCADE,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, series_id)
);

-- Add indexes for performance
CREATE INDEX idx_comments_series ON comments(series_id) WHERE series_id IS NOT NULL;
CREATE INDEX idx_comments_chapter ON comments(chapter_id) WHERE chapter_id IS NOT NULL;
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_id) WHERE parent_id IS NOT NULL;
CREATE INDEX idx_ratings_series ON ratings(series_id);
CREATE INDEX idx_ratings_user ON ratings(user_id);
CREATE INDEX IF NOT EXISTS idx_chapters_series_published ON chapters(series_id, is_published);
CREATE INDEX IF NOT EXISTS idx_reading_progress_user ON reading_progress(user_id);

-- Enable RLS on new tables
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for comments
CREATE POLICY "Comments are viewable by everyone"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Users can create comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
  ON comments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for ratings
CREATE POLICY "Ratings are viewable by everyone"
  ON ratings FOR SELECT
  USING (true);

CREATE POLICY "Users can create ratings"
  ON ratings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own ratings"
  ON ratings FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own ratings"
  ON ratings FOR DELETE
  USING (auth.uid() = user_id);

-- Function to update comment count on series
CREATE OR REPLACE FUNCTION update_series_comments()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.series_id IS NOT NULL THEN
    UPDATE series 
    SET total_comments = total_comments + 1
    WHERE id = NEW.series_id;
  ELSIF TG_OP = 'DELETE' AND OLD.series_id IS NOT NULL THEN
    UPDATE series 
    SET total_comments = GREATEST(0, total_comments - 1)
    WHERE id = OLD.series_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for comment count
DROP TRIGGER IF EXISTS trigger_update_series_comments ON comments;
CREATE TRIGGER trigger_update_series_comments
  AFTER INSERT OR DELETE ON comments
  FOR EACH ROW
  EXECUTE FUNCTION update_series_comments();

-- Function to update average rating on series
CREATE OR REPLACE FUNCTION update_series_rating()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE series 
  SET avg_rating = (
    SELECT COALESCE(AVG(rating), 0)
    FROM ratings
    WHERE series_id = COALESCE(NEW.series_id, OLD.series_id)
  )
  WHERE id = COALESCE(NEW.series_id, OLD.series_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger for rating updates
DROP TRIGGER IF EXISTS trigger_update_series_rating ON ratings;
CREATE TRIGGER trigger_update_series_rating
  AFTER INSERT OR UPDATE OR DELETE ON ratings
  FOR EACH ROW
  EXECUTE FUNCTION update_series_rating();

-- Add total_comments column to series if not exists
ALTER TABLE series 
ADD COLUMN IF NOT EXISTS total_comments INTEGER DEFAULT 0;

-- Initialize comment counts (will be 0 since we just created the table)
UPDATE series 
SET total_comments = 0
WHERE total_comments IS NULL;

-- Ensure favorites table has proper indexes
CREATE INDEX IF NOT EXISTS idx_favorites_user ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_series ON favorites(series_id);
CREATE INDEX IF NOT EXISTS idx_favorites_created ON favorites(created_at DESC);
