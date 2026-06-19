import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('signup_ip', ip)
    .eq('total_credits_purchased', 0)
    .gt('credits', 0)
    .maybeSingle()

  return NextResponse.json({ blocked: !!data }, { status: 200 })
}
