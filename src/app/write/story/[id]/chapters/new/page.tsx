'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createChapter, publishChapter } from '@/app/actions/writer-actions'
import { Save, Eye, Lock, Unlock } from 'lucide-react'

export default function NewChapterPage() {
  const router = useRouter()
  const params = useParams()
  const seriesId = params.id as string

  const [isSaving, setIsSaving] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [savedChapterId, setSavedChapterId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    chapter_number: 1,
    is_premium: false,
    coin_price: 10,
  })

  const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length

  const handleSave = async (publish: boolean = false) => {
    if (publish) {
      setIsPublishing(true)
    } else {
      setIsSaving(true)
    }

    try {
      const result = await createChapter({
        series_id: seriesId,
        ...formData,
      })

      if (result.success && result.data) {
        setSavedChapterId(result.data.id)

        if (publish) {
          await publishChapter(result.data.id)
          router.push(`/write/story/${seriesId}`)
        }
      }
    } finally {
      setIsSaving(false)
      setIsPublishing(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold mb-2">Write New Chapter</h1>
              <p className="text-muted-foreground">
                {wordCount.toLocaleString()} words
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => handleSave(false)}
                disabled={isSaving || !formData.title || !formData.content}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button
                onClick={() => handleSave(true)}
                disabled={isPublishing || !formData.title || !formData.content}
              >
                <Eye className="w-4 h-4 mr-2" />
                {isPublishing ? 'Publishing...' : 'Publish'}
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Editor */}
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
                    <Label htmlFor="content">Content</Label>
                    <textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      placeholder="Start writing your chapter here...

You can use simple formatting:
- Paragraphs are separated by empty lines
- Use asterisks for *emphasis*
- Use quotation marks for dialogue"
                      className="w-full min-h-[600px] rounded-md border border-input bg-background px-4 py-3 text-base font-mono leading-relaxed ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Settings Sidebar */}
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
                      <p className="text-xs text-muted-foreground">
                        Recommended: 10-20 coins
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Writing Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-xs text-muted-foreground">
                  <p>💡 Save drafts frequently</p>
                  <p>💡 Aim for 1,500-3,000 words per chapter</p>
                  <p>💡 End with cliffhangers to keep readers engaged</p>
                  <p>💡 Preview before publishing</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
