import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import StoryManagementClient from './StoryManagementClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function StoryManagementPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch series data
  const { data: series, error: seriesError } = await supabase
    .from('series')
    .select('*')
    .eq('id', id)
    .single()

  if (seriesError || !series) {
    notFound()
  }

  // Fetch chapters for this series
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('*')
    .eq('series_id', id)
    .order('chapter_number', { ascending: true })

  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <StoryManagementClient 
        series={series} 
        initialChapters={chapters || []} 
      />
    </Suspense>
  )
}
