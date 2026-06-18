'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import PhotoToListing from '@/components/PhotoToListing'
import SpyImprove from '@/components/SpyImprove'
import ShareModal from '@/components/ShareModal'
import { getPriceResearchCost, CREDIT_COSTS } from '@/lib/plans'
import { referralUrl } from '@/lib/referral'

const TABS = [
  { id: 'photo', label: 'Photo to Listing' },
  { id: 'spy', label: 'Spy & Improve' },
]

const TAB_COPY = {
  photo: {
    heading: 'Turn a product photo into a listing that sells',
    subheading:
      'Upload a photo of your product and we\'ll write a ready-to-use Etsy title, description, and tag set based on what\'s in the image.',
  },
  spy: {
    heading: 'Spy on a competitor and beat their listing',
    subheading:
      'Paste any public Etsy listing URL. We\'ll find the gaps in their title, description, and tags — then write you a stronger version.',
  },
}

export default function ListingGenerator({ credits, onCreditsUsed, packTier = 'none', referralCode }) {
  const [activeTab, setActiveTab] = useState('photo')
  const [listingResult, setListingResult] = useState(null)
  const [spyResult, setSpyResult] = useState(null)
  const [shareOpen, setShareOpen] = useState(false)
  const priceResearchCost = getPriceResearchCost(packTier)
  const spyCost = CREDIT_COSTS.spy_improve
  const url = referralCode ? referralUrl(referralCode) : null

  useEffect(() => {
    const tab = new URLSearchParams(window.location.search).get('tab')
    if (tab === 'photo' || tab === 'spy') {
      setActiveTab(tab)
    }
  }, [])

  return (
    <div>
      <div className="mb-6 max-w-2xl">
        <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl lg:text-3xl">
          {TAB_COPY[activeTab].heading}
        </h2>
        <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
          {TAB_COPY[activeTab].subheading}
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-3">
        <div className="inline-flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-1 shadow-sm">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition sm:px-5 ${
                activeTab === tab.id
                  ? 'bg-brand text-[var(--text-primary)] shadow-sm'
                  : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <Link
          href="/account/history"
          className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] px-4 py-2 text-sm font-medium
            text-[var(--text-secondary)] shadow-sm transition hover:text-[var(--text-primary)]"
        >
          History
        </Link>
      </div>

      {credits < 6 && (
        <div
          className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-xl p-4 text-sm"
          style={{ background: 'rgba(255,61,139,0.1)', border: '1px solid rgba(255,61,139,0.3)', color: '#FF8FB8' }}
        >
          <span>
            {credits === 0
              ? 'You have no credits left. Redeem a code above to generate more listings.'
              : `You need at least 3 credits to generate a listing, or ${spyCost} credits for Spy & Improve.`}
          </span>
          {url && (
            <button
              type="button"
              onClick={() => setShareOpen(true)}
              className="font-semibold underline"
              style={{ color: '#FFB800' }}
            >
              Or refer a friend and earn 5 free credits →
            </button>
          )}
        </div>
      )}

      {activeTab === 'photo' && (
        <PhotoToListing
          onCreditsUsed={onCreditsUsed}
          creditsAvailable={credits}
          result={listingResult}
          onResultChange={setListingResult}
          priceResearchCost={priceResearchCost}
          referralCode={referralCode}
        />
      )}
      {activeTab === 'spy' && (
        <SpyImprove
          onCreditsUsed={onCreditsUsed}
          creditsAvailable={credits}
          result={spyResult}
          onResultChange={setSpyResult}
        />
      )}

      {shareOpen && url && <ShareModal referralUrl={url} onClose={() => setShareOpen(false)} />}
    </div>
  )
}
