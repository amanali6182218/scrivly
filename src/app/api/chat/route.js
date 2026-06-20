import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

export const runtime = 'nodejs'

const ANTHROPIC_API_URL = 'https://api.anthropic.com/v1/messages'
const ANTHROPIC_MODEL = 'claude-sonnet-4-6'
const ANTHROPIC_VERSION = '2023-06-01'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Scrivly <onboarding@resend.dev>'
const SUPPORT_EMAIL = 'scrivly@gmail.com'

const SYSTEM_PROMPT = `You are Scrivly Assistant, a helpful and friendly support agent for
Scrivly — a tool that helps Etsy sellers create optimized listings,
analyze competitor products, manage credits, and grow their Etsy stores.

### WHAT YOU KNOW ABOUT SCRIVLY

CREDITS:
- Credits are used to generate listings, run Spy & Improve, and use Price Research
- Users redeem credits using a code on the Account or Billing page
- After redeeming, credits appear instantly in the dashboard
- Common issue: page needs refresh after redeeming

FEATURES:
- Listing Generator: Creates SEO-optimized Etsy listings from product info or images
- Spy & Improve: Analyze competitor listings and get improvement suggestions
- Price Research: Find optimal pricing for products based on market data
- Health Score: Rates the quality of a listing (0-100). Higher = better chance of ranking
- Etsy Connection: Users connect their Etsy store via OAuth in Settings

COMMON ERRORS:
- "Credits not showing" → Ask them to refresh. If still not showing, collect email and redeem code, escalate
- "Code already used" → Ask for code and email, escalate immediately
- "Generation failing" → Ask them to try again. If persists, escalate
- "Can't connect Etsy" → Ask them to disconnect and reconnect in Settings > Etsy Connection

ACCOUNT:
- Password change: Settings > Account > Change Password
- Email change: Settings > Account > Update Email
- Plan/billing: Settings > Billing

### HOW TO HANDLE REQUESTS

TIER 1 — Answer directly:
- How do I redeem a code
- How do credits work
- What is health score
- How do I use Spy & Improve / Price Research
- How do I connect Etsy
- How to change password or email

TIER 2 — Try to help, ask for details:
- Credits not showing after redeem → ask to refresh, if not resolved escalate
- Login issues → ask what error they see, provide steps
- Code says already used → escalate immediately

TIER 3 — Create a support ticket:
- Refund requests
- Billing disputes
- Bugs that persist after troubleshooting
- Anything you cannot resolve

### WHEN CREATING A TICKET
Respond with this exact JSON and nothing else:
{
  "action": "create_ticket",
  "issue_type": "billing|credits|bug|refund|other",
  "issue_summary": "one sentence summary of the issue",
  "message_to_user": "friendly message telling user ticket has been created with ticket number"
}

### TONE
- Friendly, warm, concise
- Never say "I cannot help with that"
- Always either answer or escalate
- Keep responses short (2-5 sentences max unless explaining a feature)`

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function extractJsonAction(text) {
  const trimmed = text.trim()
  const start = trimmed.indexOf('{')
  const end = trimmed.lastIndexOf('}')
  if (start === -1 || end === -1 || end < start) return null
  try {
    const parsed = JSON.parse(trimmed.slice(start, end + 1))
    if (parsed && parsed.action === 'create_ticket') return parsed
    return null
  } catch {
    return null
  }
}

async function generateTicketId(admin) {
  const todayStr = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const { count } = await admin
    .from('support_tickets')
    .select('id', { count: 'exact', head: true })
    .like('ticket_id', `SCR-${todayStr}-%`)

  const next = (count || 0) + 1
  return `SCR-${todayStr}-${String(next).padStart(4, '0')}`
}

function formatConversation(conversationHistory, message) {
  const lines = (conversationHistory || []).map(
    (turn) => `${turn.role === 'assistant' ? 'Assistant' : 'User'}: ${turn.content}`
  )
  lines.push(`User: ${message}`)
  return lines.join('\n')
}

