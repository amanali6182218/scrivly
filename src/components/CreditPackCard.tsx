export type CreditPackChecklistItem = {
  label: string;
  included: boolean;
};

export type CreditPack = {
  name: string;
  price: string;
  credits: string;
  listings: string;
  perListing?: string;
  bonusBadge?: string;
  checklist: CreditPackChecklistItem[];
  note?: string;
  popular?: boolean;
  buttonLabel: string;
  buttonId: string;
  href?: string;
};

export default function CreditPackCard({ pack }: { pack: CreditPack }) {
  return (
    <div
      className={`relative flex h-full flex-col rounded-2xl border p-6 shadow-sm sm:p-8 ${
        pack.popular ? "border-brand-pink" : "border-[var(--border-default)] bg-[var(--bg-card)]"
      }`}
      style={
        pack.popular
          ? {
              background: "linear-gradient(180deg, rgba(255,61,139,0.08) 0%, var(--bg-card) 100%)",
              boxShadow: "0 0 40px rgba(255,61,139,0.25)",
            }
          : undefined
      }
    >
      {pack.popular && (
        <span className="absolute -top-3 right-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow-sm">
          Most Popular
        </span>
      )}

      <h3 className="text-lg font-semibold text-[var(--text-primary)]">{pack.name}</h3>
      <p className="mt-3 text-4xl font-extrabold text-[var(--text-primary)]">{pack.price}</p>
      <div className="mt-3 flex items-center gap-2">
        <p className="text-sm font-medium text-[var(--text-primary)]">{pack.credits} credits</p>
        {pack.bonusBadge && (
          <span className="rounded-full bg-brand-orange px-2 py-0.5 text-xs font-bold text-white">
            {pack.bonusBadge}
          </span>
        )}
      </div>
      <p className="text-sm text-[var(--text-secondary)]">{pack.listings}</p>
      {pack.perListing && <p className="mt-1 text-xs text-[var(--text-muted)]">{pack.perListing}</p>}

      <ul className="mt-6 flex-1 space-y-2.5">
        {pack.checklist.map((item) => (
          <li key={item.label} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
            <span style={{ color: item.included ? "#22C55E" : "#FF3D8B" }}>{item.included ? "✓" : "✗"}</span>
            {item.label}
          </li>
        ))}
      </ul>

      <a
        href={pack.href || "#"}
        id={pack.buttonId}
        target="_blank"
        rel="noopener noreferrer"
        className={`mt-auto block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
          pack.popular
            ? "bg-brand text-white shadow-md hover:shadow-[0_0_30px_rgba(255,61,139,0.4)]"
            : "border border-[var(--border-default)] text-[var(--text-primary)] hover:border-[var(--text-muted)]"
        }`}
      >
        {pack.buttonLabel}
      </a>

      {pack.note && (
        <p className="mt-4 text-xs text-[var(--text-muted)]">{pack.note}</p>
      )}
    </div>
  );
}
