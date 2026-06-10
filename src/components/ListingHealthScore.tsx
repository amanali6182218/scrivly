"use client";

import { GeneratedListing } from "@/lib/types";
import { HealthScore, CategoryScore, healthColor, scoreListingHealth } from "@/lib/healthScore";

const RADIUS = 38;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS; // ≈ 238.76

const COLOR_STROKE: Record<"green" | "amber" | "red", string> = {
  green: "#10b981",
  amber: "#f59e0b",
  red:   "#ef4444",
};

const COLOR_LABEL: Record<"green" | "amber" | "red", string> = {
  green: "text-emerald-600",
  amber: "text-amber-600",
  red:   "text-red-500",
};

const COLOR_BAR: Record<"green" | "amber" | "red", string> = {
  green: "bg-emerald-500",
  amber: "bg-amber-400",
  red:   "bg-red-400",
};

const COLOR_BADGE_BG: Record<"green" | "amber" | "red", string> = {
  green: "bg-emerald-50 ring-emerald-200",
  amber: "bg-amber-50 ring-amber-200",
  red:   "bg-red-50 ring-red-200",
};

function ScoreArc({ total, color }: { total: number; color: "green" | "amber" | "red" }) {
  const arcLen = (total / 100) * CIRCUMFERENCE;
  const stroke = COLOR_STROKE[color];
  const labelClass = COLOR_LABEL[color];

  return (
    <div className="relative flex items-center justify-center">
      <svg viewBox="0 0 100 100" className="h-24 w-24" aria-hidden="true">
        {/* track */}
        <circle cx="50" cy="50" r={RADIUS} fill="none" stroke="#e2e8f0" strokeWidth="8" />
        {/* arc */}
        <circle
          cx="50" cy="50" r={RADIUS}
          fill="none"
          stroke={stroke}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={`${arcLen} ${CIRCUMFERENCE}`}
          transform="rotate(-90 50 50)"
        />
        {/* score text */}
        <text x="50" y="47" textAnchor="middle" fontSize="22" fontWeight="bold" fill={stroke}>
          {total}
        </text>
        <text x="50" y="62" textAnchor="middle" fontSize="11" fill="#94a3b8">
          / 100
        </text>
      </svg>
      <span className="sr-only">Health score: {total} out of 100</span>
    </div>
  );
}

function CategoryRow({ cat, color }: { cat: CategoryScore; color: "green" | "amber" | "red" }) {
  const isFull = cat.score === cat.maxScore;
  const pct = Math.round((cat.score / cat.maxScore) * 100);
  const barColor = isFull ? COLOR_BAR.green : COLOR_BAR[color];

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between gap-3 text-xs">
        <span className={`font-medium ${isFull ? "text-stone-700" : "text-stone-600"}`}>
          {cat.label}
        </span>
        <span className={`shrink-0 tabular-nums ${isFull ? "text-emerald-600 font-semibold" : "text-stone-500"}`}>
          {cat.score}/{cat.maxScore}
        </span>
      </div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-stone-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {cat.tip && (
        <p className="flex gap-1.5 text-xs leading-relaxed text-stone-500">
          <span className="mt-0.5 shrink-0 text-amber-500">→</span>
          {cat.tip}
        </p>
      )}
    </div>
  );
}

interface ListingHealthScoreProps {
  listing: GeneratedListing;
  onFix?: (weakAreaTips: string[]) => void;
  isGenerating?: boolean;
}

export default function ListingHealthScore({ listing, onFix, isGenerating }: ListingHealthScoreProps) {
  const score: HealthScore = scoreListingHealth(listing);
  const color = healthColor(score.total);
  const weakTips = score.categories
    .filter((c) => c.score < c.maxScore && c.tip)
    .map((c) => c.tip as string);

  const gradeLabel =
    color === "green" ? "Great listing" :
    color === "amber" ? "Good — room to improve" :
    "Needs work";

  return (
    <div className={`rounded-xl border bg-white p-5 shadow-sm ring-1 ring-inset ${COLOR_BADGE_BG[color]}`}>
      <div className="mb-4 flex items-center gap-4">
        <ScoreArc total={score.total} color={color} />
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-stone-500">Listing Health</p>
          <p className={`mt-0.5 text-base font-bold ${COLOR_LABEL[color]}`}>{gradeLabel}</p>
          <p className="mt-0.5 text-xs text-stone-400">
            {weakTips.length === 0
              ? "All categories at full marks — your listing is optimised!"
              : `${weakTips.length} area${weakTips.length !== 1 ? "s" : ""} below full marks`}
          </p>
        </div>
      </div>

      <div className="space-y-4 border-t border-stone-100 pt-4">
        {score.categories.map((cat) => (
          <CategoryRow key={cat.label} cat={cat} color={color} />
        ))}
      </div>

      {onFix && weakTips.length > 0 && (
        <button
          type="button"
          onClick={() => onFix(weakTips)}
          disabled={isGenerating}
          className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg
            border border-amber-200 bg-white px-4 py-2.5 text-sm font-semibold text-amber-700
            shadow-sm transition hover:bg-amber-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Fixing…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Fix {weakTips.length} weak area{weakTips.length !== 1 ? "s" : ""}
            </>
          )}
        </button>
      )}
    </div>
  );
}
