'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, BookOpen, X, LibraryBig } from 'lucide-react'
import { browseSeries } from '@/app/actions/reader-actions'
import SeriesCard from '@/components/series/SeriesCard'

export default function BrowsePage() {
  const [contentType, setContentType] = useState<'all' | 'novel' | 'manga'>('all')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('trending')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [series, setSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadSeries = useCallback(async () => {
    setLoading(true)
    const result = await browseSeries({
      contentType,
      genres: selectedGenres,
      sortBy,
      searchQuery,
      limit: 24,
    })
    if (result.series) setSeries(result.series)
    setLoading(false)
  }, [contentType, selectedGenres, sortBy, searchQuery])

  useEffect(() => {
    loadSeries()
  }, [loadSeries])

  const genres = [
    'Fantasy', 'Romance', 'Action', 'Sci-Fi', 'Mystery', 'Horror',
    'Comedy', 'Drama', 'Slice of Life', 'Adventure', 'Martial Arts',
    'Xuanhuan', 'Wuxia', 'Xianxia', 'School Life', 'Psychological',
  ]

  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'latest', label: 'Latest Updates' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'new', label: 'New Releases' },
  ]

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre],
    )
  }

  const clearAll = () => {
    setSelectedGenres([])
    setSearchQuery('')
    setContentType('all')
    setSortBy('trending')
  }

  const activeFilters = selectedGenres.length + (contentType !== 'all' ? 1 : 0) + (searchQuery ? 1 : 0)

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 text-primary mb-3">
          <LibraryBig className="w-4 h-4" />
          <span className="text-xs font-semibold uppercase tracking-[0.18em]">Explore the library</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2">Browse stories</h1>
        <p className="text-muted-foreground">Filter by genre, sort by what matters — find your next favorite.</p>
      </div>

      {/* Search + toolbar */}
      <div className="sticky top-16 z-20 -mx-4 px-4 py-3 bg-background/80 backdrop-blur-md border-b border-border/60 mb-8">
        <div className="flex flex-col md:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, author, or keyword..."
              className="pl-10 h-11"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex gap-2">
            {/* content type pill group */}
            <div className="inline-flex rounded-lg border bg-muted/40 p-1 h-11">
              {(['all', 'novel', 'manga'] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setContentType(t)}
                  className={`px-3 sm:px-4 text-sm font-medium rounded-md capitalize transition-colors ${
                    contentType === t
                      ? 'bg-background shadow-sm text-foreground'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {t === 'all' ? 'All' : t}
                </button>
              ))}
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-11 px-3 rounded-lg border bg-background text-sm font-medium cursor-pointer hover:bg-accent"
            >
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>

            <Button
              variant={showFilters ? 'default' : 'outline'}
              onClick={() => setShowFilters(!showFilters)}
              className="h-11 gap-2 relative"
            >
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
              {activeFilters > 0 && (
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold">
                  {activeFilters}
                </span>
              )}
            </Button>
          </div>
        </div>

        {/* Genre chips — always visible when filter open */}
        {showFilters && (
          <div className="mt-3 pt-3 border-t border-border/60 animate-fade-in-up">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Genres</span>
              {activeFilters > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
                >
                  <X className="w-3 h-3" />
                  Clear all
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {genres.map((genre) => {
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
            </div>
          </div>
        )}
      </div>

      {/* Results */}
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
          <h3 className="text-xl font-semibold mb-1">No stories match</h3>
          <p className="text-muted-foreground mb-5 text-sm">
            Try a different genre, sort, or search term.
          </p>
          <Button onClick={clearAll}>Clear filters</Button>
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-5 text-sm text-muted-foreground">
            <span>
              {series.length} {series.length === 1 ? 'result' : 'results'}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 animate-fade-in-up">
            {series.map((item) => (
              <SeriesCard key={item.id} series={item} />
            ))}
          </div>
          {series.length >= 24 && (
            <div className="mt-12 text-center">
              <Button size="lg" variant="outline" onClick={loadSeries}>
                Refresh results
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}
