'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSignIn = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const supabase = createClient()
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const inputClasses =
    'w-full rounded-lg border border-[#222222] bg-[#0A0A0A] px-4 py-2.5 text-sm text-white ' +
    'placeholder:text-[#555555] shadow-sm transition focus:border-brand-pink focus:outline-none ' +
    'focus:ring-[3px] focus:ring-[rgba(255,61,139,0.15)]'

  return (
    <div
      className="relative flex min-h-screen items-center justify-center bg-black px-4"
      style={{ backgroundImage: 'radial-gradient(ellipse at center, rgba(123,47,255,0.08) 0%, transparent 70%)' }}
    >
      <div className="relative w-full max-w-sm">
        <div className="mb-8 text-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Scrivly" className="mx-auto mb-3" style={{ height: '40px', width: 'auto' }} />
          <h1 className="text-2xl font-bold text-white">Scrivly</h1>
          <p className="mt-1 text-sm text-[#A0A0A0]">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border border-[#222222] bg-[#111111] p-10 shadow-sm">
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-white">
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
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-white">
                  Password
                </label>
                <span className="text-xs text-brand-pink hover:text-brand-orange cursor-pointer">
                  Forgot password?
                </span>
              </div>
              <input
                id="password"
                type="password"
                required
                autoComplete="current-password"
                placeholder="••••••••"
                className={inputClasses}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-[#A0A0A0]">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-brand-pink hover:text-brand-orange">
              Get started free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
