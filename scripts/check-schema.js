/**
 * Check current Supabase database schema
 * This queries the database to see what tables and columns exist
 */

const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://gkhsrwebwdabzmojefry.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseKey) {
  console.error('❌ Missing NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkSchema() {
  console.log('🔍 Checking Supabase Database Schema...\n')

  // Check tables
  const tables = ['profiles', 'series', 'chapters', 'comments', 'ratings', 'favorites', 'reading_progress', 'unlocked_chapters', 'transactions']
  
  for (const table of tables) {
    try {
      const { data, error, count } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true })
      
      if (error) {
        if (error.code === '42P01') {
          console.log(`❌ Table "${table}" - DOES NOT EXIST`)
        } else {
          console.log(`⚠️  Table "${table}" - Error: ${error.message}`)
        }
      } else {
        console.log(`✅ Table "${table}" - EXISTS (${count || 0} rows)`)
      }
    } catch (err) {
      console.log(`⚠️  Table "${table}" - Error: ${err.message}`)
    }
  }

  console.log('\n📊 Checking specific columns...\n')

  // Check chapters table columns
  try {
    const { data: chaptersData, error: chaptersError } = await supabase
      .from('chapters')
      .select('likes, word_count')
      .limit(1)
    
    if (chaptersError) {
      console.log('❌ chapters.likes, chapters.word_count - NOT FOUND')
      console.log('   Error:', chaptersError.message)
    } else {
      console.log('✅ chapters.likes, chapters.word_count - EXISTS')
    }
  } catch (err) {
    console.log('❌ chapters table - Error:', err.message)
  }

  // Check series table columns
  try {
    const { data: seriesData, error: seriesError } = await supabase
      .from('series')
      .select('total_comments')
      .limit(1)
    
    if (seriesError) {
      console.log('❌ series.total_comments - NOT FOUND')
      console.log('   Error:', seriesError.message)
    } else {
      console.log('✅ series.total_comments - EXISTS')
    }
  } catch (err) {
    console.log('❌ series table - Error:', err.message)
  }

  // Check comments table structure
  try {
    const { data: commentsData, error: commentsError } = await supabase
      .from('comments')
      .select('id, user_id, series_id, chapter_id, parent_id, content, likes')
      .limit(1)
    
    if (commentsError) {
      console.log('❌ comments table structure - INCOMPLETE')
      console.log('   Error:', commentsError.message)
    } else {
      console.log('✅ comments table structure - COMPLETE')
    }
  } catch (err) {
    console.log('❌ comments table - Error:', err.message)
  }

  // Check ratings table structure
  try {
    const { data: ratingsData, error: ratingsError } = await supabase
      .from('ratings')
      .select('id, user_id, series_id, rating, review')
      .limit(1)
    
    if (ratingsError) {
      console.log('❌ ratings table structure - INCOMPLETE')
      console.log('   Error:', ratingsError.message)
    } else {
      console.log('✅ ratings table structure - COMPLETE')
    }
  } catch (err) {
    console.log('❌ ratings table - Error:', err.message)
  }

  console.log('\n✨ Schema check complete!\n')
}

checkSchema().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
