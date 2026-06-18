'use client'

import { useState } from 'react'
import ShareModal from '@/components/ShareModal'
import { referralUrl } from '@/lib/referral'

const STEPS = [
  { icon: '🔗', text: 'Share your link', subtext: 'Friend signs up', reward: '+5 credits', color: '#FFB800' },
  { icon: '🛒', text: 'Friend buys', subtext: 'Any credit pack', reward: '+10 credits', color: '#FF3D8B' },
  { icon: '🎁', text: 'Friend gets', subtext: '3 free credits', reward: null, color: '#7B2FFF' },
]

export default function ReferralCard({ profile }) {
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)

  const code = profile?.referral_code
  const url = code ? referralUrl(code) : ''
  const creditsEarned = profile?.referral_credits_earned || 0
  const totalReferred = profile?.total_referrals || 0
  const purchased = profile?.referral_purchases || 0

  const handleCopy = async () => {
    if (!url) return
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  if (!code) return null

  return (
    <div
      className="relative mb-8 overflow-hidden rounded-2xl shadow-sm"
      style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)', padding: '24px' }}
    >
      <div className="absolute inset-y-0 left-0 w-[3px] bg-brand" />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>Refer &amp; Earn 🎁</h3>
        <span
          className="rounded-full px-3 py-1.5 text-sm font-bold"
          style={{ background: 'rgba(255,184,0,0.15)', color: '#FFB800' }}
        >
          {creditsEarned} credits earned
        </span>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {STEPS.map((step, i) => (
          <div key={step.text} className="flex items-center gap-3">
            <div
              className="flex items-center gap-2 rounded-xl px-3 py-2"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
            >
              <span style={{ fontSize: '18px' }}>{step.icon}</span>
              <div>
                <p className="text-xs font-bold" style={{ color: 'var(--text-primary)' }}>{step.text}</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{step.subtext}</p>
              </div>
              {step.reward && (
                <span className="ml-1 text-xs font-bold" style={{ color: step.color }}>{step.reward}</span>
              )}
            </div>
            {i < STEPS.length - 1 && (
              <span style={{ color: 'var(--text-muted)' }}>→</span>
            )}
          </div>
        ))}
      </div>

      <div className="mt-6">
        <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide" style={{ color: '#FFB800' }}>
          Your referral link
        </p>
        <div
          className="truncate rounded-lg px-4 py-3 font-mono text-sm"
          style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
        >
          {url}
        </div>

        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={handleCopy}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition"
            style={{
              background: 'var(--bg-elevated)',
              border: '1px solid var(--border-default)',
              color: copied ? '#22C55E' : 'var(--text-primary)',
            }}
          >
            {copied ? (
              <>✓ Copied!</>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="9" y="9" width="11" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
                Copy link
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => setShareOpen(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #FFB800, #FF3D8B, #7B2FFF)' }}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342a3 3 0 100 2.316m0-2.316a3 3 0 100-2.316m0 2.316L15.316 17.658m0-9.316a3 3 0 105.658 1.658 3 3 0 00-5.658-1.658zm0 0L8.684 10.658m6.632 7a3 3 0 105.658-1.658 3 3 0 00-5.658 1.658z" />
            </svg>
            Share
          </button>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { value: totalReferred, label: 'Total referred' },
          { value: purchased, label: 'Purchased' },
          { value: creditsEarned, label: 'Credits earned' },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-lg p-3 text-center"
            style={{ background: 'var(--bg-elevated)' }}
          >
            <p className="gradient-text" style={{ fontSize: '20px', fontWeight: 700 }}>{stat.value}</p>
            <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {shareOpen && <ShareModal referralUrl={url} onClose={() => setShareOpen(false)} />}
    </div>
  )
}
