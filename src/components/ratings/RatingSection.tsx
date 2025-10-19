'use client'

import { useState, useEffect } from 'react'
import { Star, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getRatings } from '@/app/actions/reader-actions'
import RatingForm from './RatingForm'
import RatingItem from './RatingItem'

interface Rating {
  id: string
  user_id: string
  rating: number
  review?: string
  created_at: string
  profiles: {
    display_name: string
    avatar_url?: string
  }
}

interface UserRating {
  id: string
  rating: number
  review?: string
}

interface RatingSectionProps {
  seriesId: string
  averageRating?: number
  totalRatings?: number
}

export default function RatingSection({ seriesId, averageRating = 0, totalRatings = 0 }: RatingSectionProps) {
  const [ratings, setRatings] = useState<Rating[]>([])
  const [userRating, setUserRating] = useState<UserRating | null>(null)
  const [loading, setLoading] = useState(true)
  const [showRatingForm, setShowRatingForm] = useState(false)

  useEffect(() => {
    loadRatings()
  }, [seriesId])

  const loadRatings = async () => {
    setLoading(true)
    const { ratings: data, userRating: userData } = await getRatings(seriesId)
    if (data) {
      setRatings(data)
    }
    if (userData) {
      setUserRating(userData)
    }
    setLoading(false)
  }

  const handleRatingUpdated = () => {
    loadRatings()
    setShowRatingForm(false)
  }

  const renderStars = (rating: number, size: 'sm' | 'lg' = 'sm') => {
    const starSize = size === 'sm' ? 'h-4 w-4' : 'h-6 w-6'
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${starSize} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5" />
              Ratings & Reviews
            </CardTitle>
            <div className="flex items-center gap-3 mt-2">
              {renderStars(Math.round(averageRating), 'lg')}
              <div className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} out of 5 ({totalRatings} {totalRatings === 1 ? 'rating' : 'ratings'})
              </div>
            </div>
          </div>
          <Button 
            onClick={() => setShowRatingForm(!showRatingForm)}
            variant={showRatingForm ? "outline" : "default"}
          >
            {userRating ? 'Update Rating' : 'Rate This Series'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showRatingForm && (
          <RatingForm
            seriesId={seriesId}
            existingRating={userRating}
            onRatingUpdated={handleRatingUpdated}
            onCancel={() => setShowRatingForm(false)}
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : ratings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Star className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No ratings yet. Be the first to rate this series!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((rating) => (
              <RatingItem
                key={rating.id}
                rating={rating}
                onRatingUpdated={loadRatings}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
