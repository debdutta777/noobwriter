'use server'

import { createClient } from '@/lib/supabase/server'

const EXCHANGE_RATE = 2000 // 2000 coins = ₹100
const RUPEES_PER_UNIT = 100 // ₹100
const MINIMUM_COINS = 20000 // Minimum coins required for exchange

/**
 * Exchange coins to INR (instant bank transfer)
 * Rate: 2000 coins = ₹100
 * Minimum: 20000 coins
 */
export async function exchangeCoinsToINR(coinAmount: number, bankDetails: {
  accountNumber: string
  ifscCode: string
  accountHolderName: string
  upiId?: string
}) {
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
        error: `Minimum ${MINIMUM_COINS} coins required for exchange` 
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

    // Create exchange transaction with FULL bank details
    // Coins will NOT be deducted until admin confirms payment
    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'coin_exchange',
        amount: inrAmount,
        coin_amount: coinAmount, // Positive - will be deducted when confirmed
        description: `Exchange request: ${coinAmount} coins → ₹${inrAmount}`,
        payment_status: 'pending',
        metadata: {
          exchange_type: 'coins_to_inr',
          exchange_rate: EXCHANGE_RATE,
          rupees_per_unit: RUPEES_PER_UNIT,
          coins_to_deduct: coinAmount, // Store for later deduction
          bank_details: {
            account_number: bankDetails.accountNumber, // Store FULL account number
            ifsc_code: bankDetails.ifscCode,
            account_holder_name: bankDetails.accountHolderName,
            upi_id: bankDetails.upiId || null, // Store UPI ID if provided
          },
          requested_at: new Date().toISOString()
        }
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating exchange transaction:', transactionError)
      return { success: false, error: 'Failed to create exchange request' }
    }

    // IMPORTANT: Coins are NOT deducted here
    // They will be deducted when admin confirms payment via confirmExchangePayment()
    
    return { 
      success: true, 
      inrAmount,
      transactionId: transaction.id,
      message: `Exchange request submitted for ₹${inrAmount}. Processing time: 1-2 business days.`
    }
  } catch (error) {
    console.error('Error in exchangeCoinsToINR:', error)
    return { success: false, error: 'Failed to process exchange request' }
  }
}

/**
 * Get exchange history
 */
export async function getExchangeHistory() {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { exchanges: null, error: 'Not authenticated' }
    }

    const { data: exchanges, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'coin_exchange')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) throw error

    return { exchanges, error: null }
  } catch (error) {
    console.error('Error fetching exchange history:', error)
    return { exchanges: null, error: 'Failed to fetch exchange history' }
  }
}

/**
 * Cancel pending exchange (by user)
 * No coins to refund since they weren't deducted yet
 */
export async function cancelExchange(transactionId: string) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .eq('type', 'coin_exchange')
      .eq('payment_status', 'pending')
      .single()

    if (txError || !transaction) {
      return { success: false, error: 'Transaction not found or already processed' }
    }

    // Update transaction status to cancelled
    // No coins to refund since they weren't deducted
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        payment_status: 'cancelled',
        metadata: {
          ...transaction.metadata,
          cancelled_at: new Date().toISOString(),
          cancelled_by: 'user'
        }
      })
      .eq('id', transactionId)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      return { success: false, error: 'Failed to cancel exchange' }
    }

    return { 
      success: true,
      message: 'Exchange request cancelled successfully' 
    }
  } catch (error) {
    console.error('Error in cancelExchange:', error)
    return { success: false, error: 'Failed to cancel exchange' }
  }
}

/**
 * ADMIN FUNCTION: Confirm payment and deduct coins
 * Call this after you've manually transferred money to user
 * REQUIRES: Admin role
 */
export async function confirmExchangePayment(
  transactionId: string,
  paymentDetails?: {
    transactionRef?: string
    paymentMethod?: 'bank_transfer' | 'upi'
    notes?: string
  }
) {
  const supabase = await createClient()

  try {
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return { 
        success: false, 
        error: 'Access denied: Admin role required' 
      }
    }
    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('type', 'coin_exchange')
      .eq('payment_status', 'pending')
      .single()

    if (txError || !transaction) {
      return { 
        success: false, 
        error: 'Transaction not found or already processed' 
      }
    }

    const userId = transaction.user_id
    const coinAmount = transaction.metadata?.coins_to_deduct || transaction.coin_amount

    // Deduct coins from user's wallet using atomic function
    const { error: deductError } = await supabase.rpc('deduct_coins', {
      p_user_id: userId,
      p_amount: coinAmount
    })

    if (deductError) {
      console.error('Error deducting coins:', deductError)
      return { 
        success: false, 
        error: 'Failed to deduct coins. User may have insufficient balance.' 
      }
    }

    // Update transaction status to completed
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        payment_status: 'completed',
        coin_amount: -coinAmount, // Now negative since coins are deducted
        metadata: {
          ...transaction.metadata,
          completed_at: new Date().toISOString(),
          payment_confirmed_by: 'admin',
          payment_details: paymentDetails || null
        }
      })
      .eq('id', transactionId)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      // Try to refund coins if update fails
      await supabase.rpc('add_coins', {
        p_user_id: userId,
        p_amount: coinAmount
      })
      return { success: false, error: 'Failed to update transaction status' }
    }

    return { 
      success: true,
      message: `Payment confirmed and ${coinAmount} coins deducted from user`,
      coinsDeducted: coinAmount
    }
  } catch (error) {
    console.error('Error in confirmExchangePayment:', error)
    return { success: false, error: 'Failed to confirm payment' }
  }
}

/**
 * ADMIN FUNCTION: Reject exchange request
 * REQUIRES: Admin role
 */
export async function rejectExchangeRequest(
  transactionId: string,
  rejectionReason: string
) {
  const supabase = await createClient()

  try {
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { success: false, error: 'Not authenticated' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return { 
        success: false, 
        error: 'Access denied: Admin role required' 
      }
    }
    // Get transaction details
    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('type', 'coin_exchange')
      .eq('payment_status', 'pending')
      .single()

    if (txError || !transaction) {
      return { 
        success: false, 
        error: 'Transaction not found or already processed' 
      }
    }

    // Update transaction status to rejected
    // No coins to refund since they weren't deducted
    const { error: updateError } = await supabase
      .from('transactions')
      .update({ 
        payment_status: 'rejected',
        metadata: {
          ...transaction.metadata,
          rejected_at: new Date().toISOString(),
          rejected_by: 'admin',
          rejection_reason: rejectionReason
        }
      })
      .eq('id', transactionId)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      return { success: false, error: 'Failed to reject exchange' }
    }

    return { 
      success: true,
      message: 'Exchange request rejected',
      reason: rejectionReason
    }
  } catch (error) {
    console.error('Error in rejectExchangeRequest:', error)
    return { success: false, error: 'Failed to reject exchange' }
  }
}

/**
 * Get all pending exchange requests (for admin)
 * REQUIRES: Admin role
 */
export async function getPendingExchanges() {
  const supabase = await createClient()

  try {
    // Verify admin access
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return { exchanges: null, error: 'Not authenticated' }
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || !profile || profile.role !== 'admin') {
      return { 
        exchanges: null, 
        error: 'Access denied: Admin role required' 
      }
    }
    const { data: exchanges, error } = await supabase
      .from('transactions')
      .select(`
        *,
        profiles:user_id (
          display_name,
          email
        )
      `)
      .eq('type', 'coin_exchange')
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error

    return { exchanges, error: null }
  } catch (error) {
    console.error('Error fetching pending exchanges:', error)
    return { exchanges: null, error: 'Failed to fetch pending exchanges' }
  }
}
