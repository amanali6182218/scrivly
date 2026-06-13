import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getHistoryLimit } from '@/lib/plans'
import HistoryShell from '@/components/HistoryShell'

export const dynamic = 'force-dynamic'

export default async function HistoryPage() {
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

  const packTier = profile.pack_tier || 'none'
  const historyLimit = getHistoryLimit(packTier)
  const fetchLimit = historyLimit ?? 50

  const { data: history } = await supabase
    .from('generation_history')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(fetchLimit)

  return <HistoryShell user={user} profile={profile} initialHistory={history || []} />
}
