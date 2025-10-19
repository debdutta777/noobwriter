'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, Check, Sparkles, Star, Crown } from 'lucide-react'
import { createRazorpayOrder, verifyRazorpayPayment } from '@/app/actions/payment-actions'
import Script from 'next/script'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface CoinPackage {
  id: string
  amount: number
  price: number
  bonus: number
  popular?: boolean
  badge?: string
}

const coinPackages: CoinPackage[] = [
  {
    id: 'starter',
    amount: 100,
    price: 99,
    bonus: 0,
  },
  {
    id: 'basic',
    amount: 500,
    price: 499,
    bonus: 50,
  },
  {
    id: 'popular',
    amount: 1000,
    price: 899,
    bonus: 150,
    popular: true,
    badge: 'Most Popular',
  },
  {
    id: 'premium',
    amount: 2000,
    price: 1699,
    bonus: 400,
    badge: 'Best Value',
  },
  {
    id: 'ultimate',
    amount: 5000,
    price: 3999,
    bonus: 1500,
    badge: 'Ultimate',
  },
]

export default function BuyCoinsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)
  const [razorpayLoaded, setRazorpayLoaded] = useState(false)

  const checkAuth = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login?redirect=/wallet/buy-coins')
      return
    }

    setUser(user)
    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  async function handlePurchase(pkg: CoinPackage) {
    if (!user || !razorpayLoaded) {
      alert('Payment system not ready. Please refresh the page.')
      return
    }

    setProcessing(true)
    setSelectedPackage(pkg.id)

    try {
      const totalCoins = pkg.amount + pkg.bonus

      // Create Razorpay order
      const orderResult = await createRazorpayOrder(pkg.price, pkg.id)

      if (orderResult.error || !orderResult.orderId) {
        throw new Error(orderResult.error || 'Failed to create order')
      }

      // Get user profile for display
      const { data: profile } = await supabase
        .from('profiles')
        .select('display_name, email')
        .eq('id', user.id)
        .single()

      // Initialize Razorpay payment
      const options = {
        key: orderResult.keyId,
        amount: orderResult.amount,
        currency: orderResult.currency,
        name: 'NoobWriter',
        description: `Purchase ${pkg.amount} coins (+${pkg.bonus} bonus)`,
        order_id: orderResult.orderId,
        prefill: {
          name: profile?.display_name || 'User',
          email: profile?.email || user.email,
        },
        theme: {
          color: '#8b5cf6',
        },
        handler: async function (response: any) {
          // Payment successful - verify and update wallet
          const verifyResult = await verifyRazorpayPayment(
            response.razorpay_order_id,
            response.razorpay_payment_id,
            response.razorpay_signature,
            totalCoins,
            pkg.price,
            pkg.id
          )

          if (verifyResult.error) {
            alert('Payment verification failed: ' + verifyResult.error)
          } else {
            alert(`✅ Successfully purchased ${totalCoins} coins!\nNew balance: ${verifyResult.newBalance} coins`)
            router.push('/wallet')
          }
        },
        modal: {
          ondismiss: function () {
            setProcessing(false)
            setSelectedPackage(null)
          }
        }
      }

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error: any) {
      console.error('Purchase error:', error)
      alert('Failed to process purchase: ' + (error.message || 'Unknown error'))
      setProcessing(false)
      setSelectedPackage(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <>
      {/* Load Razorpay script */}
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setRazorpayLoaded(true)}
        onError={() => {
          console.error('Failed to load Razorpay')
          alert('Payment system failed to load. Please refresh the page.')
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-12 text-center">
            <h1 className="text-4xl font-bold mb-4">Buy Coins</h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Choose a coin package to unlock premium chapters, support your favorite authors, 
              and get exclusive content.
            </p>
          </div>

        {/* Benefits */}
        <div className="mb-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Sparkles className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Unlock Premium</h3>
            <p className="text-sm text-muted-foreground">
              Access exclusive chapters and content
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Star className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Support Authors</h3>
            <p className="text-sm text-muted-foreground">
              Help creators earn from their work
            </p>
          </div>
          <div className="text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
              <Crown className="w-8 h-8 text-primary" />
            </div>
            <h3 className="font-semibold mb-2">Bonus Coins</h3>
            <p className="text-sm text-muted-foreground">
              Get extra coins with larger packages
            </p>
          </div>
        </div>

        {/* Coin Packages */}
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coinPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={`relative ${
                  pkg.popular
                    ? 'border-primary shadow-lg shadow-primary/20 scale-105'
                    : ''
                }`}
              >
                {pkg.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <div className="bg-primary text-primary-foreground px-4 py-1 rounded-full text-xs font-semibold">
                      {pkg.badge}
                    </div>
                  </div>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="mb-4">
                    <Coins className={`w-16 h-16 mx-auto ${
                      pkg.popular ? 'text-primary' : 'text-muted-foreground'
                    }`} />
                  </div>
                  <CardTitle className="text-3xl font-bold">
                    {pkg.amount.toLocaleString()}
                  </CardTitle>
                  <p className="text-sm text-muted-foreground">Base Coins</p>
                </CardHeader>

                <CardContent className="space-y-4">
                  {pkg.bonus > 0 && (
                    <div className="flex items-center justify-center gap-2 p-3 rounded-lg bg-green-500/10 text-green-600 dark:text-green-400">
                      <Sparkles className="w-4 h-4" />
                      <span className="font-semibold">+{pkg.bonus} Bonus Coins</span>
                    </div>
                  )}

                  <div className="text-center py-4 border-t border-b">
                    <div className="text-3xl font-bold">₹{pkg.price}</div>
                    <div className="text-sm text-muted-foreground mt-1">
                      Total: {(pkg.amount + pkg.bonus).toLocaleString()} coins
                    </div>
                  </div>

                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Instant delivery</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Secure payment</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-green-500" />
                      <span>Never expires</span>
                    </div>
                  </div>

                  <Button
                    className="w-full"
                    variant={pkg.popular ? 'default' : 'outline'}
                    size="lg"
                    disabled={processing || !razorpayLoaded}
                    onClick={() => handlePurchase(pkg)}
                  >
                    {!razorpayLoaded ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Loading Payment...
                      </>
                    ) : processing && selectedPackage === pkg.id ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                        Processing...
                      </>
                    ) : (
                      'Buy Now with Razorpay'
                    )}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Payment Info */}
        <div className="mt-12 max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Payment Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• All purchases are processed securely through Razorpay</p>
              <p>• Coins are added to your account instantly after payment</p>
              <p>• All sales are final and non-refundable</p>
              <p>• Coins never expire and can be used anytime</p>
              <p>• For support, contact us at support@noobwriter.com</p>
            </CardContent>
          </Card>
        </div>
        </div>
      </div>
    </>
  )
}
