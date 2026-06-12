import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CreditPackCard from "@/components/CreditPackCard";

export const metadata = {
  title: "Pricing — Scrivly",
  description: "No subscriptions, no monthly fees. Buy Scrivly credits when you need them — they never expire.",
};

const PACKS = [
  {
    name: "Starter Pack",
    price: "$15",
    credits: "100",
    listings: "~10 complete listings",
    perListing: "~$1.50 per listing",
    buttonLabel: "Buy on Etsy →",
    buttonId: "pricing-starter-link",
    href: "https://www.etsy.com/shop/AmanCraftio",
  },
  {
    name: "Pro Pack",
    price: "$29",
    credits: "250",
    listings: "~25 complete listings",
    perListing: "~$1.16 per listing",
    popular: true,
    buttonLabel: "Buy on Etsy →",
    buttonId: "pricing-pro-link",
    href: "https://www.etsy.com/shop/AmanCraftio",
  },
  {
    name: "Power Seller Pack",
    price: "$49",
    credits: "500",
    listings: "~50 complete listings",
    perListing: "~$0.98 per listing",
    buttonLabel: "Buy on Etsy →",
    buttonId: "pricing-power-link",
    href: "https://www.etsy.com/shop/AmanCraftio",
  },
];

const CREDIT_USAGE = [
  ["Full generation with price research (photo + listing + price + score)", "10 credits"],
  ["Basic generation (no price research)", "6 credits"],
  ["Price research standalone", "4 credits"],
  ["Spy and Improve", "8 credits"],
  ["Fix weak areas", "2 credits"],
  ["Category suggestion", "Free"],
  ["Post to Etsy", "Free"],
];

const SELLER_PROFILES = [
  {
    name: "Occasional seller",
    desc: "List 1–5 new products per month",
    pack: "Starter Pack (100 credits)",
    duration: "Lasts approximately 2–3 months",
  },
  {
    name: "Active seller",
    desc: "List 10–20 new products per month",
    pack: "Pro Pack (250 credits)",
    duration: "Lasts approximately 1–2 months",
  },
  {
    name: "Power seller",
    desc: "List 30+ new products per month",
    pack: "Power Pack (500 credits)",
    duration: "Lasts approximately 1–2 months",
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
    a: "Scrivly does not currently offer a free trial. Purchase any credit pack on Etsy from $15 to get started.",
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
        <div
          className="mx-auto flex max-w-3xl flex-col items-center gap-4 rounded-2xl p-6 text-center sm:flex-row sm:justify-between sm:text-left"
          style={{
            background: "linear-gradient(135deg, rgba(255,184,0,0.12) 0%, rgba(255,61,139,0.12) 50%, rgba(123,47,255,0.12) 100%)",
            border: "1px solid rgba(255,61,139,0.3)",
          }}
        >
          <p className="text-sm font-medium text-[var(--text-primary)] sm:text-base">
            New account? Get started with our Starter Pack for just $15.
          </p>
          <Link
            href="/signup"
            className="w-full shrink-0 rounded-lg bg-brand px-6 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:shadow-[0_0_30px_rgba(255,61,139,0.4)] sm:w-auto"
          >
            Get started
          </Link>
        </div>

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
                  <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Action</th>
                  <th className="px-4 py-3 font-semibold text-[var(--text-primary)]">Credits used</th>
                </tr>
              </thead>
              <tbody>
                {CREDIT_USAGE.map(([action, cost], i) => (
                  <tr key={action} style={{ borderTop: "1px solid var(--border-subtle)", background: i % 2 === 0 ? "transparent" : "var(--bg-card)" }}>
                    <td className="px-4 py-3 text-[var(--text-secondary)]">{action}</td>
                    <td className="px-4 py-3 font-medium text-[var(--text-primary)]">{cost}</td>
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
