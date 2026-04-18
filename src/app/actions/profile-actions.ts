'use server'

import { createClient } from '@/lib/supabase/server'

export interface UserProfile {
  id: string
  username: string
  display_name: string
  avatar_url: string | null
  bio: string | null
  role: 'reader' | 'writer' | 'admin'
  coin_balance: number
  created_at: string
  is_current_user: boolean
  social_links: {
    twitter?: string
    facebook?: string
    instagram?: string
    website?: string
  } | null
  stats: {
    stories_written: number
    chapters_published: number
    total_reads: number
    followers: number
    following: number
  }
  stories: Array<{
    id: string
    title: string
    cover_url: string | null
    content_type: string
    total_chapters: number
    total_views: number
    average_rating: number | null
  }>
  favorites: Array<{
    id: string
    title: string
    cover_url: string | null
    content_type: string
  }>
}

export async function getUserProfile(username: string) {
  const supabase = await createClient()

  try {
    // Get user by username
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('username', username)
      .single()

    if (profileError || !profile) {
      return { profile: null, error: 'User not found' }
    }

    // Stories + view totals for this author
    const seriesData = await supabase
      .from('series')
      .select('id, title, cover_url, content_type, total_chapters, total_views, average_rating', { count: 'exact' })
      .eq('author_id', profile.id)
      .eq('is_published', true)
      .order('updated_at', { ascending: false })

    const seriesIds = (seriesData.data || []).map((s) => s.id)

    const { data: { user: currentUser } } = await supabase.auth.getUser()

    // Wallet balance lives on wallets, not profiles
    const [walletRes, chaptersData, followersData, followingData, favoritesRes] = await Promise.all([
      supabase.from('wallets').select('coin_balance').eq('user_id', profile.id).maybeSingle(),
      seriesIds.length > 0
        ? supabase
            .from('chapters')
            .select('id', { count: 'exact', head: true })
            .in('series_id', seriesIds)
            .eq('is_published', true)
        : Promise.resolve({ count: 0 } as { count: number }),
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('following_id', profile.id),
      supabase
        .from('follows')
        .select('id', { count: 'exact', head: true })
        .eq('follower_id', profile.id),
      supabase
        .from('favorites')
        .select('series_id')
        .eq('user_id', profile.id)
        .order('created_at', { ascending: false })
        .limit(24),
    ])

    const favoriteSeriesIds = (favoritesRes.data || []).map((f) => f.series_id).filter(Boolean)
    const { data: favoriteSeriesRows } = favoriteSeriesIds.length > 0
      ? await supabase
          .from('series')
          .select('id, title, cover_url, content_type')
          .in('id', favoriteSeriesIds)
      : { data: [] as Array<{ id: string; title: string; cover_url: string | null; content_type: string }> }

    const totalReads = seriesData.data?.reduce((sum, s) => sum + (s.total_views || 0), 0) || 0

    const favoritesOrder = new Map(favoriteSeriesIds.map((id, i) => [id, i]))
    const favorites = (favoriteSeriesRows || [])
      .slice()
      .sort((a, b) => (favoritesOrder.get(a.id) ?? 0) - (favoritesOrder.get(b.id) ?? 0))

    const socialLinks = (profile.social_links && typeof profile.social_links === 'object' && !Array.isArray(profile.social_links))
      ? (profile.social_links as UserProfile['social_links'])
      : null

    const role: UserProfile['role'] =
      profile.role === 'writer' || profile.role === 'admin' ? profile.role : 'reader'

    const userProfile: UserProfile = {
      id: profile.id,
      username: profile.username || username,
      display_name: profile.display_name || username,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      role,
      coin_balance: walletRes.data?.coin_balance ?? 0,
      created_at: profile.created_at,
      is_current_user: currentUser?.id === profile.id,
      social_links: socialLinks,
      stats: {
        stories_written: seriesData.count || 0,
        chapters_published: chaptersData.count || 0,
        total_reads: totalReads,
        followers: followersData.count || 0,
        following: followingData.count || 0,
      },
      stories: (seriesData.data || []).map((s) => ({
        id: s.id,
        title: s.title,
        cover_url: s.cover_url,
        content_type: s.content_type,
        total_chapters: s.total_chapters || 0,
        total_views: s.total_views || 0,
        average_rating: s.average_rating,
      })),
      favorites,
    }

    return { profile: userProfile, error: null }
  } catch (error: any) {
    console.error('Error fetching user profile:', error)
    return { profile: null, error: error.message }
  }
}

export async function getCurrentUserProfile() {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { profile: null, error: 'Not authenticated' }
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !profile) {
      return { profile: null, error: 'Profile not found' }
    }

    return { profile, error: null }
  } catch (error: any) {
    console.error('Error fetching current user profile:', error)
    return { profile: null, error: error.message }
  }
}

export async function updateUserProfile(updates: {
  display_name?: string
  bio?: string
  avatar_url?: string
  social_links?: {
    twitter?: string
    facebook?: string
    instagram?: string
    website?: string
  }
}) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error updating profile:', error)
    return { success: false, error: error.message }
  }
}

export async function followUser(userId: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    if (user.id === userId) {
      return { success: false, error: 'Cannot follow yourself' }
    }

    const { error } = await supabase
      .from('follows')
      .insert({
        follower_id: user.id,
        following_id: userId
      })

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error following user:', error)
    return { success: false, error: error.message }
  }
}

export async function unfollowUser(userId: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { error } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', user.id)
      .eq('following_id', userId)

    if (error) {
      return { success: false, error: error.message }
    }

    return { success: true, error: null }
  } catch (error: any) {
    console.error('Error unfollowing user:', error)
    return { success: false, error: error.message }
  }
}

export async function checkIfFollowing(userId: string) {
  const supabase = await createClient()

  try {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { isFollowing: false, error: null }
    }

    const { data, error } = await supabase
      .from('follows')
      .select('id')
      .eq('follower_id', user.id)
      .eq('following_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error checking follow status:', error)
    }

    return { isFollowing: !!data, error: null }
  } catch (error: any) {
    console.error('Error checking follow status:', error)
    return { isFollowing: false, error: error.message }
  }
}
