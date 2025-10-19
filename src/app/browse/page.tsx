'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, SlidersHorizontal, BookOpen, Star, Eye, X } from 'lucide-react'
import { browseSeries } from '@/app/actions/reader-actions'

export default function BrowsePage() {
  const [contentType, setContentType] = useState<'all' | 'novel' | 'manga'>('all')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('trending')
  const [showFilters, setShowFilters] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [series, setSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSeries()
  }, [contentType, selectedGenres, sortBy, searchQuery])

  const loadSeries = async () => {
    setLoading(true)
    const result = await browseSeries({
      contentType,
      genres: selectedGenres,
      sortBy,
      searchQuery,
      limit: 20,
    })
    if (result.series) {
      setSeries(result.series)
    }
    setLoading(false)
  }

  const genres = [
    'Fantasy', 'Romance', 'Action', 'Sci-Fi', 'Mystery', 'Horror',
    'Comedy', 'Drama', 'Slice of Life', 'Adventure', 'Martial Arts',
    'Xuanhuan', 'Wuxia', 'Xianxia', 'School Life', 'Psychological'
  ]

  const sortOptions = [
    { value: 'trending', label: 'Trending' },
    { value: 'popular', label: 'Most Popular' },
    { value: 'latest', label: 'Latest Updates' },
    { value: 'rating', label: 'Highest Rated' },
    { value: 'new', label: 'New Releases' },
  ]

  const toggleGenre = (genre: string) => {
    setSelectedGenres(prev =>
      prev.includes(genre)
        ? prev.filter(g => g !== genre)
        : [...prev, genre]
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Browse Stories</h1>
        <p className="text-muted-foreground">Discover your next favorite series from our collection</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        {/* Search Bar */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title, author, or keyword..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="gap-2"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Content Type Tabs */}
        <div className="flex gap-2">
          <Button
            variant={contentType === 'all' ? 'default' : 'outline'}
            onClick={() => setContentType('all')}
          >
            All
          </Button>
          <Button
            variant={contentType === 'novel' ? 'default' : 'outline'}
            onClick={() => setContentType('novel')}
          >
            Novels
          </Button>
          <Button
            variant={contentType === 'manga' ? 'default' : 'outline'}
            onClick={() => setContentType('manga')}
            className="bg-purple-600 hover:bg-purple-700"
          >
            Manga
          </Button>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center justify-between">
                Filters
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Sort By */}
              <div>
                <label className="text-sm font-medium mb-2 block">Sort By</label>
                <div className="flex flex-wrap gap-2">
                  {sortOptions.map((option) => (
                    <Button
                      key={option.value}
                      variant={sortBy === option.value ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => setSortBy(option.value)}
                    >
                      {option.label}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Genres */}
              <div>
                <label className="text-sm font-medium mb-2 block">Genres</label>
                <div className="flex flex-wrap gap-2">
                  {genres.map((genre) => (
                    <Button
                      key={genre}
                      variant={selectedGenres.includes(genre) ? 'default' : 'outline'}
                      size="sm"
                      onClick={() => toggleGenre(genre)}
                    >
                      {genre}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Selected Filters */}
              {selectedGenres.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Selected Filters</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedGenres.map((genre) => (
                      <span
                        key={genre}
                        className="flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground rounded-full text-sm"
                      >
                        {genre}
                        <button
                          onClick={() => toggleGenre(genre)}
                          className="hover:bg-primary-foreground/20 rounded-full p-0.5"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedGenres([])}
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {[...Array(10)].map((_, i) => (
            <Card key={i} className="h-full">
              <div className="aspect-[3/4] bg-muted animate-pulse rounded-t-lg" />
              <CardContent className="p-3">
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-3 bg-muted animate-pulse rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : series.length === 0 ? (
        <Card className="p-12 text-center">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No series found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your filters or search query
          </p>
          <Button onClick={() => {
            setSelectedGenres([])
            setSearchQuery('')
            setContentType('all')
          }}>
            Clear Filters
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {series.map((item) => (
            <Link key={item.id} href={`/series/${item.id}`}>
              <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                <CardHeader className="p-0">
                  <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                    <img
                      src={item.cover || 'https://via.placeholder.com/300x400?text=No+Cover'}
                      alt={item.title}
                      className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute top-2 left-2">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${
                      item.contentType === 'novel'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-purple-600 text-white'
                    }`}>
                      {item.contentType === 'novel' ? 'Novel' : 'Manga'}
                    </span>
                  </div>
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span className="text-xs font-semibold">{item.rating}</span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3">
                    <p className="text-white text-sm font-medium line-clamp-2">{item.title}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-3">
                <div className="flex flex-wrap gap-1 mb-2">
                  {item.genres.slice(0, 2).map((genre: string) => (
                    <span
                      key={genre}
                      className="px-2 py-0.5 bg-accent text-accent-foreground rounded-full text-xs"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{(item.views / 1000).toFixed(0)}K</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3" />
                    <span>{item.chapters}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
        </div>
      )}

      {/* Load More */}
      {!loading && series.length > 0 && (
        <div className="mt-12 text-center">
          <Button size="lg" variant="outline">
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
