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
  priceResult?: PriceResearchResult | null;
  isPriceLoading?: boolean;
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
      <div className="flex items-center gap-2.5 rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-4 shadow-sm">
        <svg className="h-4 w-4 shrink-0 animate-spin text-brand-pink" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        <p className="text-sm text-[#A0A0A0]">Researching Etsy market prices…</p>
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
    <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5 shadow-sm">
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <p className="gradient-text text-xs font-semibold uppercase tracking-wide">Suggested Price</p>
          <p className="gradient-text mt-1 text-2xl font-bold sm:text-3xl">
            {formatPrice(result.suggestedPriceMin)} – {formatPrice(result.suggestedPriceMax)}
          </p>
          <p className="mt-0.5 text-sm text-[#A0A0A0]">
            Average: <span className="font-semibold text-white">{formatPrice(result.averagePrice)}</span>
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
          <li key={i} className="flex gap-2 text-sm leading-relaxed text-[#A0A0A0]">
            <span className="mt-0.5 shrink-0 text-brand-pink">•</span>
            {tip}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#1A1A1A] pt-3">
        <p className="text-xs text-[#555555]">
          Based on analysis of {result.competitorCount} similar Etsy listings
        </p>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1.5 rounded-md bg-brand
            px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm
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
      className="inline-flex items-center gap-1.5 rounded-md border border-[#222222] bg-[#1A1A1A]
        px-3 py-1.5 text-xs font-medium text-[#A0A0A0] shadow-sm transition hover:border-brand-pink hover:text-white"
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
    <div className="rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5 shadow-sm">
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
      border-[#333333] bg-[#0A0A0A] p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand">
        <svg className="h-8 w-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 5.714L21 12l-5.714 2.286L13 20l-2.286-5.714L5 12l5.714-2.286L13 4z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-white">Your AI-generated listing will appear here</h3>
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

function LoadingState() {
  return (
    <div className="space-y-4">
      {/* Title skeleton */}
      <div className="animate-pulse rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5 shadow-sm">
        <div className="mb-4 h-3 w-24 rounded bg-[#1A1A1A]" />
        <div className="h-4 w-full rounded bg-[#1A1A1A]" />
        <div className="mt-2 h-4 w-2/3 rounded bg-[#1A1A1A]" />
      </div>

      {/* Description skeleton */}
      <div className="animate-pulse rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5 shadow-sm">
        <div className="mb-4 h-3 w-32 rounded bg-[#1A1A1A]" />
        <div className="space-y-2">
          <div className="h-3 w-full rounded bg-[#161616]" />
          <div className="h-3 w-full rounded bg-[#161616]" />
          <div className="h-3 w-5/6 rounded bg-[#161616]" />
          <div className="h-3 w-full rounded bg-[#161616]" />
          <div className="h-3 w-2/3 rounded bg-[#161616]" />
        </div>
      </div>

      {/* Tags skeleton */}
      <div className="animate-pulse rounded-xl border border-[#1A1A1A] bg-[#0D0D0D] p-5 shadow-sm">
        <div className="mb-4 h-3 w-20 rounded bg-[#1A1A1A]" />
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="h-6 w-16 rounded-full bg-[#161616]" />
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
      <h3 className="text-base font-semibold text-white">Couldn&apos;t generate a listing</h3>
      <p className="mt-1.5 max-w-sm text-sm text-[#A0A0A0]">{message}</p>
    </div>
  );
}

function titleCounterInfo(length: number): { className: string; label: string } {
  if (length < 100) return { className: "text-[#FF3D8B]", label: "Too short" };
  if (length < 120) return { className: "text-[#FFB800]", label: "Good" };
  return { className: "text-[#22C55E]", label: "Optimal ✓" };
}

export default function ResultsPanel({ listing, isGenerating, error, onRegenerate, onFix, priceResult, isPriceLoading }: ResultsPanelProps) {
  const [showToast, setShowToast] = useState(false);

  if (isGenerating) return <LoadingState />;
  if (error) return <ErrorState message={error} />;
  if (!listing) return <EmptyState />;

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
        <p className="text-sm font-medium text-[#A0A0A0]">Your generated listing</p>
        {onRegenerate && (
          <button
            type="button"
            onClick={onRegenerate}
            className="inline-flex items-center gap-1.5 rounded-md border border-[#222222] bg-[#1A1A1A]
              px-3 py-1.5 text-xs font-medium text-[#A0A0A0] shadow-sm transition hover:border-brand-pink hover:text-white"
          >
            <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Regenerate
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={handleCopyAll}
        className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-brand
          px-4 py-2.5 text-sm font-semibold text-white shadow-md
          transition hover:shadow-[0_0_30px_rgba(255,61,139,0.4)]"
      >
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v12m0 0l-4-4m4 4l4-4M4 20h16" />
        </svg>
        Copy complete listing
      </button>

      <Section title="Listing Title" copyText={listing.title} copyLabel="title">
        <p className="text-sm leading-relaxed text-white">{listing.title}</p>
        <p className={`mt-2 text-xs font-semibold ${titleInfo.className}`}>
          {listing.title.length} / 140 characters · {titleInfo.label}
        </p>
      </Section>

      <Section title="Listing Description" copyText={listing.description} copyLabel="description">
        <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-[#A0A0A0]">
          {listing.description}
        </pre>
      </Section>

      <Section title="Suggested Tags" copyText={listing.tags.join(", ")} copyLabel="all tags">
        <div className="flex flex-wrap gap-2">
          {listing.tags.map((tag) => (
            <TagChip key={tag} tag={tag} />
          ))}
        </div>
        <p className="mt-3 text-xs text-[#555555]">
          {listing.tags.length} / 13 tags · click a tag to copy it
        </p>
      </Section>

      {(isPriceLoading || priceResult) && (
        <PriceSection result={priceResult} isLoading={isPriceLoading} />
      )}

      <ListingHealthScore listing={listing} onFix={onFix} isGenerating={isGenerating} />

      {showToast && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-fade-in rounded-lg
          border border-[#333333] bg-[#1A1A1A] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          ✓ Copied!
        </div>
      )}
    </div>
  );
}
