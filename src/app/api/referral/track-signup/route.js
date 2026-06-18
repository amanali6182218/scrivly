import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createClient } from '@/lib/supabase/server'
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

  const refCode = typeof body?.refCode === 'string' ? body.refCode.trim() : ''
  if (!refCode) {
    return NextResponse.json({ error: 'refCode is required.' }, { status: 400 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const normalizedCode = refCode.toUpperCase()

  const { data: currentProfile } = await admin
    .from('profiles')
    .select('id, referred_by, device_fingerprint, credits')
    .eq('id', user.id)
    .single()

  if (!currentProfile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
  }

  if (currentProfile.referred_by) {
    return NextResponse.json({ alreadyTracked: true })
  }

  const { data: referrer } = await admin
    .from('profiles')
    .select('id, referral_code, credits, total_referrals, referral_credits_earned')
    .eq('referral_code', normalizedCode)
    .maybeSingle()

  if (!referrer) {
    return NextResponse.json({ error: 'Invalid referral code' }, { status: 404 })
  }

  if (referrer.id === user.id) {
    return NextResponse.json({ error: 'Self-referral is not allowed.' }, { status: 400 })
  }

  // Anti-abuse: block if this device fingerprint already triggered a referral bonus before
  if (currentProfile.device_fingerprint) {
    const { data: deviceReuse } = await admin
      .from('profiles')
      .select('id')
      .eq('device_fingerprint', currentProfile.device_fingerprint)
      .not('referred_by', 'is', null)
      .neq('id', user.id)
      .maybeSingle()

    if (deviceReuse) {
      return NextResponse.json({ error: 'This device has already used a referral link.' }, { status: 400 })
    }
  }

  const now = new Date().toISOString()
  const newTotalReferrals = (referrer.total_referrals || 0) + 1
  const newCreditsEarned = (referrer.referral_credits_earned || 0) + REFERRAL_SIGNUP_BONUS

  await admin
    .from('profiles')
    .update({
      referred_by: referrer.id,
      credits: (currentProfile.credits || 0) + REFERRED_USER_BONUS,
      updated_at: now,
    })
    .eq('id', user.id)

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
    referred_id: user.id,
    event_type: 'signup',
    credits_awarded: REFERRAL_SIGNUP_BONUS,
  })

  await admin.from('credit_transactions').insert({
    user_id: user.id,
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

  return NextResponse.json({
    success: true,
    creditsAdded: REFERRED_USER_BONUS,
    message: '3 credits added to your account',
  })
}
