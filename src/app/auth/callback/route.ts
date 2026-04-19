import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import type { Database } from '@/types/database'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const next = requestUrl.searchParams.get('next') ?? '/'
  const origin = requestUrl.origin

  const response = NextResponse.redirect(`${origin}${next}`)

  if (!code) return response

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          response.cookies.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          response.cookies.set({ name, value: '', ...options })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)
  if (error || !data.user) return response

  const { data: profile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle()

  if (!profile) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email!,
      display_name:
        data.user.user_metadata?.full_name ||
        data.user.email?.split('@')[0] ||
        'User',
      avatar_url: data.user.user_metadata?.avatar_url,
      role: 'reader',
    })

    await supabase.from('wallets').insert({
      user_id: data.user.id,
      coin_balance: 5,
    })
  }

  return response
}
