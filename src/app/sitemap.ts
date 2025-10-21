import { MetadataRoute } from 'next'
import { createClient } from '@/lib/supabase/server'

export const dynamic = 'force-dynamic'
export const revalidate = 3600 // Revalidate every hour

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient()
  const baseUrl = 'https://noobwriter.com'

  // Static routes
  const routes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/novels`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/manga`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/browse`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  try {
    // Get all published series
    const { data: series, error } = await supabase
      .from('series')
      .select('id, updated_at, content_type')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(5000)

    if (!error && series) {
      const seriesUrls: MetadataRoute.Sitemap = series.map((s) => ({
        url: `${baseUrl}/series/${s.id}`,
        lastModified: new Date(s.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }))
      routes.push(...seriesUrls)
    }

    // Get published chapters
    const { data: chapters, error: chaptersError } = await supabase
      .from('chapters')
      .select('id, series_id, updated_at')
      .eq('status', 'published')
      .order('updated_at', { ascending: false })
      .limit(5000)

    if (!chaptersError && chapters) {
      const chapterUrls: MetadataRoute.Sitemap = chapters.map((c) => ({
        url: `${baseUrl}/read/${c.series_id}/${c.id}`,
        lastModified: new Date(c.updated_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
      routes.push(...chapterUrls)
    }
  } catch (error) {
    console.error('Error generating sitemap:', error)
  }

  return routes
}
