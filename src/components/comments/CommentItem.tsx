'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Heart, Reply, Trash2, MoreVertical } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { likeComment, deleteComment } from '@/app/actions/reader-actions'
import CommentForm from './CommentForm'
import { formatDistanceToNow } from 'date-fns'

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

interface CommentItemProps {
  comment: Comment
  seriesId?: string
  chapterId?: string
  onCommentUpdated: () => void
  isReply?: boolean
}

export default function CommentItem({
  comment,
  seriesId,
  chapterId,
  onCommentUpdated,
  isReply = false,
}: CommentItemProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(comment.likes)

  const handleLike = async () => {
    if (liked) return // Prevent multiple likes

    const { success } = await likeComment(comment.id, likeCount)
    
    if (success) {
      setLiked(true)
      setLikeCount(likeCount + 1)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this comment?')) return

    const { success } = await deleteComment(comment.id)
    
    if (success) {
      onCommentUpdated()
    }
  }

  const handleReplyAdded = () => {
    setShowReplyForm(false)
    onCommentUpdated()
  }

  return (
    <div className={`${isReply ? 'ml-8 pl-4 border-l-2 border-muted' : ''}`}>
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="flex-shrink-0">
          <div className="relative w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden">
            {comment.profiles.avatar_url ? (
              <Image
                src={comment.profiles.avatar_url}
                alt={comment.profiles.display_name}
                fill
                className="object-cover"
              />
            ) : (
              <span className="text-sm font-medium">
                {comment.profiles.display_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
        </div>

        {/* Comment Content */}
        <div className="flex-1 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm">{comment.profiles.display_name}</p>
              <p className="text-xs text-muted-foreground">
                {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
              </p>
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

          <p className="text-sm">{comment.content}</p>

          {/* Actions */}
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLike}
              disabled={liked}
              className="h-8 px-2"
            >
              <Heart className={`h-4 w-4 mr-1 ${liked ? 'fill-red-500 text-red-500' : ''}`} />
              <span className="text-xs">{likeCount}</span>
            </Button>

            {!isReply && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowReplyForm(!showReplyForm)}
                className="h-8 px-2"
              >
                <Reply className="h-4 w-4 mr-1" />
                <span className="text-xs">Reply</span>
              </Button>
            )}
          </div>

          {/* Reply Form */}
          {showReplyForm && (
            <div className="mt-3">
              <CommentForm
                seriesId={seriesId}
                chapterId={chapterId}
                parentId={comment.id}
                onCommentAdded={handleReplyAdded}
                onCancel={() => setShowReplyForm(false)}
                placeholder="Write your reply..."
              />
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-4 space-y-4">
              {comment.replies.map((reply) => (
                <CommentItem
                  key={reply.id}
                  comment={reply}
                  seriesId={seriesId}
                  chapterId={chapterId}
                  onCommentUpdated={onCommentUpdated}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
