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
      view_count,
      average_rating,
      total_ratings,
      updated_at,
      chapters:chapters(count)
    `)
    .eq('status', 'published')
    .order('average_rating', { ascending: false })
    .order('total_ratings', { ascending: false })
    .limit(limit)

  if (error) {
    console.error('Error fetching recommended series:', error)
    return []
  }

  return (data || []).map(series => ({
    id: series.id,
    title: series.title,
    cover_url: series.cover_url,
    synopsis: series.synopsis,
    content_type: series.content_type,
    author_name: Array.isArray(series.author) && series.author.length > 0 
      ? series.author[0].display_name 
      : 'Anonymous',
    total_chapters: series.chapters?.[0]?.count || 0,
    average_rating: series.average_rating || 0,
    total_ratings: series.total_ratings || 0,
    view_count: series.view_count || 0,
    updated_at: series.updated_at
  }))
}

export async function getRecentlyUpdatedSeries(limit: number = 6): Promise<SeriesCard[]> {
  const supabase = await createClient()
  
  // Get series that have recently updated chapters
  const { data, error } = await supabase
    .from('series')
    .select(`
      id,
      title,
      cover_url,
      synopsis,
      content_type,
      author:profiles!series_author_id_fkey(display_name),
      view_count,
      average_rating,
      total_ratings,
      updated_at,
      chapters:chapters(count)
    `)
    .eq('status', 'published')
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
    synopsis: series.synopsis,
    content_type: series.content_type,
    author_name: Array.isArray(series.author) && series.author.length > 0 
      ? series.author[0].display_name 
      : 'Anonymous',
    total_chapters: series.chapters?.[0]?.count || 0,
    average_rating: series.average_rating || 0,
    total_ratings: series.total_ratings || 0,
    view_count: series.view_count || 0,
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
        view_count,
        average_rating,
        total_ratings,
        updated_at,
        chapters:chapters(count)
      `)
      .eq('status', 'published')
      .contains('genres', [genre])
      .order('view_count', { ascending: false })
      .limit(5)

    if (!error && data) {
      rankings.push({
        genre,
        series: data.map(series => ({
          id: series.id,
          title: series.title,
          cover_url: series.cover_url,
          synopsis: series.synopsis,
          content_type: series.content_type,
          author_name: Array.isArray(series.author) && series.author.length > 0 
            ? series.author[0].display_name 
            : 'Anonymous',
          total_chapters: series.chapters?.[0]?.count || 0,
          average_rating: series.average_rating || 0,
          total_ratings: series.total_ratings || 0,
          view_count: series.view_count || 0,
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
