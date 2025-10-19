import { NextRequest, NextResponse } from 'next/server'
import { verifyPayment } from '@/app/actions/coin-actions'

export async function POST(request: NextRequest) {
  try {
    const { orderId, paymentId, signature } = await request.json()

    if (!orderId || !paymentId || !signature) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await verifyPayment(orderId, paymentId, signature)

    if (result.success) {
      return NextResponse.json({ success: true })
    } else {
      return NextResponse.json(
        { success: false, error: result.error },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
