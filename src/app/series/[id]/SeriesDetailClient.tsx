'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Heart,
  Share2,
  Star,
  Eye,
  Clock,
  BookOpen,
  Lock,
  Play,
  ChevronDown,
  ChevronUp
} from 'lucide-react'
import { getSeriesDetail, toggleFavorite, checkIsFavorited } from '@/app/actions/reader-actions'
import CommentSection from '@/components/comments/CommentSection'
import RatingSection from '@/components/ratings/RatingSection'
import TipButton from '@/components/tip/TipButton'

interface SeriesDetailClientProps {
  params: { id: string }
}

export default function SeriesDetailClient({ params }: SeriesDetailClientProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAllChapters, setShowAllChapters] = useState(false)
  const [activeTab, setActiveTab] = useState<'chapters' | 'about' | 'reviews'>('chapters')
  const [series, setSeries] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [favoriteLoading, setFavoriteLoading] = useState(false)

  const loadSeries = useCallback(async () => {
    setLoading(true)
    const result = await getSeriesDetail(params.id)
    if (result.series && result.chapters) {
      setSeries(result.series)
      setChapters(result.chapters.reverse()) // Most recent first
    }
    setLoading(false)
  }, [params.id])

  const checkFavoriteStatus = useCallback(async () => {
    const result = await checkIsFavorited(params.id)
    setIsFavorited(result.isFavorited)
  }, [params.id])

  const handleToggleFavorite = async () => {
    if (favoriteLoading) return
    
    setFavoriteLoading(true)
    const result = await toggleFavorite(params.id)
    
    if (result.success) {
      setIsFavorited(result.isFavorited)
    } else if (result.error) {
      alert(result.error)
    }
    
    setFavoriteLoading(false)
  }

  useEffect(() => {
    loadSeries()
    checkFavoriteStatus()
  }, [loadSeries, checkFavoriteStatus])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading series...</p>
        </div>
      </div>
    )
  }

  if (!series) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-xl font-semibold mb-4">Series not found</p>
          <Link href="/browse">
            <Button>Browse Series</Button>
          </Link>
        </div>
      </div>
    )
  }

  const displayChapters = showAllChapters ? chapters : chapters.slice(0, 10)

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-b from-primary/20 to-background border-b">
        <div className="container mx-auto px-4 py-12">
          <div className="grid md:grid-d-cols-3 lg:grid-cols-4 gap-8">
            {/* Cover Image */}
            <div className="md:col-span-1">
              <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={series.cover_url || '/placeholder-cover.jpg'}
                  alt={series.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Series Info */}
            <div className="md:col-span-2 lg:col-span-3 space-y-6">
              {/* Title and Stats */}
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary font-medium">
                    {series.content_type === 'novel' ? 'Novel' : 'Manga'}
                  </span>
                  <span>•</span>
                  <span>{series.status}</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{series.title}</h1>
                <p className="text-lg text-muted-foreground mb-4">{series.author_name}</p>

                {/* Stats Row */}
                <div className="flex flex-wrap gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <Star className="h-4 w-4 text-amber-500 fill-amber-500" />
                    <span className="font-semibold">{series.average_rating?.toFixed(1) || 'N/A'}</span>
                    <span className="text-muted-foreground">({series.total_ratings || 0} ratings)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-muted-foreground" />
                    <span>{(series.total_views || 0).toLocaleString()} views</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                    <span>{series.total_chapters || 0} chapters</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span>Updated {new Date(series.last_chapter_at || series.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Genres */}
              <div className="flex flex-wrap gap-2">
                {series.genres?.map((genre: string) => (
                  <span
                    key={genre}
                    className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {series.content_type === 'novel' ? (
                  <Link href={`/read/${series.id}/1`}>
                    <Button size="lg" className="gap-2">
                      <BookOpen className="h-4 w-4" />
                      Start Reading
                    </Button>
                  </Link>
                ) : (
                  <Link href={`/manga/${series.id}/1`}>
                    <Button size="lg" className="gap-2">
                      <Play className="h-4 w-4" />
                      Start Reading
                    </Button>
                  </Link>
                )}
                <Button
                  size="lg"
                  variant={isFavorited ? "default" : "outline"}
                  onClick={handleToggleFavorite}
                  disabled={favoriteLoading}
                  className="gap-2"
                >
                  <Heart className={isFavorited ? "fill-current" : ""} />
                  {favoriteLoading ? 'Saving...' : (isFavorited ? 'Favorited' : 'Add to Library')}
                </Button>
                <TipButton
                  authorId={series.author_id}
                  authorName={series.author}
                  seriesId={series.id}
                  size="lg"
                />
                <Button size="lg" variant="outline" className="gap-2">
                  <Share2 className="h-4 w-4" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab('chapters')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'chapters'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Chapters
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'about'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            About
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${
              activeTab === 'reviews'
                ? 'border-primary text-primary'
                : 'border-transparent text-muted-foreground hover:text-foreground'
            }`}
          >
            Reviews ({series.total_ratings || 0})
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'chapters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Chapters</h2>
              <span className="text-muted-foreground">
                {chapters.length} {chapters.length === 1 ? 'chapter' : 'chapters'}
              </span>
            </div>

            <div className="space-y-2">
              {displayChapters.map((chapter: any) => (
                <Link
                  key={chapter.id}
                  href={`/read/${series.id}/${chapter.chapter_number}`}
                  className="block"
                >
                  <Card className="hover:bg-accent transition-colors">
                    <CardHeader className="flex-row items-center justify-between space-y-0 py-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg">
                          Chapter {chapter.chapter_number}: {chapter.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                          <span>{new Date(chapter.published_at).toLocaleDateString()}</span>
                          {chapter.word_count && (
                            <>
                              <span>•</span>
                              <span>{chapter.word_count.toLocaleString()} words</span>
                            </>
                          )}
                          {chapter.view_count > 0 && (
                            <>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Eye className="h-3 w-3" />
                                {chapter.view_count.toLocaleString()}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {chapter.is_premium && (
                          <span className="px-2 py-1 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400 text-xs font-medium flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            {chapter.coin_price} coins
                          </span>
                        )}
                      </div>
                    </CardHeader>
                  </Card>
                </Link>
              ))}
            </div>

            {chapters.length > 10 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAllChapters(!showAllChapters)}
              >
                {showAllChapters ? (
                  <>
                    Show Less <ChevronUp className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Show All Chapters ({chapters.length}) <ChevronDown className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            )}
          </div>
        )}

        {activeTab === 'about' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-4">Synopsis</h2>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                {series.description || 'No description available.'}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Series Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author:</span>
                    <span className="font-medium">{series.author_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="font-medium capitalize">{series.content_type}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Status:</span>
                    <span className="font-medium capitalize">{series.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Chapters:</span>
                    <span className="font-medium">{series.total_chapters}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Published:</span>
                    <span className="font-medium">{new Date(series.created_at).toLocaleDateString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Statistics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Views:</span>
                    <span className="font-medium">{(series.total_views || 0).toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Average Rating:</span>
                    <span className="font-medium flex items-center gap-1">
                      <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                      {series.average_rating?.toFixed(2) || 'N/A'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Ratings:</span>
                    <span className="font-medium">{series.total_ratings || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Favorites:</span>
                    <span className="font-medium">{series.total_favorites || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Last Updated:</span>
                    <span className="font-medium">
                      {new Date(series.last_chapter_at || series.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div className="space-y-6">
            <RatingSection seriesId={series.id} />
            <div className="mt-8">
              <h3 className="text-xl font-bold mb-4">Comments</h3>
              <CommentSection seriesId={series.id} />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
