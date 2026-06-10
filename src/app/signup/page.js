'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { isDisposableEmail } from '@/lib/disposable-email-domains'
import { getFingerprint } from '@/lib/fingerprint'

export default function SignupPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)

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
    'w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 ' +
    'placeholder:text-stone-400 shadow-sm transition focus:border-amber-400 focus:outline-none ' +
    'focus:ring-2 focus:ring-amber-200'

  if (success) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
        <div className="w-full max-w-sm rounded-2xl border border-amber-100 bg-white p-8 text-center shadow-sm">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
          <h2 className="text-lg font-semibold text-stone-900">Check your email</h2>
          <p className="mt-2 text-sm text-stone-500">
            We sent a confirmation link to{' '}
            <span className="font-medium text-stone-700">{email}</span>.
            Click it to activate your account and get your free credits.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-block text-sm font-medium text-amber-600 hover:text-amber-700"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Scrivly" width={56} height={56} className="mx-auto mb-3 h-14 w-14 rounded-2xl object-cover shadow-md shadow-amber-500/30" />
          <h1 className="text-2xl font-bold text-stone-900">Scrivly</h1>
          <p className="mt-1 text-sm text-stone-500">Create your free account</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-8 shadow-sm">
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-stone-700">
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
              <p className="mt-1.5 text-xs text-stone-400">
                Please use a real email address. Temporary emails are not accepted.
              </p>
            </div>

            <div>
              <label htmlFor="password" className="mb-1.5 block text-sm font-medium text-stone-700">
                Password <span className="font-normal text-stone-400">(min. 6 characters)</span>
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
              <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-stone-700">
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
              <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-2.5
                text-sm font-semibold text-white shadow-md shadow-amber-500/20 transition
                hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? 'Creating account…' : 'Get Started Free'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-amber-600 hover:text-amber-700">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
