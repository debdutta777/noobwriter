import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'
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

async function applyRLSFix() {
  console.log('Applying RLS policies fix for chapters table...\n')

  const sqlFile = join(process.cwd(), 'supabase', 'migrations', 'fix_chapters_rls_policies.sql')
  const sql = readFileSync(sqlFile, 'utf-8')

  // Split by semicolons and execute each statement
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'))

  for (const statement of statements) {
    console.log(`Executing: ${statement.substring(0, 80)}...`)
    
    const { data, error } = await supabase.rpc('exec_sql', { 
      sql_query: statement 
    }).catch(async () => {
      // If RPC doesn't exist, try direct execution
      // This won't work with service key, need to use SQL editor in Supabase
      return { data: null, error: 'Direct SQL execution not available via service key' }
    })

    if (error) {
      console.error(`Error: ${error}`)
    } else {
      console.log('✓ Success')
    }
  }

  console.log('\n\n⚠️ IMPORTANT: If errors occurred, please run this SQL manually in Supabase SQL Editor:')
  console.log('\n1. Go to: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql')
  console.log('2. Copy the contents of: supabase/migrations/fix_chapters_rls_policies.sql')
  console.log('3. Paste and run the SQL\n')
}

applyRLSFix()
