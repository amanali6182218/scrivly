"use client";

import { useState } from "react";
import { MarketDemand, PriceResearchResult } from "@/lib/types";

interface PriceSuggesterProps {
  productName: string;
  category: string;
  onUsePrice: (price: number) => void;
}

const DEMAND_STYLES: Record<MarketDemand, { label: string; classes: string; dot: string }> = {
  low: { label: "Low demand", classes: "bg-stone-100 text-stone-600 ring-stone-200", dot: "bg-stone-400" },
  medium: { label: "Medium demand", classes: "bg-amber-100 text-amber-700 ring-amber-200", dot: "bg-amber-500" },
  high: { label: "High demand", classes: "bg-emerald-100 text-emerald-700 ring-emerald-200", dot: "bg-emerald-500" },
};

function formatPrice(value: number): string {
  return value % 1 === 0 ? `$${value}` : `$${value.toFixed(2)}`;
}

function PromptState() {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed
      border-amber-200 bg-white/60 p-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h.01M15 12h.01M9 16h.01M15 16h.01M3 8a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-stone-800">Add a product name first</h3>
      <p className="mt-1.5 max-w-sm text-sm text-stone-500">
        Enter a <span className="font-medium text-amber-700">Product Name</span> and{" "}
        <span className="font-medium text-amber-700">Category</span> in the form to research what
        similar Etsy listings are charging.
      </p>
    </div>
  );
}

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border
      border-amber-100 bg-white/70 py-16 text-center">
      <svg className="h-8 w-8 animate-spin text-amber-500" viewBox="0 0 24 24" fill="none">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
        />
      </svg>
      <p className="text-sm font-medium text-stone-600">Researching Etsy market prices…</p>
      <p className="max-w-xs text-xs text-stone-400">
        Searching the web for similar listings — this can take up to a minute.
      </p>
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex h-full flex-col items-center justify-center rounded-2xl border
      border-red-200 bg-red-50 p-12 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.008v.008H12v-.008zM21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 className="text-base font-semibold text-stone-800">Couldn&apos;t research prices</h3>
      <p className="mt-1.5 max-w-sm text-sm text-stone-600">{message}</p>
    </div>
  );
}

function ResultView({
  result,
  onUsePrice,
}: {
  result: PriceResearchResult;
  onUsePrice: (price: number) => void;
}) {
  const demand = DEMAND_STYLES[result.marketDemand];
  const [applied, setApplied] = useState(false);

  const handleUsePrice = () => {
    onUsePrice(result.averagePrice);
    setApplied(true);
    setTimeout(() => setApplied(false), 1800);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-100 bg-white p-6 text-center shadow-sm">
        <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Suggested price range</p>
        <p className="mt-2 text-3xl font-bold text-stone-900 sm:text-4xl">
          {formatPrice(result.suggestedPriceMin)} – {formatPrice(result.suggestedPriceMax)}
        </p>
        <p className="mt-1 text-sm text-stone-500">
          Average similar listing: <span className="font-semibold text-stone-700">{formatPrice(result.averagePrice)}</span>
        </p>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium ring-1 ring-inset ${demand.classes}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${demand.dot}`} />
            {demand.label}
          </span>
        </div>

        <button
          type="button"
          onClick={handleUsePrice}
          className="mt-5 inline-flex items-center gap-2 rounded-lg bg-gradient-to-r from-amber-500
            to-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-amber-500/20
            transition hover:from-amber-600 hover:to-orange-600"
        >
          {applied ? (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Price applied!
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-9c-1.11 0-2.08.402-2.599 1" />
              </svg>
              Use this price (${formatPrice(result.averagePrice).slice(1)})
            </>
          )}
        </button>
      </div>

      <div className="rounded-xl border border-amber-100 bg-white p-5 shadow-sm">
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wide text-amber-700">Pricing tips</h3>
        <ul className="space-y-2">
          {result.pricingTips.map((tip, i) => (
            <li key={i} className="flex gap-2 text-sm leading-relaxed text-stone-700">
              <span className="mt-0.5 text-amber-500">•</span>
              <span>{tip}</span>
            </li>
          ))}
        </ul>
      </div>

      <p className="text-center text-xs text-stone-400">
        Based on analysis of {result.competitorCount} similar Etsy listings
      </p>
    </div>
  );
}

export default function PriceSuggester({ productName, category, onUsePrice }: PriceSuggesterProps) {
  const [result, setResult] = useState<PriceResearchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canResearch = productName.trim().length > 0;

  const handleResearch = async () => {
    if (!canResearch) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await fetch("/api/price-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, category }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to research prices.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-amber-100 bg-white/80 p-6 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-stone-900">Smart Price Suggester</h2>
          <p className="mt-1 text-sm text-stone-500">
            We&apos;ll search the web for similar Etsy listings and recommend a competitive price
            range based on what&apos;s currently selling.
          </p>
        </div>

        <div className="space-y-3 rounded-lg border border-amber-100 bg-amber-50/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-amber-700">Researching for</p>
          <p className="text-sm text-stone-700">
            <span className="font-medium">Product:</span>{" "}
            {productName.trim() ? productName : <span className="italic text-stone-400">not set</span>}
          </p>
          <p className="text-sm text-stone-700">
            <span className="font-medium">Category:</span> {category}
          </p>
        </div>

        <button
          type="button"
          onClick={handleResearch}
          disabled={!canResearch || isLoading}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r
            from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md
            shadow-amber-500/20 transition hover:from-amber-600 hover:to-orange-600
            disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isLoading ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Researching…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3" />
              </svg>
              Research Prices
            </>
          )}
        </button>

        <p className="mt-4 rounded-lg border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs text-amber-800 sm:text-sm">
          <span className="font-semibold">Tip:</span> Results are AI-generated estimates based on a
          live web search — always sanity-check against listings you find yourself.
        </p>
      </div>

      <div>
        {!canResearch && !result && !isLoading && !error && <PromptState />}
        {canResearch && !result && !isLoading && !error && (
          <div className="flex h-full flex-col items-center justify-center rounded-2xl border border-dashed
            border-amber-200 bg-white/60 p-12 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <svg className="h-7 w-7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="11" cy="11" r="7" strokeLinecap="round" strokeLinejoin="round" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.3-4.3" />
              </svg>
            </div>
            <h3 className="text-base font-semibold text-stone-800">Ready to research</h3>
            <p className="mt-1.5 max-w-sm text-sm text-stone-500">
              Click <span className="font-medium text-amber-700">Research Prices</span> to see what
              similar Etsy listings are charging for products like yours.
            </p>
          </div>
        )}
        {isLoading && <LoadingState />}
        {error && <ErrorState message={error} />}
        {result && !isLoading && !error && <ResultView result={result} onUsePrice={onUsePrice} />}
      </div>
    </div>
  );
}
