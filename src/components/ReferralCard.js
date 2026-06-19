'use client'

import { useState } from 'react'
import ShareModal from '@/components/ShareModal'
import { referralUrl as buildReferralUrl } from '@/lib/referral'

export default function ReferralCard({ profile }) {
  const [copied, setCopied] = useState(false)
  const [shareOpen, setShareOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('scrivly_referral_expanded') === 'true'
    }
    return false
  })

  const code = profile?.referral_code
  const referralUrl = code ? buildReferralUrl(code) : ''
  const creditsEarned = profile?.referral_credits_earned || 0
  const totalReferrals = profile?.total_referrals || 0
  const referralPurchases = profile?.referral_purchases || 0
  const totalCreditsPurchased = profile?.total_credits_purchased || 0

  const toggle = () => {
    const next = !isExpanded
    setIsExpanded(next)
    localStorage.setItem('scrivly_referral_expanded', String(next))
  }

  const handleCopy = async () => {
    if (!referralUrl) return
    try {
      await navigator.clipboard.writeText(referralUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  const handleShare = () => setShareOpen(true)

  if (!code) return null

  return (
    <div style={{ marginBottom: '16px' }}>

      {/* SLIM BAR — always visible */}
      <div
        onClick={toggle}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 20px',
          height: '44px',
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderRadius: isExpanded ? '10px 10px 0 0' : '10px',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          fontSize: '14px',
          color: 'var(--text-secondary)',
        }}>
          <span>🎁</span>
          <span style={{
            fontWeight: '500',
            color: 'var(--text-primary)',
          }}>
            Refer &amp; Earn
          </span>
          <span style={{
            fontSize: '12px',
            color: 'var(--text-muted)',
          }}>
            — Share your link and earn credits
          </span>
        </div>
        <span style={{
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}>
          {isExpanded ? 'Collapse ▲' : 'Expand ▼'}
        </span>
      </div>

      {/* EXPANDED CONTENT */}
      {isExpanded && (
        <div style={{
          background: 'var(--bg-card)',
          border: '1px solid var(--border-default)',
          borderTop: 'none',
          borderRadius: '0 0 10px 10px',
          padding: '20px',
        }}>

          {/* HOW IT WORKS — one line */}
          <p style={{
            fontSize: '13px',
            color: 'var(--text-muted)',
            marginBottom: '16px',
            marginTop: '0',
          }}>
            Friend signs up → you get
            <strong style={{ color: '#FFB800' }}> +5 credits</strong>
            &nbsp;· Friend buys → you get
            <strong style={{ color: '#FF3D8B' }}> +10 more</strong>
            &nbsp;· They get
            <strong style={{ color: '#7B2FFF' }}> 3 free credits</strong>
          </p>

          {/* REFERRAL LINK ROW */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginBottom: '12px',
          }}>
            <input
              readOnly
              value={referralUrl}
              style={{
                flex: 1,
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '10px 14px',
                fontSize: '13px',
                fontFamily: 'monospace',
                color: 'var(--text-secondary)',
                outline: 'none',
              }}
            />
            <button
              onClick={handleCopy}
              style={{
                background: copied ? '#22C55E' : 'var(--bg-elevated)',
                border: '1px solid var(--border-default)',
                borderRadius: '8px',
                padding: '10px 16px',
                fontSize: '13px',
                color: copied ? 'white' : 'var(--text-primary)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s',
              }}
            >
              {copied ? 'Copied! ✓' : 'Copy'}
            </button>
          </div>

          {/* SHARE BUTTON */}
          <button
            onClick={handleShare}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg,#FFB800,#FF3D8B,#7B2FFF)',
              border: 'none',
              borderRadius: '8px',
              padding: '12px',
              fontSize: '14px',
              fontWeight: '600',
              color: 'white',
              cursor: 'pointer',
              marginBottom: '16px',
            }}
          >
            Share with Etsy sellers →
          </button>

          {/* STATS ROW */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px',
            marginBottom: '12px',
          }}>
            {[
              { value: totalReferrals || 0, label: 'Referred' },
              { value: referralPurchases || 0, label: 'Purchased' },
              { value: creditsEarned || 0, label: 'Credits earned' },
            ].map((stat, i) => (
              <div key={i} style={{
                background: 'var(--bg-elevated)',
                borderRadius: '8px',
                padding: '10px',
                textAlign: 'center',
              }}>
                <div style={{
                  fontSize: '20px',
                  fontWeight: '700',
                  background: 'linear-gradient(135deg,#FFB800,#FF3D8B,#7B2FFF)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}>
                  {stat.value}
                </div>
                <div style={{
                  fontSize: '11px',
                  color: 'var(--text-muted)',
                  marginTop: '2px',
                }}>
                  {stat.label}
                </div>
              </div>
            ))}
          </div>

          {/* PURCHASE WARNING */}
          {(!totalCreditsPurchased || totalCreditsPurchased === 0) && (
            <div style={{
              background: 'rgba(255,184,0,0.08)',
              border: '1px solid rgba(255,184,0,0.25)',
              borderRadius: '8px',
              padding: '10px 14px',
              fontSize: '12px',
              color: '#FFB800',
            }}>
              ⚠ Purchase a credit pack first to earn referral bonuses.
              Your friends still get 3 free credits when they sign up.
            </div>
          )}
        </div>
      )}

      {shareOpen && <ShareModal referralUrl={referralUrl} onClose={() => setShareOpen(false)} />}
    </div>
  )
}
