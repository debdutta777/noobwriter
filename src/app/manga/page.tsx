'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, BookOpen, Images } from 'lucide-react'
import { browseSeries } from '@/app/actions/reader-actions'
import SeriesCard from '@/components/series/SeriesCard'

const GENRES = ['Action', 'Romance', 'Fantasy', 'Comedy', 'Drama', 'Horror', 'Mystery', 'Sci-Fi']

const SORTS = [
  { value: 'trending', label: 'Trending' },
  { value: 'popular', label: 'Most popular' },
  { value: 'latest', label: 'Recently updated' },
  { value: 'rating', label: 'Highest rated' },
  { value: 'new', label: 'Newest' },
]

export default function MangaPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('trending')
  const [series, setSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    setLoading(true)
    const result = await browseSeries({
      contentType: 'manga',
      genres: selectedGenres,
      sortBy,
      searchQuery,
      limit: 24,
    })
    if (result.series) setSeries(result.series)
    setLoading(false)
  }, [selectedGenres, sortBy, searchQuery])

  useEffect(() => {
    load()
  }, [load])

  const toggleGenre = (genre: string) =>
    setSelectedGenres((prev) => (prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]))

  return (
    <div className="container mx-auto px-4 py-10">
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-purple-500 mb-3">
          <Images className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Manga & comics</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Manga</h1>
        <p className="text-muted-foreground">Visual stories, panel by panel. Vertical or paged — your choice.</p>
      </div>

      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search manga..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="h-11 px-3 rounded-lg border bg-background text-sm font-medium cursor-pointer hover:bg-accent"
          >
            {SORTS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {GENRES.map((genre) => {
            const active = selectedGenres.includes(genre)
            return (
              <button
                key={genre}
                onClick={() => toggleGenre(genre)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                  active
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'bg-background border-border hover:border-foreground/30'
                }`}
              >
                {genre}
              </button>
            )
          })}
          {selectedGenres.length > 0 && (
            <button
              onClick={() => setSelectedGenres([])}
              className="px-3 py-1.5 rounded-full text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="rounded-xl bg-card ring-1 ring-border/60 overflow-hidden">
              <div className="aspect-[2/3] bg-muted animate-pulse" />
              <div className="px-3 py-2">
                <div className="h-2.5 bg-muted animate-pulse rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : series.length === 0 ? (
        <div className="text-center py-24 rounded-2xl border border-dashed">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <BookOpen className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-semibold mb-1">No manga found</h3>
          <p className="text-muted-foreground text-sm">Try adjusting your filters or search term.</p>
        </div>
      ) : (
        <>
          <div className="mb-5 text-sm text-muted-foreground">
            {series.length} manga series
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fade-in-up">
            {series.map((manga) => (
              <SeriesCard key={manga.id} series={manga} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}
