import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient: createServerSupabaseClient } = require("@/lib/supabase/server");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createAdminClient } = require("@/lib/supabase/admin");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getHistoryLimit } = require("@/lib/plans");

export const runtime = "nodejs";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const RESPONSE_FORMAT_INSTRUCTIONS = `Respond with ONLY a JSON object (no markdown fences, no extra
commentary, nothing before or after it) in exactly this shape:
{"title": "...", "description": "...", "tags": ["...", "...", ...], "primarySearchPhrase": "..."}`;

const PHOTO_SYSTEM_PROMPT = `You are an expert Etsy listing writer with deep knowledge of Etsy SEO.
You generate complete, high-ranking Etsy listings from product photos.
You write with full confidence — never use phrases like "appears to be",
"seems like", "likely", "possibly", or any guessing language.
Write as if you made this product yourself and know every detail.

TITLE RULES (follow exactly):
- Maximum 140 characters
- Put the most important keyword FIRST
- Stack 4-6 high search volume keywords naturally
- No filler words, no punctuation, no "and" between keywords
- Format: [Primary Keyword] [Material] [Style] — [Secondary Keyword] [Occasion/Use]
- Example: "Men Leather Bomber Jacket Vintage Cowhide — Motorcycle Biker Jacket Christmas Gift"
- The title must pass Etsy SEO without any edits by the user

DESCRIPTION RULES (follow exactly):
Write every description in this exact style and structure:

STYLE REFERENCE (follow this template — do not copy it, use it as structure only):

"The Rider Club takes a simple leather jacket and adds some style.
This jacket includes conceal carry and armor pockets and a ventilated
action back for comfort while riding. The Rider Club is a true three
season jacket with an insulated zip out thermal liner in case the temps
rise on your ride. The lower belt detail and side stretch panel ads to
its classic aesthetic.

Features:
- Runs true to size
- 1.2-1.3mm Vintage Naked Cowhide Leather
- Center zip style with banded snap collar
- Two vented chest pockets
- Two zippered slash pockets
- Two conceal carry pockets with tapered holsters
- Rear belt detail
- Size stretch panels for comfort
- Zippered sleeves with gussets and button snap
- Action back with zipper exhaust vents
- Insulated zip-out thermal liner
- YKK zippers
- Armor pockets for CE rated armor

- Perfect Winter Gift: A charismatic leather jacket designed to keep
you warm, stylish, and comfortable during the colder months, ideal
for winter gifting.
- Holiday & Seasonal Gifts: Great choice for Thanksgiving, Black
Friday, Christmas, and New Year gifting.
- Gifts for Him: Ideal gift option for Men, Boys, Husband, Son,
Father, Dad, Best Friend, or Boyfriend, a versatile wardrobe
essential for every man."

DESCRIPTION STRUCTURE TO FOLLOW:
1. One confident opening sentence that sells the product
2. Two to three sentences about what makes it special or functional
3. Features: bullet points — specific materials with measurements,
   hardware brand names, construction details, functional features
4. Gifting bullets — occasions, who it is for, why it makes a great gift
- Never use: "stunning", "amazing", "game-changing", "appears to be",
  "seems", "possibly", "may be", "beautiful", "gorgeous"
- Always use: specific material names, measurements where visible,
  hardware brand names if identifiable, functional benefits
- Minimum 150 words, maximum 300 words
- SEO keywords must appear naturally in the description text

TAGS RULES (follow exactly):
- Generate exactly 13 tags
- Every single tag must be 20 characters or less including spaces
- No exceptions — if a tag is over 20 characters, shorten it
- Each tag must be a real Etsy search term buyers actually use
- Use the keyword research results provided to pick highest ranked tags
- No duplicate words across tags
- Example good tags: "leather bomber jacket", "mens biker jacket",
  "motorcycle jacket", "leather jacket gift", "christmas gift men"
- Example bad tags: "vintage distressed leather motorcycle jacket" (too long)

MATERIALS/ATTRIBUTES RULES:
- List every visible material with specifics (e.g. "cowhide leather"
  not just "leather")
- Include hardware details if visible (zippers, snaps, buckles)
- Include color names specifically (midnight black, slate grey,
  not just black or grey)
- Include lining if visible
- Never guess — if something is not clearly visible in the photo,
  leave that field empty rather than guessing

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "title here max 140 chars",
  "description": "full description here",
  "tags": ["tag1", "tag2", "tag3", "tag4", "tag5", "tag6", "tag7",
           "tag8", "tag9", "tag10", "tag11", "tag12", "tag13"],
  "materials": "comma separated materials list",
  "attributes": {
    "color": "",
    "style": "",
    "occasion": "",
    "material": "",
    "closure": "",
    "lining": ""
  }
}

Return ONLY the JSON. No preamble. No explanation. No markdown.`;

