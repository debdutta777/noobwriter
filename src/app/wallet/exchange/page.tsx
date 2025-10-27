'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { ArrowDownUp, Coins, DollarSign, AlertCircle, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react'
import { exchangeCoinsToINR, getExchangeHistory, cancelExchange } from '@/app/actions/wallet-exchange-actions'
import { toast } from 'sonner'
import Link from 'next/link'

const EXCHANGE_RATE = 2000 // 2000 coins = ₹100
const RUPEES_PER_UNIT = 100 // ₹100
const MINIMUM_COINS = 20000 // Minimum coins required

interface ExchangeTransaction {
  id: string
  amount: number
  coin_amount: number
  description: string
  payment_status: string
  created_at: string
  metadata: any
}

export default function ExchangePage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [balance, setBalance] = useState(0)
  const [coinAmount, setCoinAmount] = useState('')
  const [accountNumber, setAccountNumber] = useState('')
  const [confirmAccountNumber, setConfirmAccountNumber] = useState('')
  const [ifscCode, setIfscCode] = useState('')
  const [accountHolderName, setAccountHolderName] = useState('')
  const [upiId, setUpiId] = useState('')
  const [exchanges, setExchanges] = useState<ExchangeTransaction[]>([])

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login?redirect=/wallet/exchange')
      return
    }

    setLoading(true)

    // Get wallet balance
    const { data: wallet } = await supabase
      .from('wallets')
      .select('coin_balance')
      .eq('user_id', user.id)
      .single()

    if (wallet) {
      setBalance(wallet.coin_balance)
    }

    // Get exchange history
    const { exchanges: history } = await getExchangeHistory()
    if (history) {
      setExchanges(history)
    }

    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    loadData()
  }, [loadData])

  const calculateINR = (coins: number) => {
    return Math.floor(coins / EXCHANGE_RATE) * RUPEES_PER_UNIT
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const coins = parseInt(coinAmount)

    // Validation
    if (isNaN(coins) || coins <= 0) {
      toast.error('Please enter a valid coin amount')
      return
    }

    if (coins < MINIMUM_COINS) {
      toast.error(`Minimum ${MINIMUM_COINS.toLocaleString()} coins required`)
      return
    }

    if (coins > balance) {
      toast.error(`Insufficient coins. You have ${balance.toLocaleString()} coins.`)
      return
    }

    if (coins % EXCHANGE_RATE !== 0) {
      toast.error(`Coin amount must be divisible by ${EXCHANGE_RATE.toLocaleString()}`)
      return
    }

    if (!accountNumber || !confirmAccountNumber || !ifscCode || !accountHolderName) {
      toast.error('Please fill in all bank details')
      return
    }

    if (accountNumber !== confirmAccountNumber) {
      toast.error('Account numbers do not match')
      return
    }

    if (accountNumber.length < 9 || accountNumber.length > 18) {
      toast.error('Invalid account number length')
      return
    }

    if (ifscCode.length !== 11) {
      toast.error('IFSC code must be 11 characters')
      return
    }

    setSubmitting(true)

    const result = await exchangeCoinsToINR(coins, {
      accountNumber,
      ifscCode: ifscCode.toUpperCase(),
      accountHolderName,
      upiId: upiId || undefined,
    })

    setSubmitting(false)

    if (result.success) {
      toast.success(result.message || `Exchange request submitted for ₹${result.inrAmount}`)
      setCoinAmount('')
      setAccountNumber('')
      setConfirmAccountNumber('')
      setIfscCode('')
      setAccountHolderName('')
      setUpiId('')
      loadData()
    } else {
      toast.error(result.error || 'Failed to submit exchange request')
    }
  }

  const handleCancel = async (transactionId: string) => {
    if (!confirm('Are you sure you want to cancel this exchange?')) return

    setSubmitting(true)
    const result = await cancelExchange(transactionId)
    setSubmitting(false)

    if (result.success) {
      toast.success(result.message || 'Exchange cancelled successfully')
      loadData()
    } else {
      toast.error(result.error || 'Failed to cancel exchange')
    }
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
            <ArrowDownUp className="w-3 h-3 mr-1" />
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
      case 'cancelled':
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20">
            <XCircle className="w-3 h-3 mr-1" />
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <Link href="/wallet">
            <Button variant="ghost" size="sm" className="mb-4">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Wallet
            </Button>
          </Link>
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
            Exchange Coins to INR
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Convert your coins to Indian Rupees
          </p>
        </div>

        {/* Balance Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Coins className="w-4 h-4" />
                Available Coins
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{balance.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">Your coin balance</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <DollarSign className="w-4 h-4" />
                Exchange Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {EXCHANGE_RATE.toLocaleString()} = ₹{RUPEES_PER_UNIT}
              </div>
              <p className="text-xs text-gray-500 mt-1">Current rate</p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Minimum Exchange
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{MINIMUM_COINS.toLocaleString()}</div>
              <p className="text-xs text-gray-500 mt-1">coins (₹{calculateINR(MINIMUM_COINS)})</p>
            </CardContent>
          </Card>
        </div>

        {/* Exchange Form */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Exchange Request</CardTitle>
            <CardDescription>
              Minimum {MINIMUM_COINS.toLocaleString()} coins required. Amount must be divisible by {EXCHANGE_RATE.toLocaleString()}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {balance < MINIMUM_COINS && (
              <div className="mb-4 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                    Insufficient Coins
                  </p>
                  <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                    You need at least {MINIMUM_COINS.toLocaleString()} coins to exchange. 
                    You currently have {balance.toLocaleString()} coins.
                  </p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Coin Amount */}
              <div>
                <Label htmlFor="coinAmount">Coin Amount</Label>
                <Input
                  id="coinAmount"
                  type="number"
                  placeholder={`Enter amount (min ${MINIMUM_COINS.toLocaleString()})`}
                  value={coinAmount}
                  onChange={(e) => setCoinAmount(e.target.value)}
                  min={MINIMUM_COINS}
                  step={EXCHANGE_RATE}
                  disabled={balance < MINIMUM_COINS || submitting}
                  className="mt-1"
                />
                {coinAmount && parseInt(coinAmount) > 0 && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                    You will receive: <span className="font-semibold text-green-600">
                      ₹{calculateINR(parseInt(coinAmount)).toLocaleString()}
                    </span>
                  </p>
                )}
              </div>

              {/* Bank Details */}
              <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
                <h3 className="font-semibold text-sm">Bank Account Details</h3>
                
                <div>
                  <Label htmlFor="accountHolderName">Account Holder Name</Label>
                  <Input
                    id="accountHolderName"
                    type="text"
                    placeholder="As per bank records"
                    value={accountHolderName}
                    onChange={(e) => setAccountHolderName(e.target.value)}
                    disabled={submitting}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    type="text"
                    placeholder="Enter account number"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
                    disabled={submitting}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="confirmAccountNumber">Confirm Account Number</Label>
                  <Input
                    id="confirmAccountNumber"
                    type="text"
                    placeholder="Re-enter account number"
                    value={confirmAccountNumber}
                    onChange={(e) => setConfirmAccountNumber(e.target.value.replace(/\D/g, ''))}
                    disabled={submitting}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="ifscCode">IFSC Code</Label>
                  <Input
                    id="ifscCode"
                    type="text"
                    placeholder="e.g., SBIN0001234"
                    value={ifscCode}
                    onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                    maxLength={11}
                    disabled={submitting}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="upiId">UPI ID (Optional)</Label>
                  <Input
                    id="upiId"
                    type="text"
                    placeholder="e.g., yourname@paytm, 9876543210@ybl"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                    disabled={submitting}
                    className="mt-1"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    You can provide either bank details or UPI ID for payment
                  </p>
                </div>
              </div>

              {/* Info Box */}
              <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <h4 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">
                  Important Information
                </h4>
                <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
                  <li>• {EXCHANGE_RATE.toLocaleString()} coins = ₹{RUPEES_PER_UNIT}</li>
                  <li>• Minimum exchange: {MINIMUM_COINS.toLocaleString()} coins (₹{calculateINR(MINIMUM_COINS)})</li>
                  <li>• Amount must be divisible by {EXCHANGE_RATE.toLocaleString()}</li>
                  <li>• Processing time: 1-3 business days (manual processing)</li>
                  <li>• Coins will be deducted only after payment is confirmed</li>
                  <li>• Provide bank account details OR UPI ID</li>
                  <li>• Ensure payment details are correct before submitting</li>
                </ul>
              </div>

              <Button
                type="submit"
                disabled={balance < MINIMUM_COINS || submitting || !coinAmount}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                size="lg"
              >
                {submitting ? 'Processing...' : 'Submit Exchange Request'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Exchange History */}
        <Card>
          <CardHeader>
            <CardTitle>Exchange History</CardTitle>
            <CardDescription>
              View all your coin-to-INR exchange requests
            </CardDescription>
          </CardHeader>
          <CardContent>
            {exchanges.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <ArrowDownUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                <p>No exchange requests yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exchanges.map((exchange) => (
                  <div
                    key={exchange.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <ArrowDownUp className="w-4 h-4 text-blue-500" />
                        <span className="font-medium">
                          {Math.abs(exchange.coin_amount).toLocaleString()} coins → ₹{exchange.amount.toLocaleString()}
                        </span>
                        {getStatusBadge(exchange.payment_status)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {new Date(exchange.created_at).toLocaleString()}
                      </p>
                      {exchange.metadata?.bank_details && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Account: ****{exchange.metadata.bank_details.account_number}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-3 md:mt-0">
                      {exchange.payment_status === 'pending' && (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleCancel(exchange.id)}
                          disabled={submitting}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
