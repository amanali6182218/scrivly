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
  console.log('[track-signup] received refCode:', refCode)
  if (!refCode) {
    return NextResponse.json({ error: 'refCode is required.' }, { status: 400 })
  }

  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  console.log('[track-signup] authenticated user:', user?.id)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const admin = createAdminClient()
  const normalizedCode = refCode.toUpperCase()

  const { data: currentProfile, error: currentProfileError } = await admin
    .from('profiles')
    .select('id, referred_by, device_fingerprint, credits')
    .eq('id', user.id)
    .single()

  console.log('[track-signup] currentProfile:', currentProfile, 'error:', currentProfileError)

  if (!currentProfile) {
    return NextResponse.json({ error: 'Profile not found.' }, { status: 404 })
  }

  if (currentProfile.referred_by) {
    console.log('[track-signup] already tracked, referred_by:', currentProfile.referred_by)
    return NextResponse.json({ alreadyTracked: true })
  }

  const { data: referrer, error: referrerError } = await admin
    .from('profiles')
    .select('id, referral_code, credits, total_referrals, referral_credits_earned, total_credits_purchased')
    .eq('referral_code', normalizedCode)
    .maybeSingle()

  console.log('[track-signup] looked up referrer for code', normalizedCode, '→', referrer, 'error:', referrerError)

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

  // Anti-abuse: block if this IP already received referral credits
  const clientIp =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'

  if (clientIp !== '127.0.0.1') {
    const { data: ipAbuse } = await admin
      .from('profiles')
      .select('id')
      .eq('signup_ip', clientIp)
      .not('referred_by', 'is', null)
      .limit(1)

    if (ipAbuse && ipAbuse.length > 0) {
      // IP already used for referral — account exists, but no credits awarded
      return NextResponse.json({
        success: false,
        blocked: true,
        reason: 'ip_already_referred',
        message: 'This network has already received referral credits',
      })
    }
  }

  const now = new Date().toISOString()
  const newTotalReferrals = (referrer.total_referrals || 0) + 1
  const newCreditsEarned = (referrer.referral_credits_earned || 0) + REFERRAL_SIGNUP_BONUS

  const { error: updateNewUserError } = await admin
    .from('profiles')
    .update({
      referred_by: referrer.id,
      credits: (currentProfile.credits || 0) + REFERRED_USER_BONUS,
      updated_at: now,
    })
    .eq('id', user.id)

  console.log('[track-signup] updated new user credits, error:', updateNewUserError)

  // Check referrer has purchased before awarding bonus credits
  if (!referrer.total_credits_purchased || referrer.total_credits_purchased === 0) {
    // New user still gets 3 credits but referrer gets no bonus
    return NextResponse.json({
      success: true,
      creditsAdded: REFERRED_USER_BONUS,
      referrerRewarded: false,
      message: 'Credits added to new user. Referrer has not purchased yet — no bonus awarded.',
    })
  }

  // Only reaches here if referrer has purchased — award bonus
  const { error: updateReferrerError } = await admin
    .from('profiles')
    .update({
      credits: (referrer.credits || 0) + REFERRAL_SIGNUP_BONUS,
      referral_credits_earned: newCreditsEarned,
      total_referrals: newTotalReferrals,
      updated_at: now,
    })
    .eq('id', referrer.id)

  console.log('[track-signup] updated referrer credits, error:', updateReferrerError)

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
