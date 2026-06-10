import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata: Metadata = {
  title: "Scrivly — SEO-Optimized Etsy Listings in Seconds",
  description:
    "Generate SEO-optimized Etsy listing titles, descriptions, and tags from your product details.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans text-stone-800 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
