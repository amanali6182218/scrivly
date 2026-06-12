"use client";

import { useState } from "react";
import { SpyResult } from "@/lib/types";
import ListingHealthScore from "@/components/ListingHealthScore";

const inputClasses =
  "w-full rounded-lg border border-[var(--border-default)] bg-[var(--bg-input)] px-4 py-2.5 text-sm text-[var(--text-primary)] " +
  "placeholder:text-[var(--text-muted)] shadow-sm transition focus:border-brand-pink focus:outline-none " +
  "focus:ring-2 focus:ring-[rgba(255,61,139,0.15)]";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard unavailable */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-[var(--border-default)] bg-[var(--bg-elevated)]
        px-2.5 py-1 text-xs font-medium text-[var(--text-secondary)] shadow-sm transition hover:border-brand-pink
        hover:text-[var(--text-primary)]"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-[#22C55E]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="9" y="9" width="13" height="13" rx="2" strokeLinecap="round" strokeLinejoin="round" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
          </svg>
          Copy
        </>
      )}
    </button>
  );
}

function TagChip({ tag }: { tag: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(tag);
      setCopied(true);
      setTimeout(() => setCopied(false), 1200);
    } catch {
      /* clipboard unavailable */
    }
  };
  return (
    <button
      type="button"
      onClick={copy}
      title="Click to copy"
      className="rounded-full px-3 py-1 text-xs font-medium transition"
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
      {copied ? "✓ " : ""}{tag}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-[var(--border-default)]
      bg-[var(--bg-card)] py-20 text-center">
      <svg className="h-9 w-9 animate-spin text-brand-pink" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <div>
        <p className="text-sm font-semibold text-[var(--text-primary)]">Analyzing competitor listing…</p>
        <p className="mt-1 text-xs text-[var(--text-secondary)]">Fetching page, identifying gaps, generating improvements — this may take 30–60 seconds.</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl px-8 py-12 text-center"
      style={{ background: "rgba(255,61,139,0.08)", border: "1px solid rgba(255,61,139,0.3)" }}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full" style={{ background: "rgba(255,61,139,0.15)" }}>
        <svg className="h-6 w-6 text-[#FF3D8B]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-[var(--text-primary)]">Analysis failed</p>
      <p className="max-w-sm text-sm text-[var(--text-secondary)]">{message}</p>
    </div>
  );
}

