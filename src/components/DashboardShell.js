'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { createClient } from '@/lib/supabase/client'
import ListingGenerator from '@/components/ListingGenerator'

// TODO: Replace each URL with your actual Etsy listing URL before going live
const CREDIT_PACKS = [
  { name: 'Starter Pack',  credits: 100, price: '$9',  url: 'https://www.etsy.com/listing/STARTER_PACK_ID' },
  { name: 'Pro Pack',      credits: 250, price: '$19', url: 'https://www.etsy.com/listing/PRO_PACK_ID' },
  { name: 'Power Seller',  credits: 500, price: '$35', url: 'https://www.etsy.com/listing/POWER_SELLER_ID' },
]

function RedeemForm({ userId, onRedeem, compact = false }) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState(null)

  const handleRedeem = async (e) => {
    e.preventDefault()
    if (!code.trim()) return
    setLoading(true)
    setMessage(null)

    try {
      const res = await fetch('/api/credits/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.trim(), userId }),
      })
      const data = await res.json()

      if (!res.ok) {
        setMessage({ type: 'error', text: data.error || 'Invalid code.' })
      } else {
        setMessage({ type: 'success', text: `+${data.creditsAdded} credits added!` })
        setCode('')
        onRedeem(data.creditsAdded)
      }
    } catch {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleRedeem} className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Enter redeem code (e.g. ETY-XXXX-XXXX-XX)"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          className={`flex-1 rounded-lg border border-amber-200 bg-white px-3 text-sm
            text-stone-800 placeholder:text-stone-400 shadow-sm transition
            focus:border-amber-400 focus:outline-none focus:ring-2 focus:ring-amber-200
            ${compact ? 'py-2' : 'py-2.5'}`}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2 text-sm
            font-semibold text-white shadow-sm transition hover:from-amber-600 hover:to-orange-600
            disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Redeem'}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-emerald-600' : 'text-red-600'}`}>
          {message.text}
        </p>
      )}
    </form>
  )
}

