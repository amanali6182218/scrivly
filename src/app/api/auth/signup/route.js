import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { createAdminClient } from '@/lib/supabase/admin'
import { isDisposableEmail } from '@/lib/disposable-email-domains'

function getClientIp(request) {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) return forwarded.split(',')[0].trim()
  return request.headers.get('x-real-ip') || null
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { email, password, fingerprint } = body

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 })
  }

  // Block disposable email domains
  if (isDisposableEmail(email)) {
    return NextResponse.json(
      { error: 'Please use a permanent email address to sign up.' },
      { status: 400 }
    )
  }

  const admin = createAdminClient()
  const ip = getClientIp(request)

  // Create the user via the anon client (sends confirmation email)
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  )

  const origin = request.headers.get('origin') || 'http://localhost:3000'
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  })

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }

  // The DB trigger creates the profile row immediately on user insert.
  // Update it with IP and fingerprint for abuse tracking.
  if (data.user) {
    await admin
      .from('profiles')
      .update({
        signup_ip: ip,
        device_fingerprint: fingerprint || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', data.user.id)
  }

  return NextResponse.json({ success: true, userId: data.user?.id ?? null })
}