function ResultsView({ result, onClear }: { result: SpyResult; onClear?: () => void }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT — competitor */}
      <div className="space-y-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center rounded-full border border-[var(--border-default)] bg-[var(--bg-card)] px-3 py-1 text-xs font-semibold text-[var(--text-secondary)]">
              Their listing
            </span>
            {result.competitorPrice && (
              <span className="text-sm font-medium text-[var(--text-secondary)]">{result.competitorPrice}</span>
            )}
          </div>
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

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">Title</p>
          <p className="text-sm leading-relaxed text-[var(--text-primary)]">{result.competitorTitle}</p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{result.competitorTitle.length}/140 characters</p>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-[var(--text-secondary)]">What we found wrong</p>
          <ul className="space-y-3">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                  bg-[var(--bg-elevated)] text-xs font-bold text-[var(--text-primary)]">
                  {i + 1}
                </span>
                {w}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] px-5 py-3">
          <p className="text-xs text-[var(--text-secondary)]">
            <span className="gradient-text font-semibold">Est. monthly searches</span> for main keyword:{" "}
            <span className="font-medium text-[var(--text-primary)]">{result.estimatedMonthlySearches}</span>
          </p>
        </div>
      </div>

      {/* RIGHT — improved */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
            style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22C55E" }}
          >
            Your improved version
          </span>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="gradient-text text-xs font-semibold uppercase tracking-wide">Improved title</p>
            <CopyButton text={result.improvedTitle} />
          </div>
          <p className="text-sm leading-relaxed text-[var(--text-primary)]">{result.improvedTitle}</p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{result.improvedTitle.length}/140 characters</p>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="gradient-text text-xs font-semibold uppercase tracking-wide">Improved description</p>
            <CopyButton text={result.improvedDescription} />
          </div>
          <div className="max-h-64 overflow-y-auto pr-1">
            {result.improvedDescription.split("\n").filter(Boolean).map((para, i) => (
              <p key={i} className="mb-3 text-sm leading-relaxed text-[var(--text-secondary)]">{para}</p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-[var(--border-default)] bg-[var(--bg-secondary)] p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="gradient-text text-xs font-semibold uppercase tracking-wide">
              Optimised tags ({result.improvedTags.length})
            </p>
            <CopyButton text={result.improvedTags.join(", ")} />
          </div>
          <div className="flex flex-wrap gap-2">
            {result.improvedTags.map((tag) => (
              <TagChip key={tag} tag={tag} />
            ))}
          </div>
        </div>

        <ListingHealthScore
          listing={{
            title: result.improvedTitle,
            description: result.improvedDescription,
            tags: result.improvedTags,
          }}
        />
      </div>
    </div>
  );
}

interface SpyImproveProps {
  onCreditsUsed?: (amount: number) => void;
  creditsAvailable?: number;
  result?: SpyResult | null;
  onResultChange?: (result: SpyResult | null) => void;
}

export default function SpyImprove({ onCreditsUsed, creditsAvailable = Infinity, result = null, onResultChange }: SpyImproveProps = {}) {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = url.trim().length > 0 && !isLoading && creditsAvailable >= 4;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setIsLoading(true);
    onResultChange?.(null);
    setError(null);

    try {
      const response = await fetch("/api/spy-listing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to analyze listing.");
      }

      onResultChange?.(data as SpyResult);
      onCreditsUsed?.(4);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleAnalyze();
  };

  return (
    <div className="space-y-8">
      {/* URL input card */}
      <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-5 shadow-sm sm:p-8">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-[var(--text-primary)]">Paste a competitor&apos;s listing URL</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            We&apos;ll fetch the listing, find what&apos;s weak, and write a better version for you to use.
          </p>
        </div>

        <div className="flex gap-3">
          <input
            type="url"
            placeholder="https://www.etsy.com/listing/123456789/product-name"
            className={`${inputClasses} flex-1`}
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={!canAnalyze || creditsAvailable < 4}
            title={creditsAvailable === 0 ? "No credits remaining. Buy more on Etsy." : undefined}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-brand
              px-5 py-2.5 text-sm font-bold text-[var(--text-primary)] shadow-md transition-all duration-200 ease-in-out
              hover:shadow-[0_0_40px_rgba(255,61,139,0.35)] disabled:cursor-not-allowed
              disabled:opacity-60"
          >
            {isLoading ? (
              <>
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing…
              </>
            ) : (
              <>
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
                Spy &amp; Improve
              </>
            )}
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-[var(--text-secondary)]">
            Uses <span className="font-semibold text-brand-orange">4 credits</span> — competitor analysis + improved listing
          </p>
        </div>
        {creditsAvailable < 4 && creditsAvailable !== Infinity && (
          <p className="mt-2 text-sm text-[#FF3D8B]">
            You need at least 4 credits to run a competitor analysis.
          </p>
        )}
      </div>

      {isLoading && <LoadingState />}
      {error && !isLoading && <ErrorState message={error} />}
      {result && !isLoading && !error && <ResultsView result={result} onClear={() => onResultChange?.(null)} />}

      {!isLoading && !error && !result && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed
          border-[var(--border-default)] bg-[var(--bg-input)] py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand">
            <svg className="h-7 w-7 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-[var(--text-primary)]">Paste any Etsy listing URL above to get started</p>
          <p className="max-w-sm text-xs text-[var(--text-muted)]">
            Works on any public listing — your own, a competitor&apos;s, or one in a category you&apos;re entering.
          </p>
        </div>
      )}

      <p className="text-center text-xs text-[var(--text-muted)]">
        Analysis based on publicly visible listing data.
      </p>
    </div>
  );
}
