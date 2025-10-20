'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { createSeries } from '@/app/actions/writer-actions'
import { BookOpen, Image, Tag, Info, CheckCircle } from 'lucide-react'
import CoverUpload from '@/components/upload/CoverUpload'

const GENRES = [
  'Fantasy', 'Romance', 'Action', 'Adventure', 'Mystery', 'Thriller',
  'Sci-Fi', 'Horror', 'Comedy', 'Drama', 'Slice of Life', 'Historical',
  'Supernatural', 'Psychological', 'Sports', 'Martial Arts'
]

const AGE_RATINGS = [
  { value: 'everyone', label: 'Everyone' },
  { value: 'teen', label: 'Teen (13+)' },
  { value: 'mature', label: 'Mature (16+)' },
  { value: 'adult', label: 'Adult (18+)' },
]

export default function NewStoryPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    title: '',
    synopsis: '',
    content_type: 'novel' as 'novel' | 'manga',
    genres: [] as string[],
    tags: [] as string[],
    age_rating: 'everyone',
    cover_url: '',
  })

  const handleGenreToggle = (genre: string) => {
    setFormData(prev => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter(g => g !== genre)
        : [...prev.genres, genre].slice(0, 3) // Max 3 genres
    }))
  }

  const handleTagAdd = (tag: string) => {
    if (tag && !formData.tags.includes(tag) && formData.tags.length < 10) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tag]
      }))
    }
  }

  const handleTagRemove = (tag: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(t => t !== tag)
    }))
  }

  const handleSubmit = async () => {
    setError(null)
    setIsSubmitting(true)

    try {
      const result = await createSeries(formData)
      
      if (result.success && result.data) {
        // Redirect to the new series page
        router.push(`/write/story/${result.data.id}`)
      } else {
        setError(result.error || 'Failed to create story')
        setIsSubmitting(false)
      }
    } catch (err) {
      setError('An unexpected error occurred')
      setIsSubmitting(false)
    }
  }

  const canProceed = () => {
    switch (step) {
      case 1:
        return formData.title.length >= 3 && formData.content_type
      case 2:
        return formData.synopsis.length >= 50
      case 3:
        return formData.genres.length >= 1
      default:
        return true
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Progress Stepper */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                      s === step
                        ? 'bg-primary text-primary-foreground'
                        : s < step
                        ? 'bg-green-500 text-white'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 4 && (
                    <div
                      className={`h-1 w-16 md:w-32 ${
                        s < step ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-sm">
              <span className={step === 1 ? 'font-semibold' : 'text-muted-foreground'}>
                Basic Info
              </span>
              <span className={step === 2 ? 'font-semibold' : 'text-muted-foreground'}>
                Synopsis
              </span>
              <span className={step === 3 ? 'font-semibold' : 'text-muted-foreground'}>
                Categories
              </span>
              <span className={step === 4 ? 'font-semibold' : 'text-muted-foreground'}>
                Review
              </span>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {/* Step 1: Basic Info */}
          {step === 1 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Info className="w-5 h-5" />
                  Basic Information
                </CardTitle>
                <CardDescription>
                  Let's start with the basics of your story
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Story Title *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Enter your story title"
                    maxLength={100}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.title.length}/100 characters
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Content Type *</Label>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, content_type: 'novel' })}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.content_type === 'novel'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <BookOpen className="w-8 h-8 mx-auto mb-2" />
                      <p className="font-semibold">Novel</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Text-based stories
                      </p>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, content_type: 'manga' })}
                      className={`p-6 rounded-lg border-2 transition-all ${
                        formData.content_type === 'manga'
                          ? 'border-primary bg-primary/10'
                          : 'border-border hover:border-primary/50'
                      }`}
                    >
                      <Image className="w-8 h-8 mx-auto mb-2" aria-label="Manga icon" />
                      <p className="font-semibold">Manga</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Image-based comics
                      </p>
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Cover Image (Optional)</Label>
                  <CoverUpload
                    currentCoverUrl={formData.cover_url}
                    onUploadComplete={(url) => setFormData({ ...formData, cover_url: url })}
                    aspectRatio="portrait"
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Synopsis */}
          {step === 2 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  Story Synopsis
                </CardTitle>
                <CardDescription>
                  Write a compelling description to attract readers
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="synopsis">Synopsis *</Label>
                  <textarea
                    id="synopsis"
                    value={formData.synopsis}
                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                    placeholder="Describe your story... What's it about? Who are the main characters? What makes it unique?"
                    className="w-full min-h-[200px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none"
                    maxLength={2000}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.synopsis.length}/2000 characters (minimum 50)
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Categories */}
          {step === 3 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  Categories & Tags
                </CardTitle>
                <CardDescription>
                  Help readers find your story
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <Label>Genres * (Select up to 3)</Label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {GENRES.map((genre) => (
                      <button
                        key={genre}
                        type="button"
                        onClick={() => handleGenreToggle(genre)}
                        disabled={!formData.genres.includes(genre) && formData.genres.length >= 3}
                        className={`p-2 text-sm rounded-md border transition-all ${
                          formData.genres.includes(genre)
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border hover:border-primary/50'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {genre}
                      </button>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {formData.genres.length}/3 genres selected
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tags">Tags (Optional, up to 10)</Label>
                  <Input
                    id="tags"
                    placeholder="Type a tag and press Enter"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        handleTagAdd(input.value.trim())
                        input.value = ''
                      }
                    }}
                  />
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-sm"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => handleTagRemove(tag)}
                          className="hover:text-destructive"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age_rating">Age Rating *</Label>
                  <select
                    id="age_rating"
                    value={formData.age_rating}
                    onChange={(e) => setFormData({ ...formData, age_rating: e.target.value })}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    {AGE_RATINGS.map((rating) => (
                      <option key={rating.value} value={rating.value}>
                        {rating.label}
                      </option>
                    ))}
                  </select>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5" />
                  Review & Create
                </CardTitle>
                <CardDescription>
                  Review your story details before creating
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Title</p>
                  <p>{formData.title}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Content Type</p>
                  <p className="capitalize">{formData.content_type}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Synopsis</p>
                  <p className="text-sm text-muted-foreground">{formData.synopsis}</p>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Genres</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.genres.map((genre) => (
                      <span key={genre} className="px-2 py-1 rounded-md bg-primary/10 text-sm">
                        {genre}
                      </span>
                    ))}
                  </div>
                </div>
                {formData.tags.length > 0 && (
                  <div>
                    <p className="text-sm font-semibold mb-1">Tags</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.tags.map((tag) => (
                        <span key={tag} className="px-2 py-1 rounded-md bg-muted text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-semibold mb-1">Age Rating</p>
                  <p className="capitalize">
                    {AGE_RATINGS.find(r => r.value === formData.age_rating)?.label}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Navigation */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={() => setStep(Math.max(1, step - 1))}
              disabled={step === 1 || isSubmitting}
            >
              Back
            </Button>
            <div className="flex gap-2">
              {step < 4 ? (
                <Button
                  onClick={() => setStep(step + 1)}
                  disabled={!canProceed()}
                >
                  Continue
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Story'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
