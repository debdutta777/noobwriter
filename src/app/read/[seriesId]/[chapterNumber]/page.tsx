import { Suspense } from 'react'
import NovelReaderClient from './NovelReaderClient'

interface PageProps {
  params: Promise<{ seriesId: string; chapterNumber: string }>
}

export default async function NovelReaderPage({ params }: PageProps) {
  const resolvedParams = await params
  
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <NovelReaderClient params={resolvedParams} />
    </Suspense>
  )
}

