import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient: createServerSupabaseClient } = require("@/lib/supabase/server");

export const runtime = "nodejs";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
const CONFIDENCE_VALUES = ["high", "medium", "low"];

const ETSY_CATEGORIES = `Accessories > Belts & Suspenders
Accessories > Gloves & Mittens
Accessories > Hair Accessories
Accessories > Hats & Caps
Accessories > Keychains & Lanyards
Accessories > Patches & Pins
Accessories > Scarves & Wraps
Accessories > Sunglasses & Eyewear
Accessories > Ties & Bow Ties
Accessories > Umbrellas & Rain Accessories
Accessories > Wallets & Money Clips
Art & Collectibles > Collectibles
Art & Collectibles > Dolls & Miniatures
Art & Collectibles > Drawing & Illustration
Art & Collectibles > Fiber Arts
Art & Collectibles > Glass Art
Art & Collectibles > Mixed Media & Collage
Art & Collectibles > Painting
Art & Collectibles > Photography
Art & Collectibles > Prints
Art & Collectibles > Sculpture
Bags & Purses > Backpacks
Bags & Purses > Clutches & Pouches
Bags & Purses > Cosmetic Bags & Cases
Bags & Purses > Diaper Bags
Bags & Purses > Handbags
Bags & Purses > Luggage & Travel
Bags & Purses > Messenger Bags
Bags & Purses > Tote Bags
Bags & Purses > Wallets
Bath & Beauty > Bath Accessories
Bath & Beauty > Bath Soaks & Bombs
Bath & Beauty > Hair Care
Bath & Beauty > Makeup & Cosmetics
Bath & Beauty > Nail Care
Bath & Beauty > Skin Care
Bath & Beauty > Soaps
Bath & Beauty > Spa & Relaxation
Books, Movies & Music > Books
Books, Movies & Music > Magazines
Books, Movies & Music > Movies
Books, Movies & Music > Music
Books, Movies & Music > Sheet Music
Clothing > Children's Clothing
Clothing > Costumes
Clothing > Gender-Neutral Adult Clothing
Clothing > Men's Clothing
Clothing > Pet Clothing
Clothing > Women's Clothing
Craft Supplies & Tools > Beads & Jewelry Making
Craft Supplies & Tools > Fabric & Textiles
Craft Supplies & Tools > Findings & Hardware
Craft Supplies & Tools > Knitting & Crochet Supplies
Craft Supplies & Tools > Patterns & How-To
Craft Supplies & Tools > Ribbon & Trim
Craft Supplies & Tools > Sewing & Fiber Tools
Craft Supplies & Tools > Tools & Equipment
Craft Supplies & Tools > Yarn & Roving
Electronics & Accessories > Audio
Electronics & Accessories > Cameras & Photography
Electronics & Accessories > Cell Phones & Accessories
Electronics & Accessories > Computers & Peripherals
Electronics & Accessories > Tech Accessories
Home & Living > Bath
Home & Living > Bedding
Home & Living > Furniture
Home & Living > Home Decor
Home & Living > Kitchen & Dining
Home & Living > Lighting
Home & Living > Office
Home & Living > Outdoor & Gardening
Home & Living > Pillows & Covers
Home & Living > Rugs
Home & Living > Storage & Organization
Home & Living > Wall Decor
Jewelry > Anklets
Jewelry > Body Jewelry
Jewelry > Bracelets
Jewelry > Brooches & Pins
Jewelry > Earrings
Jewelry > Jewelry Sets
Jewelry > Necklaces
Jewelry > Rings
Jewelry > Watches
Paper & Party Supplies > Calendars & Planners
Paper & Party Supplies > Cards & Invitations
Paper & Party Supplies > Gift Wrapping
Paper & Party Supplies > Office & School Supplies
Paper & Party Supplies > Party Decor
Paper & Party Supplies > Stationery
Pet Supplies > Pet Bowls & Feeding
Pet Supplies > Pet Beds & Furniture
Pet Supplies > Pet Clothing & Accessories
Pet Supplies > Pet Collars, Harnesses & Leashes
Pet Supplies > Pet Memorials
Pet Supplies > Pet Toys
Shoes > Children's Shoes
Shoes > Men's Shoes
Shoes > Women's Shoes
Toys & Games > Baby & Toddler Toys
Toys & Games > Dolls & Action Figures
Toys & Games > Games & Puzzles
Toys & Games > Outdoor & Sports Toys
Toys & Games > Plush
Toys & Games > Stuffed Animals
Weddings > Wedding Accessories
Weddings > Wedding Decorations
Weddings > Wedding Decor & Keepsakes
Weddings > Wedding Stationery
Weddings > Wedding Bouquets & Flowers
Weddings > Wedding Jewelry`;

