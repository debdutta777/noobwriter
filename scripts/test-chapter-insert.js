import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testChapterInsert() {
  console.log('Testing chapter insert with all required fields...\n')
  
  const seriesId = '637eb10c-5126-4e4c-a4b8-356689cfdd60'
  const title = 'Test Chapter'
  const content = 'This is a test chapter content with some words to count.'
  
  // Generate slug
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 100) + '-' + Date.now()

  // Calculate word count
  const wordCount = content.trim().split(/\s+/).filter(Boolean).length

  console.log('Inserting chapter with:')
  console.log('- Title:', title)
  console.log('- Slug:', slug)
  console.log('- Word Count:', wordCount)
  console.log('- Series ID:', seriesId)
  console.log()

  const { data, error } = await supabase
    .from('chapters')
    .insert({
      series_id: seriesId,
      title: title,
      slug: slug,
      content: content,
      chapter_number: 1,
      word_count: wordCount,
      is_premium: false,
      coin_price: 0,
      is_published: false,
    })
    .select()

  if (error) {
    console.error('❌ Insert failed:', error.message)
    console.error('Details:', error)
  } else {
    console.log('✅ SUCCESS! Chapter created:')
    console.log(data)
    
    // Clean up - delete the test chapter
    const deleteResult = await supabase
      .from('chapters')
      .delete()
      .eq('id', data[0].id)
    
    if (deleteResult.error) {
      console.log('\n⚠️  Could not delete test chapter:', deleteResult.error.message)
    } else {
      console.log('\n✓ Test chapter deleted')
    }
  }
}

testChapterInsert()
