import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CreditPackCard from "@/components/CreditPackCard";

export const metadata = {
  title: "Buy Credits — Scrivly Etsy Shop",
  description: "Purchase Scrivly credit packs on Etsy. Starter $9, Pro $19, Power $35. Unique code delivered instantly.",
};

const STEPS = [
  {
    title: "Visit our Etsy Shop",
    body: "Click any credit pack below to go directly to our Etsy listing.",
  },
  {
    title: "Complete your purchase",
    body: "Buy securely through Etsy. You will receive a unique redeem code via Etsy message within 1–2 minutes.",
  },
  {
    title: "Redeem and start",
    body: "Go to your Scrivly dashboard, enter your code, and credits are added instantly. Start generating.",
  },
];

const PACKS = [
  {
    name: "Starter Pack",
    price: "$9",
    credits: "100",
    listings: "~33 complete listings",
    perListing: "~$0.27 per listing",
    buttonLabel: "Buy Starter on Etsy →",
    buttonId: "etsy-starter-link",
    href: "https://www.etsy.com/shop/AmanCraftio",
  },
  {
    name: "Pro Pack",
    price: "$19",
    credits: "250",
    listings: "~83 complete listings",
    perListing: "~$0.23 per listing",
    popular: true,
    buttonLabel: "Buy Pro Pack on Etsy →",
    buttonId: "etsy-pro-link",
    href: "https://www.etsy.com/shop/AmanCraftio",
  },
  {
    name: "Power Seller Pack",
    price: "$35",
    credits: "500",
    listings: "~166 complete listings",
    perListing: "~$0.21 per listing",
    buttonLabel: "Buy Power Pack on Etsy →",
    buttonId: "etsy-power-link",
    href: "https://www.etsy.com/shop/AmanCraftio",
  },
];

const BUYING_FAQS = [
  {
    q: "Can I buy multiple packs?",
    a: "Yes. Each pack gives a separate code. Redeem each one in your dashboard to stack credits on your account.",
  },
  {
    q: "What if I don't receive my code?",
    a: "Check your Etsy messages inbox. If not received within 5 minutes, message us on Etsy and we will resolve it immediately.",
  },
  {
    q: "Can I get a refund?",
    a: "If you have any issue, message us on Etsy before leaving a review and we will make it right.",
  },
];

export default function EtsyShopPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-20">
        <PageHero
          label="BUY CREDITS"
          heading="Get Scrivly Credits on Etsy"
          subtext="Purchase a credit pack on Etsy, receive your unique code instantly, and start generating listings in minutes."
        />

        {/* How to buy */}
        <div className="grid gap-6 sm:grid-cols-3">
          {STEPS.map((step, i) => (
            <div
              key={step.title}
              className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6"
            >
              <span className="gradient-text text-2xl font-extrabold">{`0${i + 1}`}</span>
              <h3 className="mt-3 font-semibold text-[var(--text-primary)]">{step.title}</h3>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{step.body}</p>
            </div>
          ))}
        </div>

        {/* Credit packs */}
        <div className="mt-20 grid gap-6 text-left sm:grid-cols-3">
          {PACKS.map((pack) => (
            <CreditPackCard key={pack.name} pack={pack} />
          ))}
        </div>

        {/* Delivery note */}
        <div
          className="mx-auto mt-10 max-w-3xl rounded-2xl p-6 text-sm sm:p-8"
          style={{ border: "1px solid rgba(255,184,0,0.4)", background: "rgba(255,184,0,0.06)", color: "var(--text-secondary)" }}
        >
          <p className="font-semibold text-[var(--text-primary)]">How credit delivery works:</p>
          <p className="mt-2 leading-relaxed">
            After purchasing on Etsy, your unique redeem code arrives via Etsy message within 1–2 minutes.
            Each code is unique and single-use — it cannot be shared or reused. Credits never expire.
          </p>
        </div>

        {/* Important note */}
        <div
          className="mx-auto mt-6 max-w-3xl rounded-2xl p-6 text-sm sm:p-8"
          style={{ border: "1px solid var(--border-default)", background: "var(--bg-card)", color: "var(--text-secondary)" }}
        >
          <p className="font-semibold text-[var(--text-primary)]">Important:</p>
          <p className="mt-2 leading-relaxed">
            Each generation uses 3 credits and includes: title, description, 13 tags, and health
            score. Add price research for 2 more credits (5 total).
          </p>
        </div>

        {/* Buying FAQ */}
        <div className="mt-20 text-left">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Questions about buying
          </h2>
          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {BUYING_FAQS.map((item) => (
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