interface ManualRequestBody {
  mode?: "manual";
  productName?: string;
  category?: string;
  features?: string;
  targetBuyer?: string;
  weakAreas?: string[];
}

interface PhotoRequestBody {
  mode: "photo";
  image?: string;
  mediaType?: string;
  details?: string;
  selectedCategory?: string;
  weakAreas?: string[];
}

type GenerateRequestBody = ManualRequestBody | PhotoRequestBody;

interface IdentifiedMaterials {
  primary?: string;
  secondary?: string;
  finish?: string;
  construction?: string;
}

interface ListingAttributes {
  color?: string;
  style?: string;
  occasion?: string;
  material?: string;
  closure?: string;
  lining?: string;
}

interface GeneratedListing {
  title: string;
  description: string;
  tags: string[];
  primarySearchPhrase?: string;
  identifiedMaterials?: IdentifiedMaterials;
  materials?: string;
  attributes?: ListingAttributes;
}

interface AnthropicMessageParams {
  system?: string;
  messages: Array<{ role: "user"; content: string | AnthropicContentBlock[] }>;
}

type AnthropicContentBlock =
  | { type: "text"; text: string }
  | { type: "image"; source: { type: "base64"; media_type: string; data: string } };

function weakAreasSuffix(weakAreas?: string[]): string {
  if (!weakAreas?.length) return "";
  return `\n\nIMPORTANT — the previous version of this listing scored poorly in these specific areas. Fix every one of them in your new version:\n${weakAreas.map((w) => `- ${w}`).join("\n")}`;
}

function buildManualPrompt(
  values: { productName: string; category: string; features: string; targetBuyer: string },
  weakAreas?: string[],
): string {
  return `You are an Etsy seller writing your own listing for the product below. Write the way real Etsy sellers write — warm, conversational, like you're describing something you made or sourced yourself, not like a brand or ChatGPT.

Product name: ${values.productName}
Category: ${values.category}
Key features: ${values.features || "(none provided)"}
Target buyer: ${values.targetBuyer || "(not specified)"}

STEP 1 — IDENTIFY:
- The product and what it's made of (if relevant).
- Who the target buyer is and what occasion they might be buying it for.
- The main keywords this buyer would type into Etsy search.
- The single PRIMARY SEARCH PHRASE that should anchor the title and description.

STEP 2 — WRITE THE LISTING using these rules:
1. TITLE — start with the primary search phrase, include material/who-it's-for if relevant, max 140 characters, no ALL CAPS, comma-separated like a real Etsy listing title.
2. DESCRIPTION — 300-450 words, 6 short paragraphs (max 2 sentences each), written like a real person using "I"/"we": (1) hook with the primary search phrase, (2) what it's made of / how it's made, (3) who it's for + the primary search phrase again, (4) a mandatory gifting angle mentioning 2-3 occasions, (5) practical details with a human touch, (6) care instructions ending with the primary search phrase one final time.
3. TAGS — exactly 13 Etsy search tags, each under 20 characters, mixing broad terms (e.g. "gift for her") with specific long-tail terms (e.g. "gold hoop earrings").

Never use banned phrases like "superior quality", "premium craftsmanship", "meticulously crafted", "innovative design", "state of the art", "unparalleled quality", or "elevate your style" — sound like Etsy, not Amazon.

${RESPONSE_FORMAT_INSTRUCTIONS}${weakAreasSuffix(weakAreas)}`;
}

