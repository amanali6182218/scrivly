import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { getHigherTier } from '@/lib/plans'
import { REFERRAL_PURCHASE_BONUS, buildReferralPurchaseEmailHtml } from '@/lib/referral'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Scrivly <onboarding@resend.dev>'

async function awardReferralPurchaseBonus(admin, userId, now) {
  const { data: buyerProfile } = await admin
    .from('profiles')
    .select('referred_by')
    .eq('id', userId)
    .single()

  if (!buyerProfile?.referred_by) return

  const { data: existingPurchaseEvent } = await admin
    .from('referral_events')
    .select('id')
    .eq('referred_id', userId)
    .eq('event_type', 'purchase')
    .maybeSingle()

  if (existingPurchaseEvent) return

  const referrerId = buyerProfile.referred_by
  const { data: referrerProfile } = await admin
    .from('profiles')
    .select('credits, referral_credits_earned, referral_purchases, total_referrals')
    .eq('id', referrerId)
    .single()

  if (!referrerProfile) return

  const newCreditsEarned = (referrerProfile.referral_credits_earned || 0) + REFERRAL_PURCHASE_BONUS
  const newReferralPurchases = (referrerProfile.referral_purchases || 0) + 1

  await admin
    .from('profiles')
    .update({
      credits: (referrerProfile.credits || 0) + REFERRAL_PURCHASE_BONUS,
      referral_credits_earned: newCreditsEarned,
      referral_purchases: newReferralPurchases,
      updated_at: now,
    })
    .eq('id', referrerId)

  await admin.from('referral_events').insert({
    referrer_id: referrerId,
    referred_id: userId,
    event_type: 'purchase',
    credits_awarded: REFERRAL_PURCHASE_BONUS,
  })

  await admin.from('credit_transactions').insert({
    user_id: referrerId,
    type: 'referral_bonus',
    amount: REFERRAL_PURCHASE_BONUS,
    description: 'Referral purchase bonus',
  })

  try {
    const { data: referrerAuth } = await admin.auth.admin.getUserById(referrerId)
    const referrerEmail = referrerAuth?.user?.email
    if (referrerEmail) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: referrerEmail,
        subject: 'Your referral just made a purchase! +10 credits 🎉',
        html: buildReferralPurchaseEmailHtml({
          totalReferrals: referrerProfile.total_referrals || 0,
          referralPurchases: newReferralPurchases,
          creditsEarned: newCreditsEarned,
        }),
      })
    }
  } catch {
    // email failures should never block the referral reward
  }
}

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

  await awardReferralPurchaseBonus(admin, userId, now)

  return NextResponse.json({
    success: true,
    creditsAdded: redeemCode.credits,
    newBalance,
  })
}
