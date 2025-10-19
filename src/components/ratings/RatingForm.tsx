'use client'

import { useState } from 'react'
import { Star, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createOrUpdateRating, deleteRating } from '@/app/actions/reader-actions'
import { useToast } from '@/hooks/use-toast'

interface RatingFormProps {
  seriesId: string
  existingRating?: {
    rating: number
    review?: string
  } | null
  onRatingUpdated: () => void
  onCancel?: () => void
}

export default function RatingForm({
  seriesId,
  existingRating,
  onRatingUpdated,
  onCancel,
}: RatingFormProps) {
  const [rating, setRating] = useState(existingRating?.rating || 0)
  const [review, setReview] = useState(existingRating?.review || '')
  const [hoveredStar, setHoveredStar] = useState(0)
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      toast({
        title: 'Error',
        description: 'Please select a rating',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    const { rating: ratingData, error } = await createOrUpdateRating({
      seriesId,
      rating,
      review: review.trim() || undefined,
    })

    setSubmitting(false)

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Success',
      description: existingRating ? 'Rating updated successfully' : 'Rating submitted successfully',
    })

    onRatingUpdated()
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete your rating?')) return

    setSubmitting(true)

    const { success, error } = await deleteRating(seriesId)

    setSubmitting(false)

    if (error) {
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      })
      return
    }

    toast({
      title: 'Success',
      description: 'Rating deleted successfully',
    })

    onRatingUpdated()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div>
        <p className="text-sm font-medium mb-2">Your Rating</p>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(0)}
              className="transition-transform hover:scale-110"
              disabled={submitting}
            >
              <Star
                className={`h-8 w-8 cursor-pointer transition-colors ${
                  star <= (hoveredStar || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground hover:text-yellow-400'
                }`}
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm font-medium">
              {rating} / 5
            </span>
          )}
        </div>
      </div>

      <div>
        <p className="text-sm font-medium mb-2">Review (Optional)</p>
        <Textarea
          value={review}
          onChange={(e: any) => setReview(e.target.value)}
          placeholder="Share your thoughts about this series..."
          rows={4}
          disabled={submitting}
          className="resize-none"
        />
      </div>

      <div className="flex items-center gap-2 justify-end">
        {existingRating && (
          <Button
            type="button"
            variant="destructive"
            onClick={handleDelete}
            disabled={submitting}
          >
            Delete Rating
          </Button>
        )}
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={submitting}
          >
            Cancel
          </Button>
        )}
        <Button type="submit" disabled={submitting || rating === 0}>
          {submitting ? (
            <>
              <Send className="h-4 w-4 mr-2 animate-pulse" />
              {existingRating ? 'Updating...' : 'Submitting...'}
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              {existingRating ? 'Update Rating' : 'Submit Rating'}
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