function buildUserEmailHtml({ name, ticketId, issueSummary }) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: #f4f4f7; padding: 32px;">
      <div style="max-width: 480px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px;">
        <p style="font-size: 15px; color: #444;">Hi ${escapeHtml(name || 'there')},</p>
        <p style="font-size: 15px; color: #444; line-height: 1.5;">
          We received your support request and created ticket #${escapeHtml(ticketId)}.
        </p>
        <p style="font-size: 14px; color: #444;"><strong>Issue:</strong> ${escapeHtml(issueSummary)}</p>
        <p style="font-size: 14px; color: #444;">Our team will get back to you within 24 hours.</p>
        <p style="font-size: 14px; color: #888;">— Scrivly Support Team</p>
      </div>
    </div>
  `
}

function buildInternalEmailHtml({ ticketId, userEmail, issueType, issueSummary, fullConversation, createdAt }) {
  return `
    <div style="font-family: -apple-system, Segoe UI, Roboto, sans-serif; background: #f4f4f7; padding: 32px;">
      <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; padding: 32px;">
        <p style="font-size: 14px; color: #444;"><strong>Ticket:</strong> ${escapeHtml(ticketId)}</p>
        <p style="font-size: 14px; color: #444;"><strong>User Email:</strong> ${escapeHtml(userEmail || 'Not logged in')}</p>
        <p style="font-size: 14px; color: #444;"><strong>Issue Type:</strong> ${escapeHtml(issueType)}</p>
        <p style="font-size: 14px; color: #444;"><strong>Issue Summary:</strong> ${escapeHtml(issueSummary)}</p>
        <p style="font-size: 13px; color: #888; margin-top: 20px;"><strong>Full Conversation:</strong></p>
        <pre style="white-space: pre-wrap; font-family: monospace; font-size: 12px; color: #333; background: #f4f4f7; border-radius: 8px; padding: 16px;">${escapeHtml(fullConversation)}</pre>
        <p style="font-size: 12px; color: #888; margin-top: 20px;"><strong>Created At:</strong> ${escapeHtml(createdAt)}</p>
      </div>
    </div>
  `
}

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'Server is missing ANTHROPIC_API_KEY.' }, { status: 500 })
  }

  let body
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Request body must be valid JSON.' }, { status: 400 })
  }

  const message = typeof body?.message === 'string' ? body.message.trim() : ''
  const userId = body?.userId || null
  const userEmail = body?.userEmail || null
  const conversationHistory = Array.isArray(body?.conversationHistory) ? body.conversationHistory : []

  if (!message) {
    return NextResponse.json({ error: 'message is required.' }, { status: 400 })
  }

  const messages = [
    ...conversationHistory
      .filter((turn) => turn && typeof turn.content === 'string')
      .map((turn) => ({ role: turn.role === 'assistant' ? 'assistant' : 'user', content: turn.content })),
    { role: 'user', content: message },
  ]

  let anthropicResponse
  try {
    anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: SYSTEM_PROMPT,
        messages,
      }),
    })
  } catch {
    return NextResponse.json({ error: 'Failed to reach the Anthropic API.' }, { status: 502 })
  }

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text()
    return NextResponse.json({ error: `Anthropic API error (${anthropicResponse.status}): ${errorText}` }, { status: 502 })
  }

  const payload = await anthropicResponse.json()
  const textBlock = payload?.content?.find((block) => block?.type === 'text')
  const rawText = textBlock?.text

  if (!rawText) {
    return NextResponse.json({ error: 'Model response did not contain any text.' }, { status: 502 })
  }

  const ticketAction = extractJsonAction(rawText)

  if (!ticketAction) {
    return NextResponse.json({ reply: rawText.trim() })
  }

  // Claude is escalating — create a support ticket
  const admin = createAdminClient()
  const ticketId = await generateTicketId(admin)
  const fullConversation = formatConversation(conversationHistory, message)
  const createdAt = new Date().toISOString()

  await admin.from('support_tickets').insert({
    ticket_id: ticketId,
    user_id: userId,
    user_email: userEmail,
    issue_type: ticketAction.issue_type || 'other',
    issue_summary: ticketAction.issue_summary || message,
    conversation_history: [...conversationHistory, { role: 'user', content: message }],
    status: 'open',
  })

  if (userEmail) {
    try {
      await resend.emails.send({
        from: FROM_EMAIL,
        to: userEmail,
        subject: `Your Scrivly Support Ticket #${ticketId}`,
        html: buildUserEmailHtml({
          name: null,
          ticketId,
          issueSummary: ticketAction.issue_summary || message,
        }),
      })
    } catch {
      // email failures should never block ticket creation
    }
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: SUPPORT_EMAIL,
      subject: `New Support Ticket #${ticketId}`,
      html: buildInternalEmailHtml({
        ticketId,
        userEmail,
        issueType: ticketAction.issue_type || 'other',
        issueSummary: ticketAction.issue_summary || message,
        fullConversation,
        createdAt,
      }),
    })
  } catch {
    // email failures should never block ticket creation
  }

  return NextResponse.json({
    reply: ticketAction.message_to_user || `Your ticket #${ticketId} has been created. Our team will get back to you within 24 hours.`,
    ticketId,
  })
}