function LowCreditsModal({ credits, userId, onRedeem, onDismiss }) {
  return (
    // Backdrop
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-stone-900/50 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-amber-100 bg-white shadow-xl">
        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-stone-400 transition hover:bg-stone-100 hover:text-stone-600"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <svg className="h-6 w-6 text-amber-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-stone-900">You are running low on credits</h2>
              <p className="mt-0.5 text-sm text-stone-500">
                You have <span className="font-semibold text-amber-600">{credits} credit{credits !== 1 ? 's' : ''}</span> remaining.
                Top up to keep generating listings.
              </p>
            </div>
          </div>

          {/* Pack options */}
          <div className="mb-6 space-y-3">
            {CREDIT_PACKS.map((pack) => (
              <a
                key={pack.name}
                href={pack.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/60
                  px-4 py-3.5 transition hover:border-amber-300 hover:bg-amber-50 hover:shadow-sm"
              >
                <div>
                  <p className="font-semibold text-stone-900">{pack.name}</p>
                  <p className="text-sm text-stone-500">{pack.credits} credits</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-amber-600">{pack.price}</span>
                  <span className="flex items-center gap-1 rounded-lg bg-gradient-to-r from-amber-500
                    to-orange-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
                    Buy
                    <svg className="h-3 w-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </span>
                </div>
              </a>
            ))}
          </div>

          {/* Divider + redeem section */}
          <div className="relative mb-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-100" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-stone-400">After purchase</span>
            </div>
          </div>

          <p className="mb-3 text-sm text-stone-600">
            Return here and enter your redeem code to instantly add credits to your account.
          </p>

          <RedeemForm userId={userId} onRedeem={onRedeem} compact />
        </div>
      </div>
    </div>
  )
}

export default function DashboardShell({ user, profile }) {
  const router = useRouter()
  const [credits, setCredits] = useState(profile.credits)
  const [signingOut, setSigningOut] = useState(false)
  const [modalDismissed, setModalDismissed] = useState(false)
  const [redeemExpanded, setRedeemExpanded] = useState(false)

  const emailPrefix = user.email.split('@')[0]
  const initial = user.email.charAt(0).toUpperCase()

  // Reset dismissed state when credits recover so modal re-appears next drop
  useEffect(() => {
    if (credits >= 3) setModalDismissed(false)
  }, [credits])

  const showLowCreditsModal = credits < 3 && !modalDismissed

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  const handleCreditsUsed = (amount) => {
    setCredits((prev) => Math.max(0, prev - amount))
  }

  const handleCreditsAdded = (amount) => {
    setCredits((prev) => prev + amount)
  }

  const creditColor =
    credits > 10 ? 'text-emerald-600' :
    credits > 0  ? 'text-amber-600'   :
                   'text-red-600'

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/60 to-orange-50/40">
      {/* Low credits modal */}
      {showLowCreditsModal && (
        <LowCreditsModal
          credits={credits}
          userId={user.id}
          onRedeem={handleCreditsAdded}
          onDismiss={() => setModalDismissed(true)}
        />
      )}

      {/* Header */}
      <header className="border-b border-amber-100 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <span className="flex items-center gap-2 text-base font-bold text-stone-900 sm:text-lg">
            <Image src="/logo.png" alt="Scrivly" width={28} height={28} className="h-7 w-7 rounded-lg object-cover" />
            Scrivly
          </span>

          <div className="flex items-center gap-4 sm:gap-6">
            <div className="flex items-center gap-2 rounded-full border border-amber-200 bg-amber-50 px-3 py-1.5">
              <svg className="h-4 w-4 text-amber-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className={`text-sm font-bold tabular-nums ${creditColor}`}>{credits}</span>
              <span className="hidden text-xs text-stone-400 sm:inline">credits</span>
            </div>

            <div
              title={user.email}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br
                from-amber-400 to-orange-500 text-sm font-semibold text-white shadow-sm"
            >
              {initial}
            </div>

            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium
                text-stone-600 shadow-sm transition hover:bg-stone-50 disabled:opacity-50"
            >
              {signingOut ? 'Signing out…' : 'Sign out'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        {/* Welcome card */}
        <div className="mb-8 flex flex-col overflow-hidden rounded-2xl border border-amber-100 shadow-sm sm:flex-row">
          <div className="flex-1 bg-gradient-to-br from-amber-100/80 to-orange-100/60 px-5 py-5 sm:px-6">
            <p className="text-lg font-bold text-stone-900">Welcome back 👋</p>
            <p className="mt-0.5 text-sm text-stone-500">{emailPrefix}</p>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2 bg-amber-50/40 px-5 py-5 sm:px-6">
            <span className={`inline-flex w-fit items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold ${creditColor}`}>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {credits} credits remaining
            </span>
            <p className="text-xs text-stone-500">Each full generation uses 3 credits</p>
            <button
              onClick={() => setModalDismissed(false)}
              className="w-fit text-sm font-medium text-amber-700 transition hover:text-amber-800"
            >
              Buy more credits →
            </button>
          </div>
        </div>

        <ListingGenerator credits={credits} onCreditsUsed={handleCreditsUsed} />

        {/* Redeem section */}
        <div className="mt-8 rounded-xl border border-amber-100 bg-white/70 p-4 shadow-sm">
          <button
            type="button"
            onClick={() => setRedeemExpanded((prev) => !prev)}
            className="flex w-full items-center justify-between text-sm font-medium text-stone-600
              transition hover:text-amber-700"
          >
            Have a redeem code? Click to expand
            <svg
              className={`h-4 w-4 shrink-0 transition-transform ${redeemExpanded ? 'rotate-180' : ''}`}
              viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {redeemExpanded && (
            <div className="mt-4 border-t border-amber-100 pt-4">
              <RedeemForm userId={user.id} onRedeem={handleCreditsAdded} compact />
            </div>
          )}
        </div>
      </main>

      <footer className="mx-auto max-w-6xl px-4 pb-10 pt-4 text-center text-xs text-stone-400 sm:px-6">
        Scrivly — built to help independent sellers ship listings faster.
      </footer>
    </div>
  )
}
