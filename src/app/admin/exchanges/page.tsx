'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { 
  CheckCircle, 
  XCircle, 
  Clock, 
  Copy, 
  User, 
  Mail, 
  CreditCard,
  RefreshCw,
  AlertTriangle
} from 'lucide-react'
import { 
  getPendingExchanges, 
  confirmExchangePayment, 
  rejectExchangeRequest 
} from '@/app/actions/wallet-exchange-actions'
import { toast } from 'sonner'

interface ExchangeRequest {
  id: string
  user_id: string
  amount: number
  coin_amount: number
  created_at: string
  metadata: any
  profiles: {
    display_name: string
    email: string
  }
}

export default function AdminExchangePage() {
  const [loading, setLoading] = useState(true)
  const [exchanges, setExchanges] = useState<ExchangeRequest[]>([])
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [selectedExchange, setSelectedExchange] = useState<ExchangeRequest | null>(null)
  const [transactionRef, setTransactionRef] = useState('')
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'upi'>('bank_transfer')
  const [notes, setNotes] = useState('')
  const [rejectionReason, setRejectionReason] = useState('')

  const loadExchanges = async () => {
    setLoading(true)
    const { exchanges: data, error } = await getPendingExchanges()
    if (!error && data) {
      setExchanges(data)
    } else if (error) {
      toast.error('Failed to load exchanges')
    }
    setLoading(false)
  }

  useEffect(() => {
    loadExchanges()
  }, [])

  const handleConfirm = async (exchangeId: string) => {
    if (!confirm('Confirm that you have transferred the money to the user?')) return

    setProcessingId(exchangeId)
    const result = await confirmExchangePayment(exchangeId, {
      transactionRef: transactionRef || undefined,
      paymentMethod,
      notes: notes || undefined
    })
    setProcessingId(null)

    if (result.success) {
      toast.success(result.message || 'Payment confirmed successfully')
      setSelectedExchange(null)
      setTransactionRef('')
      setNotes('')
      loadExchanges()
    } else {
      toast.error(result.error || 'Failed to confirm payment')
    }
  }

  const handleReject = async (exchangeId: string) => {
    if (!rejectionReason.trim()) {
      toast.error('Please provide a rejection reason')
      return
    }

    if (!confirm('Reject this exchange request?')) return

    setProcessingId(exchangeId)
    const result = await rejectExchangeRequest(exchangeId, rejectionReason)
    setProcessingId(null)

    if (result.success) {
      toast.success('Exchange request rejected')
      setSelectedExchange(null)
      setRejectionReason('')
      loadExchanges()
    } else {
      toast.error(result.error || 'Failed to reject exchange')
    }
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label} copied to clipboard`)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading exchange requests...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-red-600 via-orange-600 to-yellow-600 bg-clip-text text-transparent">
              Exchange Requests (Admin)
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Manage pending coin-to-INR exchange requests
            </p>
          </div>
          <Button onClick={loadExchanges} variant="outline" size="sm">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Pending Requests
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{exchanges.length}</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <CreditCard className="w-4 h-4" />
                Total Amount
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ₹{exchanges.reduce((sum, ex) => sum + ex.amount, 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-purple-500/20">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" />
                Total Coins (to deduct)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                {exchanges.reduce((sum, ex) => sum + (ex.metadata?.coins_to_deduct || ex.coin_amount), 0).toLocaleString()}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Exchange Requests List */}
        {exchanges.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center text-muted-foreground">
              <Clock className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <p className="text-lg">No pending exchange requests</p>
              <p className="text-sm mt-2">All caught up! 🎉</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {exchanges.map((exchange) => (
              <Card key={exchange.id} className="border-l-4 border-l-yellow-500">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="flex items-center gap-2 mb-2">
                        <User className="w-5 h-5" />
                        {exchange.profiles?.display_name || 'Unknown User'}
                        <Badge variant="outline" className="ml-2 bg-yellow-500/10 text-yellow-600">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {exchange.profiles?.email || 'No email'}
                      </CardDescription>
                      <p className="text-xs text-muted-foreground mt-2">
                        Requested: {new Date(exchange.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-green-600">
                        ₹{exchange.amount.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {(exchange.metadata?.coins_to_deduct || exchange.coin_amount).toLocaleString()} coins
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {/* Bank Details */}
                  <div className="space-y-3 p-4 bg-muted/30 rounded-lg mb-4">
                    <h4 className="font-semibold text-sm mb-3">Payment Details:</h4>
                    
                    {exchange.metadata?.bank_details?.account_holder_name && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account Holder:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">
                            {exchange.metadata.bank_details.account_holder_name}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(
                              exchange.metadata.bank_details.account_holder_name,
                              'Name'
                            )}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {exchange.metadata?.bank_details?.account_number && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Account Number:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {exchange.metadata.bank_details.account_number}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(
                              exchange.metadata.bank_details.account_number,
                              'Account Number'
                            )}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {exchange.metadata?.bank_details?.ifsc_code && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">IFSC Code:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {exchange.metadata.bank_details.ifsc_code}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(
                              exchange.metadata.bank_details.ifsc_code,
                              'IFSC Code'
                            )}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}

                    {exchange.metadata?.bank_details?.upi_id && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">UPI ID:</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium text-blue-600">
                            {exchange.metadata.bank_details.upi_id}
                          </span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(
                              exchange.metadata.bank_details.upi_id,
                              'UPI ID'
                            )}
                          >
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Action Form */}
                  {selectedExchange?.id === exchange.id ? (
                    <div className="space-y-4 p-4 border rounded-lg bg-background">
                      <div>
                        <Label>Payment Method</Label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value as any)}
                          className="w-full mt-1 p-2 border rounded-md"
                        >
                          <option value="bank_transfer">Bank Transfer (NEFT/IMPS/RTGS)</option>
                          <option value="upi">UPI</option>
                        </select>
                      </div>

                      <div>
                        <Label>Transaction Reference (Optional)</Label>
                        <Input
                          placeholder="UTR/Transaction ID"
                          value={transactionRef}
                          onChange={(e) => setTransactionRef(e.target.value)}
                        />
                      </div>

                      <div>
                        <Label>Notes (Optional)</Label>
                        <Textarea
                          placeholder="Any additional notes..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => handleConfirm(exchange.id)}
                          disabled={processingId === exchange.id}
                          className="flex-1 bg-green-600 hover:bg-green-700"
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Confirm Payment Sent
                        </Button>
                        <Button
                          onClick={() => {
                            setSelectedExchange(null)
                            setTransactionRef('')
                            setNotes('')
                          }}
                          variant="outline"
                        >
                          Cancel
                        </Button>
                      </div>

                      <div className="pt-4 border-t">
                        <Label className="text-red-600">Or Reject Request</Label>
                        <Textarea
                          placeholder="Rejection reason..."
                          value={rejectionReason}
                          onChange={(e) => setRejectionReason(e.target.value)}
                          rows={2}
                          className="mt-2"
                        />
                        <Button
                          onClick={() => handleReject(exchange.id)}
                          disabled={processingId === exchange.id}
                          variant="destructive"
                          className="w-full mt-2"
                        >
                          <XCircle className="w-4 h-4 mr-2" />
                          Reject Request
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => setSelectedExchange(exchange)}
                        disabled={processingId !== null}
                        className="flex-1"
                      >
                        Process Payment
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
