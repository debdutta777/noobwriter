'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { getChapterContent } from '@/app/actions/reader-actions'
import {
  incrementChapterViews,
  updateReadingProgress,
  toggleChapterLike,
} from '@/app/actions/stats-actions'
import CommentSection from '@/components/comments/CommentSection'
import TipButton from '@/components/tip/TipButton'
import {
  ChevronLeft,
  ChevronRight,
  Lock,
  Coins,
  ArrowUp,
  Heart,
  MessageSquare,
} from 'lucide-react'

interface Props {
  params: { seriesId: string; chapterNumber: string }
}

export default function MangaReaderClient({ params }: Props) {
  const router = useRouter()
  const chapterNum = parseInt(params.chapterNumber)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<any>(null)
  const [viewTracked, setViewTracked] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const result = await getChapterContent(params.seriesId, chapterNum)
      if (result.error || !result.chapter) {
        setError(result.error || 'Chapter not found')
        return
      }
      setData(result)
      setLikeCount((result.chapter as any).likes || 0)
    } catch (err) {
      setError('Failed to load chapter')
    } finally {
      setLoading(false)
    }
  }, [params.seriesId, chapterNum])

  useEffect(() => {
    load()
  }, [load])

  useEffect(() => {
    if (data?.chapter && !viewTracked) {
      incrementChapterViews(data.chapter.id, params.seriesId)
      setViewTracked(true)
    }
  }, [data, viewTracked, params.seriesId])

  useEffect(() => {
    let progressTimeout: NodeJS.Timeout
    const handleScroll = () => {
      const windowHeight = window.innerHeight
      const documentHeight = document.documentElement.scrollHeight
      const scrollTop = window.scrollY
      const progress = Math.min((scrollTop / (documentHeight - windowHeight)) * 100, 100)
      setShowScrollTop(scrollTop > 500)

      if (data?.chapter?.id) {
        clearTimeout(progressTimeout)
        progressTimeout = setTimeout(() => {
          updateReadingProgress(data.chapter.id, progress)
        }, 2000)
      }
    }
    window.addEventListener('scroll', handleScroll)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      clearTimeout(progressTimeout)
    }
  }, [data])

  const handleLike = async () => {
    if (!data?.chapter?.id) return
    const result = await toggleChapterLike(data.chapter.id)
    if (result.success) {
      setIsLiked(!!result.liked)
      setLikeCount((prev) => (result.liked ? prev + 1 : Math.max(prev - 1, 0)))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <p className="text-muted-foreground">Loading chapter…</p>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4">
        <p className="text-lg">{error || 'Chapter not found'}</p>
        <Link href={`/series/${params.seriesId}`}>
          <Button variant="outline">Back to series</Button>
        </Link>
      </div>
    )
  }

  const { chapter, series, isUnlocked, mangaPages } = data
  const pages: Array<{ page_number: number; image_url: string }> = mangaPages || []

  if (!isUnlocked) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background px-4">
        <div className="max-w-md w-full border rounded-lg p-8 text-center space-y-4">
          <Lock className="w-12 h-12 mx-auto text-muted-foreground" />
          <h1 className="text-2xl font-bold">Premium Chapter</h1>
          <p className="text-muted-foreground">
            Unlock this chapter to continue reading.
          </p>
          <p className="flex items-center justify-center gap-2 text-lg font-semibold">
            <Coins className="w-5 h-5 text-yellow-500" />
            {chapter.coin_price} coins
          </p>
          <Link href="/wallet/buy-coins">
            <Button className="w-full">Get Coins</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <Link
            href={`/series/${params.seriesId}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="truncate max-w-[40vw]">{series?.title || 'Series'}</span>
          </Link>
          <div className="text-sm text-muted-foreground">
            Chapter {chapter.chapter_number} · {chapter.title}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl py-6 px-2">
        {pages.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            No pages have been uploaded for this chapter yet.
          </div>
        ) : (
          <div className="flex flex-col gap-1 bg-black">
            {pages.map((p) => (
              <div key={p.page_number} className="relative w-full">
                <Image
                  src={p.image_url}
                  alt={`Page ${p.page_number}`}
                  width={1200}
                  height={1800}
                  className="w-full h-auto"
                  sizes="(max-width: 768px) 100vw, 768px"
                  priority={p.page_number <= 2}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
          {data.prevChapter ? (
            <Button
              variant="outline"
              onClick={() => router.push(`/read/${params.seriesId}/${data.prevChapter}`)}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Previous
            </Button>
          ) : <span />}

          <div className="flex items-center gap-2">
            <Button
              variant={isLiked ? 'default' : 'outline'}
              size="sm"
              onClick={handleLike}
            >
              <Heart className={`w-4 h-4 mr-1 ${isLiked ? 'fill-current' : ''}`} />
              {likeCount}
            </Button>
            {series?.author_id && (
              <TipButton
                authorId={series.author_id}
                authorName={series.author?.display_name || 'Author'}
                seriesId={params.seriesId}
                chapterId={chapter.id}
                size="sm"
              />
            )}
          </div>

          {data.nextChapter ? (
            <Button onClick={() => router.push(`/read/${params.seriesId}/${data.nextChapter}`)}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : <span />}
        </div>

        <div className="mt-10">
          <div className="flex items-center gap-2 mb-4">
            <MessageSquare className="w-5 h-5" />
            <h2 className="text-xl font-semibold">Comments</h2>
          </div>
          <CommentSection chapterId={chapter.id} seriesId={params.seriesId} />
        </div>
      </main>

      {showScrollTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="fixed bottom-6 right-6 p-3 rounded-full bg-primary text-primary-foreground shadow-lg"
          aria-label="Scroll to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  )
}
