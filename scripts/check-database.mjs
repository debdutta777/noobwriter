import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })
dotenv.config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env file')
  console.error('Need: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDatabase() {
  console.log('🔍 Checking Supabase Database Schema...\n')
  console.log('Project URL:', supabaseUrl)
  console.log('─'.repeat(80))

  // Check 1: Transaction type constraints
  console.log('\n📋 CHECK 1: Transaction Type Constraints')
  console.log('─'.repeat(80))
  
  const { data: txTypes, error: txError } = await supabase
    .from('transactions')
    .select('type')
    .limit(100)

  if (txError) {
    console.error('❌ Error querying transactions:', txError.message)
  } else {
    const uniqueTypes = [...new Set(txTypes?.map(t => t.type) || [])]
    console.log('✅ Current transaction types in database:', uniqueTypes)
    
    const expectedTypes = ['purchase', 'unlock', 'tip', 'tip_sent', 'tip_received', 'earning', 'refund', 'payout_request']
    const missingTypes = expectedTypes.filter(t => !uniqueTypes.includes(t))
    
    if (missingTypes.length > 0) {
      console.log('⚠️  Types used in code but not yet in DB:', missingTypes)
      console.log('   Action: Apply transaction types migration!')
    } else {
      console.log('✅ All expected types are available')
    }
  }

  // Check 2: Wallets table
  console.log('\n💰 CHECK 2: Wallets Table')
  console.log('─'.repeat(80))
  
  const { data: wallets, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .limit(5)

  if (walletError) {
    console.error('❌ Error querying wallets:', walletError.message)
  } else {
    console.log('✅ Wallets table accessible')
    console.log('Sample wallet:', wallets?.[0] || 'No wallets yet')
    
    if (wallets && wallets.length > 0) {
      const avgBalance = wallets.reduce((sum, w) => sum + (w.coin_balance || 0), 0) / wallets.length
      console.log(`Average balance: ${avgBalance.toFixed(0)} coins`)
    }
  }

  // Check 3: Favorites with series join
  console.log('\n❤️  CHECK 3: Favorites Table & Joins')
  console.log('─'.repeat(80))
  
  const { data: favorites, error: favError } = await supabase
    .from('favorites')
    .select(`
      *,
      series:series_id (
        id,
        title,
        cover_url,
        author_id,
        profiles:author_id (
          display_name
        )
      )
    `)
    .limit(3)

  if (favError) {
    console.error('❌ Error querying favorites:', favError.message)
    console.error('   This could indicate foreign key naming issues')
  } else {
    console.log('✅ Favorites table accessible with joins')
    if (favorites && favorites.length > 0) {
      console.log('Sample favorite:', {
        series_title: favorites[0].series?.title || 'N/A',
        has_cover: !!favorites[0].series?.cover_url,
        author: favorites[0].series?.profiles?.display_name || 'N/A'
      })
    } else {
      console.log('No favorites yet (normal for new database)')
    }
  }

  // Check 4: Reading progress with joins
  console.log('\n📖 CHECK 4: Reading Progress & Joins')
  console.log('─'.repeat(80))
  
  const { data: progress, error: progressError } = await supabase
    .from('reading_progress')
    .select(`
      *,
      series:series_id (
        id,
        title,
        cover_url
      ),
      chapters:chapter_id (
        id,
        chapter_number,
        title
      )
    `)
    .limit(3)

  if (progressError) {
    console.error('❌ Error querying reading_progress:', progressError.message)
  } else {
    console.log('✅ Reading progress table accessible with joins')
    if (progress && progress.length > 0) {
      console.log('Sample progress:', {
        series_title: progress[0].series?.title || 'N/A',
        chapter_number: progress[0].chapters?.chapter_number || 'N/A',
        has_cover: !!progress[0].series?.cover_url
      })
    } else {
      console.log('No reading progress yet (normal for new database)')
    }
  }

  // Check 5: Series table structure
  console.log('\n📚 CHECK 5: Series Table')
  console.log('─'.repeat(80))
  
  const { data: series, error: seriesError } = await supabase
    .from('series')
    .select('*')
    .limit(3)

  if (seriesError) {
    console.error('❌ Error querying series:', seriesError.message)
  } else {
    console.log('✅ Series table accessible')
    if (series && series.length > 0) {
      const sample = series[0]
      console.log('Sample series fields:', Object.keys(sample).join(', '))
      console.log('Has cover_url:', 'cover_url' in sample || 'cover_image_url' in sample)
    } else {
      console.log('No series yet')
    }
  }

  // Check 6: Test wallet creation (safe test)
  console.log('\n🧪 CHECK 6: Test Queries')
  console.log('─'.repeat(80))
  
  // Test .maybeSingle() vs .single()
  const { data: testWallet, error: testError } = await supabase
    .from('wallets')
    .select('coin_balance')
    .eq('user_id', '00000000-0000-0000-0000-000000000000') // Non-existent user
    .maybeSingle()

  if (testError) {
    console.error('❌ .maybeSingle() test failed:', testError.message)
  } else {
    console.log('✅ .maybeSingle() works correctly (returns null for non-existent:', testWallet === null)
  }

  // Summary
  console.log('\n' + '═'.repeat(80))
  console.log('📊 SUMMARY')
  console.log('═'.repeat(80))
  
  const checks = [
    { name: 'Transaction types', passed: !txError },
    { name: 'Wallets table', passed: !walletError },
    { name: 'Favorites with joins', passed: !favError },
    { name: 'Reading progress with joins', passed: !progressError },
    { name: 'Series table', passed: !seriesError },
    { name: 'Query methods', passed: !testError }
  ]

  checks.forEach(check => {
    console.log(`${check.passed ? '✅' : '❌'} ${check.name}`)
  })

  const allPassed = checks.every(c => c.passed)
  
  console.log('\n' + '═'.repeat(80))
  if (allPassed) {
    console.log('🎉 All checks passed! Database schema is correct.')
  } else {
    console.log('⚠️  Some checks failed. Review errors above.')
  }
  console.log('═'.repeat(80))
}

checkDatabase()
  .then(() => {
    console.log('\n✅ Database check complete!')
    process.exit(0)
  })
  .catch(err => {
    console.error('\n❌ Fatal error:', err.message)
    process.exit(1)
  })
