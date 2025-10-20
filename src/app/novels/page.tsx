'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Star, Eye, BookOpen } from 'lucide-react'
import { browseSeries } from '@/app/actions/reader-actions'

export default function NovelsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedGenres, setSelectedGenres] = useState<string[]>([])
  const [sortBy, setSortBy] = useState('trending')
  const [series, setSeries] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const genres = ['Fantasy', 'Romance', 'Action', 'Sci-Fi', 'Mystery', 'Horror', 'Comedy', 'Drama']

  const loadNovels = async () => {
    setLoading(true)
    const result = await browseSeries({
      contentType: 'novel',
      genres: selectedGenres,
      sortBy,
      searchQuery,
      limit: 24,
    })
    if (result.series) {
      setSeries(result.series)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadNovels()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, selectedGenres, sortBy])

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
        <h1 className="text-4xl font-bold mb-2">Novels</h1>
        <p className="text-muted-foreground">Discover amazing stories</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row gap-4 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search novels..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-4 py-2 rounded-lg border bg-background"
          >
            <option value="trending">Trending</option>
            <option value="popular">Most Popular</option>
            <option value="latest">Recently Updated</option>
            <option value="rating">Highest Rated</option>
            <option value="new">Newest</option>
          </select>
        </div>

        {/* Genre Filters */}
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
          {selectedGenres.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedGenres([])}
            >
              Clear All
            </Button>
          )}
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <div className="aspect-[2/3] bg-muted" />
              <CardContent className="p-3">
                <div className="h-4 bg-muted rounded mb-2" />
                <div className="h-3 bg-muted rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : series.length === 0 ? (
        <div className="text-center py-20">
          <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
          <h3 className="text-xl font-semibold mb-2">No novels found</h3>
          <p className="text-muted-foreground">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-muted-foreground">
            Showing {series.length} novel{series.length !== 1 ? 's' : ''}
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            {series.map((novel) => (
              <Link key={novel.id} href={`/series/${novel.id}`}>
                <Card className="group hover:shadow-lg transition-all cursor-pointer">
                  <div className="relative aspect-[2/3] overflow-hidden rounded-t-lg bg-muted">
                    {novel.cover ? (
                      <Image
                        src={novel.cover}
                        alt={novel.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <BookOpen className="w-12 h-12 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <CardContent className="p-3">
                    <h3 className="font-semibold text-sm mb-1 line-clamp-2 group-hover:text-primary transition-colors">
                      {novel.title}
                    </h3>
                    <p className="text-xs text-muted-foreground mb-2">
                      {novel.author}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                        <span>{novel.rating.toFixed(1)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        <span>{novel.views > 1000 ? `${(novel.views / 1000).toFixed(1)}k` : novel.views}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
