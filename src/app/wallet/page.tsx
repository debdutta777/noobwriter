'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Coins, TrendingUp, TrendingDown, Plus, ArrowRight } from 'lucide-react'
import Link from 'next/link'

interface Transaction {
  id: string
  amount: number
  coin_amount: number | null
  type: string
  description: string | null
  created_at: string
  metadata: any
}

export default function WalletPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(true)
  const [balance, setBalance] = useState(0)
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const checkAuthAndLoadWallet = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      router.push('/login?redirect=/wallet')
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

    // Get recent transactions
    const { data: txns } = await supabase
      .from('transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(20)

    if (txns) {
      setTransactions(txns)
    }

    setLoading(false)
  }, [supabase, router])

  useEffect(() => {
    checkAuthAndLoadWallet()
  }, [checkAuthAndLoadWallet])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading wallet...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Wallet</h1>
          <p className="text-muted-foreground">
            Manage your coins and view transaction history
          </p>
        </div>

        {/* Balance Card */}
        <div className="mb-8">
          <Card className="bg-gradient-to-br from-primary/10 to-purple-500/10">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Total Balance</p>
                  <div className="flex items-center gap-3">
                    <Coins className="w-10 h-10 text-primary" />
                    <span className="text-5xl font-bold">{balance}</span>
                    <span className="text-2xl text-muted-foreground">coins</span>
                  </div>
                </div>
                <Link href="/wallet/buy-coins">
                  <Button size="lg" className="gap-2">
                    <Plus className="w-5 h-5" />
                    Buy Coins
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link href="/wallet/buy-coins">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-green-500/10">
                    <Plus className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Buy Coins</h3>
                    <p className="text-sm text-muted-foreground">Add funds to wallet</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/browse">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Coins className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Unlock Chapters</h3>
                    <p className="text-sm text-muted-foreground">Read premium content</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/settings">
            <Card className="hover:border-primary transition-colors cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="p-3 rounded-full bg-purple-500/10">
                    <ArrowRight className="w-6 h-6 text-purple-500" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Settings</h3>
                    <p className="text-sm text-muted-foreground">Payment methods</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>

        {/* Transaction History */}
        <Card>
          <CardHeader>
            <CardTitle>Transaction History</CardTitle>
          </CardHeader>
          <CardContent>
            {transactions.length === 0 ? (
              <div className="text-center py-12">
                <Coins className="w-16 h-16 text-muted-foreground mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground mb-4">No transactions yet</p>
                <Link href="/wallet/buy-coins">
                  <Button>Buy Your First Coins</Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {transactions.map((txn) => (
                  <div
                    key={txn.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-accent/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        txn.type === 'purchase' || txn.type === 'earning'
                          ? 'bg-green-500/10'
                          : 'bg-red-500/10'
                      }`}>
                        {txn.type === 'purchase' || txn.type === 'earning' ? (
                          <TrendingUp className="w-5 h-5 text-green-500" />
                        ) : (
                          <TrendingDown className="w-5 h-5 text-red-500" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">
                          {txn.description || txn.type}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(txn.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <div className={`text-lg font-bold ${
                      txn.coin_amount && txn.coin_amount > 0 ? 'text-green-500' : 'text-red-500'
                    }`}>
                      {txn.coin_amount && txn.coin_amount > 0 ? '+' : ''}{txn.coin_amount || 0} coins
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
