import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import AccountShell from '@/components/AccountShell'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
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

  return <AccountShell user={user} profile={profile} />
}
