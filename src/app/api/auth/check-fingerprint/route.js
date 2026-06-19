import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ blocked: false }, { status: 200 })
  }

  const { fingerprint } = body
  if (!fingerprint) return NextResponse.json({ blocked: false }, { status: 200 })

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('device_fingerprint', fingerprint)
    .eq('total_credits_purchased', 0)
    .maybeSingle()

  return NextResponse.json({ blocked: !!data }, { status: 200 })
}
