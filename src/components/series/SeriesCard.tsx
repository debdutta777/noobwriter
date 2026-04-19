'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Star, Eye, BookOpen } from 'lucide-react'
import type { SeriesCard as SeriesCardType } from '@/app/actions/homepage-actions'

interface SeriesCardProps {
  series: SeriesCardType
  showStats?: boolean
  compact?: boolean
}

function formatNumber(num: number) {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`
  return num.toString()
}

export default function SeriesCard({ series, showStats = true, compact = false }: SeriesCardProps) {
  const href = `/series/${series.slug || series.id}`
  const isManga = series.content_type === 'manga'

  if (compact) {
    return (
      <Link href={href} className="block group">
        <div className="flex gap-3 p-2 rounded-xl hover:bg-accent/50 transition-colors">
          <div className="relative w-[68px] h-[96px] flex-shrink-0 rounded-lg overflow-hidden bg-muted ring-1 ring-border/60">
            {series.cover_url ? (
              <Image
                src={series.cover_url}
                alt={series.title}
                fill
                sizes="68px"
                className="object-cover group-hover:scale-[1.04] transition-transform duration-500"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-muted-foreground" />
              </div>
            )}
          </div>
          <div className="flex-1 min-w-0 py-0.5">
            <h3 className="font-semibold text-sm leading-snug line-clamp-2 mb-1 group-hover:text-primary transition-colors">
              {series.title}
            </h3>
            <p className="text-xs text-muted-foreground mb-2 truncate">{series.author_name}</p>
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                <span className="font-medium text-foreground/80">{series.average_rating.toFixed(1)}</span>
              </span>
              <span className="inline-flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {formatNumber(series.view_count)}
              </span>
            </div>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <Link href={href} className="group block">
      <div className="relative rounded-xl overflow-hidden bg-card ring-1 ring-border/60 transition-all duration-300 group-hover:ring-primary/40 group-hover:shadow-xl group-hover:shadow-primary/10 group-hover:-translate-y-1">
        <div className="relative aspect-[2/3] w-full bg-muted">
          {series.cover_url ? (
            <Image
              src={series.cover_url}
              alt={series.title}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
              className="object-cover group-hover:scale-[1.06] transition-transform duration-[700ms] ease-out"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted/60">
              <BookOpen className="w-12 h-12 text-muted-foreground/60" />
            </div>
          )}

          {/* bottom fade for legibility */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />

          {/* type badge */}
          <span
            className={`absolute top-2 left-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide backdrop-blur-sm ${
              isManga
                ? 'bg-purple-500/90 text-white'
                : 'bg-white/90 text-black'
            }`}
          >
            {isManga ? 'Manga' : 'Novel'}
          </span>

          {/* rating pill */}
          {series.total_ratings > 0 && (
            <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[11px] font-semibold bg-black/70 text-white backdrop-blur-sm">
              <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
              {series.average_rating.toFixed(1)}
            </span>
          )}

          {/* title + author over cover */}
          <div className="absolute inset-x-0 bottom-0 p-3">
            <h3 className="text-white font-semibold text-sm leading-tight line-clamp-2 drop-shadow-md">
              {series.title}
            </h3>
            <p className="text-white/70 text-[11px] mt-0.5 truncate">{series.author_name}</p>
          </div>
        </div>

        {showStats && (
          <div className="flex items-center justify-between px-3 py-2 text-[11px] text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Eye className="w-3 h-3" />
              {formatNumber(series.view_count)}
            </span>
            <span className="inline-flex items-center gap-1">
              <BookOpen className="w-3 h-3" />
              {series.total_chapters} ch
            </span>
          </div>
        )}
      </div>
    </Link>
  )
}
