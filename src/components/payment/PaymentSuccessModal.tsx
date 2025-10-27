'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Coins, Sparkles, ArrowRight, Trophy } from 'lucide-react'
import confetti from 'canvas-confetti'

interface PaymentSuccessModalProps {
  isOpen: boolean
  coinsAmount: number
  bonusCoins: number
  newBalance: number
  transactionId?: string
  onCloseAction: () => void
}

export default function PaymentSuccessModal({
  isOpen,
  coinsAmount,
  bonusCoins,
  newBalance,
  transactionId,
  onCloseAction,
}: PaymentSuccessModalProps) {
  const router = useRouter()
  const [showDetails, setShowDetails] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Trigger confetti animation
      const duration = 3000
      const animationEnd = Date.now() + duration
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 9999 }

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min
      }

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now()

        if (timeLeft <= 0) {
          return clearInterval(interval)
        }

        const particleCount = 50 * (timeLeft / duration)
        
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        })
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        })
      }, 250)

      // Show details after animation
      setTimeout(() => setShowDetails(true), 500)

      return () => clearInterval(interval)
    }
  }, [isOpen])

  if (!isOpen) return null

  const totalCoins = coinsAmount + bonusCoins

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <Card className="w-full max-w-lg overflow-hidden border-2 border-green-500/20 shadow-2xl animate-in zoom-in-95 duration-300">
        <CardContent className="p-0">
          {/* Success Header */}
          <div className="relative bg-gradient-to-br from-green-500 to-emerald-600 p-8 text-white overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-20">
              <div className="absolute top-10 left-10 w-20 h-20 bg-white rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-10 right-10 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            <div className="relative z-10 text-center">
              {/* Success Icon with animation */}
              <div className="inline-flex items-center justify-center w-20 h-20 mb-4 bg-white/20 backdrop-blur-sm rounded-full animate-in zoom-in duration-500">
                <CheckCircle2 className="w-12 h-12 text-white animate-in zoom-in duration-700" style={{ animationDelay: '200ms' }} />
              </div>

              <h2 className="text-3xl font-bold mb-2 animate-in slide-in-from-bottom duration-500" style={{ animationDelay: '300ms' }}>
                Payment Successful!
              </h2>
              <p className="text-green-50 text-lg animate-in slide-in-from-bottom duration-500" style={{ animationDelay: '400ms' }}>
                Your coins have been added to your wallet
              </p>
            </div>
          </div>

          {/* Details Section */}
          {showDetails && (
            <div className="p-8 space-y-6 animate-in slide-in-from-bottom duration-500">
              {/* Coins Breakdown */}
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg border border-primary/10">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg">
                      <Coins className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Base Coins</p>
                      <p className="text-2xl font-bold text-foreground">{coinsAmount}</p>
                    </div>
                  </div>
                </div>

                {bonusCoins > 0 && (
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-lg border border-amber-500/20">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 rounded-lg">
                        <Sparkles className="w-6 h-6 text-amber-500" />
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bonus Coins</p>
                        <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">+{bonusCoins}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-500/10 to-emerald-500/10 rounded-lg border-2 border-green-500/30">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-500/20 rounded-lg">
                      <Trophy className="w-6 h-6 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Total Received</p>
                      <p className="text-3xl font-bold text-green-600 dark:text-green-400">{totalCoins} Coins</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* New Balance */}
              <div className="p-6 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent rounded-xl border border-primary/20">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">New Wallet Balance</p>
                    <p className="text-4xl font-bold text-primary">{newBalance}</p>
                    <p className="text-xs text-muted-foreground mt-1">Coins available</p>
                  </div>
                  <Coins className="w-16 h-16 text-primary/20" />
                </div>
              </div>

              {/* Transaction ID */}
              {transactionId && (
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground mb-1">Transaction ID</p>
                  <p className="text-sm font-mono text-foreground/80 break-all">{transactionId}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  onClick={() => {
                    onCloseAction()
                    router.push('/wallet')
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  View Wallet
                </Button>
                <Button
                  onClick={() => {
                    onCloseAction()
                    router.push('/browse')
                  }}
                  className="flex-1 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
                >
                  Start Reading
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <p className="text-center text-sm text-muted-foreground">
                Thank you for supporting NoobWriter! 🎉
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
