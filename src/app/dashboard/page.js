import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardShell from '@/components/DashboardShell'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile) {
    redirect('/login')
  }

  const { data: purchase } = await supabase
    .from('credit_transactions')
    .select('id')
    .eq('user_id', user.id)
    .eq('type', 'purchase')
    .limit(1)
    .maybeSingle()

  return <DashboardShell user={user} profile={profile} hasRedeemed={!!purchase} />
}
