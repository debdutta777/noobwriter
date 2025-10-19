'use client'

import { useState, useEffect } from 'react'
import { Coins, Check, Sparkles, TrendingUp, Star, Zap } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { getUserWallet, createCoinPurchase } from '@/app/actions/coin-actions'
import { useRouter } from 'next/navigation'

interface CoinPackage {
  id: string
  coins: number
  price: number
  bonus: number
  popular?: boolean
  bestValue?: boolean
}

const coinPackages: CoinPackage[] = [
  {
    id: 'starter',
    coins: 100,
    price: 99,
    bonus: 0,
  },
  {
    id: 'basic',
    coins: 500,
    price: 449,
    bonus: 50,
  },
  {
    id: 'popular',
    coins: 1000,
    price: 849,
    bonus: 150,
    popular: true,
  },
  {
    id: 'premium',
    coins: 2000,
    price: 1599,
    bonus: 400,
  },
  {
    id: 'ultimate',
    coins: 5000,
    price: 3799,
    bonus: 1200,
    bestValue: true,
  },
]

export default function CoinPurchasePage() {
  const router = useRouter()
  const [selectedPackage, setSelectedPackage] = useState<CoinPackage | null>(null)
  const [userBalance, setUserBalance] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadUserBalance()
  }, [])

  const loadUserBalance = async () => {
    const result = await getUserWallet()
    if (result.wallet) {
      setUserBalance(result.wallet.coin_balance)
    }
  }

  const handlePurchase = async () => {
    if (!selectedPackage) return

    setIsLoading(true)
    setError(null)

    try {
      // Create purchase order
      const result = await createCoinPurchase(
        selectedPackage.coins + selectedPackage.bonus,
        selectedPackage.price
      )

      if (!result.success || !result.orderId) {
        setError(result.error || 'Failed to create order')
        setIsLoading(false)
        return
      }

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: selectedPackage.price * 100, // Convert to paise
        currency: 'INR',
        name: 'NoobWriter',
        description: `${selectedPackage.coins + selectedPackage.bonus} Coins`,
        order_id: result.orderId,
        handler: async function (response: any) {
          // Payment successful
          try {
            const verifyResponse = await fetch('/api/payment/verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                orderId: result.orderId,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
              }),
            })

            const verifyResult = await verifyResponse.json()

            if (verifyResult.success) {
              // Reload balance and redirect to library
              await loadUserBalance()
              router.push('/library?tab=wallet&success=true')
            } else {
              setError('Payment verification failed')
            }
          } catch (err) {
            setError('Payment verification failed')
          } finally {
            setIsLoading(false)
          }
        },
        modal: {
          ondismiss: function () {
            setIsLoading(false)
          },
        },
        prefill: {
          email: result.userEmail,
        },
        theme: {
          color: '#6366f1',
        },
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.open()
    } catch (err) {
      setError('Failed to initiate payment')
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Razorpay Script */}
      <script src="https://checkout.razorpay.com/v1/checkout.js" async />

      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="mb-4 flex justify-center">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center shadow-lg">
              <Coins className="w-10 h-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-3">Purchase Coins</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Unlock premium chapters and support your favorite authors
          </p>
          
          {/* Current Balance */}
          <div className="mt-6 inline-flex items-center gap-2 px-6 py-3 rounded-full bg-primary/10 border border-primary/20">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="text-sm text-muted-foreground">Current Balance:</span>
            <span className="text-lg font-bold">{userBalance}</span>
            <span className="text-sm text-muted-foreground">coins</span>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="max-w-4xl mx-auto mb-6 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
            <p className="text-destructive text-center">{error}</p>
          </div>
        )}

        {/* Coin Packages */}
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-12">
          {coinPackages.map((pkg) => (
            <Card
              key={pkg.id}
              className={`relative p-6 cursor-pointer transition-all hover:scale-105 ${
                selectedPackage?.id === pkg.id
                  ? 'ring-2 ring-primary shadow-lg'
                  : 'hover:shadow-md'
              } ${pkg.popular ? 'border-primary' : ''} ${
                pkg.bestValue ? 'border-green-500' : ''
              }`}
              onClick={() => setSelectedPackage(pkg)}
            >
              {/* Badge */}
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center gap-1">
                  <Star className="w-3 h-3" />
                  POPULAR
                </div>
              )}
              {pkg.bestValue && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-green-500 text-white text-xs font-bold flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  BEST VALUE
                </div>
              )}

              {/* Selected Indicator */}
              {selectedPackage?.id === pkg.id && (
                <div className="absolute top-3 right-3 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                  <Check className="w-4 h-4 text-primary-foreground" />
                </div>
              )}

              {/* Content */}
              <div className="text-center">
                <div className="mb-4 flex justify-center">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center">
                    <Coins className="w-8 h-8 text-white" />
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-3xl font-bold">{pkg.coins}</div>
                  <div className="text-xs text-muted-foreground">coins</div>
                </div>

                {pkg.bonus > 0 && (
                  <div className="mb-3 flex items-center justify-center gap-1 text-green-600 dark:text-green-400">
                    <Sparkles className="w-3 h-3" />
                    <span className="text-sm font-semibold">+{pkg.bonus} Bonus</span>
                  </div>
                )}

                <div className="mb-4 text-2xl font-bold">₹{pkg.price}</div>

                <div className="text-xs text-muted-foreground">
                  ₹{(pkg.price / (pkg.coins + pkg.bonus)).toFixed(2)} per coin
                </div>
              </div>
            </Card>
          ))}
        </div>

        {/* Purchase Button */}
        <div className="max-w-md mx-auto">
          <Button
            onClick={handlePurchase}
            disabled={!selectedPackage || isLoading}
            className="w-full h-14 text-lg"
            size="lg"
          >
            {isLoading ? (
              'Processing...'
            ) : selectedPackage ? (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Purchase {selectedPackage.coins + selectedPackage.bonus} Coins for ₹
                {selectedPackage.price}
              </>
            ) : (
              'Select a Package'
            )}
          </Button>
        </div>

        {/* Benefits */}
        <div className="mt-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Why Buy Coins?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Unlock Premium Content</h3>
              <p className="text-sm text-muted-foreground">
                Get instant access to exclusive premium chapters
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Star className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Support Authors</h3>
              <p className="text-sm text-muted-foreground">
                Help creators continue writing amazing stories
              </p>
            </Card>

            <Card className="p-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                  <Zap className="w-6 h-6 text-primary" />
                </div>
              </div>
              <h3 className="text-lg font-semibold mb-2">Permanent Access</h3>
              <p className="text-sm text-muted-foreground">
                Once unlocked, chapters are yours forever
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
