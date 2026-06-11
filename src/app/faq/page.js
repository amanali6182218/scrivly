import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PageHero from "@/components/PageHero";
import CtaBanner from "@/components/CtaBanner";
import FAQSection from "@/components/FAQSection";

export const metadata = {
  title: "FAQ — Scrivly",
  description: "Find answers to common questions about Scrivly AI listing agent for Etsy sellers.",
};

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main className="mx-auto max-w-[1100px] px-4 py-12 sm:px-6 sm:py-20">
        <PageHero
          label="SUPPORT"
          heading="Frequently Asked Questions"
          subtext={
            <>
              Everything you need to know about Scrivly. Can&apos;t find the answer?{" "}
              <Link href="/contact" className="text-brand-pink underline-offset-2 hover:underline">
                Contact us
              </Link>
              .
            </>
          }
        />

        <FAQSection />

        <CtaBanner
          heading="Still have questions?"
          buttons={[
            { label: "Message us", href: "/contact", variant: "secondary" },
            { label: "Get started free", href: "/signup" },
          ]}
        />
      </main>

      <Footer />
    </div>
  );
}
