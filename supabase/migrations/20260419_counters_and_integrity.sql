-- Migration: Fix counters, add missing tables, integrity indexes
-- Idempotent — safe to re-run.
--
-- Fixes:
--   1. Rating trigger was writing to non-existent column `avg_rating` (should be `average_rating`).
--   2. No trigger kept `series.total_favorites` in sync.
--   3. `follows` table (user-to-user follow) did not exist in any migration.
--   4. `comment_likes` join table did not exist — `comments.likes` was bumped via a
--      racy client-supplied counter with no idempotency.
--   5. Backfill all counters from authoritative row data.

-- ============================================================================
-- 1. follows (user → user) — was missing entirely
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (follower_id, following_id),
  CHECK (follower_id <> following_id)
);

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone"
  ON public.follows FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can follow" ON public.follows;
CREATE POLICY "Users can follow"
  ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);

DROP POLICY IF EXISTS "Users can unfollow" ON public.follows;
CREATE POLICY "Users can unfollow"
  ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ============================================================================
-- 2. comment_likes — idempotent per-user likes on comments
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.comment_likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  comment_id UUID NOT NULL REFERENCES public.comments(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id, comment_id)
);

CREATE INDEX IF NOT EXISTS idx_comment_likes_user ON public.comment_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON public.comment_likes(comment_id);

ALTER TABLE public.comment_likes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comment likes are viewable by everyone" ON public.comment_likes;
CREATE POLICY "Comment likes are viewable by everyone"
  ON public.comment_likes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can like comments" ON public.comment_likes;
CREATE POLICY "Users can like comments"
  ON public.comment_likes FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can unlike comments" ON public.comment_likes;
CREATE POLICY "Users can unlike comments"
  ON public.comment_likes FOR DELETE USING (auth.uid() = user_id);

-- Keep comments.likes in sync from comment_likes rows.
CREATE OR REPLACE FUNCTION public.sync_comment_likes_count()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID := COALESCE(NEW.comment_id, OLD.comment_id);
BEGIN
  UPDATE public.comments
  SET likes = (
    SELECT COUNT(*) FROM public.comment_likes WHERE comment_id = target_id
  )
  WHERE id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_comment_likes ON public.comment_likes;
CREATE TRIGGER trg_sync_comment_likes
  AFTER INSERT OR DELETE ON public.comment_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_comment_likes_count();

-- ============================================================================
-- 3. chapter_likes → chapters.likes (replace racy app-side counter)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_chapter_likes_count()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID := COALESCE(NEW.chapter_id, OLD.chapter_id);
BEGIN
  UPDATE public.chapters
  SET likes = (
    SELECT COUNT(*) FROM public.chapter_likes WHERE chapter_id = target_id
  )
  WHERE id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_chapter_likes ON public.chapter_likes;
CREATE TRIGGER trg_sync_chapter_likes
  AFTER INSERT OR DELETE ON public.chapter_likes
  FOR EACH ROW EXECUTE FUNCTION public.sync_chapter_likes_count();

-- ============================================================================
-- 4. favorites → series.total_favorites
-- ============================================================================

CREATE OR REPLACE FUNCTION public.sync_series_favorites_count()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID := COALESCE(NEW.series_id, OLD.series_id);
BEGIN
  UPDATE public.series
  SET total_favorites = (
    SELECT COUNT(*) FROM public.favorites WHERE series_id = target_id
  )
  WHERE id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_series_favorites ON public.favorites;
CREATE TRIGGER trg_sync_series_favorites
  AFTER INSERT OR DELETE ON public.favorites
  FOR EACH ROW EXECUTE FUNCTION public.sync_series_favorites_count();

-- ============================================================================
-- 5. Fix ratings trigger — was writing to non-existent `avg_rating`
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_series_rating()
RETURNS TRIGGER AS $$
DECLARE
  target_id UUID := COALESCE(NEW.series_id, OLD.series_id);
BEGIN
  UPDATE public.series
  SET average_rating = (
    SELECT ROUND(AVG(rating)::numeric, 2) FROM public.ratings WHERE series_id = target_id
  )
  WHERE id = target_id;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_series_rating ON public.ratings;
CREATE TRIGGER trigger_update_series_rating
  AFTER INSERT OR UPDATE OR DELETE ON public.ratings
  FOR EACH ROW EXECUTE FUNCTION public.update_series_rating();

-- ============================================================================
-- 6. comments → series.total_comments
-- Existing trigger only counts direct series comments; keep behaviour.
-- (Re-declared for completeness / idempotence.)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.update_series_comments()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.series_id IS NOT NULL THEN
    UPDATE public.series SET total_comments = total_comments + 1 WHERE id = NEW.series_id;
  ELSIF TG_OP = 'DELETE' AND OLD.series_id IS NOT NULL THEN
    UPDATE public.series SET total_comments = GREATEST(0, total_comments - 1) WHERE id = OLD.series_id;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_series_comments ON public.comments;
CREATE TRIGGER trigger_update_series_comments
  AFTER INSERT OR DELETE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.update_series_comments();

-- ============================================================================
-- 7. Backfill all counters from authoritative row data
-- ============================================================================

-- total_favorites
UPDATE public.series s
SET total_favorites = COALESCE(sub.cnt, 0)
FROM (SELECT series_id, COUNT(*) AS cnt FROM public.favorites GROUP BY series_id) sub
WHERE s.id = sub.series_id;

UPDATE public.series SET total_favorites = 0
WHERE id NOT IN (SELECT DISTINCT series_id FROM public.favorites);

-- total_comments (series-level comments only)
UPDATE public.series s
SET total_comments = COALESCE(sub.cnt, 0)
FROM (SELECT series_id, COUNT(*) AS cnt FROM public.comments WHERE series_id IS NOT NULL GROUP BY series_id) sub
WHERE s.id = sub.series_id;

UPDATE public.series SET total_comments = 0
WHERE id NOT IN (SELECT DISTINCT series_id FROM public.comments WHERE series_id IS NOT NULL);

-- average_rating
UPDATE public.series s
SET average_rating = sub.avg_r
FROM (SELECT series_id, ROUND(AVG(rating)::numeric, 2) AS avg_r FROM public.ratings GROUP BY series_id) sub
WHERE s.id = sub.series_id;

-- chapters.likes
UPDATE public.chapters c
SET likes = COALESCE(sub.cnt, 0)
FROM (SELECT chapter_id, COUNT(*) AS cnt FROM public.chapter_likes GROUP BY chapter_id) sub
WHERE c.id = sub.chapter_id;

UPDATE public.chapters SET likes = 0
WHERE id NOT IN (SELECT DISTINCT chapter_id FROM public.chapter_likes);

-- comments.likes
UPDATE public.comments co
SET likes = COALESCE(sub.cnt, 0)
FROM (SELECT comment_id, COUNT(*) AS cnt FROM public.comment_likes GROUP BY comment_id) sub
WHERE co.id = sub.comment_id;

UPDATE public.comments SET likes = 0
WHERE id NOT IN (SELECT DISTINCT comment_id FROM public.comment_likes);
