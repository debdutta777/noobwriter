'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Plus, 
  Edit, 
  Eye, 
  Clock, 
  FileText,
  ArrowLeft,
  Settings,
  Trash2,
  Heart,
  MessageSquare,
  Users
} from 'lucide-react'
import { publishChapter } from '@/app/actions/writer-actions'
import { getSeriesStats } from '@/app/actions/stats-actions'

interface Chapter {
  id: string
  title: string
  chapter_number: number
  is_published: boolean
  word_count: number
  view_count: number
  created_at: string
  published_at: string | null
}

interface Series {
  id: string
  title: string
  cover_url: string | null
  synopsis: string
  content_type: string
  status: string
  total_chapters: number
  is_published: boolean
}

interface StoryManagementClientProps {
  series: Series
  initialChapters: Chapter[]
}

export default function StoryManagementClient({ series, initialChapters }: StoryManagementClientProps) {
  const router = useRouter()
  const [chapters, setChapters] = useState(initialChapters)
  const [publishingId, setPublishingId] = useState<string | null>(null)
  const [stats, setStats] = useState<any>(null)

  // Load real-time stats
  useEffect(() => {
    const loadStats = async () => {
      const result = await getSeriesStats(series.id)
      if (result.success) {
        setStats(result.stats)
      }
    }
    loadStats()

    // Refresh stats every 30 seconds
    const interval = setInterval(loadStats, 30000)
    return () => clearInterval(interval)
  }, [series.id])

  const handlePublishChapter = async (chapterId: string) => {
    setPublishingId(chapterId)
    const result = await publishChapter(chapterId)
    
    if (result.success) {
      // Update local state
      setChapters(prev => prev.map(ch => 
        ch.id === chapterId 
          ? { ...ch, is_published: true, published_at: new Date().toISOString() }
          : ch
      ))
      // Refresh stats
      const statsResult = await getSeriesStats(series.id)
      if (statsResult.success) {
        setStats(statsResult.stats)
      }
    }
    
    setPublishingId(null)
  }

  const totalWords = stats?.totalWords || chapters.reduce((sum, ch) => sum + (ch.word_count || 0), 0)
  const publishedChapters = stats?.publishedChapters || chapters.filter(ch => ch.is_published).length

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <Link href="/write/dashboard" className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Link>

        {/* Series Header */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex gap-4">
                  {series.cover_url && (
                    <div className="relative w-24 h-32 rounded-lg overflow-hidden flex-shrink-0">
                      <Image
                        src={series.cover_url}
                        alt={series.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-2xl mb-2">{series.title}</CardTitle>
                    <div className="flex gap-2 mb-2">
                      <Badge variant={series.is_published ? "default" : "secondary"}>
                        {series.is_published ? 'Published' : 'Draft'}
                      </Badge>
                      <Badge variant="outline">{series.content_type}</Badge>
                      <Badge variant="outline">{series.status}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {series.synopsis}
                    </p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Series
                </Button>
              </div>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Statistics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <BookOpen className="w-3 h-3" />
                  Total Chapters
                </span>
                <span className="font-semibold">{stats?.totalChapters || chapters.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Published
                </span>
                <span className="font-semibold">{publishedChapters}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <FileText className="w-3 h-3" />
                  Total Words
                </span>
                <span className="font-semibold">{totalWords.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Total Views
                </span>
                <span className="font-semibold">
                  {(stats?.totalViews || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Heart className="w-3 h-3" />
                  Total Likes
                </span>
                <span className="font-semibold">
                  {(stats?.totalLikes || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <Users className="w-3 h-3" />
                  Followers
                </span>
                <span className="font-semibold">
                  {(stats?.followers || 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Comments
                </span>
                <span className="font-semibold">
                  {(stats?.comments || 0).toLocaleString()}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Chapters Section */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Chapters ({chapters.length})
              </CardTitle>
              <Link href={`/write/story/${series.id}/chapters/new`}>
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Chapter
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {chapters.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-xl font-semibold mb-2">No chapters yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start writing your story by adding your first chapter
                </p>
                <Link href={`/write/story/${series.id}/chapters/new`}>
                  <Button>
                    <Plus className="w-4 h-4 mr-2" />
                    Write First Chapter
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-2">
                {chapters.map((chapter) => (
                  <div
                    key={chapter.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-semibold">
                        {chapter.chapter_number}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1">{chapter.title}</h4>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3" />
                            {chapter.word_count?.toLocaleString() || 0} words
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {chapter.view_count?.toLocaleString() || 0} views
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {new Date(chapter.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      {chapter.is_published ? (
                        <Badge>Published</Badge>
                      ) : (
                        <Badge variant="secondary">Draft</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <Link href={`/write/story/${series.id}/chapters/${chapter.id}/edit`}>
                        <Button variant="outline" size="sm">
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                      </Link>
                      {!chapter.is_published && (
                        <Button 
                          size="sm"
                          onClick={() => handlePublishChapter(chapter.id)}
                          disabled={publishingId === chapter.id}
                        >
                          {publishingId === chapter.id ? 'Publishing...' : 'Publish'}
                        </Button>
                      )}
                      {chapter.is_published && (
                        <Link href={`/read/${series.id}/${chapter.chapter_number}`}>
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 mr-2" />
                            View
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
