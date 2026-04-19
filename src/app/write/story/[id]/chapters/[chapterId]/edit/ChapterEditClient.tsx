'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { ArrowLeft, Save, Eye } from 'lucide-react'
import dynamic from 'next/dynamic'
import MangaPagesUpload, { MangaPageItem } from '@/components/upload/MangaPagesUpload'

const RichTextEditor = dynamic(() => import('@/components/editor/RichTextEditor'), {
  ssr: false,
  loading: () => <div className="min-h-[400px] rounded-md border bg-muted/30 animate-pulse" />,
})
import { createClient } from '@/lib/supabase/client'
import { saveMangaPages } from '@/app/actions/manga-actions'

interface Chapter {
  id: string
  series_id: string
  title: string
  slug: string
  content: string
  chapter_number: number
  word_count: number
  is_premium: boolean
  coin_price: number
  is_published: boolean
  series?: {
    id: string
    title: string
  }
}

interface ChapterEditClientProps {
  chapter: Chapter
  seriesId: string
  seriesSlug?: string
  contentType?: 'novel' | 'manga'
  initialPages?: MangaPageItem[]
}

export default function ChapterEditClient({
  chapter,
  seriesId,
  seriesSlug,
  contentType = 'novel',
  initialPages = [],
}: ChapterEditClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSaving, setIsSaving] = useState(false)
  const [pages, setPages] = useState<MangaPageItem[]>(initialPages)
  const isManga = contentType === 'manga'

  const [formData, setFormData] = useState({
    title: chapter.title,
    content: chapter.content || '',
    chapter_number: chapter.chapter_number,
    is_premium: chapter.is_premium,
    coin_price: chapter.coin_price || 10,
  })

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length

  const handleSave = async () => {
    setIsSaving(true)

    try {
      // Calculate word count (novels only)
      const calculatedWordCount = isManga
        ? 0
        : formData.content.trim().split(/\s+/).filter(Boolean).length

      // Generate new slug if title changed
      const slug = formData.title !== chapter.title
        ? formData.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '')
            .substring(0, 100) + '-' + Date.now()
        : chapter.slug

      const { error } = await supabase
        .from('chapters')
        .update({
          title: formData.title,
          slug: slug,
          content: isManga ? null : formData.content,
          chapter_number: formData.chapter_number,
          word_count: calculatedWordCount,
          is_premium: formData.is_premium,
          coin_price: formData.coin_price,
          updated_at: new Date().toISOString(),
        })
        .eq('id', chapter.id)

      if (error) return

      if (isManga) {
        const result = await saveMangaPages(chapter.id, pages)
        if (!result.success) return
      }

      router.push(`/write/story/${seriesId}`)
      router.refresh()
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <Link 
            href={`/write/story/${seriesId}`} 
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Story
          </Link>

          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Edit Chapter</h1>
              <p className="text-muted-foreground">
                {isManga ? `${pages.length} page${pages.length === 1 ? '' : 's'}` : `${wordCount.toLocaleString()} words`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleSave}
                disabled={isSaving || !formData.title || (!isManga && !formData.content)}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              {chapter.is_published && (
                <Link href={`/read/${seriesSlug || seriesId}/${chapter.chapter_number}`}>
                  <Button variant="outline">
                    <Eye className="w-4 h-4 mr-2" />
                    View Live
                  </Button>
                </Link>
              )}
            </div>
          </div>

          {/* Chapter Form */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Chapter Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Chapter Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter chapter title"
                    />
                  </div>
                  <div>
                    <Label htmlFor="chapter_number">Chapter Number</Label>
                    <Input
                      id="chapter_number"
                      type="number"
                      min="1"
                      value={formData.chapter_number}
                      onChange={(e) => setFormData({ ...formData, chapter_number: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="is_premium">Premium Chapter</Label>
                      <p className="text-sm text-muted-foreground">
                        Readers need to unlock with coins
                      </p>
                    </div>
                    <Switch
                      id="is_premium"
                      checked={formData.is_premium}
                      onCheckedChange={(checked: boolean) => setFormData({ ...formData, is_premium: checked })}
                    />
                  </div>

                  {formData.is_premium && (
                    <div>
                      <Label htmlFor="coin_price">Coin Price</Label>
                      <Input
                        id="coin_price"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.coin_price}
                        onChange={(e) => setFormData({ ...formData, coin_price: parseInt(e.target.value) })}
                      />
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{isManga ? 'Chapter Pages' : 'Chapter Content'}</CardTitle>
              </CardHeader>
              <CardContent>
                {isManga ? (
                  <MangaPagesUpload
                    chapterId={chapter.id}
                    initialPages={initialPages}
                    onChange={setPages}
                  />
                ) : (
                  <RichTextEditor
                    value={formData.content}
                    onChange={(content: string) => setFormData({ ...formData, content })}
                    placeholder="Write your chapter here..."
                  />
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
