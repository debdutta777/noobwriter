'use server'

import { createClient } from '@/lib/supabase/server'

export async function getWriterDashboardData() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { data: null, error: 'Not authenticated' }
  }

  try {
    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, email')
      .eq('id', user.id)
      .single()

    if (!profile) {
      return { data: null, error: 'Profile not found' }
    }

    // Get writer's series
    const { data: series } = await supabase
      .from('series')
      .select('*')
      .eq('author_id', user.id)
      .order('created_at', { ascending: false })

    const mySeries = series || []

    // Calculate stats
    const totalSeries = mySeries.length
    const totalChapters = mySeries.reduce((sum, s) => sum + (s.total_chapters || 0), 0)
    const totalViews = mySeries.reduce((sum, s) => sum + (s.total_views || 0), 0)
    const avgRating = mySeries.length > 0
      ? mySeries.reduce((sum, s) => sum + (s.average_rating || 0), 0) / mySeries.length
      : 0

    // Get recent chapters (last 5)
    const { data: chapters } = await supabase
      .from('chapters')
      .select('id, title, chapter_number, view_count, published_at, series_id')
      .in('series_id', mySeries.map(s => s.id))
      .eq('is_published', true)
      .order('published_at', { ascending: false })
      .limit(5)

    // Get series titles for chapters
    const recentChapters = (chapters || []).map(chapter => {
      const seriesInfo = mySeries.find(s => s.id === chapter.series_id)
      return {
        id: chapter.id,
        title: chapter.title,
        chapter_number: chapter.chapter_number,
        views: chapter.view_count || 0,
        published_at: chapter.published_at,
        series_id: chapter.series_id,
        series_title: seriesInfo?.title || 'Unknown',
      }
    })

    // Get earnings (mock for now - would come from transactions)
    const { data: transactions } = await supabase
      .from('transactions')
      .select('amount, created_at')
      .eq('user_id', user.id)
      .eq('type', 'unlock')
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString())

    const thisMonthEarnings = (transactions || []).reduce((sum, t) => sum + Math.abs(t.amount), 0)

    // Get unique readers (users who unlocked chapters)
    const { count: totalReaders } = await supabase
      .from('chapter_unlocks')
      .select('user_id', { count: 'exact', head: true })
      .in('chapter_id', (chapters || []).map(c => c.id))

    // Get recent tips received
    const { data: tips } = await supabase
      .from('transactions')
      .select(`
        id,
        coin_amount,
        description,
        created_at,
        metadata
      `)
      .eq('user_id', user.id)
      .eq('type', 'tip')
      .gte('coin_amount', 0)
      .order('created_at', { ascending: false })
      .limit(10)

    const recentTips = (tips || []).map(tip => ({
      id: tip.id,
      amount: tip.coin_amount,
      description: tip.description,
      created_at: tip.created_at,
      tipper_name: tip.metadata?.tipper_name || 'Anonymous',
      series_title: tip.metadata?.series_title || 'Unknown',
    }))

    return {
      data: {
        user: {
          display_name: profile.display_name,
          email: profile.email,
        },
        stats: {
          totalSeries,
          totalChapters,
          totalViews,
          totalEarnings: thisMonthEarnings * 0.7, // 70% revenue share
          totalReaders: totalReaders || 0,
          avgRating,
        },
        mySeries: mySeries.map(s => ({
          id: s.id,
          title: s.title,
          cover_url: s.cover_url,
          content_type: s.content_type,
          total_chapters: s.total_chapters || 0,
          total_views: s.total_views || 0,
          avg_rating: s.average_rating || 0,
          is_published: s.is_published,
          last_chapter_at: s.updated_at,
        })),
        recentChapters,
        recentTips,
        earnings: {
          thisMonth: thisMonthEarnings * 0.7,
          lastMonth: 0, // Would calculate from previous month
          pendingPayout: thisMonthEarnings * 0.7,
        },
      },
      error: null,
    }
  } catch (error) {
    console.error('Failed to load dashboard:', error)
    return { data: null, error: 'Failed to load dashboard data' }
  }
}

export async function createSeries(formData: {
  title: string
  synopsis: string
  content_type: 'novel' | 'manga'
  genres: string[]
  tags: string[]
  age_rating: string
  cover_url?: string
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Generate slug from title
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100) + '-' + Date.now()

    const { data, error } = await supabase
      .from('series')
      .insert({
        author_id: user.id,
        title: formData.title,
        slug: slug,
        synopsis: formData.synopsis,
        content_type: formData.content_type,
        genres: formData.genres,
        tags: formData.tags,
        age_rating: formData.age_rating,
        cover_url: formData.cover_url,
        is_published: false,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to create series' }
  }
}

export async function updateSeries(
  seriesId: string,
  updates: Partial<{
    title: string
    synopsis: string
    genres: string[]
    tags: string[]
    age_rating: string
    cover_url: string
    is_published: boolean
  }>
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify ownership
    const { data: series } = await supabase
      .from('series')
      .select('author_id')
      .eq('id', seriesId)
      .single()

    if (!series || series.author_id !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    const { error } = await supabase
      .from('series')
      .update(updates)
      .eq('id', seriesId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to update series' }
  }
}

export async function createChapter(formData: {
  series_id: string
  title: string
  content: string
  chapter_number: number
  is_premium: boolean
  coin_price: number
}) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify series ownership
    const { data: series } = await supabase
      .from('series')
      .select('author_id')
      .eq('id', formData.series_id)
      .single()

    if (!series || series.author_id !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    // Generate slug from title
    const slug = formData.title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .substring(0, 100) + '-' + Date.now()

    // Calculate word count from content
    const wordCount = formData.content.trim().split(/\s+/).filter(Boolean).length

    const { data, error } = await supabase
      .from('chapters')
      .insert({
        series_id: formData.series_id,
        title: formData.title,
        slug: slug,
        content: formData.content,
        chapter_number: formData.chapter_number,
        word_count: wordCount,
        is_premium: formData.is_premium,
        coin_price: formData.coin_price,
        is_published: false,
      })
      .select()
      .single()

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, data, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to create chapter' }
  }
}

export async function publishChapter(chapterId: string) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify ownership through series
    const { data: chapter } = await supabase
      .from('chapters')
      .select('series_id, series(author_id)')
      .eq('id', chapterId)
      .single()

    if (!chapter || (chapter.series as any).author_id !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    const { error } = await supabase
      .from('chapters')
      .update({
        is_published: true,
        published_at: new Date().toISOString(),
      })
      .eq('id', chapterId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to publish chapter' }
  }
}

export async function toggleSeriesPublish(seriesId: string, publish: boolean) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify ownership
    const { data: series } = await supabase
      .from('series')
      .select('author_id')
      .eq('id', seriesId)
      .single()

    if (!series || series.author_id !== user.id) {
      return { success: false, error: 'Not authorized' }
    }

    const { error } = await supabase
      .from('series')
      .update({
        is_published: publish,
        published_at: publish ? new Date().toISOString() : null,
      })
      .eq('id', seriesId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error) {
    return { success: false, error: 'Failed to update series publish status' }
  }
}
