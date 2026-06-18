'use client'

import { Suspense, useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { isDisposableEmail } from '@/lib/disposable-email-domains'
import { getFingerprint } from '@/lib/fingerprint'

const REF_STORAGE_KEY = 'scrivly_ref'

function SignupForm() {
  const searchParams = useSearchParams()
  const refCode = searchParams.get('ref')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (refCode) {
      sessionStorage.setItem(REF_STORAGE_KEY, refCode)
    }
  }, [refCode])

  const handleSignUp = async (e) => {
    e.preventDefault()
    setError('')

    // Basic validation
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    // Block disposable email domains before any network call
    if (isDisposableEmail(email)) {
      setError('Please use a permanent email address to sign up.')
      return
    }

    setLoading(true)

    try {
      // Generate device fingerprint (non-blocking — null if it fails)
      const fingerprint = await getFingerprint()

      // Server-side signup handles all abuse checks, IP tracking, and credit assignment
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, fingerprint }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Something went wrong. Please try again.')
        return
      }

      setSuccess(true)
    } catch {
      setError('Could not connect to the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses =
    'w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] ' +
    'placeholder:text-[var(--text-muted)] shadow-sm transition focus:border-brand-pink focus:outline-none ' +
    'focus:ring-[3px] focus:ring-[rgba(255,61,139,0.15)]'

  if (success) {
    return (
      <div
        className="relative flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4"
        style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(123,47,255,0.08) 0%, transparent 70%)' }}
      >
        <div className="relative w-full max-w-sm rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-10 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <svg className="h-7 w-7 text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Check your email</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            We sent a confirmation link to{' '}
            <span className="font-medium text-[var(--text-primary)]">{email}</span>.
            Click it to activate your account and get started.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-brand-pink hover:text-brand-orange"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-[var(--bg-primary)] px-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(123,47,255,0.08) 0%, transparent 70%)' }}
    >
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          <Link href="/" className="inline-block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Scrivly" className="mx-auto mb-3" style={{ height: '40px', width: 'auto', cursor: 'pointer' }} />
          </Link>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Scrivly</h1>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Create your account and start generating SEO-optimized Etsy listings in seconds.
          </p>
        </div>

        {refCode && (
          <div
            className="mb-5 rounded-xl"
            style={{
              background: 'rgba(255,184,0,0.1)',
              border: '1px solid rgba(255,184,0,0.3)',
              padding: '16px 20px',
            }}
          >
            <p className="text-sm font-bold text-[var(--text-primary)]">🎁 You have been invited!</p>
            <p className="mt-1 text-sm text-[var(--text-secondary)]">
              Sign up now and get 3 free credits to generate your first Etsy listing — completely free.
            </p>
            <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
              Applied automatically when you sign up.
            </p>
          </div>
        )}

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-10 shadow-sm">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@example.com"
                className={inputClasses}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <p className="mt-1.5 text-xs text-[var(--text-muted)]">
                Please use a real email address. Temporary emails are not accepted.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                Password <span className="font-normal text-[var(--text-muted)]">(min. 6 characters)</span>
              </label>
              <input
                id="password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputClasses}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                Confirm password
              </label>
              <input
                id="confirm-password"
                type="password"
                required
                autoComplete="new-password"
                placeholder="••••••••"
                className={inputClasses}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            {error && (
              <p
                className="rounded-lg px-4 py-2.5 text-sm"
                style={{ background: 'rgba(255,61,139,0.08)', border: '1px solid rgba(255,61,139,0.3)', color: '#FF8FB8' }}
              >
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-brand px-4 py-3.5
                text-base font-bold text-white shadow-md transition
                hover:opacity-90 hover:shadow-[0_0_30px_rgba(255,61,139,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Get Started'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-brand-pink hover:text-brand-orange">
              Sign in
            </Link>
          </p>

          <p className="mt-4 text-center" style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
            Have a credit pack code from Etsy? You can redeem it after signing up in your dashboard.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  )
}
