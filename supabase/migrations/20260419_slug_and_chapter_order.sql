-- Migration: Clean slugs + serialize chapter_number per series
-- Idempotent — safe to re-run.
--
-- Goals:
--   1. Every series has a unique, URL-friendly slug (backfill nulls, dedupe collisions).
--   2. Every chapter has a unique slug within its series.
--   3. chapter_number is 1..N per series (no gaps, no duplicates).
--   4. Enforce uniqueness going forward via indexes.
--   5. Keep counters (series.total_chapters) in sync via trigger.

-- ============================================================================
-- 1. Helper: slugify(text)
-- ============================================================================

CREATE OR REPLACE FUNCTION public.slugify(input text)
RETURNS text
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT
    CASE
      WHEN input IS NULL OR btrim(input) = '' THEN 'untitled'
      ELSE
        trim(both '-' from
          regexp_replace(
            regexp_replace(lower(input), '[^a-z0-9]+', '-', 'g'),
            '-+', '-', 'g'
          )
        )
    END;
$$;

-- ============================================================================
-- 2. Backfill series.slug
-- ============================================================================

-- First pass: assign a slug wherever it is NULL or empty.
UPDATE public.series
SET slug = public.slugify(title)
WHERE slug IS NULL OR btrim(slug) = '';

-- Dedupe collisions: pick a winner per slug (oldest), append -2, -3, ... to others.
WITH numbered AS (
  SELECT
    id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY slug ORDER BY created_at, id) AS rn
  FROM public.series
)
UPDATE public.series s
SET slug = n.slug || '-' || n.rn
FROM numbered n
WHERE s.id = n.id
  AND n.rn > 1;

-- Make series.slug required + unique.
ALTER TABLE public.series
  ALTER COLUMN slug SET NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS series_slug_unique_idx
  ON public.series (slug);

-- ============================================================================
-- 3. Serialize chapter_number per series
-- ============================================================================
-- Renumber chapters so each series has a contiguous 1..N sequence.
-- Ordering preference: existing chapter_number, then created_at (tie-breaker).

WITH ranked AS (
  SELECT
    id,
    series_id,
    ROW_NUMBER() OVER (
      PARTITION BY series_id
      ORDER BY
        COALESCE(chapter_number, 2147483647),  -- nulls last
        created_at,
        id
    ) AS new_number
  FROM public.chapters
)
UPDATE public.chapters c
SET chapter_number = r.new_number
FROM ranked r
WHERE c.id = r.id
  AND c.chapter_number IS DISTINCT FROM r.new_number;

-- ============================================================================
-- 4. Backfill chapter.slug
-- ============================================================================

UPDATE public.chapters
SET slug = public.slugify(title)
WHERE slug IS NULL OR btrim(slug) = '';

-- Dedupe within each series.
WITH numbered AS (
  SELECT
    id,
    series_id,
    slug,
    ROW_NUMBER() OVER (PARTITION BY series_id, slug ORDER BY chapter_number, created_at, id) AS rn
  FROM public.chapters
)
UPDATE public.chapters c
SET slug = n.slug || '-' || n.rn
FROM numbered n
WHERE c.id = n.id
  AND n.rn > 1;

ALTER TABLE public.chapters
  ALTER COLUMN slug SET NOT NULL;

-- ============================================================================
-- 5. Uniqueness indexes on chapters
-- ============================================================================
-- chapter_number must be unique per series going forward.
CREATE UNIQUE INDEX IF NOT EXISTS chapters_series_number_unique_idx
  ON public.chapters (series_id, chapter_number);

-- Slug unique per series (so /read/{series-slug}/{chapter-slug} is unambiguous).
CREATE UNIQUE INDEX IF NOT EXISTS chapters_series_slug_unique_idx
  ON public.chapters (series_id, slug);

-- ============================================================================
-- 6. Keep series.total_chapters accurate
-- ============================================================================

CREATE OR REPLACE FUNCTION public.recalc_series_chapter_count(p_series_id uuid)
RETURNS void
LANGUAGE sql
AS $$
  UPDATE public.series s
  SET total_chapters = (
    SELECT COUNT(*)
    FROM public.chapters c
    WHERE c.series_id = s.id
      AND c.is_published = true
  )
  WHERE s.id = p_series_id;
$$;

CREATE OR REPLACE FUNCTION public.chapters_sync_series_count()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    PERFORM public.recalc_series_chapter_count(NEW.series_id);
  ELSIF TG_OP = 'UPDATE' THEN
    PERFORM public.recalc_series_chapter_count(NEW.series_id);
    IF NEW.series_id IS DISTINCT FROM OLD.series_id THEN
      PERFORM public.recalc_series_chapter_count(OLD.series_id);
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    PERFORM public.recalc_series_chapter_count(OLD.series_id);
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS chapters_sync_series_count_trg ON public.chapters;
CREATE TRIGGER chapters_sync_series_count_trg
AFTER INSERT OR UPDATE OR DELETE ON public.chapters
FOR EACH ROW EXECUTE FUNCTION public.chapters_sync_series_count();

-- One-shot resync for existing rows.
UPDATE public.series s
SET total_chapters = sub.cnt
FROM (
  SELECT series_id, COUNT(*) FILTER (WHERE is_published = true) AS cnt
  FROM public.chapters
  GROUP BY series_id
) sub
WHERE s.id = sub.series_id
  AND s.total_chapters IS DISTINCT FROM sub.cnt;
