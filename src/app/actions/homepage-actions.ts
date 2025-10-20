'use server'

import { createClient } from '@/lib/supabase/server'

export interface SeriesCard {
  id: string
  title: string
  cover_url: string | null
  synopsis: string
  content_type: 'novel' | 'manga'
  author_name: string
  total_chapters: number
  average_rating: number
  total_ratings: number
  view_count: number
  updated_at: string
}

export interface CategoryRanking {
  genre: string
  series: SeriesCard[]
}

export async function getRecommendedSeries(limit: number = 6): Promise<SeriesCard[]> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('series')
    .select(`
      id,
      title,
      cover_url,
      synopsis,
      content_type,
      author:profiles!series_author_id_fkey(display_name),
      total_views,
      average_rating,
      total_chapters,
      updated_at
    `)
    .eq('is_published', true)
    .order('average_rating', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recommended series:', error)
    return []
  }

  return (data || []).map(series => ({
    id: series.id,
    title: series.title,
    cover_url: series.cover_url,
    synopsis: series.synopsis || '',
    content_type: series.content_type,
    author_name: Array.isArray(series.author) && series.author.length > 0 
      ? series.author[0].display_name 
      : 'Anonymous',
    total_chapters: series.total_chapters || 0,
    average_rating: series.average_rating || 0,
    total_ratings: 0, // We'll calculate this separately if needed
    view_count: series.total_views || 0,
    updated_at: series.updated_at
  }))
}

export async function getRecentlyUpdatedSeries(limit: number = 6): Promise<SeriesCard[]> {
  const supabase = await createClient()
  
  // Get series that have recently updated chapters
  const { data, error} = await supabase
    .from('series')
    .select(`
      id,
      title,
      cover_url,
      synopsis,
      content_type,
      author:profiles!series_author_id_fkey(display_name),
      total_views,
      average_rating,
      total_chapters,
      updated_at
    `)
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recently updated series:', error)
    return []
  }

  return (data || []).map(series => ({
    id: series.id,
    title: series.title,
    cover_url: series.cover_url,
    synopsis: series.synopsis || '',
    content_type: series.content_type,
    author_name: Array.isArray(series.author) && series.author.length > 0 
      ? series.author[0].display_name 
      : 'Anonymous',
    total_chapters: series.total_chapters || 0,
    average_rating: series.average_rating || 0,
    total_ratings: 0,
    view_count: series.total_views || 0,
    updated_at: series.updated_at
  }))
}

export async function getCategoryRankings(): Promise<CategoryRanking[]> {
  const supabase = await createClient()
  
  const topGenres = ['Fantasy', 'Romance', 'Action', 'Sci-Fi']
  const rankings: CategoryRanking[] = []

  for (const genre of topGenres) {
    const { data, error } = await supabase
      .from('series')
      .select(`
        id,
        title,
        cover_url,
        synopsis,
        content_type,
        author:profiles!series_author_id_fkey(display_name),
        total_views,
        average_rating,
        total_chapters,
        updated_at
      `)
      .eq('is_published', true)
      .contains('genres', [genre])
      .order('total_views', { ascending: false })
      .limit(5)

    if (!error && data) {
      rankings.push({
        genre,
        series: data.map(series => ({
          id: series.id,
          title: series.title,
          cover_url: series.cover_url,
          synopsis: series.synopsis || '',
          content_type: series.content_type,
          author_name: Array.isArray(series.author) && series.author.length > 0 
            ? series.author[0].display_name 
            : 'Anonymous',
          total_chapters: series.total_chapters || 0,
          average_rating: series.average_rating || 0,
          total_ratings: 0,
          view_count: series.total_views || 0,
          updated_at: series.updated_at
        }))
      })
    }
  }

  return rankings
}

export async function getHomepageData() {
  const [recommended, recentlyUpdated, categoryRankings] = await Promise.all([
    getRecommendedSeries(6),
    getRecentlyUpdatedSeries(6),
    getCategoryRankings()
  ])

  return {
    recommended,
    recentlyUpdated,
    categoryRankings
  }
}
