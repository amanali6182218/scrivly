import Link from "next/link";

const FEATURES = [
  {
    icon: (
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Photo to Listing",
    description: "Snap a photo of any product and get a full Etsy listing with title, description, and 13 tags — written from what's in the image.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    title: "Spy & Improve",
    description: "Paste any Etsy listing URL. We find the weaknesses in their SEO and write you a stronger title, description, and tag set.",
  },
  {
    icon: (
      <svg className="h-6 w-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Listing Health Score",
    description: "Every listing gets a 100-point SEO score. See exactly what's weak — and fix it in one click.",
  },
];

const PRICING_PLANS = [
  {
    name: "Starter",
    price: "$9",
    credits: "100 credits",
    listings: "~33 full listings",
    blurb: "Perfect to start",
    featured: false,
  },
  {
    name: "Pro Pack",
    price: "$19",
    credits: "250 credits",
    listings: "~83 full listings",
    blurb: "Best value",
    featured: true,
  },
  {
    name: "Power Seller",
    price: "$35",
    credits: "500 credits",
    listings: "~166 full listings",
    blurb: "For active shops",
    featured: false,
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Nav */}
      <header
        className="sticky top-0 z-40 border-b border-[#1A1A1A]"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(12px)" }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <span className="flex items-center gap-2 text-base font-bold text-white sm:text-lg">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/logo.png" alt="Scrivly" style={{ height: "40px", width: "auto" }} />
            Scrivly
          </span>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="rounded-lg border border-[#333333] bg-transparent px-4 py-2 text-sm font-medium
                text-white transition hover:border-[#555555]"
            >
              Sign in
            </Link>
            <Link
              href="/signup"
              className="rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow-sm transition
                hover:shadow-[0_0_30px_rgba(255,61,139,0.4)]"
            >
              Get started free
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-4xl px-4 py-20 text-center sm:px-6 sm:py-28">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#222222] bg-[#111111] px-4 py-1.5 text-xs font-semibold text-[#A0A0A0]">
          <span className="h-1.5 w-1.5 rounded-full bg-brand-orange"></span>
          10 free credits when you sign up
        </div>

        <h1 className="mt-6 text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
          Write Etsy listings that{" "}
          <span className="gradient-text">actually sell.</span>
        </h1>

        <p className="mx-auto mt-6 max-w-2xl text-base text-[#A0A0A0] sm:text-lg">
          Upload a product photo and get a complete, SEO-optimized title, description, and tag set in
          seconds. Or paste a competitor&apos;s listing URL and we&apos;ll write you a better version.
        </p>

        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href="/signup"
            className="w-full rounded-lg bg-brand px-8 py-3.5 text-base font-semibold text-white shadow-md
              transition hover:shadow-[0_0_30px_rgba(255,61,139,0.4)] sm:w-auto"
          >
            Start for free — 10 credits
          </Link>
          <Link
            href="/login"
            className="w-full rounded-lg border border-[#333333] bg-transparent px-8 py-3.5 text-base
              font-medium text-white transition hover:border-[#555555] sm:w-auto"
          >
            Sign in to your account
          </Link>
        </div>

        {/* Social proof bar */}
        <div className="mt-10 border-y border-[#1A1A1A] bg-[#0D0D0D] px-4 py-2.5 text-xs font-medium text-[#A0A0A0] sm:text-sm">
          ⭐ Trusted by 500+ Etsy sellers · 10,000+ listings generated · Average listing score: 84/100
        </div>

        {/* Demo video */}
        <div className="py-20 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            See Scrivly in action
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#A0A0A0] sm:text-base">
            Watch how an Etsy seller turns a product photo into a complete, SEO-optimized listing in
            under 60 seconds
          </p>

          <div
            className="mx-auto mt-8 overflow-hidden rounded-lg shadow-md sm:rounded-2xl sm:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            style={{ position: "relative", width: "100%", maxWidth: "860px" }}
          >
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/GywNKUjlgj0?rel=0&modestbranding=1&color=white"
                title="Scrivly Demo — AI Listing Generator for Etsy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>

          <p className="mt-4 text-xs text-[#A0A0A0]">
            No signup required to watch · Takes less than 4 minutes to see everything
          </p>
        </div>

        {/* Feature grid */}
        <div className="mt-16 grid gap-6 text-left sm:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              className="animate-slide-up rounded-2xl border border-[#222222] bg-[#111111] p-6 shadow-sm
                transition hover:border-brand-pink"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-brand">
                {feature.icon}
              </div>
              <h3 className="mb-2 font-semibold text-white">{feature.title}</h3>
              <p className="text-sm text-[#A0A0A0]">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* See it in action */}
        <div className="mt-20">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            See what Scrivly generates in seconds
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-[#A0A0A0] sm:text-base">
            Upload a photo. Get a complete, ready-to-paste Etsy listing instantly.
          </p>

          <div className="mt-10 grid gap-6 rounded-2xl border border-[#222222] bg-[#111111] p-6 text-left shadow-sm sm:grid-cols-2 sm:p-8">
            {/* Left — example product photo */}
            <div className="flex flex-col gap-2">
              <div
                style={{
                  width: "100%",
                  aspectRatio: "1",
                  borderRadius: "12px",
                  overflow: "hidden",
                  boxShadow: "0 4px 24px rgba(0,0,0,0.4)",
                }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/ceramic-mug.jpg"
                  alt="Ceramic coffee mug product photo"
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                />
              </div>
              <p className="text-center text-xs italic text-[#555555]">
                ↑ Product photo uploaded by seller
              </p>
            </div>

            {/* Right — example output */}
            <div className="space-y-4">
              <div>
                <p className="gradient-text mb-1.5 text-xs font-semibold uppercase tracking-wide">Listing title</p>
                <p className="text-sm font-medium leading-relaxed text-white">
                  Handmade Ceramic Coffee Mug — Speckled Stoneware, Minimalist Design, Gift for Coffee Lover, Pottery Mug
                </p>
              </div>

              <div>
                <p className="gradient-text mb-1.5 text-xs font-semibold uppercase tracking-wide">Tags</p>
                <div className="flex flex-wrap gap-2">
                  {["ceramic mug", "handmade pottery", "coffee lover gift", "+ 9 more tags"].map((tag) => (
                    <span
                      key={tag}
                      className="rounded-full px-3 py-1 text-xs font-medium"
                      style={{
                        background: "rgba(123,47,255,0.15)",
                        border: "1px solid rgba(123,47,255,0.3)",
                        color: "#CC99FF",
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium"
                  style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.3)", color: "#22C55E" }}
                >
                  $28 – $45 · High demand ●
                </span>
                <span className="gradient-text inline-flex items-center gap-1.5 rounded-full border border-[#222222] px-3 py-1 text-xs font-semibold">
                  91 / 100 ✓
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div className="mt-20">
          <h2 className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl">
            Simple, transparent pricing
          </h2>

          <div className="mt-10 grid gap-6 text-left sm:grid-cols-3">
            {PRICING_PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl border p-6 shadow-sm ${
                  plan.featured ? "border-brand-pink shadow-[0_0_40px_rgba(255,61,139,0.2)]" : "border-[#222222] bg-[#111111]"
                }`}
                style={
                  plan.featured
                    ? { background: "linear-gradient(180deg, rgba(255,61,139,0.08) 0%, #111111 100%)" }
                    : undefined
                }
              >
                {plan.featured && (
                  <span className="absolute -top-3 right-6 rounded-full bg-brand px-3 py-1 text-xs font-semibold text-white shadow-sm">
                    Most Popular
                  </span>
                )}
                <h3 className="font-semibold text-white">{plan.name}</h3>
                <p className="mt-2 text-3xl font-extrabold text-white">
                  {plan.price} <span className="text-sm font-medium text-[#555555]">one-time</span>
                </p>
                <p className="mt-3 text-sm text-[#A0A0A0]">{plan.credits}</p>
                <p className="text-sm text-[#A0A0A0]">{plan.listings}</p>
                <p className="mt-2 gradient-text text-sm font-medium">{plan.blurb}</p>
                <a
                  href="#"
                  className={`mt-6 block w-full rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition ${
                    plan.featured
                      ? "bg-brand text-white shadow-md hover:shadow-[0_0_30px_rgba(255,61,139,0.4)]"
                      : "border border-[#333333] text-white hover:border-[#555555]"
                  }`}
                >
                  Buy on Etsy
                </a>
              </div>
            ))}
          </div>

          <p className="mx-auto mt-6 max-w-xl text-sm text-[#A0A0A0]">
            Each full generation (listing + price research + health score) uses 3 credits. Already
            have a code? Sign up free and redeem it.
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#1A1A1A] bg-[#0D0D0D]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-center text-xs text-[#A0A0A0] sm:flex-row sm:px-6 sm:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="Scrivly" style={{ height: "32px", width: "auto" }} />
          <p>© 2026 Scrivly · AI-powered Etsy listing agent</p>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-medium text-brand-pink hover:text-brand-orange">
              Sign in
            </Link>
            <Link href="/signup" className="font-medium text-brand-pink hover:text-brand-orange">
              Get started free
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
