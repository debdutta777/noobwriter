import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

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

async function checkRLSPolicies() {
  console.log('Checking RLS policies for chapters table...\n')

  // Query pg_policies to get RLS policies
  const { data: policies, error } = await supabase
    .rpc('get_table_policies', { table_name: 'chapters' })
    .catch(async () => {
      // If RPC doesn't exist, query directly
      const { data, error } = await supabase
        .from('pg_policies')
        .select('*')
        .eq('tablename', 'chapters')
      
      return { data, error }
    })

  if (error) {
    console.error('Error fetching policies:', error)
    
    // Alternative: Check if RLS is enabled
    console.log('\nChecking if RLS is enabled on chapters table...')
    const { data: tableInfo, error: tableError } = await supabase
      .rpc('pg_get_rls_enabled', { table_name: 'chapters' })
      .catch(() => ({ data: null, error: null }))
    
    console.log('Table info:', tableInfo)
  } else {
    console.log('Current RLS Policies:')
    console.log(JSON.stringify(policies, null, 2))
  }

  // Try to check table ownership
  console.log('\n\nChecking chapters table structure...')
  const { data: tableData, error: tableError } = await supabase
    .from('chapters')
    .select('*')
    .limit(1)

  if (tableError) {
    console.error('Error accessing chapters table:', tableError)
  } else {
    console.log('Successfully accessed chapters table')
    console.log('Sample structure:', tableData?.[0] || 'No data yet')
  }
}

checkRLSPolicies()
