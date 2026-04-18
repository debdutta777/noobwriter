'use server'

import { createClient } from '@/lib/supabase/server'

export interface MangaPage {
  id?: string
  chapter_id?: string
  page_number: number
  image_url: string
}

/**
 * Replace all pages for a chapter (delete existing + insert new).
 * Used from the manga chapter editor where the writer sets the full page list at once.
 */
export async function saveMangaPages(chapterId: string, pages: MangaPage[]) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { success: false, error: 'Not authenticated' }

  // Verify ownership: chapter -> series.author_id must match user
  const { data: chapter } = await supabase
    .from('chapters')
    .select('series_id')
    .eq('id', chapterId)
    .single()
  if (!chapter) return { success: false, error: 'Chapter not found' }

  const { data: series } = await supabase
    .from('series')
    .select('author_id')
    .eq('id', chapter.series_id)
    .single()
  if (!series || series.author_id !== user.id) {
    return { success: false, error: 'Not authorized' }
  }

  const { error: deleteError } = await supabase
    .from('manga_pages')
    .delete()
    .eq('chapter_id', chapterId)
  if (deleteError) {
    return { success: false, error: `Failed to clear pages: ${deleteError.message}` }
  }

  if (pages.length === 0) {
    await supabase.from('chapters').update({ page_count: 0 }).eq('id', chapterId)
    return { success: true }
  }

  const rows = pages.map((p, idx) => ({
    chapter_id: chapterId,
    page_number: p.page_number ?? idx + 1,
    image_url: p.image_url,
  }))

  const { error: insertError } = await supabase.from('manga_pages').insert(rows)
  if (insertError) {
    return { success: false, error: `Failed to save pages: ${insertError.message}` }
  }

  await supabase.from('chapters').update({ page_count: rows.length }).eq('id', chapterId)
  return { success: true }
}

export async function getMangaPages(chapterId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('manga_pages')
    .select('*')
    .eq('chapter_id', chapterId)
    .order('page_number', { ascending: true })
  if (error) return { pages: [] as MangaPage[], error: error.message }
  return { pages: (data || []) as MangaPage[], error: null }
}
