import type { ReactNode } from "react";

type DocLayoutProps = {
  title: string;
  lastUpdated?: string;
  subtitle?: string;
  children: ReactNode;
};

export default function DocLayout({ title, lastUpdated, subtitle, children }: DocLayoutProps) {
  return (
    <div className="mx-auto max-w-[760px] px-4 py-12 sm:px-6 sm:py-20">
      {lastUpdated && <p className="text-xs text-[var(--text-muted)]">Last updated: {lastUpdated}</p>}
      <h1 className="mt-2 text-3xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">{subtitle}</p>
      )}
      <div className="mt-8 space-y-8">{children}</div>
    </div>
  );
}

export function DocSection({ heading, children }: { heading?: string; children: ReactNode }) {
  return (
    <section>
      {heading && (
        <h2 className="gradient-text mb-3 text-xl font-bold sm:text-2xl">{heading}</h2>
      )}
      <div className="space-y-3 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">
        {children}
      </div>
    </section>
  );
}
