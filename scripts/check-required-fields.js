import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function getChaptersSchema() {
  console.log('Getting chapters table columns...\n')
  
  // Get all columns
  const { data, error } = await supabase
    .from('chapters')
    .select('*')
    .limit(0)
  
  if (error) {
    console.error('Error:', error)
    return
  }

  // Try inserting with minimal data to see what's required
  const testInsert = await supabase
    .from('chapters')
    .insert({
      series_id: '637eb10c-5126-4e4c-a4b8-356689cfdd60',
      title: 'Test',
      chapter_number: 1
    })
    .select()

  console.log('Test insert result:', testInsert)
}

getChaptersSchema()
