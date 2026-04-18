import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import EarningsClient from './EarningsClient'

export default async function EarningsPage() {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  // Check if user has any series (writer) — role field is informational only
  const { count } = await supabase
    .from('series')
    .select('id', { count: 'exact', head: true })
    .eq('author_id', user.id)

  if (!count) {
    redirect('/write/dashboard')
  }

  return <EarningsClient />
}
