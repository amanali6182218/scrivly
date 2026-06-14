import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Scrivly <onboarding@resend.dev>'
const ALERT_EMAIL = 'scrivly@gmail.com'

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function buildCodeEmailHtml({ buyerName, code }) {
  const safeName = escapeHtml(buyerName || 'there')
  const safeCode = escapeHtml(code)

  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: #f4f4f7; padding: 32px;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px; text-align: center;">
        <img src="https://scrivly.vercel.app/logo.png" alt="Scrivly" style="height: 40px; margin-bottom: 16px;" />
        <h1 style="font-size: 20px; margin: 0 0 12px;">Hi ${safeName}!</h1>
        <p style="font-size: 15px; color: #444; line-height: 1.5;">
          Thank you for your purchase. Your unique access code is ready.
        </p>

        <p style="margin: 28px 0 8px; font-size: 12px; font-weight: 700; letter-spacing: 1px; color: #888; text-transform: uppercase;">
          Your unique code:
        </p>
        <div style="background: #f4f4f7; border: 1px solid #e0e0e0; border-radius: 10px; padding: 16px; font-family: monospace; font-size: 20px; font-weight: 700; letter-spacing: 2px; color: #FF3D8B;">
          ${safeCode}
        </div>

        <div style="text-align: left; margin: 28px 0;">
          <p style="font-size: 14px; color: #444; margin: 8px 0;"><strong>1.</strong> Go to scrivly.vercel.app</p>
          <p style="font-size: 14px; color: #444; margin: 8px 0;"><strong>2.</strong> Create your free account</p>
          <p style="font-size: 14px; color: #444; margin: 8px 0;"><strong>3.</strong> Enter your code in the redeem banner</p>
        </div>

        <p style="font-size: 13px; color: #888;">
          Credits never expire — use them at your own pace.
        </p>

        <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
        <p style="font-size: 12px; color: #aaa;">scrivly@gmail.com</p>
      </div>
    </div>
  `
}

export async function POST(request) {
  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const { secret, buyerEmail, buyerName, orderId, packTier } = body

  if (secret !== process.env.MAKE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Unauthorized.' }, { status: 401 })
  }

  if (!buyerEmail || !orderId || !packTier) {
    return NextResponse.json({ error: 'buyerEmail, orderId and packTier are required.' }, { status: 400 })
  }

  const admin = createAdminClient()

  // Already processed this order — avoid issuing a duplicate code
  const { data: existingPurchase } = await admin
    .from('purchases')
    .select('id')
    .eq('lemon_squeezy_order_id', orderId)
    .maybeSingle()

  if (existingPurchase) {
    return NextResponse.json({ success: true, alreadyProcessed: true })
  }

  // Find the oldest unused, unreserved code for this tier
  const { data: codes } = await admin
    .from('redeem_codes')
    .select('*')
    .eq('is_used', false)
    .eq('pack_tier', packTier)
    .is('reserved_for_email', null)
    .order('created_at', { ascending: true })
    .limit(1)

  const codeRow = codes?.[0]

  if (!codeRow) {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: ALERT_EMAIL,
      subject: `URGENT: Out of ${packTier} codes — buyer waiting`,
      html: `<p>Buyer email: ${escapeHtml(buyerEmail)}</p><p>Order ID: ${escapeHtml(orderId)}</p>`,
    })
    return NextResponse.json({ error: `Out of ${packTier} codes.` }, { status: 503 })
  }

  const now = new Date().toISOString()

  await admin
    .from('redeem_codes')
    .update({ reserved_for_email: buyerEmail, order_id: orderId, reserved_at: now })
    .eq('id', codeRow.id)

  await admin.from('purchases').insert({
    lemon_squeezy_order_id: orderId,
    purchase_type: 'credit_pack',
    plan_name: `${packTier}_pack`,
    credits_added: codeRow.credits,
    amount_paid: 0,
    status: 'etsy_sale',
  })

  await resend.emails.send({
    from: FROM_EMAIL,
    to: buyerEmail,
    subject: 'Your Scrivly access code is here 🎉',
    html: buildCodeEmailHtml({ buyerName, code: codeRow.code }),
  })

  return NextResponse.json({ success: true, codeAssigned: true, tier: packTier })
}
