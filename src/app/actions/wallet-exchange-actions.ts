'use server'

import { createClient } from '@/lib/supabase/server'

const EXCHANGE_RATE = 2000 // 2000 coins = ₹100
const RUPEES_PER_UNIT = 100
const MINIMUM_COINS = 20000

// Exchange requests reuse the payout_request transaction type (the only one that
// passes the DB CHECK constraint) and are distinguished from regular payouts via
// metadata.flow = 'exchange'.
const EXCHANGE_FLOW = 'exchange'

/**
 * Exchange coins to INR. Coins are held (not deducted) until admin confirms.
 */
export async function exchangeCoinsToINR(
  coinAmount: number,
  bankDetails: {
    accountNumber: string
    ifscCode: string
    accountHolderName: string
    upiId?: string
  },
) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: 'Not authenticated' }

    if (coinAmount < MINIMUM_COINS) {
      return { success: false, error: `Minimum ${MINIMUM_COINS} coins required for exchange` }
    }

    if (coinAmount % EXCHANGE_RATE !== 0) {
      return {
        success: false,
        error: `Coin amount must be divisible by ${EXCHANGE_RATE} (${EXCHANGE_RATE} coins = ₹${RUPEES_PER_UNIT})`,
      }
    }

    const { data: wallet, error: walletError } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (walletError || !wallet) return { success: false, error: 'Wallet not found' }

    if (wallet.coin_balance < coinAmount) {
      return { success: false, error: `Insufficient coins. You have ${wallet.coin_balance} coins.` }
    }

    const inrAmount = (coinAmount / EXCHANGE_RATE) * RUPEES_PER_UNIT

    const { data: transaction, error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'payout_request',
        amount: inrAmount,
        coin_amount: coinAmount,
        description: `Exchange request: ${coinAmount} coins → ₹${inrAmount}`,
        payment_status: 'pending',
        metadata: {
          flow: EXCHANGE_FLOW,
          exchange_type: 'coins_to_inr',
          exchange_rate: EXCHANGE_RATE,
          rupees_per_unit: RUPEES_PER_UNIT,
          coins_to_deduct: coinAmount,
          bank_details: {
            account_number: bankDetails.accountNumber,
            ifsc_code: bankDetails.ifscCode,
            account_holder_name: bankDetails.accountHolderName,
            upi_id: bankDetails.upiId || null,
          },
          requested_at: new Date().toISOString(),
        },
      })
      .select()
      .single()

    if (transactionError) {
      console.error('Error creating exchange transaction:', transactionError)
      return { success: false, error: 'Failed to create exchange request' }
    }

    return {
      success: true,
      inrAmount,
      transactionId: transaction.id,
      message: `Exchange request submitted for ₹${inrAmount}. Processing time: 1-2 business days.`,
    }
  } catch (error) {
    console.error('Error in exchangeCoinsToINR:', error)
    return { success: false, error: 'Failed to process exchange request' }
  }
}

export async function getExchangeHistory() {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { exchanges: null, error: 'Not authenticated' }

    const { data: exchanges, error } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .eq('type', 'payout_request')
      .eq('metadata->>flow', EXCHANGE_FLOW)
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
 * User-initiated cancel of a pending exchange request. No coin movement because
 * coins were never deducted — we just mark the request as refunded.
 */
export async function cancelExchange(transactionId: string) {
  const supabase = await createClient()

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) return { success: false, error: 'Not authenticated' }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('user_id', user.id)
      .eq('type', 'payout_request')
      .eq('metadata->>flow', EXCHANGE_FLOW)
      .eq('payment_status', 'pending')
      .single()

    if (txError || !transaction) {
      return { success: false, error: 'Transaction not found or already processed' }
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        payment_status: 'refunded',
        metadata: {
          ...(transaction.metadata as Record<string, unknown>),
          cancelled_at: new Date().toISOString(),
          cancelled_by: 'user',
        },
      })
      .eq('id', transactionId)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      return { success: false, error: 'Failed to cancel exchange' }
    }

    return { success: true, message: 'Exchange request cancelled successfully' }
  } catch (error) {
    console.error('Error in cancelExchange:', error)
    return { success: false, error: 'Failed to cancel exchange' }
  }
}

async function assertAdmin(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) return { ok: false as const, error: 'Not authenticated' }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profileError || !profile || profile.role !== 'admin') {
    return { ok: false as const, error: 'Access denied: Admin role required' }
  }
  return { ok: true as const, user }
}

