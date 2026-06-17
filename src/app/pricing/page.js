import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CreditPackCard from "@/components/CreditPackCard";
import AuthCtaBanner from "@/components/AuthCtaBanner";

export const metadata = {
  title: "Pricing — Scrivly",
  description: "No subscriptions, no monthly fees. Buy Scrivly credits when you need them — they never expire.",
};

const PACKS = [
  {
    name: "Starter Pack",
    price: "$9",
    credits: "100",
    listings: "33 listings · or 6 with price research",
    buttonLabel: "Buy on Etsy →",
    buttonId: "pricing-starter-link",
    href: "https://www.etsy.com/listing/4520392297/starter-pack-etsy-listing-credits-ai-seo",
    checklist: [
      { label: "SEO title + description + 13 tags", included: true },
      { label: "Health score /100", included: true },
      { label: "Spy & Improve", included: true },
      { label: "Last 10 generations saved", included: true },
      { label: "Category auto-detection", included: true },
      { label: "Bulk CSV export (Pro+)", included: false },
      { label: "Priority support (Power only)", included: false },
    ],
  },
  {
    name: "Pro Pack",
    price: "$19",
    credits: "250",
    listings: "83 listings · or 16 with price research",
    popular: true,
    buttonLabel: "Buy on Etsy →",
    buttonId: "pricing-pro-link",
    href: "https://www.etsy.com/listing/4523284299/pro-pack-etsy-listing-credits-create",
    checklist: [
      { label: "Everything in Starter", included: true },
      { label: "Last 50 generations saved", included: true },
      { label: "Bulk CSV export", included: true },
      { label: "Priority support (Power only)", included: false },
    ],
  },
  {
    name: "Power Seller Pack",
    price: "$35",
    credits: "500",
    bonusBadge: "+50 bonus",
    listings: "183 listings · or 36 with price research",
    buttonLabel: "Buy on Etsy →",
    buttonId: "pricing-power-link",
    href: "https://www.etsy.com/listing/4523295888/power-seller-pack-etsy-listing-credits",
    checklist: [
      { label: "Everything in Pro", included: true },
      { label: "Unlimited generation history", included: true },
      { label: "Bulk CSV export", included: true },
      { label: "Price research: 10 credits (save 2 vs other plans)", included: true },
      { label: "Priority support (4hr response)", included: true },
      { label: "Power Seller badge", included: true },
    ],
    note: "Power Sellers get price research at 10 credits instead of 12 — our thanks for going big.",
  },
];

const CREDIT_USAGE_HEADERS = ["Action", "Starter/Pro", "Power Seller"];

const CREDIT_USAGE = [
  ["Basic generation", "3 credits", "3 credits"],
  ["Price research addon", "12 credits", "10 credits"],
  ["Full gen + research", "15 credits", "13 credits"],
  ["Spy & Improve", "6 credits", "6 credits"],
  ["Fix weak areas", "2 credits", "2 credits"],
  ["Category suggestion", "Free", "Free"],
];

const SELLER_PROFILES = [
  {
    name: "Occasional seller",
    desc: "List 1–5 new products per month",
    pack: "Starter Pack (100 credits)",
    duration: "Lasts approximately 4–6 months",
  },
  {
    name: "Active seller",
    desc: "List 10–20 new products per month",
    pack: "Pro Pack (250 credits)",
    duration: "Lasts approximately 3–4 months",
  },
  {
    name: "Power seller",
    desc: "List 30+ new products per month",
    pack: "Power Pack (500 credits)",
    duration: "Lasts approximately 3–4 months",
  },
];

const PRICING_FAQS = [
  {
    q: "Do credits expire?",
    a: "Never. Credits stay in your account permanently until used.",
  },
  {
    q: "Can I stack credits from multiple packs?",
    a: "Yes. Redeem multiple codes and credits add up on your account balance.",
  },
  {
    q: "What payment methods does Etsy accept?",
    a: "Etsy accepts all major credit cards, PayPal, Apple Pay, and Google Pay.",
  },
  {
    q: "Is there a free trial?",
    a: "Scrivly does not currently offer a free trial. Purchase any credit pack on Etsy from $9 to get started.",
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-20">
        <PageHero
          label="PRICING"
          heading="Pay once. Use forever."
          subtext="No subscriptions. No monthly fees. Buy credits when you need them. They never expire."
        />

        {/* New account banner */}
        <AuthCtaBanner
          heading="New to Scrivly?"
          subtext="Get started with our Starter Pack for just $9."
          buttonText="Get started"
          buttonHref="/signup"
        />

        {/* Pricing cards */}
        <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          {PACKS.map((pack) => (
            <CreditPackCard key={pack.name} pack={pack} />
          ))}
        </div>

        {/* What uses credits */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            What uses credits?
          </h2>

          <div className="mx-auto mt-10 max-w-3xl overflow-hidden rounded-2xl border" style={{ borderColor: "var(--border-default)" }}>
            <table className="w-full border-collapse text-left text-sm">
              <thead>
                <tr style={{ background: "var(--bg-card)" }}>
                  {CREDIT_USAGE_HEADERS.map((header) => (
                    <th key={header} className="px-4 py-3 font-semibold text-[var(--text-primary)]">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {CREDIT_USAGE.map(([action, standardCost, powerCost], i) => (
                  <tr key={action} style={{ borderTop: "1px solid var(--border-subtle)", background: i % 2 === 0 ? "transparent" : "var(--bg-card)" }}>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{action}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{standardCost}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{powerCost}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Credit calculator */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            How many credits do you need?
          </h2>

          <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
            {SELLER_PROFILES.map((profile) => (
              <div
                key={profile.name}
                className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6"
              >
                <h3 className="font-semibold text-[var(--text-primary)]">{profile.name}</h3>
                <p className="mt-2 text-sm text-[var(--text-secondary)]">{profile.desc}</p>
                <p className="gradient-text mt-4 text-sm font-semibold">Recommended: {profile.pack}</p>
                <p className="mt-1 text-xs text-[var(--text-muted)]">{profile.duration}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing FAQ */}
        <div className="mt-20 text-left">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Pricing questions
          </h2>
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {PRICING_FAQS.map((item) => (
              <div
                key={item.q}
                className="rounded-xl p-6"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
              >
                <p className="font-semibold text-[var(--text-primary)]">{item.q}</p>
                <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
