'use client'

import { useState, useEffect, useCallback } from 'react'
import { MessageSquare, Loader2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getComments } from '@/app/actions/reader-actions'
import CommentForm from './CommentForm'
import CommentItem from './CommentItem'

interface Comment {
  id: string
  user_id: string
  content: string
  likes: number
  created_at: string
  profiles: {
    display_name: string
    avatar_url?: string
  }
  replies?: Comment[]
}

interface CommentSectionProps {
  seriesId?: string
  chapterId?: string
  initialCount?: number
}

export default function CommentSection({ seriesId, chapterId, initialCount = 0 }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [showCommentForm, setShowCommentForm] = useState(false)

  const loadComments = useCallback(async () => {
    setLoading(true)
    const { comments: data } = await getComments(seriesId, chapterId)
    if (data) {
      setComments(data)
    }
    setLoading(false)
  }, [seriesId, chapterId])

  useEffect(() => {
    loadComments()
  }, [loadComments])

  const handleCommentAdded = () => {
    loadComments()
    setShowCommentForm(false)
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Comments ({comments.length})
          </CardTitle>
          <Button 
            onClick={() => setShowCommentForm(!showCommentForm)}
            variant={showCommentForm ? "outline" : "default"}
          >
            {showCommentForm ? 'Cancel' : 'Add Comment'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {showCommentForm && (
          <CommentForm
            seriesId={seriesId}
            chapterId={chapterId}
            onCommentAdded={handleCommentAdded}
            onCancel={() => setShowCommentForm(false)}
          />
        )}

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MessageSquare className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No comments yet. Be the first to comment!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <CommentItem
                key={comment.id}
                comment={comment}
                seriesId={seriesId}
                chapterId={chapterId}
                onCommentUpdated={loadComments}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
