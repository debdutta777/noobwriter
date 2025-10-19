'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { 
  Moon, 
  Sun, 
  Search, 
  BookOpen, 
  PenTool, 
  Menu,
  User,
  Coins,
  Settings,
  LogOut,
  Library
} from 'lucide-react'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface UserProfile {
  id: string
  display_name: string | null
  email: string | null
  avatar_url: string | null
  coin_balance: number
  has_published_series: boolean
}

export function Navbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const supabase = createClient()

  // Check auth state
  useEffect(() => {
    setMounted(true)
    
    // Get initial session
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
    })
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    
    return () => subscription.unsubscribe()
  }, [supabase.auth])

  // Fetch user profile when user changes
  const fetchUserProfile = useCallback(async (userId: string) => {
    try {
      const { data: profileData, error: profileError} = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url')
        .eq('id', userId)
        .single()

      // If profile doesn't exist, create it
      if (profileError || !profileData) {
        const { data: userData } = await supabase.auth.getUser()
        if (userData.user) {
          await supabase.from('profiles').insert({
            id: userId,
            email: userData.user.email,
            display_name: userData.user.email?.split('@')[0] || 'User',
          })
        }
      }

      const { data: walletData, error: walletError } = await supabase
        .from('wallets')
        .select('coin_balance')
        .eq('user_id', userId)
        .single()

      // If wallet doesn't exist, create it
      if (walletError || !walletData) {
        await supabase.from('wallets').insert({
          user_id: userId,
          coin_balance: 100, // Give 100 free coins
        })
      }

      // Check if user has published any series
      const { count } = await supabase
        .from('series')
        .select('*', { count: 'exact', head: true })
        .eq('author_id', userId)

      if (profileData) {
        setProfile({
          ...profileData,
          coin_balance: walletData?.coin_balance || 100,
          has_published_series: (count || 0) > 0
        })
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }, [supabase])

  useEffect(() => {
    if (user) {
      fetchUserProfile(user.id)
    } else {
      setProfile(null)
    }
  }, [user, fetchUserProfile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/')
    router.refresh()
  }

  if (!mounted) return null

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              NoobWriter
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/browse"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/browse' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Browse
            </Link>
            <Link
              href="/novels"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/novels' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Novels
            </Link>
            <Link
              href="/manga"
              className={`text-sm font-medium transition-colors hover:text-primary ${
                pathname === '/manga' ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Manga
            </Link>
            <Link
              href="/write"
              className={`flex items-center space-x-1 text-sm font-medium transition-colors hover:text-purple-600 ${
                pathname.startsWith('/write') ? 'text-purple-600' : 'text-muted-foreground'
              }`}
            >
              <PenTool className="h-4 w-4" />
              <span>Write</span>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="hidden lg:flex flex-1 max-w-md mx-6">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search novels, manga, authors..."
                className="w-full pl-10"
              />
            </div>
          </div>

          {/* Right Side Actions */}
          <div className="flex items-center space-x-2">
            {/* Theme Toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9"
            >
              {theme === 'dark' ? (
                <Sun className="h-5 w-5" />
              ) : (
                <Moon className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Auth Buttons or User Menu */}
            {user ? (
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="h-9 w-9"
                >
                  <User className="h-5 w-5" />
                </Button>

                {/* User Dropdown Menu */}
                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-56 rounded-lg border bg-popover p-2 shadow-lg">
                    <div className="px-3 py-2 border-b mb-2">
                      <p className="text-sm font-medium">{profile?.display_name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{profile?.email || user.email}</p>
                    </div>
                    
                    <Link
                      href="/library"
                      className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Library className="h-4 w-4" />
                      <span>My Library</span>
                    </Link>

                    <Link
                      href="/wallet"
                      className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Coins className="h-4 w-4" />
                      <span>Wallet ({profile?.coin_balance || 0} coins)</span>
                    </Link>

                    {profile?.has_published_series && (
                      <Link
                        href="/write/dashboard"
                        className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        <PenTool className="h-4 w-4" />
                        <span>Writer Dashboard</span>
                      </Link>
                    )}

                    <Link
                      href="/settings"
                      className="flex items-center space-x-2 rounded-md px-3 py-2 text-sm hover:bg-accent"
                      onClick={() => setUserMenuOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      <span>Settings</span>
                    </Link>

                    <div className="border-t my-2" />

                    <button
                      onClick={handleSignOut}
                      className="flex w-full items-center space-x-2 rounded-md px-3 py-2 text-sm text-red-600 hover:bg-accent"
                    >
                      <LogOut className="h-4 w-4" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="hidden md:flex items-center space-x-2">
                <Link href="/login">
                  <Button variant="ghost">Sign In</Button>
                </Link>
                <Link href="/signup">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-9 w-9"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 space-y-3">
            {/* Mobile Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search..."
                className="w-full pl-10"
              />
            </div>

            {/* Mobile Navigation Links */}
            <Link
              href="/browse"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              Browse
            </Link>
            <Link
              href="/novels"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              Novels
            </Link>
            <Link
              href="/manga"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              Manga
            </Link>
            <Link
              href="/write"
              className="block px-3 py-2 rounded-md text-sm font-medium hover:bg-accent"
            >
              <span className="flex items-center space-x-2">
                <PenTool className="h-4 w-4" />
                <span>Write</span>
              </span>
            </Link>

            {/* Mobile Auth Buttons */}
            {!user && (
              <div className="flex space-x-2 pt-2">
                <Link href="/login" className="flex-1">
                  <Button variant="outline" className="w-full">Sign In</Button>
                </Link>
                <Link href="/signup" className="flex-1">
                  <Button className="w-full">Sign Up</Button>
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
