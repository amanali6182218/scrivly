'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import Avatar from '@/components/Avatar'
import ThemeToggle from '@/components/ThemeToggle'

const AVATAR_COLORS = ['#FF3D8B', '#FFB800', '#7B2FFF', '#22C55E', '#3B82F6', '#F97316', '#EC4899', '#06B6D4']

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

function getInitials(fullName, email) {
  const trimmed = (fullName || '').trim()
  if (trimmed) {
    const parts = trimmed.split(/\s+/)
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
  }
  return email.charAt(0).toUpperCase()
}

const inputClasses =
  'w-full rounded-lg px-4 py-2.5 text-sm shadow-sm transition focus:outline-none focus:ring-[3px]'

function Toast({ message }) {
  if (!message) return null
  return (
    <p
      className="mt-3 rounded-lg px-4 py-2.5 text-sm"
      style={
        message.type === 'success'
          ? { background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.3)', color: '#22C55E' }
          : { background: 'rgba(255,61,139,0.08)', border: '1px solid rgba(255,61,139,0.3)', color: '#FF8FB8' }
      }
    >
      {message.text}
    </p>
  )
}

export default function AccountShell({ user, profile }) {
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [avatarColor, setAvatarColor] = useState(profile.avatar_color || '#FF3D8B')
  const [avatarInitials, setAvatarInitials] = useState(profile.avatar_initials || getInitials(profile.full_name, user.email))
  const [savingProfile, setSavingProfile] = useState(false)
  const [profileMessage, setProfileMessage] = useState(null)

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPassword, setSavingPassword] = useState(false)
  const [passwordMessage, setPasswordMessage] = useState(null)

  const handleSaveProfile = async (e) => {
    e.preventDefault()
    setSavingProfile(true)
    setProfileMessage(null)

    const initials = getInitials(fullName, user.email)
    const supabase = createClient()
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: fullName, avatar_initials: initials })
      .eq('id', user.id)

    if (error) {
      setProfileMessage({ type: 'error', text: 'Could not save your profile. Please try again.' })
    } else {
      setAvatarInitials(initials)
      setProfileMessage({ type: 'success', text: 'Profile updated successfully' })
    }
    setSavingProfile(false)
  }

  const handleColorSelect = async (color) => {
    const previous = avatarColor
    setAvatarColor(color)
    const supabase = createClient()
    const { error } = await supabase.from('profiles').update({ avatar_color: color }).eq('id', user.id)
    if (error) setAvatarColor(previous)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setPasswordMessage(null)

    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 6) {
      setPasswordMessage({ type: 'error', text: 'Password must be at least 6 characters.' })
      return
    }

    setSavingPassword(true)
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setPasswordMessage({ type: 'error', text: error.message })
    } else {
      setPasswordMessage({ type: 'success', text: 'Password updated successfully' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setSavingPassword(false)
  }

  const strength = getPasswordStrength(newPassword)
  const strengthInfo = STRENGTH_LEVELS[strength]

  const cardStyle = {
    background: 'var(--bg-card)',
    border: '1px solid var(--border-default)',
    borderRadius: '16px',
  }

  const fieldInputStyle = {
    background: 'var(--bg-input)',
    border: '1px solid var(--border-default)',
    color: 'var(--text-primary)',
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      {/* Header */}
      <header className="border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Scrivly" style={{ height: '36px', width: 'auto', cursor: 'pointer' }} />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10">
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition hover:text-brand-pink"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mb-6 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Manage Account
        </h1>

        <div className="space-y-6">
          {/* SECTION 1 — PROFILE */}
          <div className="p-6 shadow-sm sm:p-8" style={cardStyle}>
            <h2 className="mb-5 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Profile
            </h2>

            <div className="mb-6 flex items-center gap-4">
              <Avatar profile={{ avatar_color: avatarColor, avatar_initials: avatarInitials }} email={user.email} size={80} fontSize={28} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  {fullName || user.email}
                </p>
                <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>
                  Your avatar is generated from your initials
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label htmlFor="full-name" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Full name
                </label>
                <input
                  id="full-name"
                  type="text"
                  placeholder="e.g. John Smith"
                  className={inputClasses}
                  style={fieldInputStyle}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  readOnly
                  value={user.email}
                  className={`${inputClasses} cursor-not-allowed opacity-60`}
                  style={fieldInputStyle}
                />
              </div>

              <button
                type="submit"
                disabled={savingProfile}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm
                  transition hover:shadow-[0_0_20px_rgba(255,61,139,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingProfile ? 'Saving…' : 'Save Profile'}
              </button>

              <Toast message={profileMessage} />
            </form>
          </div>

          {/* SECTION 2 — AVATAR COLOR */}
          <div className="p-6 shadow-sm sm:p-8" style={cardStyle}>
            <h2 className="mb-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Avatar color
            </h2>
            <p className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              Pick a color for your avatar circle.
            </p>

            <div className="flex flex-wrap gap-3">
              {AVATAR_COLORS.map((color) => (
                <button
                  key={color}
                  type="button"
                  onClick={() => handleColorSelect(color)}
                  aria-label={`Select avatar color ${color}`}
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '9999px',
                    background: color,
                    cursor: 'pointer',
                    border: 'none',
                    boxShadow: avatarColor === color ? '0 0 0 2px var(--bg-card), 0 0 0 4px #FFFFFF' : 'none',
                    transition: 'all 0.15s ease',
                  }}
                />
              ))}
            </div>
          </div>

          {/* SECTION 3 — CHANGE PASSWORD */}
          <div className="p-6 shadow-sm sm:p-8" style={cardStyle}>
            <h2 className="mb-5 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Change password
            </h2>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  New password
                </label>
                <input
                  id="new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClasses}
                  style={fieldInputStyle}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
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
                <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Confirm new password
                </label>
                <input
                  id="confirm-new-password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="••••••••"
                  className={inputClasses}
                  style={fieldInputStyle}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>

              <button
                type="submit"
                disabled={savingPassword || !newPassword || !confirmPassword}
                className="rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm
                  transition hover:shadow-[0_0_20px_rgba(255,61,139,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? 'Updating…' : 'Change Password'}
              </button>

              <Toast message={passwordMessage} />
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
