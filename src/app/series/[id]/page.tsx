import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import SeriesDetailClient from './SeriesDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function SeriesDetailPage({ params }: PageProps) {
  const { id: identifier } = await params
  const supabase = await createClient()

  const column = UUID_RE.test(identifier) ? 'id' : 'slug'
  const { data: series } = await supabase
    .from('series')
    .select('id, slug')
    .eq(column, identifier)
    .maybeSingle()

  if (!series) notFound()
  if (column === 'id' && series.slug) {
    redirect(`/series/${series.slug}`)
  }

  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading series...</p>
        </div>
      </div>
    }>
      <SeriesDetailClient params={{ id: series.id }} />
    </Suspense>
  )
}
