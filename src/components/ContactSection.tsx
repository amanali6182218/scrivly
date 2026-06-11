import { SOCIAL_LINKS, EtsyIcon, EmailIcon } from "@/components/SocialIcons";

export default function ContactSection() {
  return (
    <div className="mt-20 text-left">
      <h2 className="text-center text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
        Get in touch
      </h2>
      <p className="mx-auto mt-3 max-w-xl text-center text-sm text-[var(--text-secondary)] sm:text-base">
        Have a question or need help? We are here for you.
      </p>

      <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
        {/* Left — contact info */}
        <div
          className="flex flex-col gap-4 rounded-2xl p-6 sm:p-8"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
        >
          <a
            href="https://www.etsy.com/shop/AmanCraftio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)] transition hover:text-brand-pink"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--bg-elevated)" }}
            >
              <EtsyIcon className="h-5 w-5" />
            </span>
            Message us on Etsy
          </a>
          <a
            href="mailto:scrivly@gmail.com"
            className="flex items-center gap-3 text-sm font-medium text-[var(--text-primary)] transition hover:text-brand-pink"
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
              style={{ background: "var(--bg-elevated)" }}
            >
              <EmailIcon className="h-5 w-5" />
            </span>
            Email us
          </a>
          <p className="mt-2 text-xs text-[var(--text-muted)]">We reply within 24 hours</p>
        </div>

        {/* Right — social */}
        <div
          className="flex flex-col gap-4 rounded-2xl p-6 sm:p-8"
          style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
        >
          <h3 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>
            Follow us
          </h3>
          <div className="flex flex-wrap gap-3">
            {SOCIAL_LINKS.map(({ id, label, Icon, href }) => (
              <a
                key={id}
                href={href}
                id={id}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="flex items-center justify-center rounded-lg border transition
                  hover:border-[var(--accent-pink)] hover:bg-[var(--bg-elevated)]"
                style={{
                  width: "48px",
                  height: "48px",
                  background: "var(--bg-card)",
                  borderColor: "var(--border-default)",
                  color: "var(--text-secondary)",
                }}
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
