import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkSchema() {
  console.log('🔍 Checking actual database schema...\n')

  // Check series table columns
  console.log('📋 SERIES TABLE COLUMNS:')
  const { data: seriesColumns, error: seriesError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'series')
    .order('column_name')

  if (seriesError) {
    console.error('Error fetching series columns:', seriesError)
  } else {
    console.table(seriesColumns)
  }

  // Check chapters table columns
  console.log('\n📋 CHAPTERS TABLE COLUMNS:')
  const { data: chaptersColumns, error: chaptersError } = await supabase
    .from('information_schema.columns')
    .select('column_name, data_type, is_nullable')
    .eq('table_name', 'chapters')
    .order('column_name')

  if (chaptersError) {
    console.error('Error fetching chapters columns:', chaptersError)
  } else {
    console.table(chaptersColumns)
  }

  // Try to fetch a sample series to see actual data
  console.log('\n📊 SAMPLE SERIES DATA:')
  const { data: sampleSeries, error: sampleError } = await supabase
    .from('series')
    .select('*')
    .limit(1)

  if (sampleError) {
    console.error('Error fetching sample series:', sampleError)
  } else if (sampleSeries && sampleSeries.length > 0) {
    console.log('Available columns:', Object.keys(sampleSeries[0]))
    console.log('\nSample data:', sampleSeries[0])
  } else {
    console.log('No series found in database')
  }

  process.exit(0)
}

checkSchema()
