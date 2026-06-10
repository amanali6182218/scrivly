import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request) {
  // Verify the caller is authenticated
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const amount = Number(body.amount) || 1
  const description = body.description || 'Credit usage'

  const admin = createAdminClient()

  // Fetch current balance
  const { data: profile, error: fetchError } = await admin
    .from('profiles')
    .select('credits')
    .eq('id', user.id)
    .single()

  if (fetchError || !profile) {
    return NextResponse.json({ error: 'Could not fetch credit balance.' }, { status: 500 })
  }

  if (profile.credits < amount) {
    return NextResponse.json({ error: 'Insufficient credits', success: false }, { status: 402 })
  }

  const newBalance = profile.credits - amount

  const { error: updateError } = await admin
    .from('profiles')
    .update({ credits: newBalance, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (updateError) {
    return NextResponse.json({ error: 'Failed to deduct credits.' }, { status: 500 })
  }

  await admin.from('credit_transactions').insert({
    user_id: user.id,
    type: 'usage',
    amount: -amount,
    description,
  })

  return NextResponse.json({ success: true, remainingCredits: newBalance })
}
