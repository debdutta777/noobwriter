import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  if (code) {
    const supabase = await createClient()
    
    // Exchange code for session
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error && data.user) {
      // Check if profile exists
      const { data: profile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', data.user.id)
        .single()

      // Create profile if it doesn't exist (OAuth users)
      if (!profile) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email: data.user.email!,
          display_name: data.user.user_metadata?.full_name || data.user.email?.split('@')[0] || 'User',
          avatar_url: data.user.user_metadata?.avatar_url,
          role: 'reader', // Default to reader for OAuth users, can change in settings
        })

        // Create wallet with welcome bonus
        await supabase.from('wallets').insert({
          user_id: data.user.id,
          coin_balance: 5, // Welcome bonus
        })
      }
    }
  }

  // Redirect to homepage
  return NextResponse.redirect(`${origin}/`)
}
