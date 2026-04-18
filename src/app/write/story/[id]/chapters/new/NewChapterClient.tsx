'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createChapter, publishChapter } from '@/app/actions/writer-actions'
import { saveMangaPages } from '@/app/actions/manga-actions'
import { Save, Eye } from 'lucide-react'
import RichTextEditor from '@/components/editor/RichTextEditor'
import MangaPagesUpload, { MangaPageItem } from '@/components/upload/MangaPagesUpload'

interface Props {
  seriesId: string
  contentType: 'novel' | 'manga'
}

export default function NewChapterClient({ seriesId, contentType }: Props) {
  const router = useRouter()
  const isManga = contentType === 'manga'

  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [savedChapterId, setSavedChapterId] = useState<string | null>(null)
  const [pages, setPages] = useState<MangaPageItem[]>([])

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapter_number: 1,
    is_premium: false,
    coin_price: 10,
  })

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length

  const handleSave = async (publish: boolean = false) => {
    if (publish) setIsPublishing(true)
    else setIsSaving(true)

    try {
      const chapterId =
        savedChapterId ??
        (await createChapter({
          series_id: seriesId,
          title: formData.title,
          content: isManga ? '' : formData.content,
          chapter_number: formData.chapter_number,
          is_premium: formData.is_premium,
          coin_price: formData.coin_price,
        }).then((r) => (r.success && r.data ? (r.data as { id: string }).id : null)))

      if (!chapterId) return
      setSavedChapterId(chapterId)

      if (isManga && pages.length > 0) {
        const result = await saveMangaPages(chapterId, pages)
        if (!result.success) return
      }

      if (publish) {
        await publishChapter(chapterId)
        router.push(`/write/story/${seriesId}`)
      }
    } finally {
      setIsSaving(false)
      setIsPublishing(false)
    }
  }

  const canSave = !!formData.title && (isManga ? pages.length > 0 || !!savedChapterId : !!formData.content)

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                Write New {isManga ? 'Chapter' : 'Chapter'}
              </h1>
              <p className="text-muted-foreground">
                {isManga ? `${pages.length} page${pages.length === 1 ? '' : 's'}` : `${wordCount.toLocaleString()} words`}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isSaving || !canSave}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={isPublishing || !canSave}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-3 space-y-4">
              <Card>
                <CardContent className="p-6 space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="chapter_number">Chapter Number</Label>
                    <Input
                      id="chapter_number"
                      type="number"
                      min="1"
                      value={formData.chapter_number}
                      onChange={(e) =>
                        setFormData({ ...formData, chapter_number: parseInt(e.target.value) })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Chapter Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Enter chapter title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>{isManga ? 'Pages' : 'Content'}</Label>
                    {isManga ? (
                      savedChapterId ? (
                        <MangaPagesUpload
                          chapterId={savedChapterId}
                          initialPages={pages}
                          onChange={setPages}
                        />
                      ) : (
                        <div className="border-2 border-dashed rounded-lg p-6 text-center text-sm text-muted-foreground">
                          Enter a title and click Save Draft to start uploading pages.
                        </div>
                      )
                    ) : (
                      <RichTextEditor
                        value={formData.content}
                        onChange={(content) => setFormData({ ...formData, content })}
                        placeholder="Start writing your chapter here..."
                      />
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Chapter Settings</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_premium">Premium Chapter</Label>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({ ...formData, is_premium: !formData.is_premium })
                        }
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          formData.is_premium ? 'bg-primary' : 'bg-muted'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            formData.is_premium ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Readers will need coins to unlock
                    </p>
                  </div>

                  {formData.is_premium && (
                    <div className="space-y-2">
                      <Label htmlFor="coin_price">Unlock Price (Coins)</Label>
                      <Input
                        id="coin_price"
                        type="number"
                        min="1"
                        max="100"
                        value={formData.coin_price}
                        onChange={(e) =>
                          setFormData({ ...formData, coin_price: parseInt(e.target.value) })
                        }
                      />
                      <p className="text-xs text-muted-foreground">Recommended: 10-20 coins</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
