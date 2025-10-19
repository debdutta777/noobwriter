import { razorpay } from '@/lib/razorpay/config'
import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get('x-razorpay-signature')
    const body = await request.text()

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    const event = JSON.parse(body)
    const supabase = await createClient()

    switch (event.event) {
      case 'payment.captured':
        // Handle successful payment
        const payment = event.payload.payment.entity
        await supabase
          .from('transactions')
          .update({
            payment_status: 'completed',
            razorpay_payment_id: payment.id,
          })
          .eq('razorpay_order_id', payment.order_id)
        break

      case 'payment.failed':
        // Handle failed payment
        const failedPayment = event.payload.payment.entity
        await supabase
          .from('transactions')
          .update({
            payment_status: 'failed',
          })
          .eq('razorpay_order_id', failedPayment.order_id)
        break

      case 'refund.created':
        // Handle refund
        const refund = event.payload.refund.entity
        await supabase.from('transactions').insert({
          user_id: refund.notes.userId,
          type: 'refund',
          amount: -refund.amount / 100,
          description: 'Payment refund',
          payment_status: 'completed',
          razorpay_payment_id: refund.payment_id,
        })
        break
    }

    return NextResponse.json({ status: 'ok' })
  } catch (error) {
    console.error('Webhook error:', error)
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    )
  }
}
