import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSeries() {
  console.log('🔍 Checking all series...\n')

  const { data: allSeries, error } = await supabase
    .from('series')
    .select('id, title, status, is_published, author_id, total_chapters')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error:', error)
  } else {
    console.log(`Found ${allSeries.length} series:\n`)
    allSeries.forEach((s, i) => {
      console.log(`${i + 1}. ${s.title}`)
      console.log(`   - ID: ${s.id}`)
      console.log(`   - Status: ${s.status}`)
      console.log(`   - Is Published: ${s.is_published}`)
      console.log(`   - Chapters: ${s.total_chapters}`)
      console.log(`   - Author ID: ${s.author_id}`)
      console.log('')
    })

    // Check what queries would return
    console.log('📊 Query Results:\n')

    const { data: publishedByStatus } = await supabase
      .from('series')
      .select('id, title')
      .eq('status', 'published')
    console.log(`Status = 'published': ${publishedByStatus?.length || 0} series`)

    const { data: publishedByFlag } = await supabase
      .from('series')
      .select('id, title')
      .eq('is_published', true)
    console.log(`is_published = true: ${publishedByFlag?.length || 0} series`)

    const { data: ongoingSeries } = await supabase
      .from('series')
      .select('id, title')
      .eq('status', 'ongoing')
    console.log(`Status = 'ongoing': ${ongoingSeries?.length || 0} series`)
  }

  process.exit(0)
}

checkSeries()
