import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DocLayout, { DocSection } from "@/components/DocLayout";

export const metadata = {
  title: "Privacy Policy — Scrivly",
  description: "Learn how Scrivly collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main>
        <DocLayout title="Privacy Policy" lastUpdated="June 2026">
          <DocSection>
            <p>
              Scrivly (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) operates scrivly.vercel.app. This Privacy
              Policy explains how we collect, use, and protect your information when you use our service.
            </p>
          </DocSection>

          <DocSection heading="1. Information We Collect">
            <p>We collect the following information:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Email address (required for account creation)</li>
              <li>Full name (optional, for your profile)</li>
              <li>Avatar color preference</li>
              <li>Credit balance and transaction history</li>
              <li>Product photos you upload for listing generation (not stored after processing)</li>
              <li>IP address at signup (for abuse prevention)</li>
              <li>Device fingerprint at signup (for fraud prevention)</li>
              <li>Usage data including generations performed and credits consumed</li>
            </ul>
          </DocSection>

          <DocSection heading="2. How We Use Your Information">
            <p>We use your information to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Provide and operate the Scrivly service</li>
              <li>Manage your account and credit balance</li>
              <li>Deliver redeem codes and credits</li>
              <li>Prevent fraud and abuse of the platform</li>
              <li>Send transactional emails (code delivery, account notifications)</li>
              <li>Improve the service based on usage patterns</li>
            </ul>
            <p>
              We do not sell, rent, or share your personal information with third parties for marketing
              purposes.
            </p>
          </DocSection>

          <DocSection heading="3. Data Storage and Security">
            <p>
              Your data is stored securely using Supabase, a GDPR-compliant database provider. We use
              industry-standard encryption for data in transit and at rest. Product photos uploaded for
              listing generation are processed in real-time and are not permanently stored on our servers.
            </p>
          </DocSection>

          <DocSection heading="4. Third Party Services">
            <p>Scrivly uses the following third-party services:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Supabase — database and authentication</li>
              <li>Anthropic Claude API — AI generation</li>
              <li>Vercel — hosting and deployment</li>
              <li>Resend — transactional email delivery</li>
              <li>Lemon Squeezy — payment processing (future)</li>
            </ul>
            <p>Each service has its own privacy policy governing their use of data.</p>
          </DocSection>

          <DocSection heading="5. Cookies">
            <p>We use essential cookies only:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Authentication session cookies (required to keep you logged in)</li>
              <li>Theme preference (dark/light mode)</li>
              <li>UI state preferences (collapsed panels)</li>
            </ul>
            <p>We do not use advertising or tracking cookies.</p>
          </DocSection>

          <DocSection heading="6. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your account and data</li>
              <li>Withdraw consent at any time</li>
            </ul>
            <p>To exercise these rights, contact us at the email address on our Contact page.</p>
          </DocSection>

          <DocSection heading="7. Children's Privacy">
            <p>
              Scrivly is not intended for users under the age of 13. We do not knowingly collect
              information from children.
            </p>
          </DocSection>

          <DocSection heading="8. Changes to This Policy">
            <p>
              We may update this Privacy Policy periodically. We will notify you of significant changes by
              posting a notice on our website. Continued use of Scrivly after changes constitutes
              acceptance.
            </p>
          </DocSection>

          <DocSection heading="9. Contact">
            <p>For privacy-related questions, contact us through the Contact page on our website.</p>
          </DocSection>
        </DocLayout>
      </main>

      <Footer />
    </div>
  );
}
