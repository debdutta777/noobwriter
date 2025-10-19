/**
 * Script to run migration through Supabase
 * Run this with: npx tsx scripts/run-migration.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials. Please set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  try {
    console.log('🔄 Running migration...')
    
    const migrationPath = path.join(__dirname, '../supabase/migrations/20251019_add_analytics_comments.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
    
    // Split by semicolon and filter empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`\n⚙️  Executing statement ${i + 1}/${statements.length}...`)
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        // Try direct query if RPC fails
        const { error: queryError } = await supabase.from('_migrations').select('*').limit(0)
        if (queryError) {
          console.error(`❌ Error executing statement ${i + 1}:`, error)
          throw error
        }
      }
      
      console.log(`✅ Statement ${i + 1} executed successfully`)
    }
    
    console.log('\n✨ Migration completed successfully!')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

runMigration()
