import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function applyMigration() {
  console.log('🚀 Applying Transaction Types Migration...\n')
  
  const migration = `
-- CRITICAL: Add new transaction types for tips and payouts
ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_type_check;

ALTER TABLE transactions
ADD CONSTRAINT transactions_type_check 
CHECK (type IN (
  'purchase',         -- User purchases coins
  'unlock',           -- User unlocks premium chapter
  'tip',              -- Generic tip (legacy)
  'tip_sent',         -- User sent a tip to author
  'tip_received',     -- Author received a tip
  'earning',          -- Author earning from chapter unlocks
  'refund',           -- Refund of transaction
  'payout_request',   -- Writer requested payout (pending)
  'payout_completed', -- Payout was processed successfully
  'payout_rejected'   -- Payout was rejected
));

-- Create index for faster querying of payout transactions
CREATE INDEX IF NOT EXISTS idx_transactions_type_payout 
ON transactions(user_id, type) 
WHERE type IN ('payout_request', 'payout_completed', 'payout_rejected');
  `.trim()

  console.log('Migration SQL:')
  console.log('─'.repeat(80))
  console.log(migration)
  console.log('─'.repeat(80))
  console.log()

  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: migration })
    
    if (error) {
      // If RPC doesn't exist, try alternative method
      console.log('⚠️  RPC method not available, need to apply manually')
      console.log('\n📋 MANUAL STEPS:')
      console.log('1. Go to https://supabase.com/dashboard')
      console.log('2. Select your project')
      console.log('3. Go to SQL Editor')
      console.log('4. Copy the SQL above')
      console.log('5. Paste and Run')
      console.log('\nOR')
      console.log('Copy this file to apply: supabase/migrations/20251021_add_transaction_types.sql')
    } else {
      console.log('✅ Migration applied successfully!')
    }
  } catch (err) {
    console.log('\n⚠️  Cannot apply migration via API')
    console.log('This is normal - Supabase requires SQL Editor for schema changes')
    console.log('\n📋 TO APPLY THIS MIGRATION:')
    console.log('─'.repeat(80))
    console.log('1. Go to: https://supabase.com/dashboard/project/gkhsrwebwdabzmojefry/sql')
    console.log('2. Click "New Query"')
    console.log('3. Paste the SQL shown above')
    console.log('4. Click "Run"')
    console.log('─'.repeat(80))
  }
}

applyMigration()
  .then(() => {
    process.exit(0)
  })
  .catch(err => {
    console.error('❌ Error:', err.message)
    process.exit(1)
  })
