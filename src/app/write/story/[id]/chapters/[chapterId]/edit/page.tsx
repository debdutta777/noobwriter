import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import ChapterEditClient from './ChapterEditClient'

interface PageProps {
  params: Promise<{ id: string; chapterId: string }>
}

export default async function ChapterEditPage({ params }: PageProps) {
  const { id: seriesId, chapterId } = await params
  const supabase = await createClient()

  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*')
    .eq('id', chapterId)
    .eq('series_id', seriesId)
    .single()

  if (error || !chapter) {
    notFound()
  }

  const { data: series } = await supabase
    .from('series')
    .select('id, slug, title, content_type')
    .eq('id', seriesId)
    .single()

  const contentType = (series?.content_type === 'manga' ? 'manga' : 'novel') as 'novel' | 'manga'

  let initialPages: { page_number: number; image_url: string }[] = []
  if (contentType === 'manga') {
    const { data: pages } = await supabase
      .from('manga_pages')
      .select('page_number, image_url')
      .eq('chapter_id', chapterId)
      .order('page_number', { ascending: true })
    initialPages = pages || []
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ChapterEditClient
        chapter={chapter as any}
        seriesId={seriesId}
        seriesSlug={series?.slug ?? undefined}
        contentType={contentType}
        initialPages={initialPages}
      />
    </Suspense>
  )
}
