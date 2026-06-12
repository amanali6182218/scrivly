'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

const STRENGTH_LEVELS = [
  { label: 'Very weak', color: '#FF3D8B' },
  { label: 'Weak', color: '#FF3D8B' },
  { label: 'Fair', color: '#FFB800' },
  { label: 'Good', color: '#FFB800' },
  { label: 'Strong', color: '#22C55E' },
]

function getPasswordStrength(password) {
  if (!password) return 0
  let score = 0
  if (password.length >= 6) score++
  if (password.length >= 10) score++
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++
  if (/[0-9]/.test(password)) score++
  if (/[^A-Za-z0-9]/.test(password)) score++
  return Math.min(score, 4)
}

function EyeIcon({ visible }) {
  if (visible) {
    return (
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18M10.58 10.58a2 2 0 002.83 2.83M9.88 4.24A9.77 9.77 0 0112 4c5 0 9 4 10 8a9.78 9.78 0 01-1.67 3.04M6.61 6.61C3.96 8.06 2.17 10.5 1 12c1 4 5 8 11 8a9.77 9.77 0 005.39-1.61" />
      </svg>
    )
  }
  return (
    <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

export default function ResetPasswordPage() {
  const router = useRouter()
  const [isValidLink, setIsValidLink] = useState(false)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setIsValidLink(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const strength = getPasswordStrength(newPassword)
  const strengthInfo = STRENGTH_LEVELS[strength]
  const passwordsMismatch = confirmPassword.length > 0 && newPassword !== confirmPassword
  const canSubmit = newPassword.length >= 8 && confirmPassword.length > 0 && newPassword === confirmPassword

  const inputClasses =
    'w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-2.5 pr-10 text-sm text-[var(--text-primary)] ' +
    'placeholder:text-[var(--text-muted)] shadow-sm transition focus:border-brand-pink focus:outline-none ' +
    'focus:ring-[3px] focus:ring-[rgba(255,61,139,0.15)]'

  const toggleButtonClasses =
    'absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] transition hover:text-[var(--text-primary)]'

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (newPassword.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (strength < 2) {
      setError('Please choose a stronger password')
      return
    }

    setLoading(true)
    const supabase = createClient()
    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      setError(updateError.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setTimeout(() => {
      router.push('/dashboard')
    }, 2000)
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
        </div>

        <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-10 shadow-sm">
          {!isValidLink ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(255,61,139,0.1)' }}>
                  <svg className="h-7 w-7" style={{ color: '#FF3D8B' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Invalid or expired link</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">
                This password reset link has expired or already been used. Reset links are valid for 1 hour.
              </p>

              <Link
                href="/forgot-password"
                className="mt-6 inline-block w-full rounded-lg bg-brand px-4 py-3.5
                  text-base font-bold text-white shadow-md transition
                  hover:opacity-90 hover:shadow-[0_0_30px_rgba(255,61,139,0.3)]"
              >
                Request new link
              </Link>
            </div>
          ) : success ? (
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex h-14 w-14 items-center justify-center rounded-full" style={{ background: 'rgba(34,197,94,0.15)' }}>
                  <svg className="h-7 w-7 text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
              </div>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Password updated successfully!</h2>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Redirecting you to your dashboard…</p>
            </div>
          ) : (
            <>
              <h2 className="text-lg font-semibold text-[var(--text-primary)]">Set new password</h2>
              <p className="mt-1.5 mb-6 text-sm text-[var(--text-secondary)]">
                Choose a strong password for your account.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    New password
                  </label>
                  <div className="relative">
                    <input
                      id="new-password"
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={inputClasses}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword((v) => !v)}
                      className={toggleButtonClasses}
                      aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon visible={showNewPassword} />
                    </button>
                  </div>
                  {newPassword && (
                    <div className="mt-2">
                      <div className="flex h-1.5 gap-1">
                        {[0, 1, 2, 3].map((i) => (
                          <div
                            key={i}
                            className="flex-1 rounded-full transition-all"
                            style={{ background: i < strength ? strengthInfo.color : 'var(--border-default)' }}
                          />
                        ))}
                      </div>
                      <p className="mt-1 text-xs" style={{ color: strengthInfo.color }}>
                        {strengthInfo.label}
                      </p>
                    </div>
                  )}
                </div>

                <div>
                  <label htmlFor="confirm-password" className="mb-1.5 block text-sm font-medium text-[var(--text-primary)]">
                    Confirm new password
                  </label>
                  <div className="relative">
                    <input
                      id="confirm-password"
                      type={showConfirmPassword ? 'text' : 'password'}
                      required
                      autoComplete="new-password"
                      placeholder="••••••••"
                      className={inputClasses}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className={toggleButtonClasses}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                  {passwordsMismatch && (
                    <p className="mt-1.5 text-xs" style={{ color: '#FF8FB8' }}>
                      Passwords do not match
                    </p>
                  )}
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
                  disabled={loading || !canSubmit}
                  className="w-full rounded-lg bg-brand px-4 py-3.5
                    text-base font-bold text-white shadow-md transition
                    hover:opacity-90 hover:shadow-[0_0_30px_rgba(255,61,139,0.3)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Updating…' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
