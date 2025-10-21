'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Coins, TrendingUp, Wallet, AlertCircle, CheckCircle, Clock, XCircle } from 'lucide-react'
import { requestPayout, getPayoutInfo, getPayoutHistory, cancelPayoutRequest } from '@/app/actions/payout-actions'
import { toast } from 'sonner'

interface PayoutTransaction {
  id: string
  user_id: string
  type: string
  amount: number
  coin_amount: number
  description: string
  payment_status: string
  created_at: string
  metadata?: any
}

export default function EarningsClient() {
  const [coinBalance, setCoinBalance] = useState(0)
  const [availableInr, setAvailableInr] = useState(0)
  const [canRequestPayout, setCanRequestPayout] = useState(false)
  const [minimumCoins, setMinimumCoins] = useState(3000)
  const [exchangeRate, setExchangeRate] = useState(300)
  const [rupeesPerUnit, setRupeesPerUnit] = useState(100)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [payoutHistory, setPayoutHistory] = useState<PayoutTransaction[]>([])

  useEffect(() => {
    loadPayoutInfo()
    loadPayoutHistory()
  }, [])

  const loadPayoutInfo = async () => {
    const info = await getPayoutInfo()
    if (!info.error) {
      setCoinBalance(info.coinBalance)
      setAvailableInr(info.availableInr)
      setCanRequestPayout(info.canRequestPayout)
      setMinimumCoins(info.minimumCoins || 3000)
      setExchangeRate(info.exchangeRate || 300)
      setRupeesPerUnit(info.rupeesPerUnit || 100)
    }
  }

  const loadPayoutHistory = async () => {
    const { payouts, error } = await getPayoutHistory()
    if (!error && payouts) {
      setPayoutHistory(payouts)
    }
  }

  const handleRequestPayout = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const coins = parseInt(payoutAmount)
    
    if (isNaN(coins) || coins <= 0) {
      toast.error('Please enter a valid coin amount')
      return
    }

    if (coins < minimumCoins) {
      toast.error(`Minimum ${minimumCoins} coins required`)
      return
    }

    if (coins > coinBalance) {
      toast.error(`Insufficient coins. You have ${coinBalance} coins.`)
      return
    }

    if (coins % exchangeRate !== 0) {
      toast.error(`Coin amount must be divisible by ${exchangeRate}`)
      return
    }

    setIsLoading(true)

    const result = await requestPayout(coins)

    setIsLoading(false)

    if (result.success) {
      toast.success(`Payout request submitted for ₹${result.inrAmount}`)
      setPayoutAmount('')
      loadPayoutInfo()
      loadPayoutHistory()
    } else {
      toast.error(result.error || 'Failed to request payout')
    }
  }

  const handleCancelPayout = async (transactionId: string) => {
    setIsLoading(true)
    const result = await cancelPayoutRequest(transactionId)
    setIsLoading(false)

    if (result.success) {
      toast.success(`Payout cancelled and ${result.refundAmount} coins refunded`)
      loadPayoutInfo()
      loadPayoutHistory()
    } else {
      toast.error(result.error || 'Failed to cancel payout')
    }
  }

  const calculateInr = (coins: number) => {
    return Math.floor(coins / exchangeRate) * rupeesPerUnit
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        )
      case 'processing':
        return (
          <Badge variant="outline" className="bg-blue-500/10 text-blue-600 border-blue-500/20">
            <TrendingUp className="w-3 h-3 mr-1" />
            Processing
          </Badge>
        )
      case 'completed':
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </Badge>
        )
      case 'rejected':
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            {status === 'cancelled' ? 'Cancelled' : 'Rejected'}
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 bg-clip-text text-transparent">
          Earnings & Payouts
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Manage your coin earnings and request payouts
        </p>
      </div>

      {/* Balance Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-purple-500/10 via-blue-500/10 to-pink-500/10 border-purple-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Coins className="w-4 h-4" />
              Coin Balance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {coinBalance.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">Available coins</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-teal-500/10 border-green-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <Wallet className="w-4 h-4" />
              Available INR
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              ₹{availableInr.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {exchangeRate} coins = ₹{rupeesPerUnit}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-500/10 via-orange-500/10 to-red-500/10 border-amber-500/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Minimum Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
              {minimumCoins.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">coins to request payout</p>
          </CardContent>
        </Card>
      </div>

      {/* Payout Request Form */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Request Payout</CardTitle>
          <CardDescription>
            Exchange your coins for INR. Minimum {minimumCoins.toLocaleString()} coins required.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!canRequestPayout && (
            <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                  Insufficient Coins
                </p>
                <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                  You need at least {minimumCoins.toLocaleString()} coins to request a payout. 
                  You currently have {coinBalance.toLocaleString()} coins.
                </p>
              </div>
            </div>
          )}

          <form onSubmit={handleRequestPayout} className="space-y-4">
            <div>
              <Label htmlFor="payoutAmount">Coin Amount</Label>
              <Input
                id="payoutAmount"
                type="number"
                placeholder={`Enter amount (min ${minimumCoins})`}
                value={payoutAmount}
                onChange={(e) => setPayoutAmount(e.target.value)}
                min={minimumCoins}
                step={exchangeRate}
                disabled={!canRequestPayout || isLoading}
                className="mt-1"
              />
              {payoutAmount && parseInt(payoutAmount) > 0 && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  You will receive: <span className="font-semibold text-green-600">
                    ₹{calculateInr(parseInt(payoutAmount)).toLocaleString()}
                  </span>
                </p>
              )}
            </div>

            <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                Exchange Rate Information
              </h4>
              <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                <li>• {exchangeRate} coins = ₹{rupeesPerUnit}</li>
                <li>• Minimum payout: {minimumCoins.toLocaleString()} coins (₹{calculateInr(minimumCoins)})</li>
                <li>• Amount must be divisible by {exchangeRate}</li>
                <li>• Payouts are processed within 3-5 business days</li>
              </ul>
            </div>

            <Button
              type="submit"
              disabled={!canRequestPayout || isLoading || !payoutAmount}
              className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
            >
              {isLoading ? 'Processing...' : 'Request Payout'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Payout History */}
      <Card>
        <CardHeader>
          <CardTitle>Payout History</CardTitle>
          <CardDescription>
            View all your payout requests and their status
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payoutHistory.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Wallet className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>No payout requests yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {payoutHistory.map((payout) => (
                <div
                  key={payout.id}
                  className="p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <p className="font-medium">
                          ₹{payout.amount.toLocaleString()}
                        </p>
                        {getStatusBadge(payout.payment_status)}
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {Math.abs(payout.coin_amount).toLocaleString()} coins
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(payout.created_at).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {payout.payment_status === 'pending' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCancelPayout(payout.id)}
                        disabled={isLoading}
                        className="text-red-600 hover:bg-red-50"
                      >
                        Cancel
                      </Button>
                    )}
                  </div>
                  {payout.metadata?.rejection_reason && (
                    <p className="text-xs text-red-600 mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded">
                      Reason: {payout.metadata.rejection_reason}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
