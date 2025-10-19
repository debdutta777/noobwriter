'use server'

import { createClient } from '@/lib/supabase/server'
import crypto from 'crypto'

export async function getUserWallet() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { wallet: null, error: 'Not authenticated' }
  }

  const { data: wallet, error } = await supabase
    .from('wallets')
    .select('*')
    .eq('user_id', user.id)
    .single()

  if (error) {
    return { wallet: null, error: error.message }
  }

  return { wallet, error: null }
}

export async function createCoinPurchase(coins: number, amount: number) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Create Razorpay order
    const razorpay = await import('razorpay')
    const instance = new razorpay.default({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await instance.orders.create({
      amount: amount * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${Date.now()}`,
      notes: {
        user_id: user.id,
        coins: coins.toString(),
      },
    })

    // Create payment record
    await supabase
      .from('payments')
      .insert({
        user_id: user.id,
        amount: amount,
        payment_method: 'razorpay',
        razorpay_order_id: order.id,
        status: 'pending',
      })

    return {
      success: true,
      orderId: order.id,
      userEmail: user.email,
    }
  } catch (error) {
    console.error('Failed to create order:', error)
    return {
      success: false,
      error: 'Failed to create payment order',
    }
  }
}

export async function verifyPayment(
  orderId: string,
  paymentId: string,
  signature: string
) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  
  if (authError || !user) {
    return { success: false, error: 'Not authenticated' }
  }

  try {
    // Verify signature
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(`${orderId}|${paymentId}`)
      .digest('hex')

    if (generatedSignature !== signature) {
      return { success: false, error: 'Invalid signature' }
    }

    // Get payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .select('*')
      .eq('razorpay_order_id', orderId)
      .eq('user_id', user.id)
      .single()

    if (paymentError || !payment) {
      return { success: false, error: 'Payment record not found' }
    }

    // Update payment status
    await supabase
      .from('payments')
      .update({
        razorpay_payment_id: paymentId,
        razorpay_signature: signature,
        status: 'completed',
      })
      .eq('id', payment.id)

    // Get coins from Razorpay order notes
    const razorpay = await import('razorpay')
    const instance = new razorpay.default({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    })

    const order = await instance.orders.fetch(orderId)
    const coins = parseInt(String(order.notes?.coins || '0'))

    // Add coins to wallet
    const { data: wallet } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (wallet) {
      await supabase
        .from('wallets')
        .update({
          coin_balance: wallet.coin_balance + coins,
        })
        .eq('user_id', user.id)

      // Record transaction
      await supabase
        .from('transactions')
        .insert({
          user_id: user.id,
          amount: coins,
          transaction_type: 'coin_purchase',
          description: `Purchased ${coins} coins`,
          status: 'completed',
        })
    }

    return { success: true }
  } catch (error) {
    console.error('Payment verification failed:', error)
    return { success: false, error: 'Payment verification failed' }
  }
}
