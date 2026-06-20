'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ListingGenerator from '@/components/ListingGenerator'
import ThemeToggle from '@/components/ThemeToggle'
import Avatar from '@/components/Avatar'
import RedeemBanner from '@/components/RedeemBanner'
import WelcomeModal from '@/components/WelcomeModal'
import ReferralCard from '@/components/ReferralCard'
import ContactSection from '@/components/ContactSection'
import Footer from '@/components/Footer'
import { getPriceResearchCost } from '@/lib/plans'

const CREDIT_PACKS = [
  { name: 'Starter Pack',  credits: 100, price: '$9',  url: 'https://www.etsy.com/shop/AmanCraftio' },
  { name: 'Pro Pack',      credits: 250, price: '$19', url: 'https://www.etsy.com/shop/AmanCraftio' },
  { name: 'Power Seller',  credits: 500, price: '$35', url: 'https://www.etsy.com/shop/AmanCraftio' },
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
          className={`flex-1 rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-3 text-sm
            text-[var(--text-primary)] placeholder:text-[var(--text-muted)] shadow-sm transition
            focus:border-brand-pink focus:outline-none focus:ring-2 focus:ring-[rgba(255,61,139,0.15)]
            ${compact ? 'py-2' : 'py-2.5'}`}
        />
        <button
          type="submit"
          disabled={loading || !code.trim()}
          className="rounded-lg bg-brand px-4 py-2 text-sm
            font-semibold text-white shadow-sm transition hover:shadow-[0_0_20px_rgba(255,61,139,0.35)]
            disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Checking…' : 'Redeem'}
        </button>
      </div>
      {message && (
        <p className={`text-sm ${message.type === 'success' ? 'text-[#22C55E]' : 'text-[#FF3D8B]'}`}>
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
        className="absolute inset-0 bg-[var(--bg-primary)]/70 backdrop-blur-sm"
        onClick={onDismiss}
      />

      {/* Modal panel */}
      <div className="relative w-full max-w-md rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] shadow-xl">
        {/* Dismiss button */}
        <button
          onClick={onDismiss}
          className="absolute right-4 top-4 rounded-lg p-1.5 text-[var(--text-secondary)] transition hover:bg-[var(--bg-elevated)] hover:text-[var(--text-primary)]"
          aria-label="Dismiss"
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-subtle">
              <svg className="h-6 w-6 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-bold text-[var(--text-primary)]">You are running low on credits</h2>
              <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
                You have <span className="font-semibold gradient-text">{credits} credit{credits !== 1 ? 's' : ''}</span> remaining.
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
                className="flex items-center justify-between rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)]
                  px-4 py-3.5 transition hover:border-brand-pink"
              >
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{pack.name}</p>
                  <p className="text-sm text-[var(--text-secondary)]">{pack.credits} credits</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold gradient-text">{pack.price}</span>
                  <span className="flex items-center gap-1 rounded-lg bg-brand px-3 py-1.5 text-xs font-semibold text-white shadow-sm">
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
              <div className="w-full border-t border-[var(--border-subtle)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--bg-card)] px-3 text-xs text-[var(--text-muted)]">After purchase</span>
            </div>
          </div>

          <p className="mb-3 text-sm text-[var(--text-secondary)]">
            Return here and enter your redeem code to instantly add credits to your account.
          </p>

          <RedeemForm userId={userId} onRedeem={onRedeem} compact />
        </div>
      </div>
    </div>
  )
}

const REF_STORAGE_KEY = 'scrivly_ref'

export default function DashboardShell({ user, profile }) {
  const router = useRouter()
  const [credits, setCredits] = useState(profile.credits)
  const [signingOut, setSigningOut] = useState(false)
  const [modalDismissed, setModalDismissed] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [historyCount, setHistoryCount] = useState(null)
  const [referralToast, setReferralToast] = useState(false)
  const menuRef = useRef(null)

  const emailPrefix = user.email.split('@')[0]
  const displayName = profile.full_name || emailPrefix
  const packTier = profile.pack_tier || 'none'
  const isPowerSeller = packTier === 'power' || profile.highest_pack_tier === 'power'
  const priceResearchCost = getPriceResearchCost(packTier)

  useEffect(() => {
    const supabase = createClient()
    supabase
      .from('generation_history')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .then(({ count }) => setHistoryCount(count ?? 0))
  }, [user.id])

  // Pass the logged-in user's info to the support chatbot widget (public/chatbot.js)
  useEffect(() => {
    window.ScrivlyUser = { id: user.id, email: user.email }
  }, [user.id, user.email])

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [menuOpen])

  // Reset dismissed state when credits recover so modal re-appears next drop
  useEffect(() => {
    if (credits >= 3) setModalDismissed(false)
  }, [credits])

  // First dashboard load after signing up via a referral link — claim the bonus.
  // Uses localStorage (not sessionStorage) because email confirmation links
  // open in a new tab/window, which has its own empty sessionStorage.
  useEffect(() => {
    const refCode = localStorage.getItem(REF_STORAGE_KEY)
    console.log('Referral check running, user:', user?.id, 'refCode:', refCode)
    if (!refCode) return
    if (profile.credits !== 0 || profile.referred_by) {
      console.log('Referral check skipped — credits:', profile.credits, 'referred_by:', profile.referred_by)
      localStorage.removeItem(REF_STORAGE_KEY)
      return
    }

    fetch('/api/referral/track-signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refCode }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log('Referral track-signup response:', data)
        if (data?.success) {
          handleCreditsAdded(data.creditsAdded)
          setReferralToast(true)
          setTimeout(() => setReferralToast(false), 4000)
        }
      })
      .catch((err) => {
        console.log('Referral track-signup request failed:', err)
      })
      .finally(() => localStorage.removeItem(REF_STORAGE_KEY))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const showLowCreditsModal = credits < 3 && !modalDismissed && profile.total_credits_purchased > 0

  const handleSignOut = async () => {
    setSigningOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  const handleCreditsUsed = (amount) => {
    setCredits((prev) => Math.max(0, prev - amount))
  }

  const handleCreditsAdded = (amount) => {
    setCredits((prev) => prev + amount)
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {referralToast && (
        <div
          className="fixed left-1/2 top-6 z-[9999] -translate-x-1/2 rounded-xl px-5 py-3 text-sm font-semibold shadow-lg"
          style={{ background: 'rgba(255,184,0,0.15)', border: '1px solid rgba(255,184,0,0.4)', color: '#FFB800' }}
        >
          🎁 3 free credits added! Someone referred you to Scrivly.
        </div>
      )}

      {/* First-time welcome modal */}
      <WelcomeModal
        userId={user.id}
        credits={credits}
        totalPurchased={profile.total_credits_purchased}
        onRedeem={handleCreditsAdded}
      />

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
      <header className="border-b border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2 text-base font-bold text-[var(--text-primary)] sm:text-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Scrivly" style={{ height: '40px', width: 'auto', cursor: 'pointer' }} />
            Scrivly
          </Link>

          <div className="flex items-center gap-4 sm:gap-6">
            <ThemeToggle />
            <div
              className="flex items-center gap-2 rounded-full px-3 py-1.5"
              style={{
                background: 'linear-gradient(135deg, rgba(255,184,0,0.15) 0%, rgba(123,47,255,0.15) 100%)',
                border: '1px solid rgba(255,61,139,0.3)',
              }}
            >
              <svg className="h-4 w-4 text-brand-orange" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              <span className="gradient-text text-sm font-bold tabular-nums">{credits}</span>
              <span className="hidden text-xs text-[var(--text-secondary)] sm:inline">credits</span>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setMenuOpen((prev) => !prev)}
                title={user.email}
                className="block shrink-0 transition hover:opacity-80"
              >
                <Avatar profile={profile} email={user.email} size={36} />
              </button>

              {menuOpen && (
                <div
                  className="absolute right-0 top-[calc(100%+8px)] z-50 w-56"
                  style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-default)',
                    borderRadius: '12px',
                    padding: '8px',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                  }}
                >
                  <div className="px-3 py-2">
                    <p className="truncate text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                      {displayName}
                    </p>
                    {profile.full_name && (
                      <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                    )}
                    {isPowerSeller && (
                      <span
                        className="mt-1.5 inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
                        style={{ background: 'linear-gradient(90deg, #FF8A00, #7B2FFF)' }}
                      >
                        Power Seller
                      </span>
                    )}
                  </div>
                  <div className="my-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
                  <Link
                    href="/account/history"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--bg-elevated)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    <span>Generation History</span>
                    {historyCount !== null && (
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>({historyCount})</span>
                    )}
                  </Link>
                  <Link
                    href="/account"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--bg-elevated)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Manage Account
                  </Link>
                  <Link
                    href="/account/purchases"
                    onClick={() => setMenuOpen(false)}
                    className="block rounded-lg px-3 py-2 text-sm font-medium transition hover:bg-[var(--bg-elevated)]"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    Purchase History
                  </Link>
                  <div className="my-1 border-t" style={{ borderColor: 'var(--border-subtle)' }} />
                  <button
                    type="button"
                    onClick={handleSignOut}
                    disabled={signingOut}
                    className="block w-full rounded-lg px-3 py-2 text-left text-sm font-medium transition hover:bg-[var(--bg-elevated)] disabled:opacity-50"
                    style={{ color: 'var(--text-secondary)' }}
                  >
                    {signingOut ? 'Signing out…' : 'Sign Out'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <RedeemBanner
          userId={user.id}
          onRedeem={handleCreditsAdded}
        />

        {/* Welcome card */}
        <div className="relative mb-8 flex flex-col overflow-hidden rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-card)] shadow-sm sm:flex-row">
          <div className="absolute inset-y-0 left-0 w-[3px] bg-brand" />
          <div className="flex flex-1 items-center gap-4 px-5 py-5 pl-6 sm:px-6 sm:pl-7">
            <Avatar profile={profile} email={user.email} size={56} fontSize={20} />
            <div>
              <p className="text-sm text-[var(--text-secondary)]">Welcome back,</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{displayName}</p>
            </div>
          </div>
          <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-5 sm:px-6">
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-brand px-3 py-1.5 text-sm font-bold text-white">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              {credits} credits remaining
            </span>
            <p className="text-xs text-[var(--text-secondary)]">
              Each generation uses 3 credits, or {3 + priceResearchCost} with price research
            </p>
            <a
              href="https://www.etsy.com/shop/AmanCraftio"
              target="_blank"
              rel="noopener noreferrer"
              className="w-fit text-sm font-medium text-brand-pink transition hover:text-brand-orange"
            >
              Buy more credits →
            </a>
          </div>
        </div>

        <ListingGenerator
          credits={credits}
          onCreditsUsed={handleCreditsUsed}
          packTier={packTier}
          referralCode={profile.referral_code}
        />

        <ReferralCard profile={profile} />

        <ContactSection />
      </main>

      <Footer />
    </div>
  )
}
