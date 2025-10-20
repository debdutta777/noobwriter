import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testStatsSystem() {
  console.log('=== TESTING STATS SYSTEM ===\n')

  const seriesId = '637eb10c-5126-4e4c-a4b8-356689cfdd60'

  // Test 1: Check if likes column exists
  console.log('1. Testing likes column...')
  const { data: chapter } = await supabase
    .from('chapters')
    .select('likes')
    .limit(1)
    .single()
  
  console.log('✅ Likes column exists:', chapter !== null)

  // Test 2: Test increment_chapter_views function
  console.log('\n2. Testing increment_chapter_views function...')
  const { data: chapters } = await supabase
    .from('chapters')
    .select('id, view_count')
    .eq('series_id', seriesId)
    .limit(1)
  
  if (chapters && chapters.length > 0) {
    const testChapterId = chapters[0].id
    const beforeViews = chapters[0].view_count || 0
    
    const { error } = await supabase.rpc('increment_chapter_views', {
      p_chapter_id: testChapterId
    })
    
    if (error) {
      console.log('❌ Function call failed:', error.message)
    } else {
      const { data: updated } = await supabase
        .from('chapters')
        .select('view_count')
        .eq('id', testChapterId)
        .single()
      
      console.log(`✅ View count: ${beforeViews} → ${updated.view_count}`)
    }
  }

  // Test 3: Test increment_series_views function
  console.log('\n3. Testing increment_series_views function...')
  const { data: seriesBefore } = await supabase
    .from('series')
    .select('total_views')
    .eq('id', seriesId)
    .single()
  
  const beforeSeriesViews = seriesBefore?.total_views || 0
  
  const { error: seriesError } = await supabase.rpc('increment_series_views', {
    p_series_id: seriesId
  })
  
  if (seriesError) {
    console.log('❌ Function call failed:', seriesError.message)
  } else {
    const { data: seriesAfter } = await supabase
      .from('series')
      .select('total_views')
      .eq('id', seriesId)
      .single()
    
    console.log(`✅ Series views: ${beforeSeriesViews} → ${seriesAfter.total_views}`)
  }

  // Test 4: Check tracking tables
  console.log('\n4. Testing tracking tables...')
  
  const tables = ['reading_progress', 'chapter_likes', 'series_followers']
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    
    if (error) {
      console.log(`❌ ${table}: ${error.message}`)
    } else {
      console.log(`✅ ${table}: ${count} records`)
    }
  }

  // Test 5: Test getSeriesStats simulation
  console.log('\n5. Testing series stats query...')
  const { data: series } = await supabase
    .from('series')
    .select('total_views, average_rating, total_chapters')
    .eq('id', seriesId)
    .single()
  
  const { data: chaptersData } = await supabase
    .from('chapters')
    .select('view_count, word_count, is_published, likes')
    .eq('series_id', seriesId)
  
  const { count: followers } = await supabase
    .from('series_followers')
    .select('*', { count: 'exact', head: true })
    .eq('series_id', seriesId)
  
  const { count: comments } = await supabase
    .from('comments')
    .select('*', { count: 'exact', head: true })
    .eq('series_id', seriesId)
  
  console.log('✅ Stats Summary:')
  console.log(`   Total Views: ${series.total_views || 0}`)
  console.log(`   Total Chapters: ${chaptersData?.length || 0}`)
  console.log(`   Published: ${chaptersData?.filter(c => c.is_published).length || 0}`)
  console.log(`   Total Words: ${chaptersData?.reduce((sum, ch) => sum + (ch.word_count || 0), 0) || 0}`)
  console.log(`   Total Likes: ${chaptersData?.reduce((sum, ch) => sum + (ch.likes || 0), 0) || 0}`)
  console.log(`   Followers: ${followers || 0}`)
  console.log(`   Comments: ${comments || 0}`)

  console.log('\n=== ALL TESTS COMPLETE ===')
}

testStatsSystem().catch(console.error)
