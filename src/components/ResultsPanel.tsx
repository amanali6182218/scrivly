"use client";

import { useState } from "react";
import { GeneratedListing, MarketDemand, PriceResearchResult } from "@/lib/types";
import ListingHealthScore from "@/components/ListingHealthScore";

interface ResultsPanelProps {
  listing: GeneratedListing | null;
  isGenerating: boolean;
  error?: string | null;
  onRegenerate?: () => void;
  onFix?: (weakAreas: string[]) => void;
  onClear?: () => void;
  priceResult?: PriceResearchResult | null;
  isPriceLoading?: boolean;
  credits?: number;
}

// ── Price section ─────────────────────────────────────────────────────────────

const DEMAND_STYLE: Record<MarketDemand, { label: string; bg: string; border: string; dot: string; text: string }> = {
  high:   { label: "High demand",   bg: "rgba(34,197,94,0.15)",  border: "rgba(34,197,94,0.3)",  dot: "#22C55E", text: "#22C55E" },
  medium: { label: "Medium demand", bg: "rgba(255,184,0,0.15)",  border: "rgba(255,184,0,0.3)",  dot: "#FFB800", text: "#FFB800" },
  low:    { label: "Low demand",    bg: "rgba(255,61,139,0.1)",  border: "rgba(255,61,139,0.3)", dot: "#FF3D8B", text: "#FF3D8B" },
};

function formatPrice(n: number): string {
  return n % 1 === 0 ? `$${n}` : `$${n.toFixed(2)}`;
}

function PriceSection({
  result,
  isLoading,
}: {
  result: PriceResearchResult | null | undefined;
  isLoading: boolean | undefined;
}) {
  const [copied, setCopied] = useState(false);

  if (isLoading) {
    return (
      <div className="flex items-center gap-2.5 rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-4 shadow-sm">
        <svg className="h-4 w-4 shrink-0 animate-spin text-brand-pink" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-[var(--text-secondary)]">Researching Etsy market prices…</p>
      </div>
    );
  }

  if (!result) return null;

  const demand = DEMAND_STYLE[result.marketDemand];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.averagePrice.toFixed(2));
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* clipboard unavailable */ }
  };

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="gradient-text text-xs font-semibold uppercase tracking-wide">Suggested Price</p>
          <p className="gradient-text mt-1 text-2xl font-bold sm:text-3xl">
            {formatPrice(result.suggestedPriceMin)} – {formatPrice(result.suggestedPriceMax)}
          </p>
          <p className="mt-0.5 text-sm text-[var(--text-secondary)]">
            Average: <span className="font-semibold text-[var(--text-primary)]">{formatPrice(result.averagePrice)}</span>
          </p>
        </div>
        <span
          className="inline-flex shrink-0 items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
          style={{ background: demand.bg, border: `1px solid ${demand.border}`, color: demand.text }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: demand.dot }} />
          {demand.label}
        </span>
      </div>

      <ul className="mb-4 space-y-2">
        {result.pricingTips.map((tip, i) => (
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
            <span className="mt-0.5 shrink-0 text-brand-pink">•</span>
            {tip}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--border-subtle)] pt-3">
        <p className="text-xs text-[var(--text-muted)]">
          Based on analysis of {result.competitorCount} similar Etsy listings
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand
            px-3.5 py-1.5 text-xs font-semibold text-[var(--text-primary)] shadow-sm
            transition hover:shadow-[0_0_20px_rgba(255,61,139,0.35)]"
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copied!
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
              </svg>
              Use this price
            </>
          )}
        </button>
      </div>
    </div>
  );
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}

function CopyButton({ text, label }: { text: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (await copyToClipboard(text)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)]
        px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] shadow-sm transition hover:border-brand-pink hover:text-[var(--text-primary)]"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="11" height="11" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy {label}
        </>
      )}
    </button>
  );
}

