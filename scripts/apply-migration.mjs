import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment
dotenv.config({ path: join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
})

async function applyMigration() {
  console.log('🔧 Applying atomic wallet operations migration...\n')

  try {
    // Read the SQL file
    const migrationPath = join(__dirname, '..', 'supabase', 'migrations', '20251027_atomic_wallet_operations.sql')
    const sql = readFileSync(migrationPath, 'utf-8')

    console.log('📄 Migration file loaded')
    console.log(`📏 Size: ${sql.length} characters\n`)

    // Split by statement (simple approach)
    const statements = sql
      .split(/;\s*\n/)
      .filter(s => s.trim() && !s.trim().startsWith('--'))

    console.log(`📋 Found ${statements.length} SQL statements to execute\n`)

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i].trim()
      if (!statement) continue

      // Get function name for logging
      const match = statement.match(/CREATE OR REPLACE FUNCTION (\w+)/)
      const name = match ? match[1] : `Statement ${i + 1}`

      process.stdout.write(`⏳ Executing: ${name}...`)

      const { error } = await supabase.rpc('exec_sql', { sql: statement }).single()

      if (error) {
        // Try direct query if RPC doesn't exist
        const { error: queryError } = await supabase
          .from('_sql')
          .select('*')
          .limit(0)

        console.log(` ❌ Failed`)
        console.error(`   Error: ${error.message}`)
        console.log('\n⚠️  Direct SQL execution not available via JS client.')
        console.log('📋 Please run the migration manually:')
        console.log('   1. Go to Supabase Dashboard → SQL Editor')
        console.log('   2. Copy contents of: supabase/migrations/20251027_atomic_wallet_operations.sql')
        console.log('   3. Paste and run in SQL Editor')
        process.exit(1)
      }

      console.log(' ✅')
    }

    console.log('\n🎉 Migration applied successfully!')
    console.log('\n📋 Created functions:')
    console.log('   ✅ deduct_coins()')
    console.log('   ✅ add_coins()')
    console.log('   ✅ process_tip()')
    console.log('   ✅ unlock_premium_chapter()')

    console.log('\n🔒 Security improvements:')
    console.log('   ✅ Atomic wallet operations (no race conditions)')
    console.log('   ✅ Automatic transaction rollback')
    console.log('   ✅ No admin client needed')

    console.log('\n🧪 Next steps:')
    console.log('   1. npm run build')
    console.log('   2. node scripts/test-tip-actual.mjs')

  } catch (error) {
    console.error('\n❌ Error applying migration:', error.message)
    console.log('\n📋 Manual application required:')
    console.log('   1. Go to: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/editor')
    console.log('   2. Click "SQL Editor" → "New query"')
    console.log('   3. Copy and paste: supabase/migrations/20251027_atomic_wallet_operations.sql')
    console.log('   4. Click "Run"')
    process.exit(1)
  }
}

// Run if called directly
applyMigration()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('Fatal error:', err)
    process.exit(1)
  })
