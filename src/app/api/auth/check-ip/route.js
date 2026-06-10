import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || null
}

export async function POST(request) {
  const ip = getClientIp(request)
  if (!ip) return NextResponse.json({ suspicious: false })

  const admin = createAdminClient()
  const { data } = await admin
    .from('profiles')
    .select('id')
    .eq('signup_ip', ip)
    .eq('total_credits_purchased', 0)
    .maybeSingle()

  return NextResponse.json({ suspicious: !!data })
}
