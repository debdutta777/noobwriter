import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function checkDatabaseState() {
  console.log('=== CHECKING SUPABASE DATABASE STATE ===\n')

  // 1. Check chapters table structure
  console.log('1. Checking chapters table columns...')
  const { data: chapters, error: chaptersError } = await supabase
    .from('chapters')
    .select('*')
    .limit(1)

  if (chaptersError) {
    console.error('❌ Error accessing chapters:', chaptersError.message)
  } else {
    const columns = chapters?.[0] ? Object.keys(chapters[0]) : []
    console.log('✓ Available columns:', columns.length > 0 ? columns : 'No data yet, cannot determine columns')
  }

  // 2. Check if RLS is enabled (skip for now)
  console.log('\n2. Checking RLS status... (skipped)')

  // 3. Get current user info
  console.log('\n3. Getting test user info...')
  const testUserId = '24aba03a-a678-4c4f-a53f-5d0e7eae94a7' // From the error log
  
  const { data: userSeries, error: seriesError } = await supabase
    .from('series')
    .select('id, title, author_id')
    .eq('author_id', testUserId)

  if (seriesError) {
    console.error('❌ Error fetching user series:', seriesError.message)
  } else {
    console.log(`✓ User has ${userSeries?.length || 0} series:`)
    userSeries?.forEach(s => {
      console.log(`   - ${s.title} (ID: ${s.id})`)
    })
  }

  // 4. Try to insert a test chapter as service role
  console.log('\n4. Testing chapter insert as SERVICE ROLE...')
  const testSeriesId = userSeries?.[0]?.id
  
  if (testSeriesId) {
    const { data: insertTest, error: insertError } = await supabase
      .from('chapters')
      .insert({
        series_id: testSeriesId,
        title: 'TEST CHAPTER - DELETE ME',
        content: 'This is a test',
        chapter_number: 9999,
        word_count: 10
      })
      .select()

    if (insertError) {
      console.error('❌ Service role insert failed:', insertError.message)
      console.error('   Details:', insertError)
    } else {
      console.log('✓ Service role insert SUCCESS!')
      console.log('   Inserted chapter:', insertTest)
      
      // Delete the test chapter
      const { error: deleteError } = await supabase
        .from('chapters')
        .delete()
        .eq('id', insertTest[0].id)
      
      if (!deleteError) {
        console.log('✓ Test chapter deleted')
      }
    }
  } else {
    console.log('⚠️  No series found to test with')
  }

  // 5. Check chapters table schema details
  console.log('\n5. Checking chapters table schema...')
  const { data: schemaData, error: schemaError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable, column_default')
    .eq('table_name', 'chapters')
    .catch(() => ({ data: null, error: 'Cannot access schema' }))

  if (schemaError || !schemaData) {
    console.log('⚠️  Cannot access schema info')
  } else {
    console.log('✓ Table schema:')
    schemaData.forEach(col => {
      console.log(`   - ${col.column_name}: ${col.data_type} (nullable: ${col.is_nullable})`)
    })
  }

  // 6. Check for any existing chapters
  console.log('\n6. Checking existing chapters...')
  const { data: existingChapters, error: existError } = await supabase
    .from('chapters')
    .select('id, title, series_id, created_at')
    .limit(5)

  if (existError) {
    console.error('❌ Error fetching chapters:', existError.message)
  } else {
    console.log(`✓ Found ${existingChapters?.length || 0} existing chapters`)
    existingChapters?.forEach(ch => {
      console.log(`   - ${ch.title} (Series: ${ch.series_id})`)
    })
  }

  console.log('\n=== DIAGNOSIS COMPLETE ===')
}

checkDatabaseState().catch(console.error)
