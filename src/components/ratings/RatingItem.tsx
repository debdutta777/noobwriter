'use client'

import Image from 'next/image'
import { Star, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { deleteRating } from '@/app/actions/reader-actions'
import { formatDistanceToNow } from 'date-fns'

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

interface RatingItemProps {
  rating: Rating
  onRatingUpdated: () => void
}

export default function RatingItem({ rating, onRatingUpdated }: RatingItemProps) {
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this rating?')) return

    const { success } = await deleteRating(rating.id)
    
    if (success) {
      onRatingUpdated()
    }
  }

  const renderStars = (ratingValue: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= ratingValue ? 'fill-yellow-400 text-yellow-400' : 'text-muted-foreground'
            }`}
          />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-3 p-4 border rounded-lg">
      {/* Avatar */}
      <div className="flex-shrink-0">
        <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
          {rating.profiles.avatar_url ? (
            <Image
              src={rating.profiles.avatar_url}
              alt={rating.profiles.display_name}
              fill
              className="object-cover"
            />
          ) : (
            <span className="text-sm font-medium">
              {rating.profiles.display_name.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
      </div>

      {/* Rating Content */}
      <div className="flex-1 space-y-2">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-medium text-sm">{rating.profiles.display_name}</p>
            <div className="flex items-center gap-2 mt-1">
              {renderStars(rating.rating)}
              <span className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(rating.created_at), { addSuffix: true })}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handleDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {rating.review && (
          <p className="text-sm text-muted-foreground">{rating.review}</p>
        )}
      </div>
    </div>
  )
}
