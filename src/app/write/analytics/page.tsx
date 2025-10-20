'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  BarChart3,
  TrendingUp,
  Eye,
  Users,
  Coins,
  Star,
  BookOpen,
  Calendar,
  DollarSign,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { getWriterAnalytics } from '@/app/actions/analytics-actions'
import WorldMap from '@/components/analytics/WorldMap'

type AnalyticsData = {
  overview: {
    totalViews: number
    viewsChange: number
    totalReaders: number
    readersChange: number
    totalRevenue: number
    revenueChange: number
    avgRating: number
    ratingChange: number
  }
  seriesPerformance: Array<{
    id: string
    title: string
    views: number
    readers: number
    revenue: number
    rating: number
  }>
  chapterPerformance: Array<{
    chapter: number
    title: string
    views: number
    engagement: number
    revenue: number
  }>
  readerDemographics: {
    byDevice: Array<{ name: string; value: number; count: number }>
    byRegion: Array<{ name: string; value: number; count: number; lat: number; lng: number }>
    readingTimes: Array<{ hour: string; readers: number }>
  }
  revenueBreakdown: {
    thisMonth: number
    lastMonth: number
    bySource: Array<{ source: string; amount: number; percentage: number }>
    dailyRevenue: Array<{ date: string; amount: number }>
  }
}

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')
  const [stats, setStats] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true)
      setError(null)
      
      try {
        const result = await getWriterAnalytics(timeRange)
        
        if (result.success && result.data) {
          setStats(result.data)
        } else {
          setError(result.error || 'Failed to load analytics data')
        }
      } catch (err) {
        console.error('Error fetching analytics:', err)
        setError('An unexpected error occurred')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [timeRange])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20 mb-4">
            <p className="text-destructive font-semibold">Error Loading Analytics</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Track your story performance and revenue</p>
      </div>

      {/* Time Range Selector */}
      <div className="mb-6 flex gap-2">
        {(['7d', '30d', '90d', 'all'] as const).map((range) => (
          <button
            key={range}
            onClick={() => setTimeRange(range)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              timeRange === range
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            {range === '7d' && 'Last 7 Days'}
            {range === '30d' && 'Last 30 Days'}
            {range === '90d' && 'Last 90 Days'}
            {range === 'all' && 'All Time'}
          </button>
        ))}
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Views</p>
                <p className="text-2xl font-bold">{stats.overview.totalViews.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4" />
                  <span>{stats.overview.viewsChange}%</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-blue-500/10">
                <Eye className="w-6 h-6 text-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Readers</p>
                <p className="text-2xl font-bold">{stats.overview.totalReaders.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4" />
                  <span>{stats.overview.readersChange}%</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-purple-500/10">
                <Users className="w-6 h-6 text-purple-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Revenue</p>
                <p className="text-2xl font-bold">₹{stats.overview.totalRevenue.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4" />
                  <span>{stats.overview.revenueChange}%</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-green-500/10">
                <DollarSign className="w-6 h-6 text-green-500" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Avg Rating</p>
                <p className="text-2xl font-bold">{stats.overview.avgRating}</p>
                <div className="flex items-center gap-1 mt-2 text-sm text-green-600">
                  <ArrowUp className="w-4 h-4" />
                  <span>{stats.overview.ratingChange}</span>
                </div>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/10">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="series" className="space-y-6">
        <TabsList>
          <TabsTrigger value="series">Series Performance</TabsTrigger>
          <TabsTrigger value="chapters">Chapter Analytics</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="readers">Reader Insights</TabsTrigger>
        </TabsList>

        {/* Series Performance Tab */}
        <TabsContent value="series" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Series Performance Overview</CardTitle>
              <CardDescription>Compare your stories' performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.seriesPerformance.map((series) => (
                  <div key={series.id} className="p-4 border rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-semibold text-lg mb-1">{series.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Eye className="w-4 h-4" />
                            {series.views.toLocaleString()} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            {series.readers.toLocaleString()} readers
                          </span>
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                            {series.rating}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-600">₹{series.revenue.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">Revenue</p>
                      </div>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${(series.views / 50000) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chapter Analytics Tab */}
        <TabsContent value="chapters" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Chapters</CardTitle>
              <CardDescription>Your most viewed chapters this period</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {stats.chapterPerformance.map((chapter) => (
                  <div key={chapter.chapter} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-semibold">Chapter {chapter.chapter}: {chapter.title}</p>
                      <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                        <span>{chapter.views.toLocaleString()} views</span>
                        <span>•</span>
                        <span>{chapter.engagement}% engagement</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-green-600">₹{chapter.revenue}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Revenue Tab */}
        <TabsContent value="revenue" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Revenue Sources</CardTitle>
                <CardDescription>Where your earnings come from</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.revenueBreakdown.bySource.map((source) => (
                  <div key={source.source}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{source.source}</span>
                      <span className="text-sm font-semibold">₹{source.amount.toLocaleString()}</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${source.percentage}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{source.percentage}% of total</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Monthly Comparison</CardTitle>
                <CardDescription>Revenue growth over time</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-sm text-muted-foreground mb-1">This Month</p>
                    <p className="text-3xl font-bold text-green-600">₹{stats.revenueBreakdown.thisMonth.toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-muted rounded-lg">
                    <p className="text-sm text-muted-foreground mb-1">Last Month</p>
                    <p className="text-2xl font-bold">₹{stats.revenueBreakdown.lastMonth.toLocaleString()}</p>
                  </div>
                  <div className="flex items-center gap-2 text-green-600">
                    <ArrowUp className="w-5 h-5" />
                    <span className="font-semibold">
                      {(((stats.revenueBreakdown.thisMonth - stats.revenueBreakdown.lastMonth) / stats.revenueBreakdown.lastMonth) * 100).toFixed(1)}% increase
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Reader Insights Tab */}
        <TabsContent value="readers" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Reader Devices</CardTitle>
                <CardDescription>How readers access your content</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {stats.readerDemographics.byDevice.map((device) => (
                  <div key={device.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{device.name}</span>
                      <span className="text-sm text-muted-foreground">{device.count.toLocaleString()} readers</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${device.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{device.value}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Geographic Distribution</CardTitle>
                <CardDescription>Where your readers are from</CardDescription>
              </CardHeader>
              <CardContent>
                <WorldMap data={stats.readerDemographics.byRegion} />
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