function TagChip({ tag }: { tag: string }) {
  const [copied, setCopied] = useState(false);

  const handleClick = async () => {
    if (await copyToClipboard(tag)) {
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Copy "${tag}"`}
      className="rounded-full px-3 py-1 text-xs font-medium transition active:scale-95"
      style={
        copied
          ? { background: "rgba(255,61,139,0.15)", border: "1px solid rgba(255,61,139,0.4)", color: "#FF8FB8" }
          : { background: "rgba(123,47,255,0.15)", border: "1px solid rgba(123,47,255,0.3)", color: "#CC99FF" }
      }
      onMouseEnter={(e) => {
        if (!copied) {
          e.currentTarget.style.background = "rgba(255,61,139,0.15)";
          e.currentTarget.style.border = "1px solid rgba(255,61,139,0.4)";
        }
      }}
      onMouseLeave={(e) => {
        if (!copied) {
          e.currentTarget.style.background = "rgba(123,47,255,0.15)";
          e.currentTarget.style.border = "1px solid rgba(123,47,255,0.3)";
        }
      }}
    >
      {copied ? "Copied!" : tag}
    </button>
  );
}

function Section({
  title,
  copyText,
  copyLabel,
  children,
}: {
  title: string;
  copyText: string;
  copyLabel: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="gradient-text text-sm font-semibold uppercase tracking-wide">{title}</h3>
        <CopyButton text={copyText} label={copyLabel} />
      </div>
      {children}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed
      border-[var(--border-default)] bg-[var(--bg-input)] p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand">
        <svg className="h-8 w-8 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 5.714L21 12l-5.714 2.286L13 20l-2.286-5.714L5 12l5.714-2.286L13 4z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">Your AI-generated listing will appear here</h3>
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
        {["✓ SEO-optimized title", "✓ 13 tags", "✓ Price research"].map((pill) => (
          <span
            key={pill}
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(123,47,255,0.15)", border: "1px solid rgba(123,47,255,0.3)", color: "#CC99FF" }}
          >
            {pill}
          </span>
        ))}
      </div>
    </div>
  );
}

function NoCreditsState() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border-2 border-dashed
      border-[var(--border-default)] bg-[var(--bg-input)] p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full" style={{ background: "rgba(255,61,139,0.1)" }}>
        <svg className="h-8 w-8" style={{ color: "#FF3D8B" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">You have no credits</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--text-secondary)]">
        Purchase a credit pack on Etsy to generate listings.
      </p>
      <a
        href="https://www.etsy.com/shop/AmanCraftio"
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex items-center gap-2 rounded-lg bg-brand px-5 py-2.5 text-sm font-semibold text-white shadow-md
          transition hover:shadow-[0_0_30px_rgba(255,61,139,0.4)]"
      >
        Buy credits on Etsy →
      </a>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="space-y-4">
      {/* Title skeleton */}
      <div className="animate-pulse rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-sm">
        <div className="mb-4 h-3 w-24 rounded bg-[var(--bg-elevated)]" />
        <div className="h-4 w-full rounded bg-[var(--bg-elevated)]" />
        <div className="mt-2 h-4 w-2/3 rounded bg-[var(--bg-elevated)]" />
      </div>

      {/* Description skeleton */}
      <div className="animate-pulse rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-sm">
        <div className="mb-4 h-3 w-32 rounded bg-[var(--bg-elevated)]" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-[var(--bg-card-hover)]" />
          <div className="h-3 w-full rounded bg-[var(--bg-card-hover)]" />
          <div className="h-3 w-5/6 rounded bg-[var(--bg-card-hover)]" />
          <div className="h-3 w-full rounded bg-[var(--bg-card-hover)]" />
          <div className="h-3 w-2/3 rounded bg-[var(--bg-card-hover)]" />
        </div>
      </div>

      {/* Tags skeleton */}
      <div className="animate-pulse rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-sm">
        <div className="mb-4 h-3 w-20 rounded bg-[var(--bg-elevated)]" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-6 w-16 rounded-full bg-[var(--bg-card-hover)]" />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl p-12 text-center"
      style={{ background: "rgba(255,61,139,0.08)", border: "1px solid rgba(255,61,139,0.3)" }}
    >
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full" style={{ background: "rgba(255,61,139,0.15)" }}>
        <svg className="h-7 w-7 text-[#FF3D8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-[var(--text-primary)]">Couldn&apos;t generate a listing</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}

function MaterialAnalysisCard({ materials }: { materials: GeneratedListing["identifiedMaterials"] }) {
  if (!materials) return null;
  const { primary, secondary, finish, construction } = materials;
  if (!primary && !secondary && !finish && !construction) return null;

  return (
    <div
      className="rounded-[10px] px-4 py-3"
      style={{ background: "var(--bg-elevated)", border: "1px solid var(--border-default)" }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-muted)]">AI Detected</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {primary && (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(255,138,0,0.15)", border: "1px solid rgba(255,138,0,0.3)", color: "#FFB870" }}
          >
            ✦ {primary}
          </span>
        )}
        {secondary && (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "rgba(123,47,255,0.15)", border: "1px solid rgba(123,47,255,0.3)", color: "#CC99FF" }}
          >
            + {secondary}
          </span>
        )}
        {finish && (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            ◈ {finish}
          </span>
        )}
        {construction && (
          <span
            className="rounded-full px-3 py-1 text-xs font-medium"
            style={{ background: "var(--bg-secondary)", border: "1px solid var(--border-default)", color: "var(--text-secondary)" }}
          >
            ⚒ {construction}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs text-[var(--text-muted)]">
        Not accurate? Add details in the input field and regenerate.
      </p>
    </div>
  );
}

function PrimarySearchPhraseBox({ phrase }: { phrase?: string }) {
  if (!phrase) return null;

  return (
    <div
      className="flex items-center justify-between gap-3 rounded-lg px-4 py-2.5"
      style={{ background: "rgba(255,184,0,0.1)", border: "1px solid rgba(255,184,0,0.3)" }}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wide text-brand-orange">Primary Keyword</p>
        <p className="text-base font-bold text-[var(--text-primary)]">{phrase}</p>
      </div>
      <p className="shrink-0 text-xs text-[var(--text-muted)]">Appears 3× in description</p>
    </div>
  );
}

const SEO_TIPS = [
  {
    title: "Title",
    text: "Put your most important keyword FIRST in your title. Etsy weighs the beginning of titles more heavily in search ranking.",
  },
  {
    title: "Tags",
    text: "Use all 13 tags. Each tag is a separate search opportunity. Never leave tags empty.",
  },
  {
    title: "Description",
    text: "Your first 160 characters appear in Google search results. Make them count.",
  },
];

function SeoTipsSection() {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-5 shadow-sm">
      <button
        type="button"
        onClick={() => setExpanded((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 text-left"
      >
        <h3 className="gradient-text text-sm font-semibold uppercase tracking-wide">Quick SEO Tips</h3>
        <svg
          className={`h-4 w-4 shrink-0 text-[var(--text-secondary)] transition-transform ${expanded ? "rotate-180" : ""}`}
          viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {expanded && (
        <div className="mt-4 space-y-2">
          {SEO_TIPS.map((tip) => (
            <div
              key={tip.title}
              className="flex items-start gap-3 rounded-lg p-3"
              style={{ background: "var(--bg-elevated)" }}
            >
              <span className="text-lg">💡</span>
              <p className="text-sm leading-relaxed text-[var(--text-secondary)]">
                <span className="font-semibold text-[var(--text-primary)]">{tip.title}:</span> {tip.text}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function titleCounterInfo(length: number): { className: string; label: string } {
  if (length < 100) return { className: "text-[#FF3D8B]", label: "Too short" };
  if (length < 120) return { className: "text-[#FFB800]", label: "Good" };
  return { className: "text-[#22C55E]", label: "Optimal ✓" };
}

export default function ResultsPanel({ listing, isGenerating, error, onRegenerate, onFix, onClear, priceResult, isPriceLoading, credits }: ResultsPanelProps) {
  const [showToast, setShowToast] = useState(false);

  if (isGenerating) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!listing) return credits === 0 ? <NoCreditsState /> : <EmptyState />;

  const titleInfo = titleCounterInfo(listing.title.length);

  const handleCopyAll = async () => {
    const lines = [
      "TITLE:",
      listing.title,
      "",
      "DESCRIPTION:",
      listing.description,
      "",
      "TAGS:",
      listing.tags.join(", "),
    ];
    if (priceResult) {
      lines.push(
        "",
        `SUGGESTED PRICE: ${formatPrice(priceResult.suggestedPriceMin)} – ${formatPrice(priceResult.suggestedPriceMax)} (Average: ${formatPrice(priceResult.averagePrice)})`
      );
    }
    if (await copyToClipboard(lines.join("\n"))) {
      setShowToast(true);
      setTimeout(() => setShowToast(false), 2000);
    }
  };

  return (
    <div className="animate-fade-in space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-[var(--text-secondary)]">Your generated listing</p>
        <div className="flex items-center gap-2">
          {onRegenerate && (
            <button
              type="button"
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)]
                px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] shadow-sm transition hover:border-brand-pink hover:text-[var(--text-primary)]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Regenerate
            </button>
          )}
          {onClear && (
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)]
                px-3 py-1.5 text-xs font-medium text-[var(--text-secondary)] shadow-sm transition hover:border-[#FF3D8B] hover:text-[var(--text-primary)]"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Clear
            </button>
          )}
        </div>
      </div>

      <button
        type="button"
        onClick={handleCopyAll}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand
          px-4 py-2.5 text-sm font-semibold text-[var(--text-primary)] shadow-md
          transition hover:shadow-[0_0_30px_rgba(255,61,139,0.4)]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
        </svg>
        Copy complete listing
      </button>

      <MaterialAnalysisCard materials={listing.identifiedMaterials} />

      <PrimarySearchPhraseBox phrase={listing.primarySearchPhrase} />

      <Section title="Listing Title" copyText={listing.title} copyLabel="title">
        <p className="text-sm leading-relaxed text-[var(--text-primary)]">{listing.title}</p>
        <p className={`mt-2 text-xs font-semibold ${titleInfo.className}`}>
          {listing.title.length} / 140 characters · {titleInfo.label}
        </p>
      </Section>

      <Section title="Listing Description" copyText={listing.description} copyLabel="description">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[var(--text-secondary)]">
          {listing.description}
        </pre>
      </Section>

      <Section title="Suggested Tags" copyText={listing.tags.join(", ")} copyLabel="all tags">
        <div className="flex flex-wrap gap-2">
          {listing.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
        <p className="mt-3 text-xs text-[var(--text-muted)]">
          {listing.tags.length} / 13 tags · click a tag to copy it
        </p>
      </Section>

      {(isPriceLoading || priceResult) && (
        <PriceSection result={priceResult} isLoading={isPriceLoading} />
      )}

      <ListingHealthScore listing={listing} onFix={onFix} isGenerating={isGenerating} />

      <SeoTipsSection />

      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-in rounded-lg
          border border-[var(--border-default)] bg-[var(--bg-elevated)] px-4 py-2.5 text-sm font-medium text-[var(--text-primary)] shadow-lg">
          ✓ Copied!
        </div>
      )}
    </div>
  );
}
