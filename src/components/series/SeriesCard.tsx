'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Eye, BookOpen } from 'lucide-react'
import { Card } from '@/components/ui/card'
import type { SeriesCard as SeriesCardType } from '@/app/actions/homepage-actions'

interface SeriesCardProps {
  series: SeriesCardType
  showStats?: boolean
  compact?: boolean
}

export default function SeriesCard({ series, showStats = true, compact = false }: SeriesCardProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  if (compact) {
    return (
      <Link href={`/series/${series.id}`}>
        <Card className="flex gap-3 p-3 hover:border-primary transition-colors">
          <div className="relative w-16 h-24 flex-shrink-0 rounded overflow-hidden bg-muted">
            {series.cover_url ? (
              <Image
                src={series.cover_url}
                alt={series.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-sm line-clamp-2 mb-1">{series.title}</h3>
            <p className="text-xs text-muted-foreground mb-2">{series.author_name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {series.average_rating.toFixed(1)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(series.view_count)}
              </span>
            </div>
          </div>
        </Card>
      </Link>
    )
  }

  return (
    <Link href={`/series/${series.id}`}>
      <Card className="overflow-hidden hover:border-primary transition-all hover:shadow-lg group">
        <div className="relative aspect-[2/3] w-full bg-muted">
          {series.cover_url ? (
            <Image
              src={series.cover_url}
              alt={series.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="w-16 h-16 text-muted-foreground" />
            </div>
          )}
          <div className="absolute top-2 right-2 bg-black/70 px-2 py-1 rounded text-xs font-semibold">
            {series.content_type === 'novel' ? 'Novel' : 'Manga'}
          </div>
        </div>
        <div className="p-4">
          <h3 className="font-semibold text-lg line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {series.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-2">{series.author_name}</p>
          {showStats && (
            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span className="flex items-center gap-1">
                <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                {series.average_rating.toFixed(1)} ({series.total_ratings})
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {formatNumber(series.view_count)}
              </span>
            </div>
          )}
          <div className="mt-2 text-xs text-muted-foreground">
            {series.total_chapters} {series.total_chapters === 1 ? 'chapter' : 'chapters'}
          </div>
        </div>
      </Card>
    </Link>
  )
}
