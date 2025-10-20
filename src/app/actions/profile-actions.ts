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

    // Get stats
    const [seriesData, chaptersData, followersData, followingData] = await Promise.all([
      // Count stories
      supabase
        .from('series')
        .select('id, total_views', { count: 'exact' })
        .eq('author_id', profile.id)
        .eq('status', 'published'),
      
      // Count chapters
      supabase
        .from('chapters')
        .select('id', { count: 'exact' })
        .eq('author_id', profile.id)
        .eq('status', 'published'),
      
      // Count followers
      supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('following_id', profile.id),
      
      // Count following
      supabase
        .from('follows')
        .select('id', { count: 'exact' })
        .eq('follower_id', profile.id)
    ])

    const totalReads = seriesData.data?.reduce((sum, series) => sum + (series.total_views || 0), 0) || 0

    const userProfile: UserProfile = {
      id: profile.id,
      username: profile.username || username,
      display_name: profile.display_name || username,
      avatar_url: profile.avatar_url,
      bio: profile.bio,
      role: profile.role || 'reader',
      coin_balance: profile.coin_balance || 0,
      created_at: profile.created_at,
      social_links: profile.social_links,
      stats: {
        stories_written: seriesData.count || 0,
        chapters_published: chaptersData.count || 0,
        total_reads: totalReads,
        followers: followersData.count || 0,
        following: followingData.count || 0
      }
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
