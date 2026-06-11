'use client'

import { useState } from 'react'
import PhotoToListing from '@/components/PhotoToListing'
import SpyImprove from '@/components/SpyImprove'

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

export default function ListingGenerator({ credits, onCreditsUsed }) {
  const [activeTab, setActiveTab] = useState('photo')
  const [listingResult, setListingResult] = useState(null)
  const [spyResult, setSpyResult] = useState(null)

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

      <div className="mb-8 inline-flex rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-1 shadow-sm">
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

      {credits < 3 && (
        <div
          className="mb-6 rounded-xl p-4 text-sm"
          style={{ background: 'rgba(255,61,139,0.1)', border: '1px solid rgba(255,61,139,0.3)', color: '#FF8FB8' }}
        >
          {credits === 0
            ? "You have no credits left. Redeem a code above to generate more listings."
            : "You need at least 3 credits to generate a listing, or 4 credits for Spy & Improve."}
        </div>
      )}

      {activeTab === 'photo' && (
        <PhotoToListing
          onCreditsUsed={onCreditsUsed}
          creditsAvailable={credits}
          result={listingResult}
          onResultChange={setListingResult}
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
    </div>
  )
}
