"use client";

const STEP_LABELS: Record<1 | 2 | 3, string> = {
  1: "Analysing your photos...",
  2: "Researching Etsy keywords...",
  3: "Generating your listing...",
};

interface GenerationLoaderProps {
  step: 1 | 2 | 3;
}

export default function GenerationLoader({ step }: GenerationLoaderProps) {
  return (
    <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-5 rounded-2xl border border-[var(--border-subtle)] bg-[var(--bg-secondary)] p-12 text-center">
      <div className="generation-spiral" aria-hidden="true" />
      <p className="gradient-text text-sm font-semibold">{STEP_LABELS[step]}</p>
      <span className="sr-only">Generating your listing, step {step} of 3</span>

      <style jsx>{`
        .generation-spiral {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          border: 3px solid transparent;
          border-top-color: var(--accent-orange);
          border-right-color: var(--accent-pink);
          border-bottom-color: var(--accent-purple);
          animation: generation-spin 1s linear infinite;
        }

        @keyframes generation-spin {
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
}
