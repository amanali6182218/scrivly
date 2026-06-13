import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { TwitterIcon, InstagramIcon, FacebookIcon, YouTubeIcon, TikTokIcon } from "@/components/SocialIcons";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Contact Us — Scrivly",
  description: "Get in touch with the Scrivly team. We reply within 24 hours.",
};

function EnvelopeIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7l9 6 9-6" />
    </svg>
  );
}

function ShoppingBagIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 6h18" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 10a4 4 0 01-8 0" />
    </svg>
  );
}

function ClockIcon({ className = "h-5 w-5" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2" />
    </svg>
  );
}

const DIRECT_CONTACT = [
  {
    Icon: EnvelopeIcon,
    label: "EMAIL",
    value: "scrivly@gmail.com",
    href: "mailto:scrivly@gmail.com",
    note: "For account issues, billing questions, and general enquiries.",
  },
  {
    Icon: ShoppingBagIcon,
    label: "ETSY SHOP",
    value: "AmanCraftio on Etsy",
    href: "https://www.etsy.com/shop/AmanCraftio",
    external: true,
    note: "For credit pack purchases and order-related questions. Message us directly on Etsy.",
  },
  {
    Icon: ClockIcon,
    label: "RESPONSE TIME",
    value: "Within 24 hours",
    note: "Monday to Saturday. We are based in Sialkot, Pakistan (PKT, UTC+5).",
  },
];

const SOCIAL_PLATFORMS = [
  { name: "X (Twitter)", handle: "@scrivly", href: "https://x.com", Icon: TwitterIcon, color: "var(--text-primary)" },
  { name: "Instagram", handle: "@scrivly", href: "https://instagram.com/scrivly", Icon: InstagramIcon, color: "#E1306C" },
  { name: "Facebook", handle: "facebook.com/scrivly", href: "https://facebook.com/scrivly", Icon: FacebookIcon, color: "#1877F2" },
  { name: "YouTube", handle: "Scrivly", href: "https://youtube.com", Icon: YouTubeIcon, color: "#FF0000" },
  { name: "TikTok", handle: "@scrivly", href: "https://tiktok.com", Icon: TikTokIcon, color: "#FF0050" },
];

const QUICK_LINKS = [
  { label: "Browse the FAQ →", href: "/faq" },
  { label: "Read How it works →", href: "/how-it-works" },
  { label: "Check Pricing →", href: "/pricing" },
];

const cardStyle = { background: "var(--bg-card)", border: "1px solid var(--border-default)" };

function PowerSellerSupportCard() {
  return (
    <a
      href="mailto:scrivly@gmail.com?subject=Power Seller Support Request"
      className="flex items-center gap-4 rounded-[14px] px-6 py-5 transition hover:border-[rgba(34,197,94,0.5)]"
      style={{ background: "var(--bg-card)", border: "1px solid rgba(34,197,94,0.4)" }}
    >
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-lg"
        style={{ background: "rgba(34,197,94,0.15)", color: "#22C55E" }}
      >
        ⚡
      </span>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
          POWER SELLER SUPPORT
        </p>
        <p className="mt-0.5 font-semibold text-[var(--text-primary)]">Priority email support</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          As a Power Seller you get priority responses within 4 hours.
        </p>
        <p className="mt-1 text-sm font-medium" style={{ color: "#22C55E" }}>Email us directly →</p>
      </div>
    </a>
  );
}

export default async function ContactPage() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let isPowerSeller = false;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("pack_tier").eq("id", user.id).single();
    isPowerSeller = profile?.pack_tier === "power";
  }

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-20">
        <PageHero
          label="GET IN TOUCH"
          heading="We are here to help."
          subtext="Have a question, issue, or just want to say hello? Reach out through any of the channels below. We reply within 24 hours."
        />

        <div className="grid gap-10 text-left lg:grid-cols-2">
          {/* Left column — direct contact */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">Contact directly</h2>

            <div className="mt-6 space-y-4">
              {isPowerSeller && <PowerSellerSupportCard />}
              {DIRECT_CONTACT.map(({ Icon, label, value, href, external, note }) => {
                const content = (
                  <>
                    <span
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full"
                      style={{ background: "rgba(255,61,139,0.1)", color: "#FF3D8B" }}
                    >
                      <Icon className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: "var(--text-muted)" }}>
                        {label}
                      </p>
                      <p className="mt-0.5 font-semibold text-[var(--text-primary)]">{value}</p>
                      <p className="mt-1 text-sm text-[var(--text-secondary)]">{note}</p>
                    </div>
                  </>
                );

                const className =
                  "flex items-center gap-4 rounded-[14px] px-6 py-5 transition hover:border-[rgba(255,61,139,0.4)]";

                return href ? (
                  <a
                    key={label}
                    href={href}
                    {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    className={className}
                    style={cardStyle}
                  >
                    {content}
                  </a>
                ) : (
                  <div key={label} className={className} style={cardStyle}>
                    {content}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right column — social media */}
          <div>
            <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">Follow Scrivly</h2>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              Stay updated with tips, new features, and Etsy seller advice.
            </p>

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {SOCIAL_PLATFORMS.map(({ name, handle, href, Icon, color }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3.5 rounded-xl px-5 py-4 transition duration-200 ease-out
                    hover:-translate-y-0.5 hover:border-[rgba(255,61,139,0.35)] hover:shadow-[0_8px_24px_rgba(0,0,0,0.2)]"
                  style={cardStyle}
                >
                  <span className="shrink-0" style={{ color }}>
                    <Icon className="h-9 w-9" />
                  </span>
                  <div>
                    <p className="font-semibold text-[var(--text-primary)]">{name}</p>
                    <p className="text-sm text-[var(--text-secondary)]">{handle}</p>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Before you contact */}
        <div
          className="mx-auto mt-20 max-w-3xl rounded-2xl p-8 text-center sm:p-10"
          style={{
            background:
              "linear-gradient(var(--bg-card), var(--bg-card)) padding-box, linear-gradient(135deg, rgba(255,184,0,0.4), rgba(255,61,139,0.4), rgba(123,47,255,0.4)) border-box",
            border: "1px solid transparent",
          }}
        >
          <h2 className="text-xl font-bold text-[var(--text-primary)] sm:text-2xl">Before you reach out</h2>
          <p className="mt-2 text-sm text-[var(--text-secondary)] sm:text-base">
            Your question may already be answered:
          </p>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            {QUICK_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full border border-[var(--border-default)] px-5 py-2 text-sm font-medium
                  text-[var(--text-primary)] transition hover:border-brand-pink hover:text-brand-pink"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Business info */}
        <div className="mx-auto mt-12 max-w-2xl text-center text-sm" style={{ color: "var(--text-muted)" }}>
          <p>Scrivly is operated by Aman Ali, Sialkot, Pakistan.</p>
          <p className="mt-1">Business enquiries: scrivly@gmail.com</p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
