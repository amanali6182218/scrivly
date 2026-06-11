import type { ReactNode } from "react";

type PageHeroProps = {
  label: string;
  heading: string;
  subtext?: ReactNode;
};

export default function PageHero({ label, heading, subtext }: PageHeroProps) {
  return (
    <div className="mx-auto max-w-[1100px] px-4 pb-8 pt-12 text-center sm:px-6 sm:pb-12 sm:pt-20">
      <p className="gradient-text text-xs font-semibold uppercase tracking-wide">{label}</p>
      <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-5xl">
        {heading}
      </h1>
      {subtext && (
        <p className="mx-auto mt-4 max-w-2xl text-sm text-[var(--text-secondary)] sm:text-base">{subtext}</p>
      )}
    </div>
  );
}
