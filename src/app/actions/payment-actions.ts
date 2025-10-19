'use server'

import { createClient } from '@/lib/supabase/server'
import { razorpay } from '@/lib/razorpay/config'
import crypto from 'crypto'

export async function createRazorpayOrder(amount: number, coinPackageId: string) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: amount * 100, // Convert to paise (₹99 = 9900 paise)
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`, // Keep it short (max 40 chars)
      notes: {
        user_id: user.id,
        package_id: coinPackageId,
      }
    })

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    }
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error)
    return { error: error.message || 'Failed to create order' }
  }
}

export async function verifyRazorpayPayment(
  orderId: string,
  paymentId: string,
  signature: string,
  coinAmount: number,
  packagePrice: number,
  packageId: string
) {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return { error: 'Not authenticated' }
  }

  try {
    // Verify signature
    const text = orderId + '|' + paymentId
    const generatedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(text)
      .digest('hex')

    if (generatedSignature !== signature) {
      return { error: 'Invalid signature' }
    }

    // Get current wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (!wallet) {
      return { error: 'Wallet not found' }
    }

    // Update wallet balance
    const { error: walletError } = await supabase
      .from('wallets')
      .update({ 
        coin_balance: wallet.coin_balance + coinAmount,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', user.id)

    if (walletError) {
      console.error('Wallet update error:', walletError)
      return { error: 'Failed to update wallet' }
    }

    // Create transaction record
    const { error: txnError } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        type: 'purchase',
        amount: packagePrice,
        coin_amount: coinAmount,
        description: `Purchased ${coinAmount} coins`,
        payment_status: 'completed',
        razorpay_order_id: orderId,
        razorpay_payment_id: paymentId,
        metadata: {
          package_id: packageId,
          signature: signature,
        }
      })

    if (txnError) {
      console.error('Transaction error:', txnError)
      return { error: 'Failed to create transaction' }
    }

    return { 
      success: true, 
      newBalance: wallet.coin_balance + coinAmount 
    }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return { error: error.message || 'Payment verification failed' }
  }
}