const SUGGEST_CATEGORY_SYSTEM_PROMPT = `You are an expert Etsy category classifier. You will be shown a photo
of a product. Your job is to determine which official Etsy category the product most likely belongs in.

Here is the official list of Etsy categories (format: "Top-level category > Subcategory"):

${ETSY_CATEGORIES}

Examine the photo and choose exactly 3 categories from the list above that best match the product,
ranked from most to least likely. For each, give a confidence level and a one-sentence reason based
on what you see in the photo.

Respond with ONLY a JSON array (no markdown fences, no extra commentary, nothing before or after it)
in exactly this shape:
[
  {"category": "Top-level category > Subcategory", "confidence": "high" | "medium" | "low", "reason": "one short sentence"},
  {"category": "Top-level category > Subcategory", "confidence": "high" | "medium" | "low", "reason": "one short sentence"},
  {"category": "Top-level category > Subcategory", "confidence": "high" | "medium" | "low", "reason": "one short sentence"}
]

Every "category" value must be copied exactly as written in the list above.`;

interface SuggestCategoryRequestBody {
  imageBase64?: string;
  mimeType?: string;
}

interface CategorySuggestion {
  category: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

function extractJsonArray(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf("[");
  const end = trimmed.lastIndexOf("]");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON array found in model response");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

function isCategorySuggestions(value: unknown): value is CategorySuggestion[] {
  if (!Array.isArray(value) || value.length === 0) return false;
  return value.every((item) => {
    if (!item || typeof item !== "object") return false;
    const candidate = item as Record<string, unknown>;
    return (
      typeof candidate.category === "string" &&
      typeof candidate.reason === "string" &&
      typeof candidate.confidence === "string" &&
      CONFIDENCE_VALUES.includes(candidate.confidence)
    );
  });
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: SuggestCategoryRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const imageBase64 = (body.imageBase64 ?? "").trim();
  const mimeType = (body.mimeType ?? "").trim();

  if (!imageBase64 || !mimeType) {
    return NextResponse.json({ error: "imageBase64 and mimeType are required." }, { status: 400 });
  }
  if (!ACCEPTED_IMAGE_TYPES.includes(mimeType)) {
    return NextResponse.json({ error: "Image must be a JPG, PNG, or WEBP file." }, { status: 400 });
  }

  let anthropicResponse: Response;
  try {
    anthropicResponse = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 1024,
        system: SUGGEST_CATEGORY_SYSTEM_PROMPT,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mimeType, data: imageBase64 } },
              { type: "text", text: "Here is a photo of the product. Suggest the 3 best-matching Etsy categories as instructed." },
            ],
          },
        ],
      }),
    });
  } catch {
    return NextResponse.json({ error: "Failed to reach the Anthropic API." }, { status: 502 });
  }

  if (!anthropicResponse.ok) {
    const errorText = await anthropicResponse.text();
    return NextResponse.json(
      { error: `Anthropic API error (${anthropicResponse.status}): ${errorText}` },
      { status: 502 }
    );
  }

  const payload = await anthropicResponse.json();
  const textBlock = payload?.content?.find((block: { type?: string }) => block?.type === "text");
  const rawText: string | undefined = textBlock?.text;

  if (!rawText) {
    return NextResponse.json({ error: "Model response did not contain any text." }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = extractJsonArray(rawText);
  } catch {
    return NextResponse.json({ error: "Could not parse JSON from the model response." }, { status: 502 });
  }

  if (!isCategorySuggestions(parsed)) {
    return NextResponse.json({ error: "Model response JSON was missing expected fields." }, { status: 502 });
  }

  return NextResponse.json({ suggestions: parsed.slice(0, 3) });
}
