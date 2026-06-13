import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import ThemeToggle from '@/components/ThemeToggle'

export const dynamic = 'force-dynamic'

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export default async function PurchasesPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: purchases } = await supabase
    .from('credit_transactions')
    .select('*')
    .eq('user_id', user.id)
    .eq('type', 'purchase')
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen" style={{ background: 'var(--bg-primary)' }}>
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
          Purchase History
        </h1>

        {(!purchases || purchases.length === 0) ? (
          <div
            className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed py-16 text-center"
            style={{ borderColor: 'var(--border-default)', background: 'var(--bg-input)' }}
          >
            <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>No purchases yet</p>
            <p className="max-w-sm text-xs" style={{ color: 'var(--text-muted)' }}>
              Redeem a code to see your purchase history here.
            </p>
            <Link
              href="/etsy-shop"
              className="mt-2 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-bold text-white shadow-md transition hover:shadow-[0_0_30px_rgba(255,61,139,0.35)]"
            >
              Buy Credits
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {purchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex items-center justify-between gap-4 rounded-2xl p-5 shadow-sm sm:p-6"
                style={{ background: 'var(--bg-card)', border: '1px solid var(--border-default)' }}
              >
                <div>
                  <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>
                    {purchase.description || 'Credit purchase'}
                  </p>
                  <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>
                    {formatDate(purchase.created_at)}
                  </p>
                </div>
                <p className="text-sm font-semibold" style={{ color: '#22C55E' }}>
                  +{purchase.amount} credits
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
