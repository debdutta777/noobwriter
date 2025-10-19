'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function unlockChapter(chapterId: string, coinCost: number) {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'You must be logged in to unlock chapters' }
  }

  // Start a transaction-like process
  // 1. Check user's coin balance
  const { data: wallet, error: walletError } = await supabase
    .from('wallets')
    .select('coin_balance')
    .eq('user_id', user.id)
    .single()

  if (walletError || !wallet) {
    return { success: false, error: 'Failed to fetch wallet information' }
  }

  if (wallet.coin_balance < coinCost) {
    return { success: false, error: 'Insufficient coins' }
  }

  // 2. Check if already unlocked
  const { data: existingUnlock } = await supabase
    .from('unlocked_chapters')
    .select('id')
    .eq('user_id', user.id)
    .eq('chapter_id', chapterId)
    .single()

  if (existingUnlock) {
    return { success: false, error: 'Chapter already unlocked' }
  }

  // 3. Deduct coins from wallet
  const { error: deductError } = await supabase
    .from('wallets')
    .update({ 
      coin_balance: wallet.coin_balance - coinCost 
    })
    .eq('user_id', user.id)

  if (deductError) {
    return { success: false, error: 'Failed to process payment' }
  }

  // 4. Create unlocked chapter record
  const { error: unlockError } = await supabase
    .from('unlocked_chapters')
    .insert({
      user_id: user.id,
      chapter_id: chapterId,
    })

  if (unlockError) {
    // Rollback: Add coins back
    await supabase
      .from('wallets')
      .update({ 
        coin_balance: wallet.coin_balance 
      })
      .eq('user_id', user.id)
    
    return { success: false, error: 'Failed to unlock chapter' }
  }

  // 5. Record transaction
  await supabase
    .from('transactions')
    .insert({
      user_id: user.id,
      amount: -coinCost,
      transaction_type: 'chapter_unlock',
      description: `Unlocked chapter`,
      status: 'completed',
    })

  revalidatePath('/read/[seriesId]/[chapterNumber]', 'page')
  
  return { success: true }
}

export async function checkChapterUnlocked(chapterId: string, userId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('unlocked_chapters')
    .select('id')
    .eq('user_id', userId)
    .eq('chapter_id', chapterId)
    .single()

  return { isUnlocked: !!data && !error }
}
