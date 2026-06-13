import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import AuthCtaBanner from "@/components/AuthCtaBanner";

export const metadata = {
  title: "Demo — Scrivly",
  description: "Watch a complete walkthrough of Scrivly — from signup to a published Etsy listing — in under 4 minutes.",
};

const STEPS = [
  {
    time: "0:00",
    title: "Landing page",
    body: "Scrivly's landing page — where new users discover the tool and sign up for free.",
  },
  {
    time: "0:15",
    title: "Sign up",
    body: "Creating an account takes 30 seconds. Enter your email and password, confirm your email, and you are in.",
  },
  {
    time: "0:30",
    title: "Dashboard",
    body: "The dashboard is where everything happens. Your credit balance, the tool tabs, and the redeem code banner are all visible at a glance.",
  },
  {
    time: "0:45",
    title: "Redeeming a code",
    body: "After purchasing on Etsy, enter your unique code in the redeem banner. Credits are added to your account instantly.",
  },
  {
    time: "1:00",
    title: "Uploading a photo",
    body: "Upload any product photo from your device. The AI automatically suggests the right Etsy category based on what it sees.",
  },
  {
    time: "1:30",
    title: "Generating a listing",
    body: "Click Generate Listing from Photo. The AI analyzes your photo and writes a complete listing in under 30 seconds.",
  },
  {
    time: "2:15",
    title: "Reviewing results",
    body: "Your listing, price research, and health score all appear together. Review each section and copy with one click.",
  },
  {
    time: "3:05",
    title: "Spy and Improve",
    body: "Paste any competitor listing URL to get a stronger version written automatically.",
  },
];

const HIGHLIGHTS = [
  { value: "30 seconds", label: "Generation time" },
  { value: "91/100", label: "Average health score" },
  { value: "13 tags", label: "Auto-generated every time" },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-20">
        <PageHero
          label="LIVE DEMO"
          heading="See Scrivly in action."
          subtext="Watch a complete walkthrough — from signup to published listing — in under 4 minutes."
        />

        {/* Video */}
        <div
          className="mx-auto overflow-hidden rounded-2xl"
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "960px",
            border: "1px solid rgba(255,61,139,0.2)",
            boxShadow: "0 0 60px rgba(255,61,139,0.2), 0 0 120px rgba(123,47,255,0.1)",
          }}
        >
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <iframe
              src="https://www.youtube.com/embed/GywNKUjlgj0?rel=0&modestbranding=1"
              title="Scrivly Demo — Full Walkthrough"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
            />
          </div>
        </div>

        <AuthCtaBanner
          heading="Ready to try it yourself?"
          buttonText="Get started"
          buttonHref="/signup"
        />

        {/* Step by step breakdown */}
        <div className="mt-20 text-left">
          <h2 className="text-center text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
            Step by step breakdown
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--text-secondary)] sm:text-base">
            Everything shown in the video, explained in detail.
          </p>

          <div className="mx-auto mt-10 max-w-3xl space-y-4">
            {STEPS.map((step) => (
              <div
                key={step.time}
                className="flex flex-col gap-2 rounded-xl p-5 sm:flex-row sm:items-start sm:gap-5"
                style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
              >
                <span className="gradient-text shrink-0 text-sm font-bold sm:w-16">{step.time}</span>
                <div>
                  <p className="font-semibold text-[var(--text-primary)]">{step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--text-secondary)]">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlights */}
        <div className="mx-auto mt-20 grid max-w-xl grid-cols-3 gap-6 text-center">
          {HIGHLIGHTS.map((h) => (
            <div key={h.label}>
              <p className="gradient-text text-3xl font-extrabold sm:text-4xl">{h.value}</p>
              <p className="mt-1 text-xs text-[var(--text-secondary)] sm:text-sm">{h.label}</p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <AuthCtaBanner
          heading="Try it yourself — start generating today"
          buttonText="Get started"
          buttonHref="/signup"
          secondaryButtonText="Buy credits on Etsy"
          secondaryButtonHref="https://www.etsy.com/shop/AmanCraftio"
        />
      </main>

      <Footer />
    </div>
  );
}
