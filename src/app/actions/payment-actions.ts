'use server'

import { createClient } from '@/lib/supabase/server'
import { getRazorpay } from '@/lib/razorpay/config'
import { getPackageById } from '@/lib/coin-packages'
import crypto from 'crypto'

export async function createRazorpayOrder(packageId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const pkg = getPackageById(packageId)
  if (!pkg) return { error: 'Invalid package' }

  try {
    const order = await getRazorpay().orders.create({
      amount: pkg.price * 100,
      currency: 'INR',
      receipt: `rcpt_${Date.now()}`,
      notes: {
        user_id: user.id,
        package_id: pkg.id,
        coins: String(pkg.amount + pkg.bonus),
        price: String(pkg.price),
      },
    })

    return {
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      packageId: pkg.id,
      totalCoins: pkg.amount + pkg.bonus,
      price: pkg.price,
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
  packageId: string,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Not authenticated' }

  const pkg = getPackageById(packageId)
  if (!pkg) return { error: 'Invalid package' }

  const expected = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')

  if (expected !== signature) {
    return { error: 'Invalid signature' }
  }

  try {
    // Confirm the order with Razorpay and match against the authenticated user.
    const order = await getRazorpay().orders.fetch(orderId)
    if (String(order.notes?.user_id) !== user.id || String(order.notes?.package_id) !== pkg.id) {
      return { error: 'Order does not match user or package' }
    }

    // Idempotency: if this payment was already credited, short-circuit.
    const { data: existing } = await supabase
      .from('transactions')
      .select('id')
      .eq('razorpay_payment_id', paymentId)
      .eq('payment_status', 'completed')
      .maybeSingle()

    if (existing) {
      const { data: wallet } = await supabase
        .from('wallets')
        .select('coin_balance')
        .eq('user_id', user.id)
        .single()
      return { success: true, newBalance: wallet?.coin_balance ?? 0, alreadyCredited: true }
    }

    const totalCoins = pkg.amount + pkg.bonus

    // Atomic credit via SECURITY DEFINER RPC.
    const { error: rpcError } = await supabase.rpc('add_coins_to_wallet', {
      p_user_id: user.id,
      p_coins: totalCoins,
    })

    if (rpcError) {
      console.error('add_coins_to_wallet error:', rpcError)
      return { error: 'Failed to credit coins' }
    }

    const { error: txnError } = await supabase.from('transactions').insert({
      user_id: user.id,
      type: 'purchase',
      amount: pkg.price,
      coin_amount: totalCoins,
      description: `Purchased ${pkg.amount} coins${pkg.bonus ? ` (+${pkg.bonus} bonus)` : ''}`,
      payment_status: 'completed',
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      metadata: { package_id: pkg.id, signature },
    })

    if (txnError) {
      console.error('transaction insert error:', txnError)
      // Coins already credited; log but do not fail the user.
    }

    const { data: wallet } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    return { success: true, newBalance: wallet?.coin_balance ?? 0 }
  } catch (error: any) {
    console.error('Payment verification error:', error)
    return { error: error.message || 'Payment verification failed' }
  }
}
