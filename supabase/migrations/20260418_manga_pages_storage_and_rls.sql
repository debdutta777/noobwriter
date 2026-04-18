-- Migration: Provision manga-pages storage bucket + RLS for manga_pages table
-- Idempotent — safe to re-run.
--
-- Context:
-- - manga_pages table already exists (created in 20241019_initial_schema.sql)
--   but has no RLS policies, so reads/writes succeed only with service role.
-- - The manga-pages storage bucket is NOT yet provisioned (confirmed via
--   GET /storage/v1/bucket on 2026-04-18).
-- - src/components/upload/MangaPagesUpload.tsx uploads to the path
--   `{user.id}/{chapterId}/{file}` in bucket `manga-pages`.
-- - src/app/actions/manga-actions.ts does authenticated ownership checks
--   (chapter -> series.author_id) before insert/delete, so RLS just enforces
--   the same contract at the DB level.

-- ============================================================================
-- 1. Storage bucket: manga-pages
-- ============================================================================

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'manga-pages',
  'manga-pages',
  true,                                             -- public read
  10485760,                                         -- 10 MB (matches client limit)
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- ============================================================================
-- 2. Storage policies on manga-pages
-- ============================================================================
-- Path convention: {user_id}/{chapter_id}/{filename}
-- auth.uid()::text must equal the first folder segment for write ops.

DROP POLICY IF EXISTS "manga_pages_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "manga_pages_author_insert" ON storage.objects;
DROP POLICY IF EXISTS "manga_pages_author_update" ON storage.objects;
DROP POLICY IF EXISTS "manga_pages_author_delete" ON storage.objects;

CREATE POLICY "manga_pages_public_read"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'manga-pages');

CREATE POLICY "manga_pages_author_insert"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'manga-pages'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "manga_pages_author_update"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'manga-pages'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "manga_pages_author_delete"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'manga-pages'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- ============================================================================
-- 3. RLS on manga_pages table
-- ============================================================================

ALTER TABLE public.manga_pages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "manga_pages_select_published" ON public.manga_pages;
DROP POLICY IF EXISTS "manga_pages_author_insert"    ON public.manga_pages;
DROP POLICY IF EXISTS "manga_pages_author_update"    ON public.manga_pages;
DROP POLICY IF EXISTS "manga_pages_author_delete"    ON public.manga_pages;

-- Readers see pages for any published chapter; authors always see their own.
CREATE POLICY "manga_pages_select_published"
  ON public.manga_pages FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.chapters c
      JOIN public.series s ON s.id = c.series_id
      WHERE c.id = manga_pages.chapter_id
        AND (c.is_published = true OR s.author_id = auth.uid())
    )
  );

CREATE POLICY "manga_pages_author_insert"
  ON public.manga_pages FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.chapters c
      JOIN public.series s ON s.id = c.series_id
      WHERE c.id = manga_pages.chapter_id
        AND s.author_id = auth.uid()
    )
  );

CREATE POLICY "manga_pages_author_update"
  ON public.manga_pages FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.chapters c
      JOIN public.series s ON s.id = c.series_id
      WHERE c.id = manga_pages.chapter_id
        AND s.author_id = auth.uid()
    )
  );

CREATE POLICY "manga_pages_author_delete"
  ON public.manga_pages FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1
      FROM public.chapters c
      JOIN public.series s ON s.id = c.series_id
      WHERE c.id = manga_pages.chapter_id
        AND s.author_id = auth.uid()
    )
  );

-- ============================================================================
-- 4. Helpful index for page lookups
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_manga_pages_chapter_page
  ON public.manga_pages (chapter_id, page_number);
