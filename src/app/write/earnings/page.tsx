import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EarningsClient from './EarningsClient'

export default async function EarningsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/login')
  }

  // Check if user is a writer
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || (profile.role !== 'writer' && profile.role !== 'both')) {
    redirect('/dashboard')
  }

  return <EarningsClient />
}
