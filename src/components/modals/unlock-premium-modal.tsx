'use client'

import { useState } from 'react'
import { Coins, Lock, X, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { unlockChapter } from '@/app/actions/unlock-actions'

interface UnlockPremiumModalProps {
  isOpen: boolean
  onClose: () => void
  chapterId: string
  chapterTitle: string
  chapterNumber: number
  coinCost: number
  seriesId: string
  userCoins?: number
}

export function UnlockPremiumModal({
  isOpen,
  onClose,
  chapterId,
  chapterTitle,
  chapterNumber,
  coinCost,
  seriesId,
  userCoins = 0,
}: UnlockPremiumModalProps) {
  const [isUnlocking, setIsUnlocking] = useState(false)
  const [unlockSuccess, setUnlockSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasEnoughCoins = userCoins >= coinCost

  const handleUnlock = async () => {
    setIsUnlocking(true)
    setError(null)

    try {
      const result = await unlockChapter(chapterId, coinCost)
      
      if (result.success) {
        setUnlockSuccess(true)
        setTimeout(() => {
          window.location.reload() // Reload to show unlocked content
        }, 1500)
      } else {
        setError(result.error || 'Failed to unlock chapter')
      }
    } catch (err) {
      setError('An unexpected error occurred')
    } finally {
      setIsUnlocking(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <Card className="relative z-10 w-full max-w-md mx-4 p-6">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {unlockSuccess ? (
          // Success state
          <div className="text-center py-8">
            <div className="mb-4 flex justify-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-green-500" />
              </div>
            </div>
            <h3 className="text-2xl font-bold mb-2">Chapter Unlocked!</h3>
            <p className="text-muted-foreground">
              Redirecting to chapter...
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6 text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center">
                  <Lock className="w-8 h-8 text-primary" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-2">Unlock Premium Chapter</h3>
              <p className="text-muted-foreground">
                Chapter {chapterNumber}: {chapterTitle}
              </p>
            </div>

            {/* Coin info */}
            <div className="mb-6 space-y-4">
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <span className="text-sm text-muted-foreground">Chapter Cost</span>
                <div className="flex items-center gap-1 font-semibold">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  {coinCost}
                </div>
              </div>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <span className="text-sm text-muted-foreground">Your Balance</span>
                <div className="flex items-center gap-1 font-semibold">
                  <Coins className="w-4 h-4 text-yellow-500" />
                  {userCoins}
                </div>
              </div>

              {!hasEnoughCoins && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">
                    Insufficient coins. You need {coinCost - userCoins} more coins.
                  </p>
                </div>
              )}

              {error && (
                <div className="p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                  <p className="text-sm text-destructive font-medium">{error}</p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {hasEnoughCoins ? (
                <Button
                  onClick={handleUnlock}
                  disabled={isUnlocking}
                  className="w-full"
                  size="lg"
                >
                  {isUnlocking ? (
                    'Unlocking...'
                  ) : (
                    <>
                      <Lock className="w-4 h-4 mr-2" />
                      Unlock for {coinCost} Coins
                    </>
                  )}
                </Button>
              ) : (
                <Link href="/coins/purchase" className="block">
                  <Button className="w-full" size="lg">
                    <Coins className="w-4 h-4 mr-2" />
                    Buy More Coins
                  </Button>
                </Link>
              )}

              <Button
                onClick={onClose}
                variant="outline"
                className="w-full"
                size="lg"
              >
                Cancel
              </Button>
            </div>

            {/* Additional info */}
            <div className="mt-6 pt-6 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Once unlocked, you'll have permanent access to this chapter
              </p>
            </div>
          </>
        )}
      </Card>
    </div>
  )
}
