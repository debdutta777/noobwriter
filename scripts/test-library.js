require('dotenv').config({ path: '.env' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testLibrary() {
  console.log('🔍 Testing Library Functionality\n')

  // Get any user ID from the database
  const { data: users } = await supabase
    .from('profiles')
    .select('id, email, display_name')
    .limit(1)

  if (!users || users.length === 0) {
    console.log('⚠️  No users found in database')
    return
  }

  const testUser = users[0]
  console.log(`📧 Testing with user: ${testUser.email || testUser.display_name}`)
  console.log(`   User ID: ${testUser.id}\n`)

  // Test favorites query
  console.log('1️⃣  Testing Favorites Query:')
  const { data: favorites, error: favError } = await supabase
    .from('favorites')
    .select('*, series(*)')
    .eq('user_id', testUser.id)

  if (favError) {
    console.log('   ❌ Error:', favError.message)
  } else {
    console.log(`   ✅ Found ${favorites.length} favorites`)
    if (favorites.length > 0) {
      console.log('   Sample:', JSON.stringify(favorites[0], null, 2))
    }
  }

  // Test reading progress query
  console.log('\n2️⃣  Testing Reading Progress Query:')
  const { data: progress, error: progError } = await supabase
    .from('reading_progress')
    .select('*, series(*), chapters(*)')
    .eq('user_id', testUser.id)
    .order('last_read_at', { ascending: false })
    .limit(5)

  if (progError) {
    console.log('   ❌ Error:', progError.message)
  } else {
    console.log(`   ✅ Found ${progress.length} reading progress records`)
    if (progress.length > 0) {
      console.log('   Sample:', JSON.stringify(progress[0], null, 2))
    }
  }

  // Test wallet query
  console.log('\n3️⃣  Testing Wallet Query:')
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', testUser.id)
    .single()

  if (walletError) {
    console.log('   ❌ Error:', walletError.message)
  } else if (!wallet) {
    console.log('   ⚠️  No wallet found for user')
  } else {
    console.log(`   ✅ Wallet balance: ${wallet.coin_balance} coins`)
  }

  // Test transactions query
  console.log('\n4️⃣  Testing Transactions Query:')
  const { data: transactions, error: txError } = await supabase
    .from('transactions')
    .select('*')
    .eq('user_id', testUser.id)
    .order('created_at', { ascending: false })
    .limit(5)

  if (txError) {
    console.log('   ❌ Error:', txError.message)
  } else {
    console.log(`   ✅ Found ${transactions.length} transactions`)
  }

  // Check if favorites table structure is correct
  console.log('\n5️⃣  Checking Favorites Table Structure:')
  const { data: favSample } = await supabase
    .from('favorites')
    .select('*')
    .limit(1)

  if (favSample && favSample.length > 0) {
    console.log('   Columns:', Object.keys(favSample[0]))
  } else {
    console.log('   ⚠️  No favorites in database to check structure')
  }
}

testLibrary().catch(console.error)
