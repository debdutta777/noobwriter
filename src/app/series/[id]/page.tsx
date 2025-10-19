'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
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
import { getSeriesDetail } from '@/app/actions/reader-actions'
import CommentSection from '@/components/comments/CommentSection'
import RatingSection from '@/components/ratings/RatingSection'

export default function SeriesDetailPage({ params }: { params: { id: string } }) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [showAllChapters, setShowAllChapters] = useState(false)
  const [activeTab, setActiveTab] = useState<'chapters' | 'about' | 'reviews'>('chapters')
  const [series, setSeries] = useState<any>(null)
  const [chapters, setChapters] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSeries()
  }, [params.id])

  const loadSeries = async () => {
    setLoading(true)
    const result = await getSeriesDetail(params.id)
    if (result.series && result.chapters) {
      setSeries(result.series)
      setChapters(result.chapters.reverse()) // Most recent first
    }
    setLoading(false)
  }

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
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">Series not found</h3>
            <p className="text-muted-foreground mb-4">
              This series doesn't exist or has been removed.
            </p>
            <Link href="/browse">
              <Button>Browse Series</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    )
  }

  const displayedChapters = showAllChapters ? chapters : chapters.slice(0, 10)

  return (
    <div className="min-h-screen">
      {/* Hero Section with Cover */}
      <div className="relative h-[400px] bg-gradient-to-b from-background via-background/95 to-background">
        <div
          className="absolute inset-0 opacity-20 blur-2xl"
          style={{
            backgroundImage: `url(${series.cover_url})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="container mx-auto px-4 py-8 relative z-10">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <img
                src={series.cover_url}
                alt={series.title}
                className="w-full md:w-64 rounded-lg shadow-2xl"
              />
            </div>

            {/* Series Info */}
            <div className="flex-1 space-y-4 text-white">
              <div>
                <span className={`px-3 py-1 rounded text-sm font-semibold ${
                  series.content_type === 'novel'
                    ? 'bg-primary'
                    : 'bg-purple-600'
                }`}>
                  {series.content_type === 'novel' ? 'Novel' : 'Manga'}
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl font-bold">{series.title}</h1>
              
              <div className="inline-flex items-center gap-2">
                <img
                  src={series.authorAvatar || '/default-avatar.png'}
                  alt={series.author}
                  className="w-8 h-8 rounded-full"
                />
                <span className="text-lg">by {series.author}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {series.genres.map((genre: string) => (
                  <span
                    key={genre}
                    className="px-3 py-1 bg-white/10 backdrop-blur rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap items-center gap-6 text-sm">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                  <span className="font-semibold">{series.avg_rating?.toFixed(1) || 'N/A'}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Eye className="h-5 w-5" />
                  <span>{series.total_views >= 1000000 ? `${(series.total_views / 1000000).toFixed(1)}M` : `${(series.total_views / 1000).toFixed(0)}K`} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-5 w-5" />
                  <span>{series.total_chapters} chapters</span>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link href={`/read/${series.id}/1`}>
                  <Button size="lg" className="gap-2">
                    <Play className="h-5 w-5" />
                    Start Reading
                  </Button>
                </Link>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
                  onClick={() => setIsFavorited(!isFavorited)}
                >
                  <Heart className={`h-5 w-5 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
                  {isFavorited ? 'Favorited' : 'Add to Library'}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="gap-2 bg-white/10 backdrop-blur border-white/20 text-white hover:bg-white/20"
                >
                  <Share2 className="h-5 w-5" />
                  Share
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Tabs */}
      <div className="container mx-auto px-4 py-8">
        <div className="flex gap-2 mb-6 border-b">
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'chapters'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('chapters')}
          >
            Chapters ({series.total_chapters})
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'about'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('about')}
          >
            About
          </button>
          <button
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'reviews'
                ? 'border-b-2 border-primary text-primary'
                : 'text-muted-foreground hover:text-foreground'
            }`}
            onClick={() => setActiveTab('reviews')}
          >
            Reviews
          </button>
        </div>

        {/* Chapters Tab */}
        {activeTab === 'chapters' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-muted-foreground">
                Last updated: {new Date(series.updated_at).toLocaleDateString()}
              </p>
              <Button variant="outline" size="sm">
                Newest First ↓
              </Button>
            </div>

            <div className="grid gap-2">
              {displayedChapters.map((chapter) => (
                <Link key={chapter.id} href={`/read/${series.id}/${chapter.chapter_number}`}>
                  <Card className="hover:shadow-md transition-shadow cursor-pointer group">
                    <CardContent className="flex items-center justify-between p-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">Chapter {chapter.chapter_number}</span>
                          {chapter.is_premium && (
                            <span className="flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded text-xs font-semibold">
                              <Lock className="h-3 w-3" />
                              {chapter.coin_price} coins
                            </span>
                          )}
                          {chapter.chapter_number > series.total_chapters - 3 && (
                            <span className="px-2 py-0.5 bg-green-500/10 text-green-600 dark:text-green-400 rounded text-xs font-semibold">
                              NEW
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">{chapter.title}</p>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{new Date(chapter.published_at).toLocaleDateString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {!showAllChapters && chapters.length > 10 && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAllChapters(true)}
              >
                <ChevronDown className="mr-2 h-4 w-4" />
                Show All Chapters ({chapters.length})
              </Button>
            )}

            {showAllChapters && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setShowAllChapters(false)}
              >
                <ChevronUp className="mr-2 h-4 w-4" />
                Show Less
              </Button>
            )}
          </div>
        )}

        {/* About Tab */}
        {activeTab === 'about' && (
          <div className="max-w-3xl space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Synopsis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-line text-muted-foreground leading-relaxed">
                  {series.synopsis}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Details</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className="font-medium capitalize">{series.status}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Content Type</p>
                  <p className="font-medium capitalize">{series.content_type}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Age Rating</p>
                  <p className="font-medium">{series.age_rating}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Language</p>
                  <p className="font-medium">{series.language}</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {series.tags.map((tag: string) => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-accent text-accent-foreground rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Reviews Tab */}
        {activeTab === 'reviews' && (
          <div className="max-w-4xl space-y-6">
            {/* Ratings Section */}
            <RatingSection
              seriesId={params.id}
              averageRating={series.avg_rating || 0}
              totalRatings={series.total_ratings || 0}
            />

            {/* Comments Section */}
            <CommentSection
              seriesId={params.id}
              initialCount={series.total_comments || 0}
            />
          </div>
        )}
      </div>
    </div>
  )
}