function buildPhotoUserText(details: string, weakAreas?: string[], selectedCategory?: string, etsyKeywords?: string[]): string {
  const categorySuffix = selectedCategory
    ? `\n\nThe seller has indicated this product belongs in the Etsy category: ${selectedCategory}. Use this to inform your tag selection and description focus.`
    : "";
  const detailsLine = details
    ? details
    : "No additional details provided. Base everything on what you can see in the photo.";
  const keywordSuffix = etsyKeywords?.length
    ? `\n\nTop Etsy search keywords for this product based on research:\n${etsyKeywords.map((k) => `- ${k}`).join("\n")}\nUse these keywords in the title, description, and tags.`
    : "";
  return `Carefully examine this product photo.

STEP 1 — PRODUCT ANALYSIS:
Before writing anything, identify:

1. What is this product exactly?
2. What materials, hardware, and colors are clearly visible? (be specific — e.g. "cowhide leather" not "leather", "midnight black" not "black")
3. What style or aesthetic does it have? (minimalist, rustic, cyberpunk, cottagecore, etc)
4. What are the 4-6 highest search volume keywords a buyer would type to find this on Etsy?
5. Who is the ideal buyer for this, and what occasion would they buy it for?
6. What makes this specific product visually distinctive from similar products?
7. What attributes are visible for: color, style, occasion, material, closure, lining? (leave any of these empty if not clearly visible — never guess)

STEP 2 — WRITE THE LISTING:

Using your analysis write a complete Etsy listing following ALL rules from your system instructions: confident opening sentence, features bullets with specific materials/measurements/hardware, then gifting bullets.

The listing must:
- Be completely unique to THIS product
- Write with full confidence — no "appears to be", "seems", "possibly", or guessing language
- Sound like it was written by the seller who made this product
- Stack the highest search volume keywords naturally into the title, description, and tags

Additional seller details provided:
${detailsLine}${categorySuffix}${keywordSuffix}${weakAreasSuffix(weakAreas)}

STEP 3 — GENERATE TAGS AND ATTRIBUTES:
13 tags exactly, each 20 characters or less. Fill the materials and attributes fields with only what is clearly visible — leave a field empty rather than guessing.

Return ONLY this exact JSON. No text before or after. No markdown. No code blocks. Start with { and end with }`;
}

function extractJson(text: string): unknown {
  const trimmed = text.trim();
  const start = trimmed.indexOf("{");
  const end = trimmed.lastIndexOf("}");
  if (start === -1 || end === -1 || end < start) {
    throw new Error("No JSON object found in model response");
  }
  return JSON.parse(trimmed.slice(start, end + 1));
}

function isGeneratedListing(value: unknown): value is GeneratedListing {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.title === "string" &&
    typeof candidate.description === "string" &&
    Array.isArray(candidate.tags) &&
    candidate.tags.every((tag) => typeof tag === "string")
  );
}

// STEP 1 of keyword research — identify the product type from the photo alone.
async function identifyProductType(apiKey: string, image: string, mediaType: string): Promise<string> {
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 50,
        messages: [
          {
            role: "user",
            content: [
              { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
              {
                type: "text",
                text: "Look at these product photos. In 3-5 words identify exactly what this product is. Return only the product name, nothing else. Example: mens leather bomber jacket",
              },
            ],
          },
        ],
      }),
    });
    if (!response.ok) return "";
    const payload = await response.json();
    const textBlock = payload?.content?.find((block: { type?: string }) => block?.type === "text");
    return (textBlock?.text ?? "").trim();
  } catch {
    return "";
  }
}

// STEP 2 of keyword research — web search Etsy for top keywords/tags for that product type.
async function researchEtsyKeywords(apiKey: string, productType: string): Promise<string[]> {
  if (!productType) return [];
  try {
    const response = await fetch(ANTHROPIC_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": ANTHROPIC_VERSION,
      },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 512,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [
          {
            role: "user",
            content: `Search for: "${productType} etsy bestseller keywords tags SEO 2025 2026". Extract the most commonly appearing Etsy search terms/keywords/tags from the results. Respond with ONLY a JSON array of up to 15 short keyword strings, nothing else. Example: ["leather bomber jacket","mens biker jacket"]`,
          },
        ],
      }),
    });
    if (!response.ok) return [];
    const payload = await response.json();
    const textBlocks: string[] = (payload?.content ?? [])
      .filter((block: { type?: string }) => block?.type === "text")
      .map((block: { text?: string }) => block?.text ?? "");
    const rawText = textBlocks.join("\n").trim();
    const start = rawText.indexOf("[");
    const end = rawText.lastIndexOf("]");
    if (start === -1 || end === -1 || end < start) return [];
    const parsed = JSON.parse(rawText.slice(start, end + 1));
    return Array.isArray(parsed) ? parsed.filter((k): k is string => typeof k === "string") : [];
  } catch {
    return [];
  }
}

