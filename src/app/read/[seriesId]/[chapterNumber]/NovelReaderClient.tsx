'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { UnlockPremiumModal } from '@/components/modals/unlock-premium-modal'
import { getChapterContent } from '@/app/actions/reader-actions'
import { incrementChapterViews, updateReadingProgress, toggleChapterLike } from '@/app/actions/stats-actions'
import CommentSection from '@/components/comments/CommentSection'
import TipButton from '@/components/tip/TipButton'
import {
  ChevronLeft,
  ChevronRight,
  List,
  Settings,
  Bookmark,
  BookmarkCheck,
  Share2,
  Lock,
  Coins,
  MessageSquare,
  ArrowUp,
  Heart
} from 'lucide-react'

interface NovelReaderClientProps {
  params: { seriesId: string; chapterNumber: string }
}

export default function NovelReaderClient({ params }: NovelReaderClientProps) {
  const router = useRouter()
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [fontSize, setFontSize] = useState(18)
  const [showSettings, setShowSettings] = useState(false)
  const [showChapterList, setShowChapterList] = useState(false)
  const [readingProgress, setReadingProgress] = useState(0)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [showUnlockModal, setShowUnlockModal] = useState(false)
  
  const [loading, setLoading] = useState(true)
  const [chapterData, setChapterData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [viewTracked, setViewTracked] = useState(false)

  const chapterNum = parseInt(params.chapterNumber)

  // Load chapter data from database
  const loadChapter = useCallback(async () => {
    try {
      setLoading(true)
      const data = await getChapterContent(params.seriesId, chapterNum)
      
      if (data.error || !data.chapter) {
        setError(data.error || 'Chapter not found')
        return
      }
      
      setChapterData(data)
      setLikeCount(data.chapter.likes || 0)
    } catch (err) {
      console.error('Failed to load chapter:', err)
      setError('Failed to load chapter')
    } finally {
      setLoading(false)
    }
  }, [params.seriesId, chapterNum])

  useEffect(() => {
    loadChapter()
  }, [loadChapter])

  // Track view count once when chapter loads
  useEffect(() => {
    if (chapterData && !viewTracked) {
      incrementChapterViews(chapterData.chapter.id, params.seriesId)
      setViewTracked(true)
    }
  }, [chapterData, viewTracked, params.seriesId])

  // Scroll progress tracking and reading progress updates
  useEffect(() => {
    let progressTimeout: NodeJS.Timeout

    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      
      const progress = (scrollTop / (documentHeight - windowHeight)) * 100
      const currentProgress = Math.min(progress, 100)
      setReadingProgress(currentProgress)
      
      setShowScrollTop(scrollTop > 500)

      // Debounce reading progress updates
      if (chapterData?.chapter?.id) {
        clearTimeout(progressTimeout)
        progressTimeout = setTimeout(() => {
          updateReadingProgress(chapterData.chapter.id, currentProgress)
        }, 2000)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(progressTimeout)
    }
  }, [chapterData])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const handleUnlock = () => {
    // TODO: Implement unlock flow with Razorpay
    setShowUnlockModal(false)
  }

  const handleLike = async () => {
    if (!chapterData?.chapter?.id) return

    const result = await toggleChapterLike(chapterData.chapter.id)
    if (result.success) {
      setIsLiked(result.liked!)
      setLikeCount(prev => result.liked ? prev + 1 : Math.max(prev - 1, 0))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading chapter...</p>
        </div>
      </div>
    )
  }

  if (error || !chapterData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">{error || 'Chapter not found'}</p>
          <Link href={`/series/${params.seriesId}`}>
            <Button>Back to Series</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { chapter, series, isUnlocked, userCoins, prevChapter, nextChapter } = chapterData
  const needsUnlock = chapter.is_premium && !isUnlocked

  return (
    <div className="min-h-screen bg-background">
      {/* Reading Progress Bar */}
      <div className="fixed top-0 left-0 right-0 h-1 bg-muted z-50">
        <div
          className="h-full bg-primary transition-all duration-300"
          style={{ width: `${readingProgress}%` }}
        />
      </div>

      {/* Top Navigation Bar */}
      <div className="sticky top-0 z-40 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/series/${params.seriesId}`}>
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" />
                  Back
                </Button>
              </Link>
              <div className="hidden md:block">
                <h2 className="font-semibold text-sm">{series.title}</h2>
                <p className="text-xs text-muted-foreground">
                  Chapter {chapter.chapter_number}: {chapter.title}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowChapterList(!showChapterList)}
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsBookmarked(!isBookmarked)}
              >
                {isBookmarked ? (
                  <BookmarkCheck className="h-4 w-4 fill-primary text-primary" />
                ) : (
                  <Bookmark className="h-4 w-4" />
                )}
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowSettings(false)}>
          <div
            className="absolute right-0 top-16 bottom-0 w-80 bg-background border-l p-6 overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="font-semibold text-lg mb-4">Reading Settings</h3>
            
            <div className="space-y-6">
              <div>
                <label className="text-sm font-medium mb-2 block">Font Size</label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontSize(Math.max(14, fontSize - 2))}
                  >
                    A-
                  </Button>
                  <span className="flex-1 text-center text-sm">{fontSize}px</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setFontSize(Math.min(24, fontSize + 2))}
                  >
                    A+
                  </Button>
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Font Family</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>System Default</option>
                  <option>Serif</option>
                  <option>Sans Serif</option>
                  <option>Monospace</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Line Height</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Compact</option>
                  <option>Normal</option>
                  <option>Relaxed</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Page Width</label>
                <select className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                  <option>Narrow</option>
                  <option>Medium</option>
                  <option>Wide</option>
                  <option>Full Width</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chapter List Sidebar */}
      {showChapterList && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setShowChapterList(false)}>
          <div
            className="absolute left-0 top-16 bottom-0 w-80 bg-background border-r overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-4">Chapters ({series.total_chapters})</h3>
              <div className="space-y-1">
                {Array.from({ length: series.total_chapters }, (_, i) => i + 1).map((num: number) => (
                  <Link
                    key={num}
                    href={`/read/${params.seriesId}/${num}`}
                    className={`block p-3 rounded-lg hover:bg-accent transition-colors ${
                      num === chapterNum ? 'bg-primary text-primary-foreground' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">Chapter {num}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Chapter Header */}
          <div className="mb-8 text-center">
            <Link
              href={`/series/${params.seriesId}`}
              className="text-sm text-muted-foreground hover:text-primary"
            >
              {series.title}
            </Link>
            <h1 className="text-3xl md:text-4xl font-bold mt-2 mb-4">
              Chapter {chapter.chapter_number}: {chapter.title}
            </h1>
            <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span>{new Date(chapter.published_at).toLocaleDateString()}</span>
              {chapter.word_count && (
                <>
                  <span>•</span>
                  <span>{chapter.word_count.toLocaleString()} words</span>
                </>
              )}
            </div>
          </div>

          {/* Premium Lock Overlay */}
          {needsUnlock && (
            <Card className="mb-8 border-amber-500/50">
              <CardContent className="p-8 text-center space-y-4">
                <div className="flex justify-center">
                  <div className="p-4 bg-amber-500/10 rounded-full">
                    <Lock className="h-8 w-8 text-amber-600 dark:text-amber-400" />
                  </div>
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Premium Chapter</h3>
                  <p className="text-muted-foreground">
                    Unlock this chapter to continue reading
                  </p>
                </div>
                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-amber-600 dark:text-amber-400">
                  <Coins className="h-6 w-6" />
                  <span>{chapter.coin_price} Coins</span>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button size="lg" onClick={() => setShowUnlockModal(true)} className="gap-2">
                    <Lock className="h-4 w-4" />
                    Unlock Chapter
                  </Button>
                  <Link href="/coins/purchase">
                    <Button size="lg" variant="outline" className="gap-2">
                      <Coins className="h-4 w-4" />
                      Buy Coins
                    </Button>
                  </Link>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your balance: {userCoins} coins
                </p>
              </CardContent>
            </Card>
          )}

          {/* Chapter Content */}
          {!needsUnlock && (
            <>
              <div
                className="prose prose-gray dark:prose-invert max-w-none mb-8"
                style={{ fontSize: `${fontSize}px` }}
              >
                {chapter.content.split('\n\n').map((paragraph: string, index: number) => (
                  <p key={index} className="mb-4 leading-relaxed">
                    {paragraph}
                  </p>
                ))}
              </div>

              {/* Chapter Stats and Actions */}
              <div className="flex items-center justify-center gap-6 py-6 mb-8 border-y">
                <Button
                  variant="ghost"
                  size="lg"
                  onClick={handleLike}
                  className={isLiked ? 'text-red-500' : ''}
                >
                  <Heart className={`h-5 w-5 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                  {likeCount} {likeCount === 1 ? 'Like' : 'Likes'}
                </Button>
                <Button variant="ghost" size="lg">
                  <MessageSquare className="h-5 w-5 mr-2" />
                  Comments
                </Button>
                <Button variant="ghost" size="lg">
                  <Share2 className="h-5 w-5 mr-2" />
                  Share
                </Button>
              </div>
            </>
          )}

          {/* Tip Author Section */}
          <div className="py-8 border-t border-b mb-8">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-xl font-semibold mb-2">Enjoyed this chapter?</h3>
              <p className="text-muted-foreground mb-4">
                Show your support to {series.author} by sending a tip!
              </p>
              <TipButton
                authorId={series.author_id}
                authorName={series.author}
                seriesId={params.seriesId}
                chapterId={chapter.id}
                size="lg"
                className="inline-flex"
              />
            </div>
          </div>

          {/* Chapter Navigation */}
          <div className="flex items-center justify-between py-8 border-t border-b mb-8">
            {prevChapter ? (
              <Link href={`/read/${params.seriesId}/${prevChapter}`}>
                <Button variant="outline">
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Previous Chapter
                </Button>
              </Link>
            ) : (
              <div />
            )}

            <Link href={`/series/${params.seriesId}`}>
              <Button variant="ghost">
                <List className="h-4 w-4 mr-2" />
                All Chapters
              </Button>
            </Link>

            {nextChapter ? (
              <Link href={`/read/${params.seriesId}/${nextChapter}`}>
                <Button variant="outline">
                  Next Chapter
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            ) : (
              <div />
            )}
          </div>

          {/* Comments Section */}
          <div className="mb-8">
            <CommentSection chapterId={chapter.id} />
          </div>
        </div>
      </div>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <Button
          className="fixed bottom-8 right-8 rounded-full h-12 w-12 shadow-lg"
          size="icon"
          onClick={scrollToTop}
        >
          <ArrowUp className="h-5 w-5" />
        </Button>
      )}

      {/* Bottom Navigation (Mobile) */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden bg-background border-t p-3 flex gap-2">
        {prevChapter && (
          <Link href={`/read/${params.seriesId}/${prevChapter}`} className="flex-1">
            <Button variant="outline" className="w-full">
              <ChevronLeft className="h-4 w-4" />
              Prev
            </Button>
          </Link>
        )}
        <Link href={`/series/${params.seriesId}`} className="flex-1">
          <Button variant="ghost" className="w-full">
            <List className="h-4 w-4" />
          </Button>
        </Link>
        {nextChapter && (
          <Link href={`/read/${params.seriesId}/${nextChapter}`} className="flex-1">
            <Button variant="outline" className="w-full">
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </Link>
        )}
      </div>

      {/* Unlock Modal */}
      <UnlockPremiumModal
        isOpen={showUnlockModal}
        onClose={() => setShowUnlockModal(false)}
        chapterId={chapter.id}
        chapterTitle={chapter.title}
        chapterNumber={chapter.chapter_number}
        coinCost={chapter.coin_price}
        seriesId={params.seriesId}
        userCoins={userCoins}
      />
    </div>
  )
}
