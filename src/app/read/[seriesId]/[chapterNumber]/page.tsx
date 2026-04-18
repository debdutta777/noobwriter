import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NovelReaderClient from './NovelReaderClient'
import MangaReaderClient from './MangaReaderClient'

interface PageProps {
  params: Promise<{ seriesId: string; chapterNumber: string }>
}

export default async function ReaderPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()

  const { data: series } = await supabase
    .from('series')
    .select('id, content_type')
    .eq('id', resolvedParams.seriesId)
    .single()

  if (!series) notFound()

  const isManga = series.content_type === 'manga'

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      {isManga ? (
        <MangaReaderClient params={resolvedParams} />
      ) : (
        <NovelReaderClient params={resolvedParams} />
      )}
    </Suspense>
  )
}
