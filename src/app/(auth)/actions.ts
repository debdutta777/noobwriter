'use server'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string
  const displayName = formData.get('displayName') as string
  const role = formData.get('role') as 'reader' | 'writer' | 'both'

  const supabase = await createClient()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName,
        role: role,
      },
    },
  })

  if (error) {
    // For server actions with forms, we redirect to show errors
    redirect(`/auth/signup?error=${encodeURIComponent(error.message)}`)
  }

  // Create profile
  if (data.user) {
    await supabase.from('profiles').insert({
      id: data.user.id,
      email: data.user.email!,
      display_name: displayName,
      role: role,
    })

    // Create wallet
    await supabase.from('wallets').insert({
      user_id: data.user.id,
      coin_balance: 100, // Welcome bonus
    })
  }

  revalidatePath('/', 'layout')
  
  // Redirect based on role
  if (role === 'writer' || role === 'both') {
    redirect('/write/dashboard')
  } else {
    redirect('/library')
  }
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // For server actions with forms, we redirect to show errors
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/auth/login')
}

export async function signInWithGoogle() {
  const supabase = await createClient()
  
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`,
    },
  })

  if (error) {
    redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  if (data.url) {
    redirect(data.url)
  }
  
  redirect('/auth/login?error=Failed to initiate OAuth')
}
