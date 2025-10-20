'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  BookOpen,
  TrendingUp,
  Coins,
  Eye,
  PlusCircle,
  Edit3,
  BarChart3,
  Users,
  Star,
  Clock,
  FileText,
  DollarSign,
  AlertCircle,
  PenTool,
} from 'lucide-react'
import { getWriterDashboardData } from '@/app/actions/writer-actions'
import { createClient } from '@/lib/supabase/client'

interface DashboardData {
  user: {
    display_name: string
    email: string
  }
  stats: {
    totalSeries: number
    totalChapters: number
    totalViews: number
    totalEarnings: number
    totalReaders: number
    avgRating: number
  }
  mySeries: Array<{
    id: string
    title: string
    cover_url: string | null
    content_type: string
    total_chapters: number
    total_views: number
    avg_rating: number
    is_published: boolean
    last_chapter_at: string | null
  }>
  recentChapters: Array<{
    id: string
    title: string
    chapter_number: number
    views: number
    series_title: string
    published_at: string
  }>
  earnings: {
    thisMonth: number
    lastMonth: number
    pendingPayout: number
  }
}

export default function WriterDashboardPage() {
  const router = useRouter()
  const supabase = createClient()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authChecking, setAuthChecking] = useState(true)
  const [hasPublishedSeries, setHasPublishedSeries] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  // Check authentication
  const checkAuth = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        router.push('/login?redirect=/write/dashboard')
        return
      }

      setUser(user)

      // Check if user has published any series
      const { count, error: countError } = await supabase
        .from('series')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', user.id)

      if (countError) {
        console.error('Error checking series:', countError)
        setError('Failed to check series: ' + countError.message)
      }

      setHasPublishedSeries((count || 0) > 0)
      setAuthChecking(false)

      // Only load dashboard if they have series
      if ((count || 0) > 0) {
        loadDashboard()
      } else {
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Auth check error:', err)
      setError('Authentication error: ' + (err.message || 'Unknown error'))
      setAuthChecking(false)
      setLoading(false)
    }
  }, [supabase, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const loadDashboard = async () => {
    try {
      setLoading(true)
      const result = await getWriterDashboardData()
      
      console.log('Dashboard data result:', result)
      
      if (result.error) {
        setError(result.error)
        console.error('Dashboard error:', result.error)
      } else if (result.data) {
        setData(result.data)
      } else {
        setError('No data returned from dashboard')
      }
    } catch (err: any) {
      console.error('Dashboard load error:', err)
      setError('Failed to load dashboard: ' + (err.message || 'Unknown error'))
    } finally {
      setLoading(false)
    }
  }

  if (authChecking || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Show "Create First Novel" prompt if user has no series
  if (!hasPublishedSeries) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-muted/20">
        <Card className="max-w-2xl w-full mx-4">
          <CardContent className="p-12 text-center">
            {error && (
              <div className="mb-6 p-4 bg-destructive/10 text-destructive rounded-lg">
                <p className="text-sm">{error}</p>
              </div>
            )}
            <div className="mb-6 inline-flex items-center justify-center w-20 h-20 rounded-full bg-primary/10">
              <PenTool className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-4">Welcome to Your Writer Dashboard!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              You need to create your first novel or manga to unlock the writer dashboard features.
              Start your journey as a creator today!
            </p>
            
            <div className="space-y-4">
              <Link href="/write/story/new">
                <Button size="lg" className="w-full text-lg h-auto py-4">
                  <PlusCircle className="w-6 h-6 mr-2" />
                  Create Your First Story
                </Button>
              </Link>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8 pt-8 border-t">
                <div className="text-center">
                  <div className="text-3xl mb-2">📚</div>
                  <p className="text-sm font-medium">Publish Novels</p>
                  <p className="text-xs text-muted-foreground">Share your stories</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">💰</div>
                  <p className="text-sm font-medium">Earn Coins</p>
                  <p className="text-xs text-muted-foreground">Monetize content</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-2">📊</div>
                  <p className="text-sm font-medium">Track Analytics</p>
                  <p className="text-xs text-muted-foreground">Monitor performance</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            {error ? (
              <>
                <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
                <p className="text-destructive mb-2 font-semibold">Error Loading Dashboard</p>
                <p className="text-sm text-muted-foreground mb-4">{error}</p>
                <Button onClick={loadDashboard}>Retry</Button>
              </>
            ) : (
              <>
                <p className="text-destructive mb-4">Failed to load dashboard data</p>
                <Button onClick={loadDashboard}>Retry</Button>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Writer Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {data.user.display_name}! Manage your stories and track your success.
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/write/story/new">
            <Button className="w-full h-auto py-6 text-lg" size="lg">
              <PlusCircle className="w-5 h-5 mr-2" />
              Create New Story
            </Button>
          </Link>
          <Link href="/write/chapter/new">
            <Button variant="outline" className="w-full h-auto py-6 text-lg" size="lg">
              <Edit3 className="w-5 h-5 mr-2" />
              Write Chapter
            </Button>
          </Link>
          <Link href="/write/analytics">
            <Button variant="outline" className="w-full h-auto py-6 text-lg" size="lg">
              <BarChart3 className="w-5 h-5 mr-2" />
              View Analytics
            </Button>
          </Link>
        </div>

        {/* Stats Overview */}
        <div className="mb-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-primary/10">
                  <BookOpen className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.stats.totalSeries}</p>
                  <p className="text-xs text-muted-foreground">Stories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-blue-500/10">
                  <FileText className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.stats.totalChapters}</p>
                  <p className="text-xs text-muted-foreground">Chapters</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-green-500/10">
                  <Eye className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{(data.stats.totalViews / 1000).toFixed(1)}K</p>
                  <p className="text-xs text-muted-foreground">Views</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-purple-500/10">
                  <Users className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.stats.totalReaders}</p>
                  <p className="text-xs text-muted-foreground">Readers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-yellow-500/10">
                  <Star className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{data.stats.avgRating.toFixed(1)}</p>
                  <p className="text-xs text-muted-foreground">Avg Rating</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-full bg-amber-500/10">
                  <Coins className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">₹{data.stats.totalEarnings}</p>
                  <p className="text-xs text-muted-foreground">Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* My Stories */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="w-5 h-5" />
                    My Stories ({data.mySeries.length})
                  </CardTitle>
                  <Link href="/write/story/new">
                    <Button size="sm">
                      <PlusCircle className="w-4 h-4 mr-2" />
                      New Story
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                {data.mySeries.length === 0 ? (
                  <div className="text-center py-12">
                    <BookOpen className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No stories yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Start your writing journey by creating your first story
                    </p>
                    <Link href="/write/story/new">
                      <Button>
                        <PlusCircle className="w-4 h-4 mr-2" />
                        Create Your First Story
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {data.mySeries.map((series) => (
                      <div
                        key={series.id}
                        className="flex gap-4 p-4 rounded-lg border hover:bg-accent transition-colors"
                      >
                        {/* Cover */}
                        <div className="relative flex-shrink-0 w-20 h-28 rounded-md bg-muted overflow-hidden">
                          {series.cover_url ? (
                            <Image
                              src={series.cover_url}
                              alt={series.title}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <BookOpen className="w-8 h-8 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h4 className="font-semibold text-lg mb-1 truncate">
                                {series.title}
                              </h4>
                              <div className="flex items-center gap-3 text-sm text-muted-foreground">
                                <span className="capitalize">{series.content_type}</span>
                                <span>•</span>
                                <span>{series.total_chapters} chapters</span>
                                <span>•</span>
                                <span>{series.total_views} views</span>
                              </div>
                            </div>
                            <div className="flex items-center gap-1 text-sm">
                              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                              <span>{series.avg_rating.toFixed(1)}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 mt-3">
                            <Link href={`/write/story/${series.id}`}>
                              <Button size="sm" variant="outline">
                                <Edit3 className="w-3 h-3 mr-1" />
                                Edit
                              </Button>
                            </Link>
                            <Link href={`/write/story/${series.id}/chapters/new`}>
                              <Button size="sm" variant="outline">
                                <PlusCircle className="w-3 h-3 mr-1" />
                                Add Chapter
                              </Button>
                            </Link>
                            <Link href={`/series/${series.id}`}>
                              <Button size="sm" variant="ghost">
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </Button>
                            </Link>
                            {!series.is_published && (
                              <span className="ml-auto text-xs px-2 py-1 rounded-full bg-yellow-500/10 text-yellow-600 dark:text-yellow-400">
                                Draft
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Chapters */}
            {data.recentChapters.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Recent Chapters
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {data.recentChapters.map((chapter) => (
                      <div
                        key={chapter.id}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div>
                          <p className="font-medium">
                            {chapter.series_title} - Ch. {chapter.chapter_number}
                          </p>
                          <p className="text-sm text-muted-foreground">{chapter.title}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{chapter.views} views</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(chapter.published_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Earnings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Earnings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">This Month</p>
                  <p className="text-2xl font-bold">₹{data.earnings.thisMonth}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Last Month</p>
                  <p className="text-lg">₹{data.earnings.lastMonth}</p>
                </div>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-1">Pending Payout</p>
                  <p className="text-xl font-semibold text-green-600">
                    ₹{data.earnings.pendingPayout}
                  </p>
                </div>
                <Button className="w-full" variant="outline">
                  Request Payout
                </Button>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Views</span>
                  <span className="font-semibold">{data.stats.totalViews.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Total Readers</span>
                  <span className="font-semibold">{data.stats.totalReaders}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Rating</span>
                  <span className="font-semibold flex items-center gap-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    {data.stats.avgRating.toFixed(1)}
                  </span>
                </div>
                <Link href="/write/analytics">
                  <Button className="w-full" variant="outline" size="sm">
                    View Detailed Analytics
                  </Button>
                </Link>
              </CardContent>
            </Card>

            {/* Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Writer Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  💡 Update regularly to keep readers engaged
                </p>
                <p className="text-sm text-muted-foreground">
                  💡 Respond to comments to build community
                </p>
                <p className="text-sm text-muted-foreground">
                  💡 Use premium chapters strategically
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
