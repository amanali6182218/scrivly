'use client'

import { useState, useEffect } from 'react'

const DISMISS_KEY = 'scrivly_redeem_dismissed'
const DAY_MS = 24 * 60 * 60 * 1000
const WEEK_MS = 7 * DAY_MS

export default function RedeemBanner({ userId, credits, hasRedeemed, createdAt, onRedeem }) {
  const [dismissed, setDismissed] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const [code, setCode] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [errorMsg, setErrorMsg] = useState('')
  const [creditsAdded, setCreditsAdded] = useState(0)
  const [shake, setShake] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(DISMISS_KEY)
    if (stored && Date.now() - Number(stored) < DAY_MS) {
      setDismissed(true)
    }
  }, [])

  const accountAgeMs = createdAt ? Date.now() - new Date(createdAt).getTime() : 0
  const isNewAccount = !createdAt || accountAgeMs < WEEK_MS
  const shouldShow = !dismissed && (!hasRedeemed || isNewAccount || credits <= 5)

  if (!shouldShow || hidden) return null

  const handleDismiss = () => {
    localStorage.setItem(DISMISS_KEY, String(Date.now()))
    setDismissed(true)
  }

  const triggerShake = () => {
    setShake(true)
    setTimeout(() => setShake(false), 400)
  }

  const handleSubmit = async (e) => {
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
        setCreditsAdded(data.creditsAdded)
        setStatus('success')
        setCode('')
        onRedeem(data.creditsAdded)
        setTimeout(() => setCollapsed(true), 3000)
        setTimeout(() => setHidden(true), 3500)
      }
    } catch {
      setErrorMsg('Something went wrong. Please try again.')
      setStatus('error')
      triggerShake()
    }
  }

  return (
    <div
      className="relative overflow-hidden rounded-2xl transition-all duration-500"
      style={{
        background: 'linear-gradient(135deg, rgba(255,184,0,0.12) 0%, rgba(255,61,139,0.12) 50%, rgba(123,47,255,0.12) 100%)',
        border: '1px solid rgba(255,61,139,0.3)',
        padding: collapsed ? '0px 32px' : '28px 32px',
        maxHeight: collapsed ? '0px' : '400px',
        opacity: collapsed ? 0 : 1,
        marginBottom: collapsed ? '0px' : '24px',
      }}
    >
      {/* Decorative circle */}
      <div
        className="pointer-events-none absolute rounded-full"
        style={{
          width: '200px',
          height: '200px',
          background: 'radial-gradient(circle, rgba(123,47,255,0.15), transparent)',
          top: '-60px',
          right: '-60px',
        }}
      />

      {/* Dismiss button */}
      {status !== 'success' && (
        <button
          type="button"
          onClick={handleDismiss}
          aria-label="Dismiss"
          className="absolute right-3 top-3 flex items-center justify-center rounded-lg transition
            text-[var(--text-muted)] hover:text-[var(--text-secondary)]"
          style={{ width: '24px', height: '24px', background: 'transparent' }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {status === 'success' ? (
        <div className="relative flex flex-col items-center gap-2 py-4 text-center">
          <div
            className="flex items-center justify-center rounded-full"
            style={{ width: '60px', height: '60px', background: 'rgba(34,197,94,0.15)', border: '2px solid #22C55E' }}
          >
            <span style={{ color: '#22C55E', fontSize: '28px' }}>✓</span>
          </div>
          <h3 className="text-[22px] font-bold text-[var(--text-primary)]">Credits Activated! 🎉</h3>
          <p className="text-sm text-[var(--text-secondary)]">+{creditsAdded} credits added to your account</p>
        </div>
      ) : (
        <div className="relative flex flex-col items-start gap-5 sm:flex-row sm:items-center sm:gap-10">
          {/* Left — text */}
          <div className="flex-1">
            <span
              className="inline-block rounded-full"
              style={{
                background: 'rgba(255,61,139,0.15)',
                border: '1px solid rgba(255,61,139,0.3)',
                padding: '4px 14px',
                fontSize: '13px',
                color: '#FF3D8B',
              }}
            >
              🎟 Have a code?
            </span>
            <h3 className="mt-2.5 text-[22px] font-bold text-[var(--text-primary)]">Redeem Your Credit Pack</h3>
            <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
              Enter the unique code from your Etsy purchase to activate your credits instantly.
            </p>
          </div>

          {/* Right — input + button */}
          <form onSubmit={handleSubmit} className="flex w-full flex-col gap-3 sm:w-[280px]">
            <input
              type="text"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="ETY-XXXX-XXXX-XX"
              disabled={status === 'loading'}
              className={`w-full rounded-[10px] px-[18px] py-[14px] text-[15px] font-mono tracking-[2px] outline-none transition
                bg-[var(--bg-input)] text-[var(--text-primary)] disabled:opacity-60
                focus:border-[#FF3D8B] focus:shadow-[0_0_0_3px_rgba(255,61,139,0.15)]
                ${status === 'error' ? 'border border-[#FF3D8B]' : 'border border-[var(--border-default)]'}`}
              style={{ animation: shake ? 'shake 0.4s ease' : 'none' }}
            />
            {status === 'error' && (
              <p className="text-sm" style={{ color: '#FF3D8B' }}>{errorMsg}</p>
            )}
            <button
              type="submit"
              disabled={status === 'loading' || !code.trim()}
              className="flex w-full items-center justify-center gap-2 rounded-[10px] py-[14px] px-[28px] text-[15px]
                font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60
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
          </form>
        </div>
      )}
    </div>
  )
}
