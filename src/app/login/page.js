'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
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
    'w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 ' +
    'placeholder:text-stone-400 shadow-sm transition focus:border-amber-400 focus:outline-none ' +
    'focus:ring-2 focus:ring-amber-200'

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <Image src="/logo.png" alt="Scrivly" width={339} height={102} className="mx-auto mb-3 h-14 w-14 rounded-2xl object-cover shadow-md shadow-amber-500/30" />
          <h1 className="text-2xl font-bold text-stone-900">Scrivly</h1>
          <p className="mt-1 text-sm text-stone-500">Sign in to your account</p>
        </div>

        <div className="rounded-2xl border border-amber-100 bg-white p-8 shadow-sm">
          <form onSubmit={handleSignIn} className="space-y-4">
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
            </div>

            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-stone-700">
                  Password
                </label>
                <span className="text-xs text-amber-600 hover:text-amber-700 cursor-pointer">
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
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-stone-500">
            Don&apos;t have an account?{' '}
            <Link href="/signup" className="font-medium text-amber-600 hover:text-amber-700">
              Get started free
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
