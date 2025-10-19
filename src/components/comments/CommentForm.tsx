'use client'

import { useState } from 'react'
import { Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { createComment } from '@/app/actions/reader-actions'
import { useToast } from '@/hooks/use-toast'

interface CommentFormProps {
  seriesId?: string
  chapterId?: string
  parentId?: string
  onCommentAdded: () => void
  onCancel?: () => void
  placeholder?: string
}

export default function CommentForm({
  seriesId,
  chapterId,
  parentId,
  onCommentAdded,
  onCancel,
  placeholder = 'Write your comment...',
}: CommentFormProps) {
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!content.trim()) {
      toast({
        title: 'Error',
        description: 'Comment cannot be empty',
        variant: 'destructive',
      })
      return
    }

    setSubmitting(true)

    const { comment, error } = await createComment({
      content: content.trim(),
      seriesId,
      chapterId,
      parentId,
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
      description: 'Comment posted successfully',
    })

    setContent('')
    onCommentAdded()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <Textarea
        value={content}
        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setContent(e.target.value)}
        placeholder={placeholder}
        rows={3}
        disabled={submitting}
        className="resize-none"
      />
      <div className="flex items-center gap-2 justify-end">
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
        <Button type="submit" disabled={submitting || !content.trim()}>
          {submitting ? (
            <>
              <Send className="h-4 w-4 mr-2 animate-pulse" />
              Posting...
            </>
          ) : (
            <>
              <Send className="h-4 w-4 mr-2" />
              Post Comment
            </>
          )}
        </Button>
      </div>
    </form>
  )
}
