'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Coins, Heart } from 'lucide-react'
import { sendTip, getWalletBalance } from '@/app/actions/wallet-actions'
import { useRouter } from 'next/navigation'

interface TipButtonProps {
  authorId: string
  authorName: string
  seriesId?: string
  chapterId?: string
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

const TIP_AMOUNTS = [10, 50, 100, 200, 500, 1000]

export default function TipButton({ 
  authorId, 
  authorName, 
  seriesId, 
  chapterId,
  variant = 'outline',
  size = 'default',
  className = ''
}: TipButtonProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState(50)
  const [customAmount, setCustomAmount] = useState('')
  const [loading, setLoading] = useState(false)
  const [balance, setBalance] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleOpen = async (isOpen: boolean) => {
    setOpen(isOpen)
    if (isOpen) {
      setError(null)
      setSuccess(false)
      // Fetch wallet balance
      const result = await getWalletBalance()
      if (result.error) {
        setError(result.error)
      } else {
        setBalance(result.balance)
      }
    }
  }

  const handleSendTip = async () => {
    const amount = customAmount ? parseInt(customAmount) : selectedAmount
    
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount')
      return
    }

    if (balance !== null && amount > balance) {
      setError(`Insufficient balance. You have ${balance} coins.`)
      return
    }

    setLoading(true)
    setError(null)

    const result = await sendTip(authorId, amount, seriesId, chapterId)

    if (result.success) {
      setSuccess(true)
      setBalance(result.newBalance || 0)
      setTimeout(() => {
        setOpen(false)
        setSuccess(false)
        setCustomAmount('')
      }, 2000)
    } else {
      // Check if error includes balance information (for backward compatibility)
      const errorMsg = result.error || 'Failed to send tip'
      if (errorMsg.includes('Insufficient balance')) {
        setError(errorMsg)
      } else {
        setError(errorMsg)
      }
    }

    setLoading(false)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpen}>
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className={className}>
          <Heart className="h-4 w-4 mr-2" />
          Tip Author
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Tip {authorName}</DialogTitle>
          <DialogDescription>
            Show your appreciation by sending coins to the author
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
              <Heart className="h-8 w-8 text-green-600 fill-current" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Tip Sent!</h3>
            <p className="text-muted-foreground">
              Thank you for supporting the author
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Balance Display */}
            {balance !== null && (
              <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <span className="text-sm font-medium">Your Balance:</span>
                <div className="flex items-center gap-1 font-bold">
                  <Coins className="h-4 w-4 text-yellow-600" />
                  {balance} coins
                </div>
              </div>
            )}

            {/* Preset Amounts */}
            <div>
              <label className="text-sm font-medium mb-2 block">Select Amount:</label>
              <div className="grid grid-cols-3 gap-2">
                {TIP_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant={selectedAmount === amount && !customAmount ? 'default' : 'outline'}
                    onClick={() => {
                      setSelectedAmount(amount)
                      setCustomAmount('')
                      setError(null)
                    }}
                    className="flex items-center justify-center gap-1"
                  >
                    <Coins className="h-3 w-3" />
                    {amount}
                  </Button>
                ))}
              </div>
            </div>

            {/* Custom Amount */}
            <div>
              <label className="text-sm font-medium mb-2 block">Or Enter Custom Amount:</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="number"
                    min="1"
                    placeholder="Enter amount"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value)
                      setError(null)
                    }}
                    className="w-full pl-10 pr-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{error}</p>
                {error.includes('Insufficient balance') && (
                  <Button
                    variant="link"
                    size="sm"
                    className="mt-2 h-auto p-0 text-red-600"
                    onClick={() => router.push('/coins/purchase')}
                  >
                    Buy More Coins →
                  </Button>
                )}
              </div>
            )}

            {/* Send Button */}
            <Button
              onClick={handleSendTip}
              disabled={loading || balance === null || balance === 0}
              className="w-full"
              size="lg"
            >
              {loading ? (
                'Sending...'
              ) : (
                <>
                  Send {customAmount || selectedAmount} Coins
                  <Heart className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
