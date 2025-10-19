'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { getUserLibrary } from '@/app/actions/reader-actions'
import {
  BookOpen,
  Heart,
  History,
  Coins,
  TrendingUp,
  Clock,
  Star,
  Eye,
  Lock,
  CreditCard,
  Download,
  Settings,
  User
} from 'lucide-react'

export default function LibraryPage() {
  const [activeTab, setActiveTab] = useState('continue-reading')
  const [loading, setLoading] = useState(true)
  const [libraryData, setLibraryData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadLibrary() {
      try {
        setLoading(true)
        const data = await getUserLibrary()
        
        if (data.error) {
          setError(data.error)
          return
        }
        
        setLibraryData(data)
      } catch (err) {
        console.error('Failed to load library:', err)
        setError('Failed to load library')
      } finally {
        setLoading(false)
      }
    }

    loadLibrary()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading your library...</p>
        </div>
      </div>
    )
  }

  if (error || !libraryData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <p className="text-xl font-semibold">{error || 'Failed to load library'}</p>
          <Link href="/browse">
            <Button>Browse Series</Button>
          </Link>
        </div>
      </div>
    )
  }

  const { user, readingProgress, favorites, transactions } = libraryData

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">My Library</h1>
        <p className="text-muted-foreground">Manage your reading collection and account</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Coin Balance</CardTitle>
            <Coins className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{user?.coin_balance || 0}</div>
            <Link href="/coins">
              <p className="text-xs text-primary hover:underline cursor-pointer mt-1">
                Buy more coins →
              </p>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Continue Reading</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{readingProgress?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Favorites</CardTitle>
            <Heart className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{favorites?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Series saved
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Chapters Read</CardTitle>
            <BookOpen className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">147</div>
            <p className="text-xs text-muted-foreground mt-1">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:grid-cols-5">
          <TabsTrigger value="continue-reading">
            <Clock className="h-4 w-4 mr-2" />
            Continue Reading
          </TabsTrigger>
          <TabsTrigger value="favorites">
            <Heart className="h-4 w-4 mr-2" />
            Favorites
          </TabsTrigger>
          <TabsTrigger value="history">
            <History className="h-4 w-4 mr-2" />
            History
          </TabsTrigger>
          <TabsTrigger value="wallet">
            <Coins className="h-4 w-4 mr-2" />
            Wallet
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        {/* Continue Reading Tab */}
        <TabsContent value="continue-reading" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Continue Reading</h2>
            <Button variant="outline" size="sm">Clear All</Button>
          </div>

          {readingProgress && readingProgress.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {readingProgress.map((item: any) => (
                <Card key={item.id} className="overflow-hidden">
                  <div className="flex">
                    <div className="w-32 flex-shrink-0">
                      <img
                        src={item.series?.cover_url || '/placeholder.png'}
                        alt={item.series?.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 p-4">
                      <div className="mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.series?.content_type === 'novel'
                            ? 'bg-primary/10 text-primary'
                            : 'bg-purple-600/10 text-purple-600'
                        }`}>
                          {item.series?.content_type === 'novel' ? 'Novel' : 'Manga'}
                        </span>
                      </div>
                      <Link href={`/series/${item.series_id}`}>
                        <h3 className="font-semibold text-lg mb-2 hover:text-primary cursor-pointer">
                          {item.series?.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-muted-foreground mb-3">
                        Chapter {item.last_chapter_read} of {item.series?.total_chapters}
                      </p>
                      <div className="mb-3">
                        <div className="flex items-center justify-between text-xs text-muted-foreground mb-1">
                          <span>{item.progress_percentage}% complete</span>
                          <span>{new Date(item.last_read_at).toLocaleDateString()}</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2">
                          <div
                            className="bg-primary h-2 rounded-full transition-all"
                            style={{ width: `${item.progress_percentage}%` }}
                          />
                        </div>
                      </div>
                      <Link href={`/read/${item.series_id}/${item.last_chapter_read}`}>
                        <Button className="w-full" size="sm">
                          Continue Reading
                        </Button>
                      </Link>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <BookOpen className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No series in progress</p>
                <Link href="/browse">
                  <Button>Browse Stories</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Favorites Tab */}
        <TabsContent value="favorites" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">My Favorites</h2>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Sort by: Recently Added</Button>
            </div>
          </div>

          {favorites && favorites.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {favorites.map((item: any) => (
                <Link key={item.id} href={`/series/${item.series?.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <CardHeader className="p-0">
                      <div className="relative aspect-[3/4] overflow-hidden rounded-t-lg">
                        <img
                          src={item.series?.cover_url || '/placeholder.png'}
                          alt={item.series?.title}
                          className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute top-2 right-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 bg-black/50 hover:bg-black/70"
                          >
                            <Heart className="h-4 w-4 fill-red-500 text-red-500" />
                          </Button>
                        </div>
                        {item.series?.avg_rating && (
                          <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded flex items-center gap-1">
                            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                            <span className="text-xs font-semibold">{item.series.avg_rating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent className="p-3">
                      <h3 className="font-semibold line-clamp-2 mb-1">{item.series?.title}</h3>
                      <p className="text-xs text-muted-foreground mb-2">by {item.series?.author}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{item.series?.total_chapters} chapters</span>
                        <span className="capitalize">{item.series?.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Heart className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No favorites yet</p>
                <Link href="/browse">
                  <Button>Discover Stories</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Reading History</h2>
            <Button variant="outline" size="sm">Clear History</Button>
          </div>

          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">Reading history coming soon</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Wallet Tab */}
        <TabsContent value="wallet" className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">Wallet & Transactions</h2>
            <Link href="/coins">
              <Button>
                <Coins className="mr-2 h-4 w-4" />
                Buy Coins
              </Button>
            </Link>
          </div>

          {/* Balance Card */}
          <Card className="bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-white/80 mb-2">Available Balance</p>
                  <div className="flex items-center gap-3">
                    <Coins className="h-8 w-8" />
                    <span className="text-4xl font-bold">{user?.coin_balance || 0}</span>
                    <span className="text-xl">coins</span>
                  </div>
                </div>
                <CreditCard className="h-16 w-16 opacity-50" />
              </div>
            </CardContent>
          </Card>

          {/* Transaction History */}
          <Card>
            <CardHeader>
              <CardTitle>Transaction History</CardTitle>
              <CardDescription>View all your coin transactions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {transactions && transactions.map((tx: any) => (
                  <div key={tx.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className={`p-2 rounded-full ${
                        tx.type === 'purchase' ? 'bg-green-500/10' : 'bg-red-500/10'
                      }`}>
                        {tx.type === 'purchase' ? (
                          <Download className="h-4 w-4 text-green-600" />
                        ) : (
                          <Lock className="h-4 w-4 text-red-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{tx.description || `${tx.type} transaction`}</p>
                        <p className="text-sm text-muted-foreground">{new Date(tx.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-semibold ${
                        tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount} coins
                      </p>
                      <p className="text-xs text-muted-foreground capitalize">{tx.status}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <h2 className="text-2xl font-bold mb-4">Account Settings</h2>

          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Manage your account details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <p className="font-semibold">{user?.display_name || user?.email || 'User'}</p>
                  <p className="text-sm text-muted-foreground">{user?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Recently'}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline">Edit Profile</Button>
                <Button variant="outline">Change Password</Button>
              </div>
            </CardContent>
          </Card>

          {/* Reading Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>Reading Preferences</CardTitle>
              <CardDescription>Customize your reading experience</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Auto-mark as read</p>
                  <p className="text-sm text-muted-foreground">Automatically mark chapters as read when scrolling to the end</p>
                </div>
                <Button variant="outline" size="sm">Enable</Button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email notifications</p>
                  <p className="text-sm text-muted-foreground">Get notified when your favorite series update</p>
                </div>
                <Button variant="outline" size="sm">Configure</Button>
              </div>
            </CardContent>
          </Card>

          {/* Account Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Account Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start">
                <Download className="mr-2 h-4 w-4" />
                Download My Data
              </Button>
              <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                Delete Account
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
