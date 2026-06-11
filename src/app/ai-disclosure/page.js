import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import DocLayout, { DocSection } from "@/components/DocLayout";

export const metadata = {
  title: "AI Disclosure — Scrivly",
  description: "How Scrivly uses Anthropic's Claude AI to analyze product photos and generate Etsy listings.",
};

export default function AIDisclosurePage() {
  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      <Navbar />

      <main>
        <DocLayout title="AI Disclosure" subtitle="How Scrivly uses Artificial Intelligence">
          <DocSection heading="1. What AI Powers Scrivly">
            <p>
              Scrivly is powered by Claude, an AI model developed by Anthropic. Claude is one of the most
              capable and safety-focused AI models available, used by thousands of businesses and
              developers worldwide.
            </p>
            <p>
              We use Claude&apos;s vision and language capabilities to analyze product photos and generate
              listing content.
            </p>
          </DocSection>

          <DocSection heading="2. What the AI Does">
            <p>When you upload a product photo and click Generate, our AI:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>
                Visually analyzes your product photo — identifying materials, colors, style, dimensions,
                and likely use case
              </li>
              <li>Identifies the appropriate Etsy category and relevant buyer audience</li>
              <li>
                Generates an SEO-optimized title of up to 140 characters with the primary keyword placed
                first
              </li>
              <li>
                Writes a 400–600 word product description using natural language optimized for both Etsy
                search and buyer conversion
              </li>
              <li>Selects 13 relevant tags mixing broad and specific search terms</li>
              <li>Researches current Etsy market prices for similar products using web search</li>
              <li>Scores your listing health out of 100 based on Etsy&apos;s known ranking factors</li>
            </ul>
          </DocSection>

          <DocSection heading="3. What the AI Does Not Do">
            <p>Our AI does not:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Guarantee sales or specific search rankings</li>
              <li>Access your Etsy shop without your explicit authorization</li>
              <li>Store or use your product photos to train AI models</li>
              <li>
                Generate identical content for all users — each generation is unique to your specific
                product and inputs
              </li>
              <li>Replace your judgment — always review generated content before publishing</li>
            </ul>
          </DocSection>

          <DocSection heading="4. AI Limitations">
            <p>As with all AI tools, Scrivly&apos;s output may occasionally:</p>
            <ul className="list-disc space-y-1.5 pl-5">
              <li>Miss product-specific details not visible in the photo</li>
              <li>Generate generic descriptions for very niche products</li>
              <li>Suggest pricing that differs from your local market</li>
            </ul>
            <p>
              We recommend using the Add Details field to provide context the photo cannot show, such as
              materials, dimensions, scents, or special features.
            </p>
          </DocSection>

          <DocSection heading="5. Etsy Compliance">
            <p>
              Etsy requires sellers to disclose when AI tools are used to create listing content. By using
              Scrivly, you acknowledge that your listings were created with AI assistance and take
              responsibility for including appropriate disclosures in your Etsy shop as required by
              Etsy&apos;s policies.
            </p>
          </DocSection>

          <DocSection heading="6. Data and Privacy">
            <p>
              Product photos you upload are sent to Anthropic&apos;s Claude API for processing. Anthropic
              does not use API-submitted data to train their models by default. Photos are not stored by
              Scrivly after generation is complete. See our Privacy Policy for full details.
            </p>
          </DocSection>
        </DocLayout>
      </main>

      <Footer />
    </div>
  );
}
