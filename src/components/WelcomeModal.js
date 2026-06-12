'use client'

import { useEffect, useState } from 'react'

const DISMISS_KEY = 'scrivly_welcome_modal_dismissed'
const DISMISS_HOURS = 24
const ETSY_SHOP_URL = 'https://www.etsy.com/shop/AmanCraftio'

const PACKS = [
  { name: 'Starter Pack', credits: 100, price: '$15', popular: false },
  { name: 'Pro Pack', credits: 250, price: '$29', popular: true },
  { name: 'Power Pack', credits: 500, price: '$49', popular: false },
]

function wasRecentlyDismissed() {
  if (typeof window === 'undefined') return true
  const stored = localStorage.getItem(DISMISS_KEY)
  if (!stored) return false
  const dismissedAt = Number(stored)
  if (Number.isNaN(dismissedAt)) return false
  return Date.now() - dismissedAt < DISMISS_HOURS * 60 * 60 * 1000
}

export default function WelcomeModal({ userId, credits, totalPurchased, onRedeem }) {
  const [visible, setVisible] = useState(false)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [shake, setShake] = useState(false)

  useEffect(() => {
    if (credits === 0 && totalPurchased === 0 && !wasRecentlyDismissed()) {
      setVisible(true)
    }
  }, [credits, totalPurchased])

  if (!visible) return null

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const closeModal = () => setVisible(false)

  const handleBuyClick = (e) => {
    e.preventDefault()
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    window.open(ETSY_SHOP_URL, '_blank', 'noopener,noreferrer')
    closeModal()
  }

  const handleRedeem = async (e) => {
    e.preventDefault()
    if (!code.trim() || status === 'loading') return
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/credits/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), userId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setErrorMsg(data.error || 'Invalid code')
        setStatus('error')
        triggerShake()
      } else {
        setStatus('success')
        setCode('')
        onRedeem?.(data.creditsAdded)
        setTimeout(() => closeModal(), 1500)
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
      triggerShake()
    }
  }

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
    >
      <div
        className="w-[90%] text-center"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,61,139,0.3)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '520px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(123,47,255,0.15)',
        }}
      >
        {/* Top section */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="Scrivly" style={{ height: '40px', width: 'auto', margin: '0 auto' }} />

        <h2 className="gradient-text mt-4" style={{ fontSize: '26px', fontWeight: 700 }}>
          Welcome to Scrivly! 👋
        </h2>
        <p className="mt-2 text-sm" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>
          To start generating listings you need credits. Purchase a pack on Etsy and redeem your unique code below.
        </p>

        {/* Divider */}
        <div className="my-6 border-t" style={{ borderColor: 'var(--border-default)' }} />

        {/* Redeem section */}
        <form onSubmit={handleRedeem} className="text-left">
          <label
            htmlFor="welcome-redeem-code"
            className="mb-1.5 block"
            style={{ fontSize: '12px', color: 'var(--text-muted)' }}
          >
            Already purchased? Enter your code:
          </label>

          {status === 'success' ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <div
                className="flex items-center justify-center rounded-full"
                style={{ width: '48px', height: '48px', background: 'rgba(34,197,94,0.15)', border: '2px solid #22C55E' }}
              >
                <span style={{ color: '#22C55E', fontSize: '24px' }}>✓</span>
              </div>
              <p className="font-bold text-[var(--text-primary)]">Credits activated! 🎉</p>
            </div>
          ) : (
            <>
              <input
                id="welcome-redeem-code"
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder="ETY-XXXX-XXXX-XX"
                disabled={status === 'loading'}
                className="w-full rounded-[10px] px-[18px] py-[14px] text-[15px] font-mono outline-none transition
                  bg-[var(--bg-input)] text-[var(--text-primary)] disabled:opacity-60
                  focus:border-[#FF3D8B] focus:shadow-[0_0_0_3px_rgba(255,61,139,0.15)]"
                style={{
                  letterSpacing: '2px',
                  border: status === 'error' ? '1px solid #FF3D8B' : '1px solid var(--border-default)',
                  animation: shake ? 'shake 0.4s ease' : 'none',
                }}
              />
              {status === 'error' && (
                <p className="mt-2 text-sm" style={{ color: '#FF3D8B' }}>{errorMsg}</p>
              )}
              <button
                type="submit"
                disabled={status === 'loading' || !code.trim()}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] py-[14px] px-[28px] text-[15px]
                  font-bold text-white transition disabled:cursor-not-allowed disabled:opacity-60
                  hover:opacity-90 hover:shadow-[0_0_28px_rgba(255,61,139,0.4)]"
                style={{ background: 'linear-gradient(135deg, #FFB800, #FF3D8B, #7B2FFF)', border: 'none' }}
              >
                {status === 'loading' ? (
                  <>
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Activating...
                  </>
                ) : (
                  'Activate Credits →'
                )}
              </button>
            </>
          )}
        </form>

        {/* Divider with "or" */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t" style={{ borderColor: 'var(--border-default)' }} />
          </div>
          <div className="relative flex justify-center">
            <span style={{ background: 'var(--bg-card)', padding: '0 12px', fontSize: '12px', color: 'var(--text-muted)' }}>
              or
            </span>
          </div>
        </div>

        {/* Buy section */}
        <div className="text-left">
          <p className="mb-3" style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
            Don&apos;t have a code yet? Get one on Etsy:
          </p>

          <div className="space-y-3">
            {PACKS.map((pack) => (
              <a
                key={pack.name}
                href={ETSY_SHOP_URL}
                onClick={handleBuyClick}
                className="flex items-center justify-between rounded-xl px-5 py-3.5 text-sm font-semibold transition"
                style={
                  pack.popular
                    ? {
                        border: '1px solid transparent',
                        background:
                          'linear-gradient(var(--bg-card), var(--bg-card)) padding-box, linear-gradient(135deg, #FFB800, #FF3D8B, #7B2FFF) border-box',
                        color: 'var(--text-primary)',
                      }
                    : {
                        border: '1px solid var(--border-default)',
                        color: 'var(--text-primary)',
                      }
                }
              >
                <span>
                  {pack.name} · {pack.credits} credits{pack.popular ? ' ⭐ Popular' : ''}
                </span>
                <span>{pack.price} →</span>
              </a>
            ))}
          </div>
        </div>

        {/* Bottom */}
        <p className="mt-6" style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
          Each generation uses 6 credits, or 10 with price research. Credits never expire.
        </p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-2 underline"
          style={{ fontSize: '11px', color: 'var(--text-muted)' }}
        >
          Already redeemed but still seeing this? Refresh the page.
        </button>
      </div>
    </div>
  )
}
