import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import { EtsyIcon, EmailIcon } from "@/components/SocialIcons";

export const metadata = {
  title: "Contact Us — Scrivly",
  description: "Get in touch with the Scrivly team — message us on Etsy, email us, or follow us on social media.",
};

const CONTACT_METHODS = [
  {
    icon: EtsyIcon,
    title: "Message us on Etsy",
    note: "[LINK TO BE ADDED]",
  },
  {
    icon: EmailIcon,
    title: "Email us",
    note: "[EMAIL TO BE ADDED]",
  },
  {
    icon: EtsyIcon,
    title: "Social media",
    note: "[LINKS TO BE ADDED]",
  },
];

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-20">
        <PageHero
          label="GET IN TOUCH"
          heading="Contact Us"
          subtext="We are here to help. Choose the best way to reach us below."
        />

        <div className="mx-auto grid max-w-3xl gap-6 sm:grid-cols-3">
          {CONTACT_METHODS.map(({ icon: Icon, title, note }) => (
            <div
              key={title}
              className="flex flex-col items-center gap-3 rounded-2xl p-6 text-center"
              style={{ background: "var(--bg-card)", border: "1px solid var(--border-default)" }}
            >
              <span
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: "var(--bg-elevated)" }}
              >
                <Icon className="h-6 w-6 text-[var(--text-primary)]" />
              </span>
              <h3 className="text-base font-semibold text-[var(--text-primary)]">{title}</h3>
              <p className="text-sm text-[var(--text-muted)]">{note}</p>
            </div>
          ))}
        </div>

        <p className="mx-auto mt-10 max-w-2xl text-center text-sm text-[var(--text-muted)]">
          Contact details coming soon. In the meantime, message us directly on Etsy.
        </p>
      </main>

      <Footer />
    </div>
  );
}
