/**
 * Run migration using Supabase Management API
 * This uses the MCP server credentials to execute SQL
 */

const SUPABASE_PROJECT_REF = 'gkhsrwebwdabzmojefry'
const SUPABASE_ACCESS_TOKEN = 'sbp_f7feea0e7534872518aca7bd6f69828359a34d55'

async function runMigration() {
  const fs = require('fs')
  const path = require('path')
  
  console.log('🔄 Reading migration file...')
  const migrationPath = path.join(__dirname, '../supabase/migrations/20251019_add_analytics_comments.sql')
  const migrationSQL = fs.readFileSync(migrationPath, 'utf-8')
  
  console.log('📡 Executing migration via Supabase API...')
  
  const response = await fetch(
    `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/database/query`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: migrationSQL
      })
    }
  )
  
  if (!response.ok) {
    const error = await response.text()
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
  
  const result = await response.json()
  console.log('✅ Migration completed successfully!')
  console.log('Result:', JSON.stringify(result, null, 2))
}

runMigration().catch(error => {
  console.error('❌ Error:', error)
  process.exit(1)
})
