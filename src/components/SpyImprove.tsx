"use client";

import { useState } from "react";
import { SpyResult } from "@/lib/types";
import ListingHealthScore from "@/components/ListingHealthScore";

const inputClasses =
  "w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 " +
  "placeholder:text-stone-400 shadow-sm transition focus:border-amber-400 focus:outline-none " +
  "focus:ring-2 focus:ring-amber-200";

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
      className="inline-flex shrink-0 items-center gap-1.5 rounded-md border border-stone-200 bg-white
        px-2.5 py-1 text-xs font-medium text-stone-600 shadow-sm transition hover:bg-stone-50
        hover:text-stone-800"
    >
      {copied ? (
        <>
          <svg className="h-3.5 w-3.5 text-emerald-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
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
      className={`rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset transition ${
        copied
          ? "bg-emerald-100 text-emerald-700 ring-emerald-200"
          : "bg-emerald-50 text-emerald-700 ring-emerald-200 hover:bg-emerald-100"
      }`}
    >
      {copied ? "✓ " : ""}{tag}
    </button>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-amber-100
      bg-white/70 py-20 text-center">
      <svg className="h-9 w-9 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
      </svg>
      <div>
        <p className="text-sm font-semibold text-stone-700">Analyzing competitor listing…</p>
        <p className="mt-1 text-xs text-stone-400">Fetching page, identifying gaps, generating improvements — this may take 30–60 seconds.</p>
      </div>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-red-200
      bg-red-50 px-8 py-12 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-500">
        <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <p className="text-sm font-semibold text-stone-800">Analysis failed</p>
      <p className="max-w-sm text-sm text-stone-600">{message}</p>
    </div>
  );
}

function ResultsView({ result }: { result: SpyResult }) {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* LEFT — competitor */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
            Their listing
          </span>
          {result.competitorPrice && (
            <span className="text-sm font-medium text-stone-500">{result.competitorPrice}</span>
          )}
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-5">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-amber-700">Title</p>
          <p className="text-sm leading-relaxed text-stone-800">{result.competitorTitle}</p>
          <p className="mt-2 text-xs text-stone-400">{result.competitorTitle.length}/140 characters</p>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/60 p-5">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-amber-700">What we found wrong</p>
          <ul className="space-y-3">
            {result.weaknesses.map((w, i) => (
              <li key={i} className="flex gap-2.5 text-sm leading-relaxed text-stone-700">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full
                  bg-amber-200 text-xs font-bold text-amber-800">
                  {i + 1}
                </span>
                {w}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-amber-100 bg-amber-50/40 px-5 py-3">
          <p className="text-xs text-stone-500">
            <span className="font-semibold text-amber-700">Est. monthly searches</span> for main keyword:{" "}
            <span className="font-medium text-stone-700">{result.estimatedMonthlySearches}</span>
          </p>
        </div>
      </div>

      {/* RIGHT — improved */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-inset ring-emerald-200">
            Your improved version
          </span>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
          <div className="mb-2 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Improved title</p>
            <CopyButton text={result.improvedTitle} />
          </div>
          <p className="text-sm leading-relaxed text-stone-800">{result.improvedTitle}</p>
          <p className="mt-2 text-xs text-stone-400">{result.improvedTitle.length}/140 characters</p>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">Improved description</p>
            <CopyButton text={result.improvedDescription} />
          </div>
          <div className="max-h-64 overflow-y-auto pr-1">
            {result.improvedDescription.split("\n").filter(Boolean).map((para, i) => (
              <p key={i} className="mb-3 text-sm leading-relaxed text-stone-700">{para}</p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-5">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
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
}

export default function SpyImprove({ onCreditsUsed, creditsAvailable = Infinity }: SpyImproveProps = {}) {
  const [url, setUrl] = useState("");
  const [result, setResult] = useState<SpyResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canAnalyze = url.trim().length > 0 && !isLoading && creditsAvailable >= 2;

  const handleAnalyze = async () => {
    if (!canAnalyze) return;

    setIsLoading(true);
    setResult(null);
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

      setResult(data as SpyResult);
      onCreditsUsed?.(2);
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
      <div className="rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="mb-5">
          <h2 className="text-lg font-semibold text-stone-900">Paste a competitor&apos;s listing URL</h2>
          <p className="mt-1 text-sm text-stone-500">
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
            disabled={!canAnalyze || creditsAvailable < 2}
            className="inline-flex shrink-0 items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500
              to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20
              transition hover:from-amber-600 hover:to-orange-600 disabled:cursor-not-allowed
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
          <p className="text-xs text-stone-400">
            Uses <span className="font-semibold text-amber-600">2 credits</span> — competitor analysis + improved listing
          </p>
        </div>
        {creditsAvailable < 2 && creditsAvailable !== Infinity && (
          <p className="mt-2 text-sm text-red-600">
            You need at least 2 credits to run a competitor analysis.
          </p>
        )}
      </div>

      {isLoading && <LoadingState />}
      {error && !isLoading && <ErrorState message={error} />}
      {result && !isLoading && !error && <ResultsView result={result} />}

      {!isLoading && !error && !result && (
        <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed
          border-amber-200 bg-white/50 py-16 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <p className="text-sm font-medium text-stone-700">Paste any Etsy listing URL above to get started</p>
          <p className="max-w-sm text-xs text-stone-400">
            Works on any public listing — your own, a competitor&apos;s, or one in a category you&apos;re entering.
          </p>
        </div>
      )}

      <p className="text-center text-xs text-stone-400">
        Analysis based on publicly visible listing data.
      </p>
    </div>
  );
}
