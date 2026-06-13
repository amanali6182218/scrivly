import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import AuthCtaBanner from "@/components/AuthCtaBanner";

export const metadata = {
  title: "Features — Scrivly",
  description: "Photo to listing, smart price research, listing health score, spy and improve, and more — every tool an Etsy seller needs.",
};

const ICONS = {
  camera: (
    <svg className="h-6 w-6 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  chart: (
    <svg className="h-6 w-6 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  star: (
    <svg className="h-6 w-6 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.196-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118L2.078 10.1c-.783-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  search: (
    <svg className="h-6 w-6 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
    </svg>
  ),
  grid: (
    <svg className="h-6 w-6 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  upload: (
    <svg className="h-6 w-6 text-[var(--text-primary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1M12 12V3m0 0L8 7m4-4l4 4" />
    </svg>
  ),
};

function IconBadge({ icon }) {
  return (
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand">
      {ICONS[icon]}
    </div>
  );
}

function FeatureRow({ icon, heading, subheading, body, items, reverse, visual, note }) {
  return (
    <div className={`grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <div className="text-left">
        <IconBadge icon={icon} />
        <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">{heading}</h2>
        <p className="gradient-text mt-1 text-sm font-semibold sm:text-base">{subheading}</p>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">{body}</p>
        {items && (
          <ul className="mt-5 space-y-2">
            {items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="mt-0.5" style={{ color: "#22C55E" }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        )}
        {note && (
          <div
            className="mt-5 rounded-xl p-4 text-sm"
            style={{ border: "1px solid rgba(255,184,0,0.4)", background: "rgba(255,184,0,0.06)", color: "var(--text-secondary)" }}
          >
            {note}
          </div>
        )}
      </div>

      {visual ? (
        visual
      ) : (
        <div
          className="flex min-h-[220px] items-center justify-center rounded-2xl border p-8"
          style={{ borderColor: "var(--border-default)", background: "var(--bg-card)" }}
        >
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand opacity-80">
            {ICONS[icon]}
          </div>
        </div>
      )}
    </div>
  );
}

const COMPARISON_ROWS = [
  ["Photo analysis", "✓", "✗", "✗", "Some"],
  ["Etsy-specific output", "✓", "✗", "✗", "Some"],
  ["Price research", "✓", "✗", "✗", "Some"],
  ["Health score", "✓", "✗", "✗", "✗"],
  ["Competitor spy", "✓", "✗", "✗", "✗"],
  ["Post to Etsy", "✓", "✗", "✗", "Some"],
  ["No monthly fee", "✓", "✗", "✓", "✗"],
  ["30 second generation", "✓", "✗", "✗", "Some"],
];

function ComparisonCell({ value }) {
  if (value === "✓") return <span style={{ color: "#22C55E" }}>✓</span>;
  if (value === "✗") return <span style={{ color: "var(--text-muted)" }}>✗</span>;
  return <span style={{ color: "var(--text-secondary)" }}>{value}</span>;
}

export default function FeaturesPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-20">
        <PageHero
          label="WHAT SCRIVLY CAN DO"
          heading="Every tool an Etsy seller needs."
          subtext="One platform. Six powerful features. Everything from photo to published listing."
        />

        <div className="divide-y divide-[var(--border-subtle)]">
          <FeatureRow
            icon="camera"
            heading="Photo to Listing"
            subheading="Upload once. Get everything."
            body="Take any product photo — straight from your phone or camera. Scrivly's AI reads the image with vision technology, identifying materials, colors, style, and the likely buyer. In under 30 seconds you have a complete, ready-to-paste Etsy listing."
            items={["SEO title up to 140 characters", "Full description 400–600 words", "All 13 Etsy tags"]}
            visual={
              <div className="rounded-2xl border p-6 text-left" style={{ borderColor: "var(--border-default)", background: "var(--bg-card)" }}>
                <p className="gradient-text text-xs font-semibold uppercase tracking-wide">Listing title</p>
                <p className="mt-1.5 text-sm font-medium text-[var(--text-primary)]">
                  Handmade Ceramic Coffee Mug — Speckled Stoneware, Minimalist Gift for Coffee Lovers
                </p>
                <p className="mt-4 text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--accent-pink)" }}>
                  Listing description
                </p>
                <p className="mt-1.5 text-sm leading-relaxed text-[var(--text-secondary)]">
                  This handmade ceramic coffee mug is crafted from speckled stoneware clay, fired to a smooth
                  matte finish...
                </p>
                <p className="gradient-text mt-4 text-xs font-semibold uppercase tracking-wide">Tags</p>
                <div className="mt-1.5 flex flex-wrap gap-2">
                  {["ceramic mug", "handmade pottery", "+ 11 more"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{ background: "rgba(123,47,255,0.15)", border: "1px solid rgba(123,47,255,0.3)", color: "#CC99FF" }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            }
          />

          <FeatureRow
            icon="chart"
            heading="Smart Price Research"
            subheading="Know exactly what to charge."
            body="Scrivly searches live Etsy listings for similar products and returns a suggested price range, average market price, demand level, and three specific pricing tips for your product type. No more guessing. No more undercharging."
            items={[
              "Suggested price range (min–max)",
              "Market demand indicator (low/medium/high)",
              "3 competitor pricing insights",
              "Analysis based on real Etsy listings",
            ]}
            reverse
          />

          <FeatureRow
            icon="star"
            heading="Listing Health Score"
            subheading="Score 91/100 before you publish."
            body="Every generated listing receives a health score out of 100 based on Etsy's known ranking factors. See exactly which areas are strong and which need improvement. One click fixes all weak areas automatically."
            items={[
              "Title length (120–140 chars) — 20 pts",
              "Keyword in first 40 characters — 20 pts",
              "Description length (400–600 words) — 20 pts",
              "All 13 tags filled — 20 pts",
              "Tag variety (1, 2 and 3-word mix) — 20 pts",
            ]}
          />

          <FeatureRow
            icon="search"
            heading="Spy and Improve"
            subheading="Beat any competitor listing."
            body="Paste any competitor's Etsy listing URL. Scrivly analyzes their title, description, and tags, identifies exactly what is weak, and generates you a stronger version that ranks better in Etsy search. The most powerful research tool for active Etsy sellers."
            items={["Their title keyword structure", "Gaps in their description", "Missing or weak tags", "Price positioning"]}
            reverse
          />

          <FeatureRow
            icon="grid"
            heading="Auto Category Detection"
            subheading="Right category. Every time."
            body="Upload your product photo and Scrivly automatically suggests the most appropriate Etsy category from the full official category list. Three suggestions ranked by confidence, with the reasoning shown. Auto-selects the best match so your listing is in the right place from the start."
          />

          <FeatureRow
            icon="upload"
            heading="Post Directly to Etsy"
            subheading="From Scrivly to Etsy in one click."
            body="Connect your Etsy shop and post your generated listing as a draft directly from Scrivly. No copy-pasting. No switching tabs. The title, description, tags, and price are all filled in automatically. You review the draft on Etsy, add your photos, and publish."
            note="Requires Etsy shop connection. Available to all Scrivly users."
            reverse
          />
        </div>

        {/* Comparison table */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Scrivly vs the alternatives
          </h2>

          <div className="mt-10 overflow-x-auto rounded-2xl border" style={{ borderColor: "var(--border-default)" }}>
            <table className="w-full min-w-[640px] border-collapse text-left text-sm">
              <thead>
                <tr style={{ background: "var(--bg-card)" }}>
                  <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Feature</th>
                  <th className="gradient-text px-4 py-3 font-semibold">Scrivly</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">ChatGPT</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Manual writing</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-secondary)]">Other tools</th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON_ROWS.map((row, i) => (
                  <tr key={row[0]} style={{ borderTop: "1px solid var(--border-subtle)", background: i % 2 === 0 ? "transparent" : "var(--bg-card)" }}>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{row[0]}</td>
                    {row.slice(1).map((cell, j) => (
                      <td key={j} className="px-4 py-3">
                        <ComparisonCell value={cell} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <AuthCtaBanner
          heading="Ready to try every feature?"
          buttonText="Get started"
          buttonHref="/signup"
        />
      </main>

      <Footer />
    </div>
  );
}
