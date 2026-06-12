'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: 'https://scrivly.vercel.app/reset-password',
    })

    // Always show the success state, regardless of whether the email is registered.
    setLoading(false)
    setSuccess(true)
  }

  const inputClasses =
    'w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] ' +
    'placeholder:text-[var(--text-muted)] shadow-sm transition focus:border-brand-pink focus:outline-none ' +
    'focus:ring-[3px] focus:ring-[rgba(255,61,139,0.15)]'

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
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-10 shadow-sm">
          {success ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <svg className="h-7 w-7 text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Check your email</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                We sent a password reset link to{' '}
                <span className="font-medium text-[var(--text-primary)]">{email}</span>.
                Click the link in the email to reset your password.
              </p>
              <p className="mt-3 text-xs text-[var(--text-muted)]">
                Didn&apos;t receive it? Check your spam folder or try again.
              </p>

              <button
                type="button"
                onClick={() => setSuccess(false)}
                className="mt-6 w-full rounded-lg bg-brand px-4 py-3.5
                  text-base font-bold text-white shadow-md transition
                  hover:opacity-90 hover:shadow-[0_0_30px_rgba(255,61,139,0.3)]"
              >
                Try again
              </button>

              <Link
                href="/login"
                className="mt-4 inline-block text-sm font-medium text-brand-pink hover:text-brand-orange"
              >
                Back to sign in
              </Link>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Reset your password</h2>
              <p className="mt-1.5 mb-6 text-sm text-[var(--text-secondary)]">
                Enter your email address and we will send you a reset link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    Email address
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
                  {loading ? 'Sending…' : 'Send reset link'}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-[var(--text-secondary)]">
                <Link href="/login" className="font-medium text-brand-pink hover:text-brand-orange">
                  ← Back to sign in
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
