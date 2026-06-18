'use client'

import { useState } from 'react'

function XIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  )
}

function FacebookIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#1877F2">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.234 2.686.234v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="#25D366">
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.98.58 3.83 1.58 5.39L2 22l4.86-1.67a9.86 9.86 0 005.18 1.43h.01c5.46 0 9.91-4.45 9.91-9.91C21.96 6.45 17.5 2 12.04 2zm0 18.06h-.01a8.13 8.13 0 01-4.15-1.14l-.3-.18-3.08 1.06.97-2.99-.2-.31a8.16 8.16 0 01-1.25-4.59c0-4.5 3.66-8.16 8.17-8.16 2.18 0 4.23.85 5.77 2.39a8.1 8.1 0 012.39 5.78c0 4.5-3.66 8.14-8.31 8.14zm4.48-6.1c-.25-.12-1.45-.71-1.67-.79-.22-.08-.39-.12-.55.12-.16.25-.63.79-.78.95-.14.16-.29.18-.54.06-.25-.12-1.05-.39-2-1.23-.74-.66-1.24-1.48-1.39-1.73-.14-.25-.02-.39.12-.51.12-.12.27-.31.41-.47.14-.16.18-.27.27-.45.08-.18.04-.33-.04-.45-.08-.12-.55-1.33-.76-1.82-.2-.47-.41-.41-.55-.41-.14 0-.31-.02-.47-.02-.16 0-.43.06-.66.31-.22.25-.86.84-.86 2.04 0 1.2.88 2.36 1 2.52.12.16 1.65 2.51 4 3.42 2 .78 2.4.62 2.84.58.43-.04 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.47-.27z" />
    </svg>
  )
}

function LinkIcon() {
  return (
    <svg className="h-5 w-5 text-[var(--text-secondary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.828 10.172a4 4 0 010 5.656l-2 2a4 4 0 11-5.656-5.656l1-1m2.828-2.828l1-1a4 4 0 115.656 5.656l-2 2" />
    </svg>
  )
}

const TWITTER_TEXT = (url) =>
  `Just found this AI tool that writes complete Etsy listings from a product photo in 30 seconds 🤯\n\nTitle, description, 13 tags, health score — all done automatically.\n\nSign up free and get 3 credits to try it yourself 👇\n\n${url}\n\n#EtsySeller #EtsyTips #AITools`

const FACEBOOK_TEXT = (url) =>
  `Etsy sellers — you need to see this 👇\n\nI have been using Scrivly to write my listings and it is genuinely insane how fast it works.\n\nUpload a product photo → get a complete SEO-optimized listing in 30 seconds.\nTitle. Description. All 13 tags. Done.\n\nNo more spending 45 minutes on each listing. No more guessing keywords.\n\nSign up free through my link and get 3 credits to try it yourself:\n\n${url}`

const WHATSAPP_TEXT = (url) =>
  `Hey! Have you tried Scrivly yet? 🎨\n\nIt writes complete Etsy listings from your product photo in 30 seconds. SEO title, description, all 13 tags and a health score out of 100.\n\nSign up free through my link and get 3 free credits to generate your first listing 👇\n\n${url}`

export default function ShareModal({ referralUrl, onClose }) {
  const [copiedKey, setCopiedKey] = useState(null)
  const [facebookCopied, setFacebookCopied] = useState(false)

  const flashCopied = (key, setter) => {
    setter(true)
    setTimeout(() => setter(false), 2000)
    setCopiedKey(key)
    setTimeout(() => setCopiedKey((prev) => (prev === key ? null : prev)), 2000)
  }

  const handleTwitter = () => {
    const text = encodeURIComponent(TWITTER_TEXT(referralUrl))
    window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank')
  }

  const handleFacebook = async () => {
    try {
      await navigator.clipboard.writeText(FACEBOOK_TEXT(referralUrl))
      flashCopied('facebook', setFacebookCopied)
    } catch {
      // clipboard unavailable — still open Facebook
    }
    window.open('https://www.facebook.com', '_blank')
  }

  const handleWhatsApp = () => {
    const text = encodeURIComponent(WHATSAPP_TEXT(referralUrl))
    window.open(`https://wa.me/?text=${text}`, '_blank')
  }

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(referralUrl)
      flashCopied('link', () => {})
      setCopiedKey('link')
      setTimeout(() => setCopiedKey((prev) => (prev === 'link' ? null : prev)), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  const PLATFORMS = [
    {
      key: 'twitter',
      icon: <XIcon />,
      name: 'X (Twitter)',
      preview: 'Just found this AI tool that writes Etsy listings...',
      onClick: handleTwitter,
    },
    {
      key: 'facebook',
      icon: <FacebookIcon />,
      name: 'Facebook',
      preview: facebookCopied ? 'Message copied! Paste it into your Facebook post' : 'Etsy sellers — you need to see this...',
      onClick: handleFacebook,
    },
    {
      key: 'whatsapp',
      icon: <WhatsAppIcon />,
      name: 'WhatsApp',
      preview: 'Hey! Have you tried Scrivly yet?...',
      onClick: handleWhatsApp,
    },
    {
      key: 'link',
      icon: <LinkIcon />,
      name: 'Copy referral link',
      preview: copiedKey === 'link' ? 'Link copied! ✓' : 'Copy your personal link to share anywhere',
      onClick: handleCopyLink,
    },
  ]

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(8px)', zIndex: 9999 }}
    >
      <div
        className="relative w-[90%] text-center"
        style={{
          background: 'var(--bg-card)',
          border: '1px solid rgba(255,61,139,0.3)',
          borderRadius: '20px',
          padding: '40px',
          maxWidth: '520px',
          boxShadow: '0 24px 80px rgba(0,0,0,0.6), 0 0 60px rgba(123,47,255,0.15)',
        }}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex items-center justify-center rounded-lg transition hover:bg-[var(--bg-elevated)]"
          style={{ width: '32px', height: '32px', color: 'var(--text-secondary)' }}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <h2 className="gradient-text" style={{ fontSize: '24px', fontWeight: 700 }}>
          Share Scrivly 🚀
        </h2>
        <p className="mt-2 text-sm" style={{ color: 'var(--text-secondary)' }}>
          Choose where to share. Your message is pre-written — just click and share.
        </p>

        <div className="mt-6 space-y-3 text-left">
          {PLATFORMS.map((platform) => (
            <button
              key={platform.key}
              type="button"
              onClick={platform.onClick}
              className="flex w-full items-center justify-between gap-3 rounded-xl px-5 py-4 text-left transition"
              style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-default)' }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#FF3D8B')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'var(--border-default)')}
            >
              <div className="flex items-center gap-3 overflow-hidden">
                <span className="shrink-0">{platform.icon}</span>
                <div className="overflow-hidden">
                  <p className="text-sm font-bold" style={{ color: 'var(--text-primary)' }}>{platform.name}</p>
                  <p className="truncate text-xs" style={{ color: 'var(--text-muted)' }}>{platform.preview}</p>
                </div>
              </div>
              <span className="shrink-0 text-sm font-semibold" style={{ color: '#FF3D8B' }}>
                {platform.key === 'link' ? (copiedKey === 'link' ? 'Copied ✓' : 'Copy →') : 'Share →'}
              </span>
            </button>
          ))}
        </div>

        <p className="mt-6 text-xs" style={{ color: 'var(--text-muted)' }}>
          You earn 5 credits when they sign up. +10 more when they purchase. They get 3 free credits to start.
        </p>
      </div>
    </div>
  )
}
