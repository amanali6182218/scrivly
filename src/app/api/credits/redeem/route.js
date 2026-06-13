import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { getHigherTier } from '@/lib/plans'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const { code, userId } = body
  if (!code || !userId) {
    return NextResponse.json({ error: 'code and userId are required.' }, { status: 400 })
  }

  const normalizedCode = code.toUpperCase().trim()
  const admin = createAdminClient()

  // Look up the code
  const { data: redeemCode, error: lookupError } = await admin
    .from('redeem_codes')
    .select('*')
    .eq('code', normalizedCode)
    .single()

  if (lookupError || !redeemCode) {
    return NextResponse.json({ error: 'Invalid code.' }, { status: 404 })
  }

  if (redeemCode.is_used) {
    return NextResponse.json({ error: 'This code has already been redeemed.' }, { status: 409 })
  }

  // ETY- codes are starter packs — one per account
  const isStarterPack = normalizedCode.startsWith('ETY-')
  if (isStarterPack) {
    const { data: existingPurchase } = await admin
      .from('credit_transactions')
      .select('id')
      .eq('user_id', userId)
      .eq('type', 'purchase')
      .maybeSingle()

    if (existingPurchase) {
      return NextResponse.json(
        { error: 'Each account can only redeem one starter pack.' },
        { status: 400 }
      )
    }
  }

  // Fetch current balance before making any writes
  const { data: profile } = await admin
    .from('profiles')
    .select('credits, pack_tier, highest_pack_tier')
    .eq('id', userId)
    .single()

  const currentCredits = profile?.credits ?? 0
  const newBalance = currentCredits + redeemCode.credits
  const now = new Date().toISOString()
  const codeTier = redeemCode.pack_tier || 'starter'
  const highestTier = getHigherTier(profile?.highest_pack_tier || 'none', codeTier)

  // Mark code as used and add credits in immediate sequence
  await admin
    .from('redeem_codes')
    .update({ is_used: true, used_by: userId, used_at: now })
    .eq('id', redeemCode.id)

  await admin
    .from('profiles')
    .update({ credits: newBalance, pack_tier: codeTier, highest_pack_tier: highestTier, updated_at: now })
    .eq('id', userId)

  // Log the transaction
  await admin.from('credit_transactions').insert({
    user_id: userId,
    type: 'purchase',
    amount: redeemCode.credits,
    description: `Redeemed code: ${normalizedCode}`,
  })

  return NextResponse.json({
    success: true,
    creditsAdded: redeemCode.credits,
    newBalance,
  })
}
