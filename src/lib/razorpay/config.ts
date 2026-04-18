import Razorpay from 'razorpay'

let _instance: Razorpay | null = null

export function getRazorpay(): Razorpay {
  if (_instance) return _instance
  const key_id = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID
  const key_secret = process.env.RAZORPAY_KEY_SECRET
  if (!key_id || !key_secret) {
    throw new Error('Missing Razorpay credentials (NEXT_PUBLIC_RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET)')
  }
  _instance = new Razorpay({ key_id, key_secret })
  return _instance
}

export const razorpay = new Proxy({} as Razorpay, {
  get(_target, prop) {
    const r = getRazorpay() as unknown as Record<string | symbol, unknown>
    return r[prop as string]
  },
})

export const SUBSCRIPTION_PLANS = [
  {
    id: 'monthly_basic',
    name: 'Basic Monthly',
    price: 299,
    duration: 30,
    features: ['Access to premium chapters', '10% discount on coins', 'Ad-free reading'],
  },
  {
    id: 'monthly_premium',
    name: 'Premium Monthly',
    price: 599,
    duration: 30,
    features: ['All Basic features', '20% discount on coins', 'Early chapter access', 'Exclusive badge'],
  },
  {
    id: 'yearly_premium',
    name: 'Premium Yearly',
    price: 5999,
    duration: 365,
    features: ['All Premium features', '30% discount on coins', '2 months free', 'Priority support'],
  },
]

export interface RazorpayOrderOptions {
  amount: number
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
