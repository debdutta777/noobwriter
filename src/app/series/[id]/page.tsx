import { Suspense } from 'react'
import SeriesDetailClient from './SeriesDetailClient'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function SeriesDetailPage({ params }: PageProps) {
  const resolvedParams = await params
  
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading series...</p>
        </div>
      </div>
    }>
      <SeriesDetailClient params={resolvedParams} />
    </Suspense>
  )
}
