import { razorpay } from '@/lib/razorpay/config'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { coinPackage, userId } = body

    if (!coinPackage || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Create Razorpay order
    const order = await razorpay.orders.create({
      amount: coinPackage.price * 100, // Convert to paise
      currency: 'INR',
      receipt: `order_${userId}_${Date.now()}`,
      notes: {
        userId,
        coins: coinPackage.coins.toString(),
        bonus: coinPackage.bonus.toString(),
      },
    })

    // Save pending transaction to database
    const supabase = await createClient()
    await supabase.from('transactions').insert({
      user_id: userId,
      type: 'purchase',
      amount: coinPackage.price,
      coin_amount: coinPackage.coins + coinPackage.bonus,
      description: `Purchase ${coinPackage.coins} coins`,
      payment_status: 'pending',
      razorpay_order_id: order.id,
    })

    return NextResponse.json({ order })
  } catch (error) {
    console.error('Order creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userId,
    } = body

    // Verify signature
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSign = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
      .update(sign.toString())
      .digest('hex')

    if (razorpay_signature !== expectedSign) {
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // Update transaction
    const { data: transaction } = await supabase
      .from('transactions')
      .update({
        payment_status: 'completed',
        razorpay_payment_id,
      })
      .eq('razorpay_order_id', razorpay_order_id)
      .select()
      .single()

    if (!transaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      )
    }

    // Update wallet balance
    await supabase.rpc('add_coins_to_wallet', {
      p_user_id: userId,
      p_coins: transaction.coin_amount,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { error: 'Payment verification failed' },
      { status: 500 }
    )
  }
}
