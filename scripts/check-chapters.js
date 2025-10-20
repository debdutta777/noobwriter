import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function checkChapters() {
  console.log('🔍 Checking chapters table...\n')

  // Try to fetch a sample chapter
  const { data: sampleChapters, error } = await supabase
    .from('chapters')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching sample chapters:', error)
  } else if (sampleChapters && sampleChapters.length > 0) {
    console.log('Available columns:', Object.keys(sampleChapters[0]))
    console.log('\nSample data:', sampleChapters[0])
  } else {
    console.log('No chapters found in database')
  }

  process.exit(0)
}

checkChapters()
