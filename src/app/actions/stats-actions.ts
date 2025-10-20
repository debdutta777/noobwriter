'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

/**
 * Increment view count for a chapter
 */
export async function incrementChapterViews(chapterId: string, seriesId: string) {
  const supabase = await createClient()

  try {
    // Try to increment chapter view_count using RPC
    const { error: chapterError } = await supabase.rpc('increment_chapter_views', {
      p_chapter_id: chapterId
    })

    // Fallback if RPC doesn't exist
    if (chapterError) {
      const { data: chapter } = await supabase
        .from('chapters')
        .select('view_count')
        .eq('id', chapterId)
        .single()

      await supabase
        .from('chapters')
        .update({ view_count: (chapter?.view_count || 0) + 1 })
        .eq('id', chapterId)
    }

    // Try to increment series total_views using RPC
    const { error: seriesError } = await supabase.rpc('increment_series_views', {
      p_series_id: seriesId
    })

    // Fallback if RPC doesn't exist
    if (seriesError) {
      const { data: series } = await supabase
        .from('series')
        .select('total_views')
        .eq('id', seriesId)
        .single()

      await supabase
        .from('series')
        .update({ total_views: (series?.total_views || 0) + 1 })
        .eq('id', seriesId)
    }

    revalidatePath(`/read/${seriesId}`)
    revalidatePath(`/series/${seriesId}`)

    return { success: true }
  } catch (error) {
    console.error('Error incrementing views:', error)
    return { success: false, error: 'Failed to update views' }
  }
}

/**
 * Track reading progress
 */
export async function updateReadingProgress(
  chapterId: string,
  progress: number
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  try {
    const { error } = await supabase
      .from('reading_progress')
      .upsert({
        user_id: user.id,
        chapter_id: chapterId,
        progress: Math.min(Math.max(progress, 0), 100),
        last_read_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,chapter_id'
      })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error('Error updating reading progress:', error)
    return { success: false, error: 'Failed to update progress' }
  }
}

/**
 * Get real-time series statistics
 */
export async function getSeriesStats(seriesId: string) {
  const supabase = await createClient()

  try {
    // Get series data
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('total_views, average_rating, total_chapters')
      .eq('id', seriesId)
      .single()

    if (seriesError) throw seriesError

    // Get chapter stats
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('view_count, word_count, is_published, likes')
      .eq('series_id', seriesId)

    if (chaptersError) throw chaptersError

    const totalWords = chapters?.reduce((sum, ch) => sum + (ch.word_count || 0), 0) || 0
    const totalChapterViews = chapters?.reduce((sum, ch) => sum + (ch.view_count || 0), 0) || 0
    const publishedChapters = chapters?.filter(ch => ch.is_published).length || 0
    const totalLikes = chapters?.reduce((sum, ch) => sum + (ch.likes || 0), 0) || 0

    // Get follower count
    const { count: followers } = await supabase
      .from('series_followers')
      .select('*', { count: 'exact', head: true })
      .eq('series_id', seriesId)

    // Get comment count
    const { count: comments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('series_id', seriesId)

    return {
      success: true,
      stats: {
        totalViews: series.total_views || 0,
        averageRating: series.average_rating || 0,
        totalChapters: chapters?.length || 0,
        publishedChapters,
        totalWords,
        totalChapterViews,
        totalLikes,
        followers: followers || 0,
        comments: comments || 0,
      }
    }
  } catch (error) {
    console.error('Error fetching series stats:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
}

/**
 * Get real-time chapter statistics
 */
export async function getChapterStats(chapterId: string) {
  const supabase = await createClient()

  try {
    const { data: chapter, error } = await supabase
      .from('chapters')
      .select('view_count, likes, word_count')
      .eq('id', chapterId)
      .single()

    if (error) throw error

    // Get comment count for this chapter
    const { count: comments } = await supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('chapter_id', chapterId)

    return {
      success: true,
      stats: {
        views: chapter.view_count || 0,
        likes: chapter.likes || 0,
        wordCount: chapter.word_count || 0,
        comments: comments || 0,
      }
    }
  } catch (error) {
    console.error('Error fetching chapter stats:', error)
    return { success: false, error: 'Failed to fetch stats' }
  }
}

/**
 * Like a chapter
 */
export async function toggleChapterLike(chapterId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return { success: false, error: 'Not authenticated' }

  try {
    // Check if already liked
    const { data: existing } = await supabase
      .from('chapter_likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .single()

    if (existing) {
      // Unlike
      await supabase
        .from('chapter_likes')
        .delete()
        .eq('id', existing.id)

      // Decrement likes count
      const { data: chapter } = await supabase
        .from('chapters')
        .select('likes')
        .eq('id', chapterId)
        .single()

      await supabase
        .from('chapters')
        .update({ likes: Math.max((chapter?.likes || 0) - 1, 0) })
        .eq('id', chapterId)

      return { success: true, liked: false }
    } else {
      // Like
      await supabase
        .from('chapter_likes')
        .insert({
          user_id: user.id,
          chapter_id: chapterId,
        })

      // Increment likes count
      const { data: chapter } = await supabase
        .from('chapters')
        .select('likes')
        .eq('id', chapterId)
        .single()

      await supabase
        .from('chapters')
        .update({ likes: (chapter?.likes || 0) + 1 })
        .eq('id', chapterId)

      return { success: true, liked: true }
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return { success: false, error: 'Failed to toggle like' }
  }
}
