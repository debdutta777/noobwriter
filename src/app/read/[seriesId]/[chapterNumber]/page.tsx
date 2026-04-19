import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import NovelReaderClient from './NovelReaderClient'
import MangaReaderClient from './MangaReaderClient'

interface PageProps {
  params: Promise<{ seriesId: string; chapterNumber: string }>
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ReaderPage({ params }: PageProps) {
  const { seriesId: identifier, chapterNumber } = await params
  const supabase = await createClient()

  const column = UUID_RE.test(identifier) ? 'id' : 'slug'
  const { data: series } = await supabase
    .from('series')
    .select('id, slug, content_type')
    .eq(column, identifier)
    .single()

  if (!series) notFound()

  // Old UUID URLs redirect to clean slug URLs for SEO + sharing.
  if (column === 'id' && series.slug && series.slug !== identifier) {
    redirect(`/read/${series.slug}/${chapterNumber}`)
  }

  const isManga = series.content_type === 'manga'
  const forwardedParams = {
    seriesId: series.id,
    seriesSlug: series.slug,
    chapterNumber,
  }

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      {isManga ? (
        <MangaReaderClient params={forwardedParams} />
      ) : (
        <NovelReaderClient params={forwardedParams} />
      )}
    </Suspense>
  )
}
