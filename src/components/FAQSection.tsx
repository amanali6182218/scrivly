"use client";

import { useState } from "react";

const FAQS = [
  {
    q: "Do I need to install anything?",
    a: "No. Scrivly is a web app that works in any browser on any device — phone, tablet, or desktop. No downloads, no setup.",
  },
  {
    q: "How do I get started?",
    a: "Purchase a credit pack from our Etsy shop. You will receive a unique redeem code via Etsy message within minutes. Go to scrivly.vercel.app, create a free account, enter your code, and your credits are added instantly.",
  },
  {
    q: "What does one generation include?",
    a: "Each generation uses 6 credits and includes: an SEO-optimized title up to 140 characters, a full description of 400 to 600 words, all 13 Etsy tags, and a listing health score out of 100 with specific improvement tips. Add live price research with a market demand indicator for 10 credits total.",
  },
  {
    q: "Do my credits expire?",
    a: "Never. Your credits stay in your account however long you need them. Buy when you need them, use them at your own pace.",
  },
  {
    q: "How is Scrivly different from ChatGPT?",
    a: "ChatGPT is a general AI tool — you have to write your own prompts, copy-paste results, and figure out Etsy's rules yourself. Scrivly is built specifically for Etsy. It knows the 140-character title limit, understands which tag structures rank, researches real Etsy market prices, and scores your listing — all automatically.",
  },
  {
    q: "What is the Spy and Improve feature?",
    a: "Paste any competitor's Etsy listing URL. Scrivly analyzes their title, description, and tags, identifies the weaknesses, and generates you a stronger version that ranks better in Etsy search.",
  },
  {
    q: "Can I post listings directly to Etsy?",
    a: "Yes. Connect your Etsy shop in the dashboard and click Post to Etsy after generating. Your listing is created as a draft — you review it and publish when ready.",
  },
  {
    q: "What type of products does Scrivly work for?",
    a: "Scrivly works for any physical or digital product on Etsy — handmade items, print on demand, digital downloads, vintage, art prints, jewellery, clothing, home decor, and more.",
  },
  {
    q: "What if I run out of credits?",
    a: "Visit our Etsy shop and purchase any credit pack. You will receive a new unique code via Etsy message. Redeem it in your dashboard and credits are added to your existing account instantly.",
  },
  {
    q: "Is my data safe?",
    a: "Yes. Your account is secured with Supabase authentication. We do not store your product photos after generation. We never share or sell your data to third parties.",
  },
  {
    q: "Can I use Scrivly on my phone?",
    a: "Yes. Scrivly is fully responsive and works on any screen size. Upload a photo from your phone camera and generate a complete listing in seconds.",
  },
  {
    q: "Do you offer refunds?",
    a: "If you have any issue with your purchase, message us on Etsy and we will resolve it. We want every seller to be happy with Scrivly.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="mt-20 text-left">
      <p className="gradient-text text-center text-xs font-semibold uppercase tracking-wide">FAQ</p>
      <h2 className="mt-2 text-center text-2xl font-extrabold tracking-tight text-[var(--text-primary)] sm:text-3xl">
        Everything you need to know.
      </h2>

      <div className="mx-auto mt-10 max-w-3xl">
        {FAQS.map((item, i) => {
          const isOpen = openIndex === i;
          return (
            <div
              key={item.q}
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="cursor-pointer rounded-xl"
              style={{
                background: "var(--bg-card)",
                border: `1px solid ${isOpen ? "var(--accent-pink)" : "var(--border-default)"}`,
                padding: "20px 24px",
                marginBottom: "8px",
                transition: "border-color 0.2s ease",
              }}
            >
              <div className="flex items-center justify-between gap-4">
                <p className="text-base font-medium text-[var(--text-primary)]">{item.q}</p>
                <svg
                  className="h-4 w-4 shrink-0 text-[var(--text-secondary)]"
                  style={{ transition: "transform 0.3s ease", transform: isOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
              <div
                style={{
                  maxHeight: isOpen ? "320px" : "0px",
                  opacity: isOpen ? 1 : 0,
                  overflow: "hidden",
                  transition: "max-height 0.3s ease, opacity 0.3s ease",
                }}
              >
                <p
                  className="pt-3 text-[15px]"
                  style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
