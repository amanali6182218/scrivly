import Link from "next/link";
import { SOCIAL_LINKS } from "@/components/SocialIcons";

const PRODUCT_LINKS = [
  { id: "footer-features", label: "Features" },
  { id: "footer-pricing", label: "Pricing" },
  { id: "footer-how-it-works", label: "How it works" },
  { id: "footer-demo", label: "Demo" },
];

const SUPPORT_LINKS = [
  { id: "footer-faq", label: "FAQ" },
  { id: "footer-contact", label: "Contact us" },
  { id: "footer-etsy-shop", label: "Etsy Shop" },
];

const LEGAL_LINKS = [
  { id: "footer-privacy", label: "Privacy Policy" },
  { id: "footer-terms", label: "Terms of Service" },
  { id: "footer-ai-disclosure", label: "AI Disclosure" },
];

const linkClasses = "text-sm transition hover:text-brand-pink";
const linkStyle = { color: "var(--text-secondary)" };
const headingClasses = "mb-4 text-sm font-semibold";
const headingStyle = { color: "var(--text-primary)" };

export default function Footer() {
  return (
    <footer
      style={{
        background: "var(--bg-secondary)",
        borderTop: "1px solid var(--border-subtle)",
        paddingTop: "60px",
        paddingBottom: "32px",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {/* Column 1 — Brand */}
          <div>
            <Link href="/">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.png" alt="Scrivly" style={{ height: "32px", width: "auto", cursor: "pointer" }} />
            </Link>
            <p className="mt-4 text-sm" style={{ color: "var(--text-secondary)" }}>
              AI-powered listing agent for Etsy sellers
            </p>
            <div className="mt-5 flex gap-2">
              {SOCIAL_LINKS.map(({ id, label, Icon }) => (
                <a
                  key={id}
                  href="#"
                  id={id}
                  aria-label={label}
                  className="flex items-center justify-center rounded-lg border transition
                    hover:border-[var(--accent-pink)] hover:bg-[var(--bg-elevated)]"
                  style={{
                    width: "40px",
                    height: "40px",
                    background: "var(--bg-card)",
                    borderColor: "var(--border-default)",
                    color: "var(--text-secondary)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 — Product */}
          <div>
            <h3 className={headingClasses} style={headingStyle}>Product</h3>
            <ul className="space-y-3">
              {PRODUCT_LINKS.map((link) => (
                <li key={link.id}>
                  <a href="#" id={link.id} className={linkClasses} style={linkStyle}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Support */}
          <div>
            <h3 className={headingClasses} style={headingStyle}>Support</h3>
            <ul className="space-y-3">
              {SUPPORT_LINKS.map((link) => (
                <li key={link.id}>
                  <a href="#" id={link.id} className={linkClasses} style={linkStyle}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Legal */}
          <div>
            <h3 className={headingClasses} style={headingStyle}>Legal</h3>
            <ul className="space-y-3">
              {LEGAL_LINKS.map((link) => (
                <li key={link.id}>
                  <a href="#" id={link.id} className={linkClasses} style={linkStyle}>
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div
          className="mt-12 flex flex-col items-center justify-between gap-3 pt-6 text-xs sm:flex-row"
          style={{ borderTop: "1px solid var(--border-subtle)", color: "var(--text-muted)" }}
        >
          <p>© 2026 Scrivly. All rights reserved.</p>
          <p>Created with Claude AI by Anthropic</p>
        </div>
      </div>
    </footer>
  );
}
