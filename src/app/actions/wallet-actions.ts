'use server'

import { createClient } from '@/lib/supabase/server'

export async function sendTip(recipientId: string, amount: number, seriesId?: string, chapterId?: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  if (user.id === recipientId) {
    return { success: false, error: 'You cannot tip yourself' }
  }

  if (amount <= 0) {
    return { success: false, error: 'Invalid tip amount' }
  }

  try {
    // Get sender's wallet
    const { data: senderWallet, error: senderError } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (senderError || !senderWallet) {
      return { success: false, error: 'Wallet not found' }
    }

    if (senderWallet.coin_balance < amount) {
      return { success: false, error: 'Insufficient balance', required: amount, current: senderWallet.coin_balance }
    }

    // Get recipient's wallet (or create if doesn't exist)
    let { data: recipientWallet, error: recipientError } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', recipientId)
      .maybeSingle()

    if (!recipientWallet) {
      // Create wallet for recipient if it doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: recipientId,
          coin_balance: 0,
        })
        .select('coin_balance')
        .single()

      if (createError) {
        console.error('Error creating recipient wallet:', createError)
        return { success: false, error: 'Failed to create recipient wallet' }
      }

      recipientWallet = newWallet
    }

    // Deduct from sender
    const { error: deductError } = await supabase
      .from('wallets')
      .update({ 
        coin_balance: senderWallet.coin_balance - amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (deductError) {
      console.error('Error deducting from sender:', deductError)
      return { success: false, error: 'Failed to deduct coins' }
    }

    // Add to recipient
    const { error: addError } = await supabase
      .from('wallets')
      .update({ 
        coin_balance: recipientWallet.coin_balance + amount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', recipientId)

    if (addError) {
      console.error('Error adding to recipient:', addError)
      // Rollback sender deduction
      await supabase
        .from('wallets')
        .update({ 
          coin_balance: senderWallet.coin_balance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      return { success: false, error: 'Failed to add coins to recipient' }
    }

    // Create sender transaction
    const { error: senderTxError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'tip_sent',
        amount: -amount,
        coin_amount: -amount,
        description: `Tip sent to author`,
        payment_status: 'completed',
        metadata: {
          recipient_id: recipientId,
          series_id: seriesId,
          chapter_id: chapterId,
        }
      })

    if (senderTxError) {
      console.error('Error creating sender transaction:', senderTxError)
    }

    // Create recipient transaction
    const { error: recipientTxError } = await supabase
      .from('transactions')
      .insert({
        user_id: recipientId,
        type: 'tip_received',
        amount: amount,
        coin_amount: amount,
        description: `Tip received from reader`,
        payment_status: 'completed',
        metadata: {
          sender_id: user.id,
          series_id: seriesId,
          chapter_id: chapterId,
        }
      })

    if (recipientTxError) {
      console.error('Error creating recipient transaction:', recipientTxError)
    }

    return { 
      success: true, 
      newBalance: senderWallet.coin_balance - amount,
      error: null
    }
  } catch (error) {
    console.error('Error in sendTip:', error)
    return { success: false, error: 'Failed to send tip' }
  }
}

export async function unlockPremiumChapter(chapterId: string, price: number) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Check if already unlocked
    const { data: existing } = await supabase
      .from('chapter_unlocks')
      .select('id')
      .eq('user_id', user.id)
      .eq('chapter_id', chapterId)
      .single()

    if (existing) {
      return { success: true, message: 'Chapter already unlocked', alreadyUnlocked: true }
    }

    // Get chapter and author info
    const { data: chapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*, series(author_id)')
      .eq('id', chapterId)
      .single()

    if (chapterError || !chapter) {
      return { success: false, error: 'Chapter not found' }
    }

    if (!chapter.is_premium) {
      return { success: false, error: 'Chapter is not premium' }
    }

    const actualPrice = chapter.coin_price || price
    const authorId = chapter.series?.author_id

    if (!authorId) {
      return { success: false, error: 'Author not found' }
    }

    // Get user's wallet
    const { data: userWallet, error: walletError } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (walletError || !userWallet) {
      return { success: false, error: 'Wallet not found' }
    }

    if (userWallet.coin_balance < actualPrice) {
      return { 
        success: false, 
        error: 'Insufficient balance', 
        required: actualPrice, 
        current: userWallet.coin_balance 
      }
    }

    // Get author's wallet (or create if doesn't exist)
    let { data: authorWallet } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', authorId)
      .maybeSingle()

    if (!authorWallet) {
      // Create wallet for author if it doesn't exist
      const { data: newWallet, error: createError } = await supabase
        .from('wallets')
        .insert({
          user_id: authorId,
          coin_balance: 0,
        })
        .select('coin_balance')
        .single()

      if (createError) {
        console.error('Error creating author wallet:', createError)
        return { success: false, error: 'Failed to create author wallet' }
      }

      authorWallet = newWallet
    }

    // Deduct from user
    const { error: deductError } = await supabase
      .from('wallets')
      .update({ 
        coin_balance: userWallet.coin_balance - actualPrice,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (deductError) {
      console.error('Error deducting coins:', deductError)
      return { success: false, error: 'Failed to deduct coins' }
    }

    // Add to author
    const { error: addError } = await supabase
      .from('wallets')
      .update({ 
        coin_balance: authorWallet.coin_balance + actualPrice,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', authorId)

    if (addError) {
      console.error('Error adding to author:', addError)
      // Rollback user deduction
      await supabase
        .from('wallets')
        .update({ 
          coin_balance: userWallet.coin_balance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
      return { success: false, error: 'Failed to process payment' }
    }

    // Create unlock record
    const { error: unlockError } = await supabase
      .from('chapter_unlocks')
      .insert({
        user_id: user.id,
        chapter_id: chapterId,
      })

    if (unlockError) {
      console.error('Error creating unlock record:', unlockError)
      // Note: Coins are already transferred, just log the error
    }

    // Create user transaction
    const { error: userTxError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'chapter_unlock',
        amount: -actualPrice,
        coin_amount: -actualPrice,
        description: `Unlocked premium chapter`,
        payment_status: 'completed',
        metadata: {
          chapter_id: chapterId,
          author_id: authorId,
        }
      })

    if (userTxError) {
      console.error('Error creating user transaction:', userTxError)
    }

    // Create author transaction
    const { error: authorTxError } = await supabase
      .from('transactions')
      .insert({
        user_id: authorId,
        type: 'chapter_sale',
        amount: actualPrice,
        coin_amount: actualPrice,
        description: `Chapter sale`,
        payment_status: 'completed',
        metadata: {
          chapter_id: chapterId,
          buyer_id: user.id,
        }
      })

    if (authorTxError) {
      console.error('Error creating author transaction:', authorTxError)
    }

    return { 
      success: true, 
      newBalance: userWallet.coin_balance - actualPrice,
      error: null
    }
  } catch (error) {
    console.error('Error in unlockPremiumChapter:', error)
    return { success: false, error: 'Failed to unlock chapter' }
  }
}

export async function getWalletBalance() {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { balance: 0, error: 'Not authenticated' }
  }

  try {
    const { data: wallet, error } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (error || !wallet) {
      return { balance: 0, error: 'Wallet not found' }
    }

    return { balance: wallet.coin_balance, error: null }
  } catch (error) {
    console.error('Error getting wallet balance:', error)
    return { balance: 0, error: 'Failed to get balance' }
  }
}