/**
 * ADMIN: confirm exchange payment, deduct coins atomically.
 */
export async function confirmExchangePayment(
  transactionId: string,
  paymentDetails?: {
    transactionRef?: string
    paymentMethod?: 'bank_transfer' | 'upi'
    notes?: string
  },
) {
  const supabase = await createClient()

  try {
    const auth = await assertAdmin(supabase)
    if (!auth.ok) return { success: false, error: auth.error }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('type', 'payout_request')
      .eq('metadata->>flow', EXCHANGE_FLOW)
      .eq('payment_status', 'pending')
      .single()

    if (txError || !transaction) {
      return { success: false, error: 'Transaction not found or already processed' }
    }

    const userId = transaction.user_id
    const metadata = (transaction.metadata ?? {}) as Record<string, unknown>
    const coinAmount = Number(metadata.coins_to_deduct ?? transaction.coin_amount ?? 0)

    if (!coinAmount) return { success: false, error: 'Invalid coin amount' }

    const { error: deductError } = await supabase.rpc('deduct_coins_from_wallet', {
      p_user_id: userId,
      p_coins: coinAmount,
    })

    if (deductError) {
      console.error('Error deducting coins:', deductError)
      return { success: false, error: 'Failed to deduct coins. User may have insufficient balance.' }
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        payment_status: 'completed',
        coin_amount: -coinAmount,
        metadata: {
          ...metadata,
          completed_at: new Date().toISOString(),
          payment_confirmed_by: 'admin',
          payment_details: paymentDetails || null,
        },
      })
      .eq('id', transactionId)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      // Best-effort refund if we managed to deduct but failed to record.
      await supabase.rpc('add_coins_to_wallet', {
        p_user_id: userId,
        p_coins: coinAmount,
      })
      return { success: false, error: 'Failed to update transaction status' }
    }

    return {
      success: true,
      message: `Payment confirmed and ${coinAmount} coins deducted from user`,
      coinsDeducted: coinAmount,
    }
  } catch (error) {
    console.error('Error in confirmExchangePayment:', error)
    return { success: false, error: 'Failed to confirm payment' }
  }
}

/**
 * ADMIN: reject an exchange request. No coin movement (coins were never taken).
 */
export async function rejectExchangeRequest(transactionId: string, rejectionReason: string) {
  const supabase = await createClient()

  try {
    const auth = await assertAdmin(supabase)
    if (!auth.ok) return { success: false, error: auth.error }

    const { data: transaction, error: txError } = await supabase
      .from('transactions')
      .select('*')
      .eq('id', transactionId)
      .eq('type', 'payout_request')
      .eq('metadata->>flow', EXCHANGE_FLOW)
      .eq('payment_status', 'pending')
      .single()

    if (txError || !transaction) {
      return { success: false, error: 'Transaction not found or already processed' }
    }

    const { error: updateError } = await supabase
      .from('transactions')
      .update({
        payment_status: 'failed',
        metadata: {
          ...((transaction.metadata ?? {}) as Record<string, unknown>),
          rejected_at: new Date().toISOString(),
          rejected_by: 'admin',
          rejection_reason: rejectionReason,
        },
      })
      .eq('id', transactionId)

    if (updateError) {
      console.error('Error updating transaction:', updateError)
      return { success: false, error: 'Failed to reject exchange' }
    }

    return { success: true, message: 'Exchange request rejected', reason: rejectionReason }
  } catch (error) {
    console.error('Error in rejectExchangeRequest:', error)
    return { success: false, error: 'Failed to reject exchange' }
  }
}

/**
 * ADMIN: list all pending exchange requests.
 */
export async function getPendingExchanges() {
  const supabase = await createClient()

  try {
    const auth = await assertAdmin(supabase)
    if (!auth.ok) return { exchanges: null, error: auth.error }

    const { data: exchanges, error } = await supabase
      .from('transactions')
      .select(`
        *,
        profiles:user_id (
          display_name,
          email
        )
      `)
      .eq('type', 'payout_request')
      .eq('metadata->>flow', EXCHANGE_FLOW)
      .eq('payment_status', 'pending')
      .order('created_at', { ascending: true })

    if (error) throw error

    return { exchanges, error: null }
  } catch (error) {
    console.error('Error fetching pending exchanges:', error)
    return { exchanges: null, error: 'Failed to fetch pending exchanges' }
  }
}
