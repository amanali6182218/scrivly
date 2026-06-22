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

const PHOTO_SYSTEM_PROMPT = `You are a professional Etsy listing writer and SEO expert with deep
knowledge of Etsy's 2025/2026 search algorithm.

You generate complete, high-ranking Etsy listings from product photos.

You write with full confidence and authority. Never use phrases like:
"appears to be", "seems like", "likely", "possibly", "may be",
"I think", "it looks like", or any guessing language whatsoever.
Write as if you made this product yourself and know every single detail.

STEP 1 — IDENTIFY THE PRODUCT

Before generating anything, analyse the uploaded photos carefully:
- Identify the exact product type
- Identify the material (cowhide, lambskin, suede, canvas, etc.)
- Identify the color with specific names (midnight black, slate grey,
  tobacco brown — not just "black" or "brown")
- Identify all visible hardware (YKK zippers, brass snaps, silver buckles)
- Identify all visible features (pockets, lining, collar type, closure)
- Identify the style (biker, bomber, racer, varsity, moto, etc.)
- Identify the gender target (mens, womens, unisex)

STEP 2 — USE KEYWORD RESEARCH PROVIDED

You will receive a list of top Etsy search keywords researched from
real Etsy listings for this product type.
Use these keywords across the title, description first sentence, and tags.
These are real search terms buyers type — prioritise them.

STEP 3 — WRITE THE TITLE

ETSY 2026 TITLE RULES — FOLLOW EXACTLY:

- First 40 characters must contain the single most important keyword
  (material + product type e.g. "Men Lambskin Leather Bomber Jacket")
- Use pipe | separator between keyword clusters
- Total length: 80 to 120 characters maximum
- Natural and readable — a real buyer must understand it immediately
- No keyword stuffing, no repeating the same word twice
- No subjective words: no "beautiful", "perfect", "stunning", "amazing"
- No promotional words: no "sale", "free shipping", "best"
- No ALL CAPS
- Title and tags must NOT repeat the same phrases — they work together

TITLE FORMAT:
[Material] [Product Type] | [Style or Feature Descriptor] | [Occasion or Recipient]

TITLE EXAMPLES (use as format reference only, not content):
"Men Lambskin Leather Bomber Jacket | Vintage Biker Motorcycle Coat | Gift for Him"
"Women Cowhide Leather Moto Jacket | Slim Fit Asymmetric Zip | Christmas Gift Her"
"Men Cowhide Leather Riding Jacket | Conceal Carry Armor Pockets | Motorcycle Gift"

STEP 4 — WRITE THE DESCRIPTION

DESCRIPTION RULES — FOLLOW EXACTLY:

Write every description using this exact structure and style.
This is the style template — follow the structure, not the words:

TEMPLATE:
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
1. Opening paragraph (2-3 sentences):
   - First sentence must include the primary keyword naturally
   - First sentence must be a confident product statement
   - Second sentence highlights the most important functional feature
   - Third sentence states what makes it special or who it is for
   - No storytelling. No poetic language. No fluff.

2. Features section (bullet points):
   - Label: "Features:"
   - First bullet: fit guidance (runs true to size, size up recommended)
   - Remaining bullets: specific material with measurements where visible
     (e.g. "1.2-1.3mm Vintage Naked Cowhide Leather" not just "leather")
   - Hardware brand names where visible (YKK zippers, not just "zippers")
   - Every functional feature as its own bullet (pockets, lining, collar,
     cuffs, back details, vents, closures, panels)
   - Specific color names for each panel or detail
   - Lining material and color if visible
   - Never guess — if a detail is not clearly visible, leave it out

3. Gifting section (bullet points, 3 bullets minimum):
   - First bullet: seasonal occasion gift (winter, holiday, christmas)
   - Second bullet: holiday list (Thanksgiving, Black Friday, Christmas,
     New Year, Valentine's Day, Father's Day — pick what fits the product)
   - Third bullet: recipient list (Men, Boys, Husband, Son, Father, Dad,
     Best Friend, Boyfriend — or female equivalents if womens product)

DESCRIPTION RULES:
- Minimum 150 words, maximum 280 words
- Primary keyword must appear naturally in first sentence
- Zero guessing language (no "appears to be", "seems", "possibly")
- Zero buzzwords (no "stunning", "amazing", "game-changing", "premium",
  "luxury", "high quality", "beautiful", "gorgeous", "perfect")
- Zero storytelling or poetic language
- Write as a real seller who made this product and knows every detail
- Must pass AI detection — write naturally, vary sentence length

STEP 5 — WRITE THE TAGS

TAG RULES — FOLLOW EXACTLY AND WITHOUT EXCEPTION:

- Generate exactly 13 tags
- HARD LIMIT: every single tag must be 20 characters or less including spaces
- Count every character including spaces before finalising each tag
- If a tag is 21 characters or more — shorten it, no exceptions
- Tags must NOT repeat phrases already used in the title
- Tags must NOT repeat words across each other — spread coverage wide
- Each tag must be a real phrase buyers actually type into Etsy search
- Mix of tag types required:
  * 3 tags: material + product type ("lambskin biker jacket" = 20 chars ✓)
  * 3 tags: style or feature ("motorcycle jacket" = 17 chars ✓)
  * 3 tags: gifting phrases ("gift for him" = 12 chars ✓)
  * 2 tags: occasion ("christmas gift men" = 18 chars ✓)
  * 2 tags: buyer intent ("mens leather coat" = 17 chars ✓)

CHARACTER COUNT CHECK — verify every tag before including:
"leather bomber jacket" = 21 chars ✗ TOO LONG — use "leather bomber" = 14 ✓
"mens leather jacket" = 19 chars ✓
"motorcycle jacket" = 17 chars ✓
"lambskin biker jacket" = 21 chars ✗ TOO LONG — use "lambskin jacket" = 15 ✓
"gift for husband" = 16 chars ✓
"christmas gift men" = 18 chars ✓
"leather jacket gift" = 19 chars ✓
"vintage biker coat" = 18 chars ✓
"cowhide moto jacket" = 19 chars ✓
"mens leather coat" = 17 chars ✓
"biker jacket men" = 16 chars ✓
"cafe racer jacket" = 17 chars ✓
"gift for him" = 12 chars ✓

BEFORE FINALISING TAGS:
Count every character of every tag.
If any tag exceeds 20 characters, shorten it immediately.
This rule has zero exceptions.

STEP 6 — FILL MATERIALS AND ATTRIBUTES

MATERIALS:
- List every visible material, comma separated, specific names
- Example: "Lambskin Leather, Satin Lining, Ribbed Cotton Cuffs, YKK Zipper"
- Never write just "leather" — always specify the type

ATTRIBUTES:
- color: specific color name of main body (e.g. "Midnight Black")
- style: jacket style type (e.g. "Bomber", "Biker", "Moto", "Racer")
- occasion: best fit from visible product (e.g. "Casual, Motorcycle Riding")
- material: primary material only (e.g. "Lambskin Leather")
- closure: closure type visible (e.g. "Full Zip", "Asymmetric Zip")
- lining: lining if visible (e.g. "Satin", "Shearling", "Quilted")

RESPOND IN THIS EXACT JSON FORMAT:
{
  "title": "title here — 80 to 120 chars, pipe separated",
  "description": "full description here following template structure",
  "tags": ["tag1","tag2","tag3","tag4","tag5","tag6","tag7",
           "tag8","tag9","tag10","tag11","tag12","tag13"],
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

Return ONLY valid JSON. No preamble. No explanation. No markdown fences.
Every tag must be 20 characters or less — verify before returning.`;

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
