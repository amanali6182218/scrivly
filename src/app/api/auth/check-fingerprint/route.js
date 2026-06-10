import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ isAbuser: false })
  }

  const { fingerprint } = body
  if (!fingerprint) return NextResponse.json({ isAbuser: false })

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('device_fingerprint', fingerprint)
    .eq('total_credits_purchased', 0)
    .maybeSingle()

  return NextResponse.json({ isAbuser: !!data })
}
