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

export default function AnalyticsPage() {
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | 'all'>('30d')

  // Mock data - will be replaced with real data from server actions
  const stats = {
    overview: {
      totalViews: 125430,
      viewsChange: 12.5,
      totalReaders: 8234,
      readersChange: 8.2,
      totalRevenue: 15680,
      revenueChange: 15.3,
      avgRating: 4.6,
      ratingChange: 0.2,
    },
    seriesPerformance: [
      { id: '1', title: 'The Legendary Mechanic', views: 45230, readers: 3421, revenue: 8500, rating: 4.7, trend: 'up' },
      { id: '2', title: 'Solo Leveling Chronicles', views: 38200, readers: 2890, revenue: 5200, rating: 4.5, trend: 'up' },
      { id: '3', title: 'Rebirth of the Strongest', views: 25100, readers: 1650, revenue: 1980, rating: 4.4, trend: 'down' },
      { id: '4', title: 'Magic Emperor', views: 16900, readers: 273, revenue: 0, rating: 4.8, trend: 'up' },
    ],
    chapterPerformance: [
      { chapter: 23, title: 'The Awakening', views: 4520, engagement: 85, revenue: 890 },
      { chapter: 22, title: 'Hidden Power', views: 4180, engagement: 82, revenue: 820 },
      { chapter: 21, title: 'First Battle', views: 3950, engagement: 88, revenue: 780 },
      { chapter: 20, title: 'New Beginning', views: 3720, engagement: 79, revenue: 650 },
      { chapter: 19, title: 'Discovery', views: 3580, engagement: 76, revenue: 580 },
    ],
    readerDemographics: {
      byDevice: [
        { name: 'Mobile', value: 65, count: 5352 },
        { name: 'Desktop', value: 28, count: 2305 },
        { name: 'Tablet', value: 7, count: 577 },
      ],
      byRegion: [
        { name: 'Asia', value: 45, count: 3705 },
        { name: 'North America', value: 30, count: 2470 },
        { name: 'Europe', value: 18, count: 1482 },
        { name: 'Others', value: 7, count: 577 },
      ],
      readingTimes: [
        { hour: '6 AM', readers: 850 },
        { hour: '12 PM', readers: 1200 },
        { hour: '6 PM', readers: 2100 },
        { hour: '12 AM', readers: 1800 },
      ],
    },
    revenueBreakdown: {
      thisMonth: 5680,
      lastMonth: 4920,
      bySource: [
        { source: 'Chapter Unlocks', amount: 4200, percentage: 74 },
        { source: 'Tips', amount: 980, percentage: 17 },
        { source: 'Subscriptions', amount: 500, percentage: 9 },
      ],
      dailyRevenue: [
        { date: 'Oct 13', amount: 180 },
        { date: 'Oct 14', amount: 220 },
        { date: 'Oct 15', amount: 195 },
        { date: 'Oct 16', amount: 250 },
        { date: 'Oct 17', amount: 210 },
        { date: 'Oct 18', amount: 280 },
        { date: 'Oct 19', amount: 245 },
      ],
    },
  }

  useEffect(() => {
    // TODO: Fetch analytics data from server
    setTimeout(() => setLoading(false), 500)
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
              <CardContent className="space-y-4">
                {stats.readerDemographics.byRegion.map((region) => (
                  <div key={region.name}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{region.name}</span>
                      <span className="text-sm text-muted-foreground">{region.count.toLocaleString()} readers</span>
                    </div>
                    <div className="w-full bg-muted rounded-full h-2">
                      <div
                        className="bg-purple-500 h-2 rounded-full"
                        style={{ width: `${region.value}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{region.value}%</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
