import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function checkDatabaseSchema() {
  console.log('=== CHECKING CURRENT DATABASE SCHEMA ===\n')

  // Check all tables
  const tables = ['series', 'chapters', 'profiles', 'wallets', 'comments', 'reviews', 'reading_progress', 'chapter_likes', 'series_followers']
  
  for (const table of tables) {
    console.log(`\nChecking table: ${table}`)
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .limit(0)
    
    if (error) {
      console.log(`❌ Table does NOT exist: ${error.message}`)
    } else {
      console.log(`✅ Table exists`)
      
      // Try to get one row to see columns
      const { data: sample } = await supabase
        .from(table)
        .select('*')
        .limit(1)
      
      if (sample && sample.length > 0) {
        console.log(`   Columns: ${Object.keys(sample[0]).join(', ')}`)
      }
    }
  }

  // Check series columns specifically
  console.log('\n\n=== SERIES TABLE DETAILS ===')
  const { data: seriesSample } = await supabase
    .from('series')
    .select('*')
    .limit(1)
  
  if (seriesSample && seriesSample.length > 0) {
    console.log('Available columns:', Object.keys(seriesSample[0]))
  }

  // Check chapters columns
  console.log('\n\n=== CHAPTERS TABLE DETAILS ===')
  const { data: chaptersSample } = await supabase
    .from('chapters')
    .select('*')
    .limit(1)
  
  if (chaptersSample && chaptersSample.length > 0) {
    console.log('Available columns:', Object.keys(chaptersSample[0]))
  }
}

checkDatabaseSchema().catch(console.error)
