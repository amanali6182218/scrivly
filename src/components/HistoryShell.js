'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import ThemeToggle from '@/components/ThemeToggle'
import { hasBulkCsvExport } from '@/lib/plans'

const TIER_SUBTEXT = {
  starter: 'Showing your last 10 generations. Upgrade to Pro for last 50, or Power for unlimited.',
  pro: 'Showing your last 50 generations. Upgrade to Power for unlimited history.',
  power: 'Your complete generation history — all listings saved.',
  none: 'Purchase a credit pack to start saving your generations.',
}

const cardStyle = {
  background: 'var(--bg-card)',
  border: '1px solid var(--border-default)',
  borderRadius: '16px',
}

function formatDate(dateString) {
  const date = new Date(dateString)
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  })
}

function formatPriceRange(item) {
  if (item.suggested_price_min == null || item.suggested_price_max == null) return null
  const min = Number(item.suggested_price_min)
  const max = Number(item.suggested_price_max)
  const fmt = (n) => (n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`)
  return `${fmt(min)} – ${fmt(max)}`
}

function TypeBadge({ type }) {
  if (type === 'spy_improve') {
    return (
      <span
        className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
        style={{ background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)', color: '#CC99FF' }}
      >
        Spy & Improve
      </span>
    )
  }
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: 'rgba(255,138,0,0.15)', border: '1px solid rgba(255,138,0,0.3)', color: '#FFB870' }}
    >
      Photo to Listing
    </span>
  )
}

function HealthScorePill({ score }) {
  if (score == null) return null
  let color = '#22C55E'
  if (score < 50) color = '#FF3D8B'
  else if (score < 75) color = '#FFB800'
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold"
      style={{ background: `${color}26`, border: `1px solid ${color}4D`, color }}
    >
      Health: {score}/100
    </span>
  )
}

function CopyButton({ text, label = 'Copy' }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 1800)
    } catch {
      /* clipboard unavailable */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)]
        px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] shadow-sm transition hover:border-brand-pink
        hover:text-[var(--text-primary)]"
    >
      {copied ? 'Copied!' : label}
    </button>
  )
}

function ViewListingModal({ item, onClose }) {
  if (!item) return null

  const tags = item.generated_tags || []
  const priceRange = formatPriceRange(item)
  const everything = [
    item.generated_title || '',
    '',
    item.generated_description || '',
    '',
    tags.length ? `Tags: ${tags.join(', ')}` : '',
  ].join('\n')

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl p-6 shadow-xl sm:p-8"
        style={cardStyle}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>
            {item.generation_type === 'spy_improve' ? 'Improved Listing' : 'Generated Listing'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="text-2xl leading-none transition hover:opacity-70"
            style={{ color: 'var(--text-muted)' }}
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Title</span>
              <CopyButton text={item.generated_title || ''} />
            </div>
            <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.generated_title}</p>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Description</span>
              <CopyButton text={item.generated_description || ''} />
            </div>
            <p className="whitespace-pre-wrap text-sm" style={{ color: 'var(--text-secondary)' }}>{item.generated_description}</p>
          </div>

          {tags.length > 0 && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Tags</span>
                <CopyButton text={tags.join(', ')} />
              </div>
              <div className="flex flex-wrap gap-2">
                {tags.map((tag, i) => (
                  <span
                    key={i}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)', color: '#CC99FF' }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {priceRange && (
            <div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Suggested price range</span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{priceRange}</p>
            </div>
          )}

          {item.health_score != null && (
            <div>
              <span className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Health score</span>
              <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>{item.health_score}/100</p>
            </div>
          )}
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <CopyButton text={everything} label="Copy everything" />
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-4 py-2 text-sm font-semibold transition"
            style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl py-20 text-center" style={cardStyle}>
      <svg className="h-10 w-10" style={{ color: 'var(--text-muted)' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
      </svg>
      <h2 className="text-lg font-semibold" style={{ color: 'var(--text-primary)' }}>No generations yet</h2>
      <p className="text-sm" style={{ color: 'var(--text-secondary)' }}>Your generated listings will appear here.</p>
      <Link
        href="/dashboard"
        className="mt-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-sm
          transition hover:shadow-[0_0_20px_rgba(255,61,139,0.35)]"
      >
        Generate your first listing
      </Link>
    </div>
  )
}

export default function HistoryShell({ user, profile, initialHistory }) {
  const router = useRouter()
  const packTier = profile.pack_tier || 'none'
  const canExportCsv = hasBulkCsvExport(packTier)
  const [history] = useState(initialHistory)
  const [viewItem, setViewItem] = useState(null)
  const [selectedIds, setSelectedIds] = useState([])
  const [exporting, setExporting] = useState(false)

  const toggleSelect = (id) => {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  const handleRegenerate = (item) => {
    if (item.generation_type === 'spy_improve') {
      sessionStorage.setItem('scrivly_regenerate_spy_url', item.input_details || '')
      router.push('/dashboard?tab=spy')
    } else {
      sessionStorage.setItem('scrivly_regenerate_photo_details', item.input_details || '')
      router.push('/dashboard?tab=photo')
    }
  }

  const handleExport = async () => {
    setExporting(true)
    try {
      const response = await fetch('/api/export/csv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ generationIds: selectedIds }),
      })
      if (!response.ok) {
        setExporting(false)
        return
      }
      const blob = await response.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scrivly-listings-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
      <header className="border-b" style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg-secondary)' }}>
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Link href="/dashboard" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Scrivly" style={{ height: '36px', width: 'auto', cursor: 'pointer' }} />
            <span style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', letterSpacing: '-0.3px' }}>
              Scrivly
            </span>
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-8 sm:px-6 sm:py-10" style={{ paddingBottom: canExportCsv && selectedIds.length > 0 ? '96px' : undefined }}>
        <Link
          href="/dashboard"
          className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium transition hover:text-brand-pink"
          style={{ color: 'var(--text-secondary)' }}
        >
          ← Back to Dashboard
        </Link>

        <h1 className="mb-2 text-2xl font-bold sm:text-3xl" style={{ color: 'var(--text-primary)' }}>
          Generation History
        </h1>
        <p className="mb-6 text-sm" style={{ color: 'var(--text-secondary)' }}>
          {TIER_SUBTEXT[packTier] || TIER_SUBTEXT.none}
        </p>

        {history.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="space-y-4">
            {history.map((item) => {
              const tags = item.generated_tags || []
              const priceRange = formatPriceRange(item)
              return (
                <div key={item.id} className="flex flex-col gap-4 p-5 shadow-sm sm:flex-row sm:p-6" style={cardStyle}>
                  <div className="flex shrink-0 flex-col gap-2 sm:w-1/3">
                    <div className="flex flex-wrap items-center gap-2">
                      {canExportCsv && (
                        <input
                          type="checkbox"
                          checked={selectedIds.includes(item.id)}
                          onChange={() => toggleSelect(item.id)}
                          className="h-4 w-4 cursor-pointer"
                        />
                      )}
                      <TypeBadge type={item.generation_type} />
                    </div>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{formatDate(item.created_at)}</p>
                    <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{item.credits_used} credits used</p>
                    <HealthScorePill score={item.health_score} />
                    {priceRange && (
                      <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{priceRange}</p>
                    )}
                  </div>

                  <div className="flex-1">
                    <h3 className="mb-1.5 line-clamp-2 text-base font-bold" style={{ color: 'var(--text-primary)' }}>
                      {item.generated_title}
                    </h3>
                    <p className="mb-3 text-sm" style={{ color: 'var(--text-muted)' }}>
                      {(item.generated_description || '').slice(0, 100)}
                      {(item.generated_description || '').length > 100 ? '…' : ''}
                    </p>
                    {tags.length > 0 && (
                      <div className="mb-3 flex flex-wrap gap-1.5">
                        {tags.slice(0, 5).map((tag, i) => (
                          <span
                            key={i}
                            className="rounded-full px-2.5 py-1 text-xs font-medium"
                            style={{ background: 'rgba(123,47,255,0.15)', border: '1px solid rgba(123,47,255,0.3)', color: '#CC99FF' }}
                          >
                            {tag}
                          </span>
                        ))}
                        {tags.length > 5 && (
                          <span className="rounded-full px-2.5 py-1 text-xs font-medium" style={{ color: 'var(--text-muted)' }}>
                            +{tags.length - 5} more
                          </span>
                        )}
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3">
                      <button
                        type="button"
                        onClick={() => setViewItem(item)}
                        className="text-sm font-medium text-brand-pink hover:text-brand-orange"
                      >
                        View full listing →
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRegenerate(item)}
                        className="rounded-lg px-3 py-1.5 text-sm font-medium transition"
                        style={{ background: 'var(--bg-secondary)', color: 'var(--text-primary)' }}
                      >
                        Regenerate
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>

      {!canExportCsv && history.length > 0 && (
        <div className="mx-auto max-w-3xl px-4 pb-10 sm:px-6">
          <div
            className="flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm"
            style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-default)', color: 'var(--text-secondary)' }}
            title="CSV export available on Pro and Power packs"
          >
            <span>Bulk CSV export available on Pro and Power packs</span>
            <Link href="/pricing" className="font-medium text-brand-pink hover:text-brand-orange">
              Upgrade →
            </Link>
          </div>
        </div>
      )}

      {canExportCsv && selectedIds.length > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t px-4 py-3 shadow-lg"
          style={{ background: 'var(--bg-card)', borderColor: 'var(--border-default)' }}
        >
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
              {selectedIds.length} listing{selectedIds.length === 1 ? '' : 's'} selected
            </span>
            <button
              type="button"
              onClick={handleExport}
              disabled={exporting}
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm
                transition hover:shadow-[0_0_20px_rgba(255,61,139,0.35)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {exporting ? 'Exporting…' : 'Export selected to CSV →'}
            </button>
          </div>
        </div>
      )}

      <ViewListingModal item={viewItem} onClose={() => setViewItem(null)} />
    </div>
  )
}
