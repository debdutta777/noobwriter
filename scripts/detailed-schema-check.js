/**
 * Detailed schema check - shows exact columns in key tables
 */

const SUPABASE_PROJECT_REF = 'gkhsrwebwdabzmojefry'
const SUPABASE_ACCESS_TOKEN = 'sbp_f7feea0e7534872518aca7bd6f69828359a34d55'

async function runQuery(name, query) {
  console.log(`\n📊 ${name}:`)
  console.log('='.repeat(70))
  
  try {
    const response = await fetch(
      `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query })
      }
    )
    
    if (!response.ok) {
      const error = await response.text()
      console.error(`❌ Failed:`, error)
      return
    }
    
    const result = await response.json()
    console.table(result)
  } catch (error) {
    console.error(`❌ Error:`, error.message)
  }
}

async function checkDetailedSchema() {
  console.log('\n🔍 DETAILED DATABASE SCHEMA CHECK\n')
  
  await runQuery('1. ALL COLUMNS IN SERIES TABLE', `
    SELECT column_name, data_type, is_nullable, column_default
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'series'
    ORDER BY ordinal_position;
  `)
  
  await runQuery('2. ALL COLUMNS IN PROFILES TABLE', `
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'profiles'
    ORDER BY ordinal_position;
  `)
  
  await runQuery('3. STORAGE BUCKETS', `
    SELECT id, name, public, file_size_limit
    FROM storage.buckets
    ORDER BY name;
  `)
  
  await runQuery('4. FOLLOWS TABLE CHECK', `
    SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name = 'follows'
    ) as follows_table_exists;
  `)
  
  await runQuery('5. CHECK FOR SPECIFIC COLUMNS', `
    SELECT
      EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'synopsis') as has_synopsis,
      EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'description') as has_description,
      EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'is_published') as has_is_published,
      EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'cover_url') as has_cover_url,
      EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'series' AND column_name = 'cover_image_url') as has_cover_image_url,
      EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'username') as has_username,
      EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'bio') as has_bio;
  `)
  
  console.log('\n✅ Detailed schema check complete!\n')
}

checkDetailedSchema().catch(error => {
  console.error('❌ Fatal error:', error)
  process.exit(1)
})
