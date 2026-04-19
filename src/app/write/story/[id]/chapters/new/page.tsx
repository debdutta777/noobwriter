import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getNextChapterNumber } from '@/app/actions/writer-actions'
import NewChapterClient from './NewChapterClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function NewChapterPage({ params }: PageProps) {
  const { id: seriesId } = await params
  const supabase = await createClient()

  const { data: series, error } = await supabase
    .from('series')
    .select('id, title, content_type')
    .eq('id', seriesId)
    .single()

  if (error || !series) notFound()

  const contentType = (series.content_type === 'manga' ? 'manga' : 'novel') as 'novel' | 'manga'
  const nextChapterNumber = await getNextChapterNumber(seriesId)

  return (
    <NewChapterClient
      seriesId={seriesId}
      contentType={contentType}
      nextChapterNumber={nextChapterNumber}
    />
  )
}
