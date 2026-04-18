import { getRazorpay } from '@/lib/razorpay/config'
import { getPackageById } from '@/lib/coin-packages'
import { createAdminClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (!webhookSecret) {
      console.error('RAZORPAY_WEBHOOK_SECRET not configured')
      return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 })
    }

    const signature = request.headers.get('x-razorpay-signature')
    const body = await request.text()

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const supabase = createAdminClient()

    switch (event.event) {
      case 'payment.captured': {
        const payment = event.payload.payment.entity
        await handlePaymentCaptured(supabase, payment)
        break
      }

      case 'payment.failed': {
        const payment = event.payload.payment.entity
        await supabase
          .from('transactions')
          .update({ payment_status: 'failed' })
          .eq('razorpay_order_id', payment.order_id)
        break
      }

      case 'refund.created': {
        const refund = event.payload.refund.entity
        const userId = refund.notes?.user_id || refund.notes?.userId
        if (userId) {
          await supabase.from('transactions').insert({
            user_id: userId,
            type: 'refund',
            amount: -refund.amount / 100,
            description: 'Payment refund',
            payment_status: 'completed',
            razorpay_payment_id: refund.payment_id,
          })
        }
        break
      }
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}

async function handlePaymentCaptured(
  supabase: ReturnType<typeof createAdminClient>,
  payment: { id: string; order_id: string; amount: number; notes?: Record<string, string> },
) {
  // Idempotency: if a completed transaction already exists for this payment, do nothing.
  const { data: existing } = await supabase
    .from('transactions')
    .select('id')
    .eq('razorpay_payment_id', payment.id)
    .eq('payment_status', 'completed')
    .maybeSingle()

  if (existing) return

  // Pull order notes (we set user_id + package_id there at creation).
  let notes = payment.notes || {}
  if (!notes.user_id || !notes.package_id) {
    try {
      const order = await getRazorpay().orders.fetch(payment.order_id)
      notes = (order.notes as Record<string, string>) || {}
    } catch (error) {
      console.error('Failed to fetch order for webhook:', error)
      return
    }
  }

  const userId = notes.user_id
  const packageId = notes.package_id
  if (!userId || !packageId) {
    console.error('Missing user_id or package_id in order notes')
    return
  }

  const pkg = getPackageById(packageId)
  if (!pkg) {
    console.error('Unknown package in webhook:', packageId)
    return
  }

  const totalCoins = pkg.amount + pkg.bonus

  const { error: rpcError } = await supabase.rpc('add_coins_to_wallet', {
    p_user_id: userId,
    p_coins: totalCoins,
  })

  if (rpcError) {
    console.error('Webhook add_coins_to_wallet error:', rpcError)
    return
  }

  // Upsert the transaction record (may already exist in pending state from client verify).
  const { data: pending } = await supabase
    .from('transactions')
    .select('id')
    .eq('razorpay_order_id', payment.order_id)
    .maybeSingle()

  if (pending) {
    await supabase
      .from('transactions')
      .update({
        razorpay_payment_id: payment.id,
        payment_status: 'completed',
      })
      .eq('id', pending.id)
  } else {
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'purchase',
      amount: pkg.price,
      coin_amount: totalCoins,
      description: `Purchased ${pkg.amount} coins${pkg.bonus ? ` (+${pkg.bonus} bonus)` : ''}`,
      payment_status: 'completed',
      razorpay_order_id: payment.order_id,
      razorpay_payment_id: payment.id,
      metadata: { package_id: pkg.id, source: 'webhook' },
    })
  }
}
