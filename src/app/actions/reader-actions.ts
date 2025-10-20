'use server'

import { createClient } from '@/lib/supabase/server'

export async function browseSeries(filters: {
  contentType?: 'novel' | 'manga' | 'all'
  genres?: string[]
  sortBy?: string
  searchQuery?: string
  limit?: number
  offset?: number
}) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('series')
      .select('*, profiles(display_name)')
      .eq('is_published', true)

    // Apply content type filter
    if (filters.contentType && filters.contentType !== 'all') {
      query = query.eq('content_type', filters.contentType)
    }

    // Apply genre filter
    if (filters.genres && filters.genres.length > 0) {
      query = query.overlaps('genres', filters.genres)
    }

    // Apply search filter
    if (filters.searchQuery) {
      query = query.or(`title.ilike.%${filters.searchQuery}%,synopsis.ilike.%${filters.searchQuery}%`)
    }

    // Apply sorting
    switch (filters.sortBy) {
      case 'popular':
        query = query.order('total_views', { ascending: false })
        break
      case 'latest':
        query = query.order('updated_at', { ascending: false })
        break
      case 'rating':
        query = query.order('average_rating', { ascending: false })
        break
      case 'new':
        query = query.order('created_at', { ascending: false })
        break
      default: // trending
        query = query.order('total_views', { ascending: false })
    }

    // Apply pagination
    query = query.range(filters.offset || 0, (filters.offset || 0) + (filters.limit || 20) - 1)

    const { data, error } = await query

    if (error) {
      console.error('Failed to fetch series:', error)
      return { series: [], error: error.message }
    }

    const series = (data || []).map((s: any) => ({
      id: s.id,
      title: s.title,
      author: s.profiles?.display_name || 'Anonymous',
      cover: s.cover_url,
      contentType: s.content_type,
      genres: s.genres || [],
      rating: s.average_rating || 0,
      views: s.total_views || 0,
      chapters: s.total_chapters || 0,
      status: s.status || 'ongoing',
      description: s.synopsis || '',
    }))

    return { series, error: null }
  } catch (error) {
    console.error('Error in browseSeries:', error)
    return { series: [], error: 'Failed to fetch series' }
  }
}

export async function getSeriesDetail(seriesId: string) {
  const supabase = await createClient()

  try {
    // Get series info
    const { data: series, error: seriesError } = await supabase
      .from('series')
      .select('*, profiles(display_name, avatar_url)')
      .eq('id', seriesId)
      .single()

    if (seriesError || !series) {
      return { series: null, chapters: [], error: 'Series not found' }
    }

    // Get chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('*')
      .eq('series_id', seriesId)
      .eq('is_published', true)
      .order('chapter_number', { ascending: true })

    return {
      series: {
        ...series,
        author: series.profiles?.display_name || 'Anonymous',
        authorAvatar: series.profiles?.avatar_url,
      },
      chapters: chapters || [],
      error: null,
    }
  } catch (error) {
    console.error('Error in getSeriesDetail:', error)
    return { series: null, chapters: [], error: 'Failed to fetch series details' }
  }
}

export async function getChapterContent(seriesId: string, chapterNumber: number) {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  try {
    // Get chapter
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*, series(title, author_id, profiles(display_name))')
      .eq('series_id', seriesId)
      .eq('chapter_number', chapterNumber)
      .eq('is_published', true)
      .single()

    if (chapterError || !chapter) {
      return { chapter: null, isUnlocked: false, error: 'Chapter not found' }
    }

    // Check if user has unlocked this chapter (if premium)
    let isUnlocked = !chapter.is_premium
    if (chapter.is_premium && user) {
      const { data: unlock } = await supabase
        .from('unlocked_chapters')
        .select('id')
        .eq('user_id', user.id)
        .eq('chapter_id', chapter.id)
        .single()

      isUnlocked = !!unlock
    }

    // Get series data
    const { data: series } = await supabase
      .from('series')
      .select('*, profiles!author_id(display_name)')
      .eq('id', seriesId)
      .single()

    // Get previous and next chapters
    const { data: prevChapter } = await supabase
      .from('chapters')
      .select('id, chapter_number, title')
      .eq('series_id', seriesId)
      .eq('is_published', true)
      .lt('chapter_number', chapterNumber)
      .order('chapter_number', { ascending: false })
      .limit(1)
      .single()

    const { data: nextChapter } = await supabase
      .from('chapters')
      .select('id, chapter_number, title')
      .eq('series_id', seriesId)
      .eq('is_published', true)
      .gt('chapter_number', chapterNumber)
      .order('chapter_number', { ascending: true })
      .limit(1)
      .single()

    // Get user's coin balance if authenticated
    let userCoins = 0
    if (user) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('coin_balance')
        .eq('user_id', user.id)
        .single()
      
      userCoins = wallet?.coin_balance || 0
    }

    // Increment view count
    await supabase
      .from('chapters')
      .update({ view_count: (chapter.view_count || 0) + 1 })
      .eq('id', chapter.id)

    return {
      chapter,
      series,
      isUnlocked,
      userCoins,
      prevChapter: prevChapter || null,
      nextChapter: nextChapter || null,
      error: null,
    }
  } catch (error) {
    console.error('Error in getChapterContent:', error)
    return { chapter: null, isUnlocked: false, error: 'Failed to fetch chapter' }
  }
}

