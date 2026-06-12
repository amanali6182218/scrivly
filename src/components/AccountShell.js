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

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [currentPasswordError, setCurrentPasswordError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [passwordToast, setPasswordToast] = useState(null)

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

  const showPasswordToast = (toast) => {
    setPasswordToast(toast)
    setTimeout(() => setPasswordToast(null), 3000)
  }

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setCurrentPasswordError('')
    setPasswordError('')

    if (!currentPassword) {
      setCurrentPasswordError('Please enter your current password')
      return
    }
    if (newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters')
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match')
      return
    }
    if (newPassword === currentPassword) {
      setPasswordError('New password must be different from your current password')
      return
    }

    setSavingPassword(true)
    const supabase = createClient()

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: currentPassword,
    })

    if (signInError) {
      setCurrentPasswordError('Incorrect current password. Please try again.')
      setCurrentPassword('')
      setSavingPassword(false)
      return
    }

    const { error: updateError } = await supabase.auth.updateUser({ password: newPassword })

    if (updateError) {
      showPasswordToast({ type: 'error', text: 'Failed to update password. Please try again.' })
    } else {
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      showPasswordToast({ type: 'success', text: 'Password updated successfully ✓' })
    }
    setSavingPassword(false)
  }

  const strength = getPasswordStrength(newPassword)
  const strengthInfo = STRENGTH_LEVELS[strength]
  const confirmMatches = confirmPassword.length > 0 && confirmPassword === newPassword
  const confirmMismatch = confirmPassword.length > 0 && confirmPassword !== newPassword
  const canSubmitPassword =
    currentPassword.length > 0 &&
    newPassword.length >= 8 &&
    newPassword === confirmPassword &&
    newPassword !== currentPassword

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
            <h2 className="mb-1 text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
              Change Password
            </h2>
            <p className="mb-5 text-sm" style={{ color: 'var(--text-secondary)' }}>
              To change your password you must verify your current password first.
            </p>

            <form onSubmit={handleChangePassword} className="space-y-4">
              <div>
                <label htmlFor="current-password" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Current password
                </label>
                <div className="relative">
                  <input
                    id="current-password"
                    type={showCurrentPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your current password"
                    required
                    className={`${inputClasses} pr-10`}
                    style={fieldInputStyle}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                    style={{ color: 'var(--text-muted)' }}
                    aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                  >
                    <EyeIcon visible={showCurrentPassword} />
                  </button>
                </div>
                {currentPasswordError && (
                  <p className="mt-1.5 text-xs" style={{ color: '#FF8FB8' }}>
                    {currentPasswordError}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="new-password" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  New password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNewPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                    className={`${inputClasses} pr-10`}
                    style={fieldInputStyle}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 transition hover:opacity-80"
                    style={{ color: 'var(--text-muted)' }}
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
                      {strength < 2 ? ' — Please choose a stronger password' : ''}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="confirm-new-password" className="mb-1.5 block text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                  Confirm new password
                </label>
                <div className="relative">
                  <input
                    id="confirm-new-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Repeat new password"
                    className={`${inputClasses} pr-16`}
                    style={fieldInputStyle}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />
                  <div className="absolute right-3 top-1/2 flex -translate-y-1/2 items-center gap-2">
                    {confirmMatches && (
                      <span style={{ color: '#22C55E' }} aria-label="Passwords match">✓</span>
                    )}
                    {confirmMismatch && (
                      <span style={{ color: '#FF3D8B' }} aria-label="Passwords do not match">✗</span>
                    )}
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((v) => !v)}
                      className="transition hover:opacity-80"
                      style={{ color: 'var(--text-muted)' }}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      <EyeIcon visible={showConfirmPassword} />
                    </button>
                  </div>
                </div>
              </div>

              {passwordError && (
                <p
                  className="rounded-lg px-4 py-2.5 text-sm"
                  style={{ background: 'rgba(255,61,139,0.08)', border: '1px solid rgba(255,61,139,0.3)', color: '#FF8FB8' }}
                >
                  {passwordError}
                </p>
              )}

              <button
                type="submit"
                disabled={savingPassword || !canSubmitPassword}
                className="w-full rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm
                  transition hover:shadow-[0_0_20px_rgba(255,61,139,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {savingPassword ? 'Verifying…' : 'Update Password'}
              </button>

              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
                For your security, you will remain logged in after changing your password.
              </p>

              <Toast message={passwordToast} />
            </form>
          </div>
        </div>
      </main>
    </div>
  )
}
