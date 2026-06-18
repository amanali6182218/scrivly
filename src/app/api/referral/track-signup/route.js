import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { REFERRAL_SIGNUP_BONUS, REFERRED_USER_BONUS, buildReferralSignupEmailHtml } from '@/lib/referral'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Scrivly <onboarding@resend.dev>'

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const { newUserId, refCode } = body
  if (!newUserId || !refCode) {
    return NextResponse.json({ noReferral: true })
  }

  const admin = createAdminClient()
  const normalizedCode = String(refCode).toUpperCase().trim()

  const { data: referrer } = await admin
    .from('profiles')
    .select('id, referral_code, device_fingerprint, signup_ip, credits, total_referrals, referral_credits_earned')
    .eq('referral_code', normalizedCode)
    .maybeSingle()

  if (!referrer) {
    return NextResponse.json({ noReferral: true })
  }

  if (referrer.id === newUserId) {
    return NextResponse.json({ noReferral: true, reason: 'self-referral' })
  }

  const { data: newUser } = await admin
    .from('profiles')
    .select('id, device_fingerprint, signup_ip, referred_by')
    .eq('id', newUserId)
    .maybeSingle()

  if (!newUser) {
    return NextResponse.json({ error: 'User not found.' }, { status: 404 })
  }

  if (newUser.referred_by) {
    return NextResponse.json({ noReferral: true, reason: 'already-referred' })
  }

  // Anti-abuse: block if this device/IP was used by the referrer themselves
  const sameDeviceAsReferrer =
    (newUser.device_fingerprint && newUser.device_fingerprint === referrer.device_fingerprint) ||
    (newUser.signup_ip && newUser.signup_ip === referrer.signup_ip)

  if (sameDeviceAsReferrer) {
    return NextResponse.json({ noReferral: true, reason: 'device-match-blocked' })
  }

  // Anti-abuse: block if another account from this IP already claimed a referral bonus
  if (newUser.signup_ip) {
    const { data: ipReuse } = await admin
      .from('profiles')
      .select('id')
      .eq('signup_ip', newUser.signup_ip)
      .not('referred_by', 'is', null)
      .neq('id', newUserId)
      .maybeSingle()

    if (ipReuse) {
      return NextResponse.json({ noReferral: true, reason: 'ip-already-used-for-referral' })
    }
  }

  const now = new Date().toISOString()
  const newTotalReferrals = (referrer.total_referrals || 0) + 1
  const newCreditsEarned = (referrer.referral_credits_earned || 0) + REFERRAL_SIGNUP_BONUS

  await admin
    .from('profiles')
    .update({ referred_by: referrer.id, credits: REFERRED_USER_BONUS, updated_at: now })
    .eq('id', newUserId)

  await admin
    .from('profiles')
    .update({
      credits: (referrer.credits || 0) + REFERRAL_SIGNUP_BONUS,
      referral_credits_earned: newCreditsEarned,
      total_referrals: newTotalReferrals,
      updated_at: now,
    })
    .eq('id', referrer.id)

  await admin.from('referral_events').insert({
    referrer_id: referrer.id,
    referred_id: newUserId,
    event_type: 'signup',
    credits_awarded: REFERRAL_SIGNUP_BONUS,
  })

  await admin.from('credit_transactions').insert({
    user_id: newUserId,
    type: 'referral_bonus',
    amount: REFERRED_USER_BONUS,
    description: `Signed up via referral code ${normalizedCode}`,
  })

  await admin.from('credit_transactions').insert({
    user_id: referrer.id,
    type: 'referral_bonus',
    amount: REFERRAL_SIGNUP_BONUS,
    description: 'Referral signup bonus',
  })

  try {
    const { data: referrerAuth } = await admin.auth.admin.getUserById(referrer.id)
    const referrerEmail = referrerAuth?.user?.email
    if (referrerEmail) {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: referrerEmail,
        subject: 'Someone used your Scrivly referral link! +5 credits 🎉',
        html: buildReferralSignupEmailHtml({
          referralCode: referrer.referral_code,
          totalReferrals: newTotalReferrals,
          creditsEarned: newCreditsEarned,
        }),
      })
    }
  } catch {
    // email failures should never block the referral reward
  }

  return NextResponse.json({ success: true, creditsAdded: REFERRED_USER_BONUS })
}