export async function toggleFavorite(seriesId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, isFavorited: false, error: 'Not authenticated' }
  }

  try {
    // Check if already favorited
    const { data: existing } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('series_id', seriesId)
      .single()

    if (existing) {
      // Remove favorite
      const { error: deleteError } = await supabase
        .from('favorites')
        .delete()
        .eq('user_id', user.id)
        .eq('series_id', seriesId)

      if (deleteError) {
        console.error('Error removing favorite:', deleteError)
        return { success: false, isFavorited: true, error: 'Failed to remove favorite' }
      }

      return { success: true, isFavorited: false, error: null }
    } else {
      // Add favorite
      const { error: insertError } = await supabase
        .from('favorites')
        .insert({
          user_id: user.id,
          series_id: seriesId,
        })

      if (insertError) {
        console.error('Error adding favorite:', insertError)
        return { success: false, isFavorited: false, error: 'Failed to add favorite' }
      }

      return { success: true, isFavorited: true, error: null }
    }
  } catch (error) {
    console.error('Error in toggleFavorite:', error)
    return { success: false, isFavorited: false, error: 'Failed to toggle favorite' }
  }
}

export async function checkIsFavorited(seriesId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { isFavorited: false, error: null }
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('id')
      .eq('user_id', user.id)
      .eq('series_id', seriesId)
      .single()

    return { isFavorited: !!data, error: null }
  } catch (error) {
    return { isFavorited: false, error: null }
  }
}

export async function getUserLibrary() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { user: null, readingProgress: [], favorites: [], transactions: [], error: 'Not authenticated' }
  }

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    // Get favorites
    const { data: favorites } = await supabase
      .from('favorites')
      .select('series(*)')
      .eq('user_id', user.id)

    // Get reading progress
    const { data: progress } = await supabase
      .from('reading_progress')
      .select('*, series(*), chapters(*)')
      .eq('user_id', user.id)
      .order('last_read_at', { ascending: false })
      .limit(10)

    // Get wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .single()

    // Get transactions
    const { data: transactions } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    return {
      user: {
        ...profile,
        coin_balance: wallet?.coin_balance || 0,
      },
      readingProgress: progress || [],
      favorites: (favorites || []).map((f: any) => f.series),
      transactions: transactions || [],
      error: null,
    }
  } catch (error) {
    console.error('Error in getUserLibrary:', error)
    return { user: null, readingProgress: [], favorites: [], transactions: [], error: 'Failed to fetch library data' }
  }
}

// ============= COMMENTS ACTIONS =============

export async function getComments(seriesId?: string, chapterId?: string) {
  const supabase = await createClient()

  try {
    let query = supabase
      .from('comments')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .is('parent_id', null)
      .order('created_at', { ascending: false })

    if (seriesId) {
      query = query.eq('series_id', seriesId)
    } else if (chapterId) {
      query = query.eq('chapter_id', chapterId)
    }

    const { data: comments, error } = await query

    if (error) throw error

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
        const { data: replies } = await supabase
          .from('comments')
          .select(`
            *,
            profiles:user_id (
              display_name,
              avatar_url
            )
          `)
          .eq('parent_id', comment.id)
          .order('created_at', { ascending: true })

        return { ...comment, replies: replies || [] }
      })
    )

    return { comments: commentsWithReplies, error: null }
  } catch (error) {
    console.error('Error in getComments:', error)
    return { comments: null, error: 'Failed to fetch comments' }
  }
}

export async function createComment(data: {
  content: string
  seriesId?: string
  chapterId?: string
  parentId?: string
}) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { comment: null, error: 'You must be logged in to comment' }
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        user_id: user.id,
        content: data.content,
        series_id: data.seriesId || null,
        chapter_id: data.chapterId || null,
        parent_id: data.parentId || null,
      })
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .single()

    if (error) throw error

    return { comment, error: null }
  } catch (error) {
    console.error('Error in createComment:', error)
    return { comment: null, error: 'Failed to create comment' }
  }
}

export async function likeComment(commentId: string, currentLikes: number) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to like comments' }
    }

    const { error } = await supabase
      .from('comments')
      .update({ likes: currentLikes + 1 })
      .eq('id', commentId)

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in likeComment:', error)
    return { success: false, error: 'Failed to like comment' }
  }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to delete comments' }
    }

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId)
      .eq('user_id', user.id) // RLS will also check this

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteComment:', error)
    return { success: false, error: 'Failed to delete comment' }
  }
}

// ============= RATINGS ACTIONS =============

export async function getRatings(seriesId: string) {
  const supabase = await createClient()

  try {
    const { data: ratings, error } = await supabase
      .from('ratings')
      .select(`
        *,
        profiles:user_id (
          display_name,
          avatar_url
        )
      `)
      .eq('series_id', seriesId)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Get current user's rating if logged in
    const { data: { user } } = await supabase.auth.getUser()
    let userRating = null

    if (user) {
      const { data } = await supabase
        .from('ratings')
        .select('*')
        .eq('series_id', seriesId)
        .eq('user_id', user.id)
        .single()
      
      userRating = data
    }

    return { ratings, userRating, error: null }
  } catch (error) {
    console.error('Error in getRatings:', error)
    return { ratings: null, userRating: null, error: 'Failed to fetch ratings' }
  }
}

export async function createOrUpdateRating(data: {
  seriesId: string
  rating: number
  review?: string
}) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { rating: null, error: 'You must be logged in to rate' }
    }

    const { data: rating, error } = await supabase
      .from('ratings')
      .upsert({
        user_id: user.id,
        series_id: data.seriesId,
        rating: data.rating,
        review: data.review || null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    return { rating, error: null }
  } catch (error) {
    console.error('Error in createOrUpdateRating:', error)
    return { rating: null, error: 'Failed to submit rating' }
  }
}

export async function deleteRating(seriesId: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'You must be logged in to delete ratings' }
    }

    const { error } = await supabase
      .from('ratings')
      .delete()
      .eq('series_id', seriesId)
      .eq('user_id', user.id)

    if (error) throw error

    return { success: true, error: null }
  } catch (error) {
    console.error('Error in deleteRating:', error)
    return { success: false, error: 'Failed to delete rating' }
  }
}
