import Razorpay from 'razorpay'

if (!process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  throw new Error('Missing Razorpay credentials')
}

export const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// Coin packages with INR pricing
export const COIN_PACKAGES = [
  { coins: 100, price: 99, bonus: 0, popular: false },
  { coins: 500, price: 449, bonus: 50, popular: true },
  { coins: 1000, price: 849, bonus: 150, popular: false },
  { coins: 2500, price: 1999, bonus: 500, popular: false },
  { coins: 5000, price: 3799, bonus: 1200, popular: false },
]

// Subscription plans
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
  amount: number // in paise
  currency: string
  receipt: string
  notes?: Record<string, string>
}

export interface RazorpayPaymentVerification {
  razorpay_order_id: string
  razorpay_payment_id: string
  razorpay_signature: string
}
