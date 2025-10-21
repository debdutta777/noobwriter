'use server'

import { createClient } from '@/lib/supabase/server'

const EXCHANGE_RATE = 300 // 300 coins = ₹100
const RUPEES_PER_UNIT = 100 // ₹100
const MINIMUM_COINS = 3000 // Minimum coins required to request payout

export interface PayoutRequest {
  id: string
  user_id: string
  coin_amount: number
  inr_amount: number
  status: 'pending' | 'processing' | 'completed' | 'rejected'
  payment_method?: string
  payment_details?: any
  created_at: string
  processed_at?: string
  rejection_reason?: string
}

/**
 * Request a payout for coins
 * Exchange rate: 300 coins = ₹100
 * Minimum: 3000 coins
 */
export async function requestPayout(coinAmount: number) {
  const supabase = await createClient()

  try {
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Validate coin amount
    if (coinAmount < MINIMUM_COINS) {
      return { 
        success: false, 
        error: `Minimum ${MINIMUM_COINS} coins required for payout` 
      }
    }

    // Check if amount is divisible by exchange rate
    if (coinAmount % EXCHANGE_RATE !== 0) {
      return { 
        success: false, 
        error: `Coin amount must be divisible by ${EXCHANGE_RATE} (${EXCHANGE_RATE} coins = ₹${RUPEES_PER_UNIT})` 
      }
    }

    // Get user's wallet
    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return { success: false, error: 'Wallet not found' }
    }

    // Check if user has enough coins
    if (wallet.coin_balance < coinAmount) {
      return { 
        success: false, 
        error: `Insufficient coins. You have ${wallet.coin_balance} coins.` 
      }
    }

    // Calculate INR amount
    const inrAmount = (coinAmount / EXCHANGE_RATE) * RUPEES_PER_UNIT

    // Create payout request transaction
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'payout_request',
        amount: inrAmount,
        coin_amount: -coinAmount, // Negative because coins are being withdrawn
        description: `Payout request: ${coinAmount} coins → ₹${inrAmount}`,
        payment_status: 'pending',
        metadata: {
          payout_status: 'pending',
          exchange_rate: EXCHANGE_RATE,
          rupees_per_unit: RUPEES_PER_UNIT
        }
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating payout transaction:', transactionError)
      return { success: false, error: 'Failed to create payout request' }
    }

    // Deduct coins from wallet
    const { error: updateError } = await supabase
      .from('wallets')
      .update({ 
        coin_balance: wallet.coin_balance - coinAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (updateError) {
      console.error('Error updating wallet:', updateError)
      // Rollback transaction if wallet update fails
      await supabase
        .from('transactions')
        .delete()
        .eq('id', transaction.id)
      return { success: false, error: 'Failed to process payout request' }
    }

    return { 
      success: true, 
      error: null,
      payoutId: transaction.id,
      inrAmount 
    }
  } catch (error: any) {
    console.error('Error requesting payout:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Get all payout requests for current user
 */
export async function getPayoutHistory() {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { payouts: [], error: 'Not authenticated' }
    }

    const { data: payouts, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'payout_request')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching payout history:', error)
      return { payouts: [], error: error.message }
    }

    return { payouts: payouts || [], error: null }
  } catch (error: any) {
    console.error('Error fetching payout history:', error)
    return { payouts: [], error: error.message }
  }
}

/**
 * Get current wallet balance and calculate available INR value
 */
export async function getPayoutInfo() {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { 
        coinBalance: 0, 
        availableInr: 0, 
        canRequestPayout: false,
        error: 'Not authenticated' 
      }
    }

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) {
      return { 
        coinBalance: 0, 
        availableInr: 0, 
        canRequestPayout: false,
        error: 'Wallet not found' 
      }
    }

    const coinBalance = wallet.coin_balance
    const availableInr = Math.floor(coinBalance / EXCHANGE_RATE) * RUPEES_PER_UNIT
    const canRequestPayout = coinBalance >= MINIMUM_COINS

    return {
      coinBalance,
      availableInr,
      canRequestPayout,
      minimumCoins: MINIMUM_COINS,
      exchangeRate: EXCHANGE_RATE,
      rupeesPerUnit: RUPEES_PER_UNIT,
      error: null
    }
  } catch (error: any) {
    console.error('Error fetching payout info:', error)
    return { 
      coinBalance: 0, 
      availableInr: 0, 
      canRequestPayout: false,
      error: error.message 
    }
  }
}

/**
 * Cancel a pending payout request and refund coins
 */
export async function cancelPayoutRequest(transactionId: string) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get the transaction
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .eq('type', 'payout_request')
      .single()

    if (txError || !transaction) {
      return { success: false, error: 'Transaction not found' }
    }

    // Check if payout is still pending
    if (transaction.payment_status !== 'pending') {
      return { 
        success: false, 
        error: `Cannot cancel payout with status: ${transaction.payment_status}` 
      }
    }

    // Refund coins to wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (!wallet) {
      return { success: false, error: 'Wallet not found' }
    }

    const refundAmount = Math.abs(transaction.coin_amount)

    // Update wallet balance
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        coin_balance: wallet.coin_balance + refundAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (walletError) {
      return { success: false, error: 'Failed to refund coins' }
    }

    // Update transaction status
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        payment_status: 'cancelled',
        metadata: {
          ...transaction.metadata,
          cancelled_at: new Date().toISOString(),
          refunded: true
        }
      })
      .eq('id', transactionId)

    if (updateError) {
      return { success: false, error: 'Failed to cancel payout' }
    }

    return { success: true, error: null, refundAmount }
  } catch (error: any) {
    console.error('Error cancelling payout:', error)
    return { success: false, error: error.message }
  }
}