async function buildRequestParams(body: GenerateRequestBody, apiKey: string): Promise<AnthropicMessageParams | { error: string }> {
  if (body.mode === "photo") {
    const image = (body.image ?? "").trim();
    const mediaType = (body.mediaType ?? "").trim();
    const details = (body.details ?? "").trim();

    if (!image || !mediaType) {
      return { error: "image and mediaType are required for photo mode." };
    }
    if (!ACCEPTED_IMAGE_TYPES.includes(mediaType)) {
      return { error: "Image must be a JPG, PNG, or WEBP file." };
    }

    // Keyword research step — non-blocking. If it fails or finds nothing, generation proceeds without it.
    const productType = await identifyProductType(apiKey, image, mediaType);
    const etsyKeywords = await researchEtsyKeywords(apiKey, productType);

    return {
      system: PHOTO_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: buildPhotoUserText(details, body.weakAreas, (body.selectedCategory ?? "").trim() || undefined, etsyKeywords) },
          ],
        },
      ],
    };
  }

  const productName = (body.productName ?? "").trim();
  const category = (body.category ?? "").trim();
  const features = (body.features ?? "").trim();
  const targetBuyer = (body.targetBuyer ?? "").trim();

  if (!productName || !category) {
    return { error: "productName and category are required." };
  }

  return {
    messages: [{ role: "user", content: buildManualPrompt({ productName, category, features, targetBuyer }, body.weakAreas) }],
  };
}

async function checkAuthAndDeductCredit(description: string, amount: number): Promise<{ userId: string; packTier: string } | NextResponse> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("credits, pack_tier").eq("id", user.id).single();
  if (!profile || profile.credits < amount) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const newBalance = profile.credits - amount;
  await admin.from("profiles").update({ credits: newBalance, updated_at: new Date().toISOString() }).eq("id", user.id);
  await admin.from("credit_transactions").insert({ user_id: user.id, type: "usage", amount: -amount, description });

  return { userId: user.id, packTier: profile.pack_tier ?? "none" };
}

async function recordGenerationHistory(
  userId: string,
  packTier: string,
  record: {
    generation_type: string;
    generated_title?: string;
    generated_description?: string;
    generated_tags?: string[];
    suggested_price_min?: number | null;
    suggested_price_max?: number | null;
    health_score?: number | null;
    credits_used: number;
    included_price_research?: boolean;
    input_details?: string | null;
  }
): Promise<void> {
  const admin = createAdminClient();

  await admin.from("generation_history").insert({
    user_id: userId,
    ...record,
  });

  const historyLimit = getHistoryLimit(packTier);
  if (historyLimit === null) return;

  const { data: rows } = await admin
    .from("generation_history")
    .select("id")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (!rows || rows.length <= historyLimit) return;

  const idsToDelete = rows.slice(historyLimit).map((row: { id: string }) => row.id);
  await admin.from("generation_history").delete().in("id", idsToDelete);
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  let body: GenerateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const authResult = await checkAuthAndDeductCredit("Listing generation", 3);
  if (authResult instanceof NextResponse) return authResult;
  const { userId, packTier } = authResult;

  const params = await buildRequestParams(body, apiKey);
  if ("error" in params) {
    return NextResponse.json({ error: params.error }, { status: 400 });
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
        max_tokens: 2048,
        ...params,
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
    parsed = extractJson(rawText);
  } catch {
    return NextResponse.json({ error: "Could not parse JSON from the model response." }, { status: 502 });
  }

  if (!isGeneratedListing(parsed)) {
    return NextResponse.json({ error: "Model response JSON was missing expected fields." }, { status: 502 });
  }

  const details = body.mode === "photo" ? body.details ?? null : null;

  await recordGenerationHistory(userId, packTier, {
    generation_type: "photo_to_listing",
    generated_title: parsed.title,
    generated_description: parsed.description,
    generated_tags: parsed.tags,
    credits_used: 3,
    included_price_research: false,
    input_details: details,
  });

  return NextResponse.json({
    title: parsed.title,
    description: parsed.description,
    tags: parsed.tags,
    ...(parsed.primarySearchPhrase ? { primarySearchPhrase: parsed.primarySearchPhrase } : {}),
    ...(parsed.identifiedMaterials ? { identifiedMaterials: parsed.identifiedMaterials } : {}),
    ...(parsed.materials ? { materials: parsed.materials } : {}),
    ...(parsed.attributes ? { attributes: parsed.attributes } : {}),
  });
}
