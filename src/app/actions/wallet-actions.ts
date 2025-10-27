'use server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/types/database'

type WalletInsert = Database['public']['Tables']['wallets']['Insert']
type WalletUpdate = Database['public']['Tables']['wallets']['Update']
type TransactionInsert = Database['public']['Tables']['transactions']['Insert']

// Security constants
const MIN_TIP_AMOUNT = 10
const MAX_TIP_AMOUNT = 10000
const RATE_LIMIT_WINDOW_MS = 60000 // 1 minute
const MAX_TIPS_PER_MINUTE = 10

// Helper function to check rate limit
async function checkTipRateLimit(userId: string): Promise<{ allowed: boolean; error?: string }> {
  const supabase = await createClient()
  const oneMinuteAgo = new Date(Date.now() - RATE_LIMIT_WINDOW_MS).toISOString()
  
  const { data: recentTips, error } = await supabase
    .from('transactions')
    .select('id')
    .eq('user_id', userId)
    .eq('type', 'tip')
    .gte('created_at', oneMinuteAgo)
  
  if (error) {
    console.error('Rate limit check error:', error)
    return { allowed: true } // Fail open to not block legitimate users
  }
  
  if (recentTips && recentTips.length >= MAX_TIPS_PER_MINUTE) {
    return { 
      allowed: false, 
      error: `Rate limit exceeded. Maximum ${MAX_TIPS_PER_MINUTE} tips per minute. Please wait.` 
    }
  }
  
  return { allowed: true }
}

export async function sendTip(recipientId: string, amount: number, seriesId?: string, chapterId?: string) {
  const supabase = await createClient()
  
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  if (user.id === recipientId) {
    return { success: false, error: 'You cannot tip yourself' }
  }

  // Validate tip amount with min/max limits
  if (amount < MIN_TIP_AMOUNT || amount > MAX_TIP_AMOUNT) {
    return { 
      success: false, 
      error: `Tip amount must be between ${MIN_TIP_AMOUNT} and ${MAX_TIP_AMOUNT} coins` 
    }
  }

  // Check rate limit
  const rateLimitCheck = await checkTipRateLimit(user.id)
  if (!rateLimitCheck.allowed) {
    return { success: false, error: rateLimitCheck.error || 'Rate limit exceeded' }
  }

  try {
    // Use atomic database function for tip processing
    // This ensures all operations succeed or all fail (ACID transaction)
    // No admin client needed - function has SECURITY DEFINER
    const { data, error } = await supabase.rpc('process_tip', {
      p_sender_id: user.id,
      p_recipient_id: recipientId,
      p_amount: amount,
      p_series_id: seriesId,
      p_chapter_id: chapterId
    })

    if (error) {
      console.error('Error in process_tip RPC:', error)
      return { success: false, error: 'Unable to process tip. Please try again.' }
    }

    // Check if the function returned an error
    if (data && data.length > 0) {
      const result = data[0]
      
      if (!result.success) {
        return { success: false, error: result.error_message || 'Failed to send tip' }
      }

      return { 
        success: true, 
        newBalance: result.new_sender_balance,
        error: null
      }
    }

    return { success: false, error: 'Unexpected response from server' }
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

    // Use atomic database function for chapter unlock
    // This ensures all operations succeed or all fail (ACID transaction)
    // No admin client needed - function has SECURITY DEFINER
    const { data, error } = await supabase.rpc('unlock_premium_chapter', {
      p_user_id: user.id,
      p_chapter_id: chapterId,
      p_author_id: authorId,
      p_price: actualPrice
    })

    if (error) {
      console.error('Error in unlock_premium_chapter RPC:', error)
      return { success: false, error: 'Unable to unlock chapter. Please try again.' }
    }

    // Check if the function returned an error
    if (data && data.length > 0) {
      const result = data[0]
      
      if (!result.success) {
        // Handle specific error cases
        if (result.error_message === 'Insufficient balance') {
          return { 
            success: false, 
            error: 'Insufficient balance',
            required: actualPrice
          }
        }
        
        return { success: false, error: result.error_message || 'Failed to unlock chapter' }
      }

      return { 
        success: true, 
        newBalance: result.new_user_balance,
        message: 'Chapter unlocked successfully'
      }
    }

    return { success: false, error: 'Unexpected response from server' }
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
