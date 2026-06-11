import Link from "next/link";

type CtaButton = {
  label: string;
  href: string;
  variant?: "primary" | "secondary";
};

type CtaBannerProps = {
  heading: string;
  subtext?: string;
  buttons: CtaButton[];
};

export default function CtaBanner({ heading, subtext, buttons }: CtaBannerProps) {
  return (
    <div className="mx-auto mt-20 max-w-[1100px] rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] px-6 py-10 text-center sm:px-12 sm:py-14">
      <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">{heading}</h2>
      {subtext && (
        <p className="mx-auto mt-3 max-w-xl text-sm text-[var(--text-secondary)] sm:text-base">{subtext}</p>
      )}
      <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
        {buttons.map((btn) =>
          btn.variant === "secondary" ? (
            <Link
              key={btn.href}
              href={btn.href}
              className="w-full rounded-lg border border-[var(--border-default)] bg-transparent px-8 py-3.5 text-base
                font-medium text-[var(--text-primary)] transition hover:border-[var(--text-muted)] sm:w-auto"
            >
              {btn.label}
            </Link>
          ) : (
            <Link
              key={btn.href}
              href={btn.href}
              className="w-full rounded-lg bg-brand px-8 py-3.5 text-base font-semibold text-white shadow-md
                transition hover:shadow-[0_0_30px_rgba(255,61,139,0.4)] sm:w-auto"
            >
              {btn.label}
            </Link>
          )
        )}
      </div>
    </div>
  );
}
