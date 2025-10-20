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

  // Fetch chapter data
  const { data: chapter, error } = await supabase
    .from('chapters')
    .select('*, series!inner(id, title, author_id)')
    .eq('id', chapterId)
    .eq('series_id', seriesId)
    .single()

  if (error || !chapter) {
    notFound()
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ChapterEditClient chapter={chapter} seriesId={seriesId} />
    </Suspense>
  )
}
