import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CtaBanner from "@/components/CtaBanner";

export const metadata = {
  title: "How It Works — Scrivly",
  description: "From buying credits on Etsy to publishing a complete Etsy listing — see how Scrivly works step by step.",
};

const STEPS = [
  {
    number: "01",
    title: "Get your credit pack on Etsy",
    body: "Visit our Etsy shop and choose the credit pack that fits your needs. Starter (100 credits / $15), Pro (250 credits / $29), or Power (500 credits / $49). Purchase securely through Etsy's checkout. Your unique redeem code arrives in your Etsy messages within 1–2 minutes of purchase.",
  },
  {
    number: "02",
    title: "Sign up and redeem your code",
    body: "Go to scrivly.vercel.app and create your free account with just your email address. Confirm your email, then go to your dashboard. You will see the redeem code banner at the top — enter your unique code and click Activate Credits. Your credits are added to your account instantly.",
    note: "New accounts start with 0 credits — purchase a credit pack on Etsy to get started.",
  },
  {
    number: "03",
    title: "Upload your product photo",
    body: "Click the Photo to Listing tab in your dashboard. Upload any clear product photo — from your phone, camera, or computer. Scrivly reads the image with AI vision technology and identifies the product automatically. Add any extra details the photo cannot show (materials, size, scent). Click Generate Listing from Photo.",
    items: [
      "AI analyzes your photo (3–5 seconds)",
      "Category is suggested automatically",
      "Full listing is generated (8–12 seconds)",
      "Price research runs in parallel",
      "Health score calculated instantly",
    ],
  },
  {
    number: "04",
    title: "Paste into Etsy and publish",
    body: "Your complete listing appears in the results panel. Review the title, description, and tags. Check your price suggestion and health score. Click Copy Complete Listing to copy everything to your clipboard in one click. Open your Etsy listing form and paste. Or connect your Etsy shop and use Post to Etsy to fill everything automatically.",
  },
];

function StepRow({ step, reverse }) {
  return (
    <div className={`grid items-center gap-10 py-12 sm:py-16 lg:grid-cols-2 ${reverse ? "lg:[&>*:first-child]:order-2" : ""}`}>
      <div className="text-left">
        <span className="gradient-text text-4xl font-extrabold sm:text-5xl">{step.number}</span>
        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">{step.title}</h2>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-secondary)] sm:text-base">{step.body}</p>
        {step.items && (
          <ul className="mt-5 space-y-2">
            {step.items.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                <span className="mt-0.5" style={{ color: "#22C55E" }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        )}
        {step.note && (
          <div
            className="mt-5 rounded-xl p-4 text-sm"
            style={{ border: "1px solid rgba(255,184,0,0.4)", background: "rgba(255,184,0,0.06)", color: "var(--text-secondary)" }}
          >
            {step.note}
          </div>
        )}
      </div>

      <div
        className="flex min-h-[200px] items-center justify-center rounded-2xl border"
        style={{ borderColor: "var(--border-default)", background: "var(--bg-card)" }}
      >
        <span className="gradient-text text-7xl font-extrabold opacity-30 sm:text-8xl">{step.number}</span>
      </div>
    </div>
  );
}

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-20">
        <PageHero
          label="THE PROCESS"
          heading="From photo to published listing."
          subtext="Four steps. Thirty seconds. Complete Etsy listing ready to publish."
        />

        <div className="divide-y divide-[var(--border-subtle)]">
          {STEPS.map((step, i) => (
            <StepRow key={step.number} step={step} reverse={i % 2 === 1} />
          ))}
        </div>

        {/* Advanced features */}
        <div className="mt-20">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Two more powerful tools
          </h2>

          <div className="mt-10 grid gap-6 text-left sm:grid-cols-2">
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 sm:p-8">
              <h3 className="font-semibold text-[var(--text-primary)]">Spy and Improve</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Already listed? Paste any competitor URL into the Spy and Improve tab. Scrivly reads their
                listing, identifies weaknesses, and generates you a stronger version. Use it to optimize
                existing listings or research before entering a new category.
              </p>
            </div>
            <div className="rounded-2xl border border-[var(--border-default)] bg-[var(--bg-card)] p-6 sm:p-8">
              <h3 className="font-semibold text-[var(--text-primary)]">Fix Weak Areas</h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                Generated listing scores below 80? Click Fix weak areas and Scrivly automatically rewrites
                the specific sections that are underperforming — without regenerating the entire listing.
              </p>
            </div>
          </div>
        </div>

        {/* Video */}
        <div className="mt-20 text-center">
          <h2 className="text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            See it in action
          </h2>

          <div
            className="mx-auto mt-8 overflow-hidden rounded-lg shadow-md sm:rounded-2xl sm:shadow-[0_20px_60px_rgba(0,0,0,0.5)]"
            style={{ position: "relative", width: "100%", maxWidth: "860px" }}
          >
            <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
              <iframe
                src="https://www.youtube.com/embed/GywNKUjlgj0?rel=0&modestbranding=1"
                title="How Scrivly works"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
              />
            </div>
          </div>
        </div>

        <CtaBanner
          heading="Ready to try it yourself?"
          subtext="Credits from $15 · Never expire"
          buttons={[{ label: "Create free account", href: "/signup" }]}
        />
      </main>

      <Footer />
    </div>
  );
}
