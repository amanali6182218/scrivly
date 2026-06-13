'use client'

import { useState, useEffect } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import Link from 'next/link'

export default function AuthCtaBanner({
  heading,
  subtext,
  buttonText,
  buttonHref,
  secondaryButtonText,
  secondaryButtonHref,
}) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    )
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  if (loading || user) return null

  return (
    <section
      style={{
        background: 'var(--bg-secondary)',
        borderRadius: '16px',
        padding: '48px 32px',
        textAlign: 'center',
        margin: '60px auto',
        maxWidth: '800px',
      }}
    >
      <h2
        style={{
          fontSize: '28px',
          fontWeight: '700',
          color: 'var(--text-primary)',
          marginBottom: '12px',
        }}
      >
        {heading}
      </h2>
      {subtext && (
        <p
          style={{
            fontSize: '16px',
            color: 'var(--text-secondary)',
            marginBottom: '24px',
          }}
        >
          {subtext}
        </p>
      )}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          justifyContent: 'center',
          flexWrap: 'wrap',
        }}
      >
        <Link href={buttonHref}>
          <button
            style={{
              background: 'linear-gradient(135deg,#FFB800,#FF3D8B,#7B2FFF)',
              border: 'none',
              color: 'white',
              padding: '12px 28px',
              borderRadius: '10px',
              fontSize: '15px',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            {buttonText}
          </button>
        </Link>
        {secondaryButtonText && (
          <Link href={secondaryButtonHref}>
            <button
              style={{
                background: 'transparent',
                border: '1px solid var(--border-default)',
                color: 'var(--text-primary)',
                padding: '12px 28px',
                borderRadius: '10px',
                fontSize: '15px',
                cursor: 'pointer',
              }}
            >
              {secondaryButtonText}
            </button>
          </Link>
        )}
      </div>
    </section>
  )
}
