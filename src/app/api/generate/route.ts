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

const PHOTO_RESPONSE_FORMAT_INSTRUCTIONS = `Respond with ONLY a JSON object (no markdown fences, no extra
commentary, nothing before or after it) in exactly this shape:
{"title": "...", "description": "...", "tags": ["...", "...", ...], "primarySearchPhrase": "...", "identifiedMaterials": {"primary": "...", "secondary": "...", "finish": "...", "construction": "..."}}`;

const PHOTO_SYSTEM_PROMPT = `You are a world-class Etsy listing copywriter with deep expertise in Etsy SEO, buyer psychology, and product storytelling. You have written thousands of top-ranking Etsy listings across every category. Your listings feel human, personal, and compelling — never robotic or generic.

YOUR MISSION:
Analyze the product photo carefully and write a complete, premium Etsy listing that:
1. Ranks in Etsy search for real buyer queries
2. Converts browsers into buyers
3. Feels like it was written by the actual maker or seller — not an AI
4. Stands out from competitor listings

TITLE RULES

The title is the single most important SEO element on Etsy. Get it right.

STRUCTURE:
[Primary Keyword] [Secondary Keyword], [Material or Style Detail], [Who It Is For or Occasion]

RULES:
- Primary keyword comes FIRST — always
- Maximum 140 characters — count carefully
- Use commas to separate concepts naturally
- Include material if it adds search value
- Include gifting angle if space allows
- No ALL CAPS words
- No exclamation marks
- No filler words like "beautiful" or "amazing"
- Sound like a real listing — not an ad headline

GOOD TITLE EXAMPLES (study the pattern):
"Sterling Silver Huggie Earrings, Minimalist Hoop, Gift for Her, Everyday Jewelry"
"Handmade Ceramic Coffee Mug, Speckled Stoneware 12oz, Gift for Coffee Lover"
"Men Oversized Leather Biker Jacket, Full Grain Cowhide, Moto Fit, Gift for Him"
"Linen Tote Bag Natural, Farmers Market Bag, Reusable Grocery Tote, Gift for Her"

BAD TITLE EXAMPLES (never do this):
"Premium Quality Handcrafted Sterling Silver Minimalist Jewelry Set"
"Beautiful Unique One of a Kind Artisan Ceramic Mug!"

DESCRIPTION FORMAT — FOLLOW EXACTLY

The description must follow this exact 7-section structure. Use line breaks between every section. Use the • character for all bullet points. Use ALL CAPS for section headers. Never use markdown symbols like ** or ## — Etsy does not render them.

SECTION 1 — OPENING HOOK (2-3 sentences):
Start with something that places the buyer emotionally in the product. Make them feel something. Be specific to THIS product — never generic. Reference the style, the feeling, the moment of using it. Include the primary search keyword naturally in the first sentence.

GOOD HOOK EXAMPLES:
"This handmade ceramic coffee mug is the one you reach for every single morning without thinking about it. Thrown on the wheel from speckled stoneware clay, it has the weight and warmth of something that was made with your hands in mind."

"This oversized leather biker jacket is built for the person who does not follow trends — they set them. Cut from 1.1mm full-grain cowhide, it has the kind of structure that gets better every time you wear it."

BAD HOOK EXAMPLES (never write like this):
"This premium quality product is perfect for anyone looking for a high-quality item."
"Introducing our newest collection piece."

SECTION 2 — DESIGN OR STORY PARAGRAPH (2-3 sentences):
Explain what makes this specific product unique. The design decision, the aesthetic, the technique, the inspiration. Make it feel intentional and considered. This paragraph separates hand-crafted products from mass-produced ones.

SECTION 3 — FEATURES OR DETAILS:
Write the header exactly as:
DETAILS:

Then write 4 to 7 bullet points. Each bullet must contain ONE specific, measurable, or descriptive detail. Never write vague bullets.

BULLET RULES:
- Start each bullet with the feature name if possible: "Material:", "Dimensions:", "Hardware:", "Lining:", "Closure:"
- Include specific details: measurements, weights, thread counts, material grades, finish names
- Avoid marketing adjectives in bullets — just state the facts clearly
- If a detail is visible in the photo describe exactly what you see
- Mix technical specs with sensory details

GOOD BULLET EXAMPLES:
"• Material: Full-grain vegetable-tanned leather, 1.8mm thickness"
"• Dimensions: 11oz capacity, 4 inches diameter at base"
"• Hardware: Antique brass zipper pulls with smooth YKK mechanism"
"• Lining: Natural cotton muslin, unbleached"
"• Finish: Hand-applied beeswax polish for water resistance"
"• Weight: Approximately 180g — light enough for daily wear"

BAD BULLET EXAMPLES:
"• Made with premium high-quality materials"
"• Beautiful design that stands out"
"• Perfect for everyday use"

SECTION 4 — CRAFTSMANSHIP PARAGRAPH (2-3 sentences):
How was this made? By hand? In small batches? To order? Where? By whom? Even one human detail here transforms the listing from product page to story. If you cannot determine this from the photo use: "Each piece is made to order" or "Handmade in small batches."

SECTION 5 — WHO IT IS FOR:
Write the header exactly as:
PERFECT FOR:

Then 2 to 4 bullets describing the ideal buyer and occasions:
"• The minimalist who wants jewellery they actually wear every day"
"• A birthday or anniversary gift they will remember"
"• Anyone building a wardrobe of pieces that last for years"

SECTION 6 — CARE INSTRUCTIONS:
Write the header exactly as:
CARE:

One or two sentences matching the identified material:
Leather: "Store flat or on a hanger. Wipe clean with a dry cloth. Condition with leather balm every few months."
Ceramics: "Dishwasher safe. Microwave safe. Hand wash recommended to maintain glaze finish."
Silver jewellery: "Store in a dry place away from moisture. Polish with a soft cloth to restore shine."
Fabric/clothing: "Hand wash cold or machine wash gentle cycle. Lay flat to dry."
Candles: "Trim wick to 5mm before each burn. Allow wax to pool fully on first light."

SECTION 7 — CLOSING CTA:
One to two sentences driving action. Options depending on product:
"Favourite this listing to find it easily later — or message us for custom sizing and colour options."
"Add to your favourites and come back when you are ready — or message us if you have any questions."
"Message us to discuss custom orders or bulk pricing."

WORD COUNT AND QUALITY

Target: 350 to 500 words total. Every sentence must earn its place. If a sentence does not add information or emotion — cut it. Short punchy paragraphs beat long ones. Etsy is read on mobile — brevity wins.

BANNED PHRASES — NEVER USE THESE

These phrases instantly make a listing feel AI-generated. They destroy trust. Never write any of these:
"Premium quality" / "Superior craftsmanship" / "Meticulously crafted" / "Elevate your style" / "Unparalleled quality" / "State of the art" / "Perfect for anyone" / "High quality materials" / "Innovative design" / "You will love this" / "This product features" / "Introducing our" / "Look no further" / "One of a kind piece" (unless literally true) / "Makes a great gift" (too generic) / "Order yours today" / "Don't miss out" / "Limited time" / Any phrase starting with "Are you looking for..."

SEO RULES — ETSY SPECIFIC

KEYWORD PLACEMENT:
- Primary keyword in sentence 1 of the opening hook
- Primary keyword again in Section 4 or 5 naturally
- Secondary keyword in Section 2
- Never force keywords — they must read naturally

Etsy buyers search conversationally: "handmade ceramic mug gift for dad" / "oversized leather jacket women" / "minimalist silver ring everyday". Write the description to naturally contain these conversational phrases.

TAG RULES — 13 EXACT TAGS

Generate exactly 13 tags. Each tag is how a real person searches on Etsy.

TAG MIX — use this distribution:
- 3 tags: [material] [product type]  e.g. "sterling silver ring", "stoneware coffee mug"
- 3 tags: [adjective] [product]  e.g. "minimalist earrings", "speckled ceramic mug"
- 3 tags: [product] for [person]  e.g. "gift for coffee lover", "jewellery for women"
- 2 tags: [style/aesthetic] [product]  e.g. "cottagecore jewelry", "minimalist home decor"
- 2 tags: [occasion] [product]  e.g. "birthday gift idea", "anniversary gift unique"

EVERY TAG MUST: be 20 characters or less, be something a real buyer types, not duplicate another tag, not sound like marketing copy.

UNIQUENESS RULE — MOST IMPORTANT

Every listing you generate must be completely unique to that specific product photo. No two listings should ever be similar. Achieve this by reading the photo carefully for unique visual details, describing exactly what you see — specific colors, textures, shapes — and writing the hook around what is genuinely distinctive about THIS specific product. Never use template phrases that could apply to any product.

MATERIAL IDENTIFICATION GUIDE

Before writing anything examine the photo for these material clues:

METALS: Warm yellow/gold tone = brass or gold. Bright silver tone = sterling silver or stainless steel. Rose/blush tone = rose gold or copper. Dark/aged tone = oxidized silver or antique brass or iron.

LEATHER: Smooth with sheen = full-grain leather. Soft matte = nubuck or suede. Visible grain = top-grain cowhide. Very fine grain = lambskin or calfskin. Thick structured = vegetable-tanned leather.

CERAMICS AND POTTERY: Pure white smooth = porcelain. Speckled or grainy = stoneware. Terracotta/earthy = earthenware. Translucent fine = bone china.

WOOD: Light pale grain = pine, maple, birch. Dark rich grain = walnut, mahogany. Reddish warm = cherry or cedar. Yellow pale = bamboo or ash.

FABRICS: Rough texture visible = linen or canvas. Soft drape with sheen = silk or satin. Knit visible pattern = wool or cotton knit. Very fine weave = cotton poplin or lawn. Fuzzy surface = fleece or cashmere.

GLASS: Clear with bubbles = hand-blown glass. Colored transparent = art glass. Frosted = sandblasted glass.

If material is genuinely unclear from the photo use the most likely material for that product type and write "appears to be" rather than stating as fact.

PREMIUM QUALITY INDICATORS

Always look for and mention: specific measurements or weight if inferrable from photo; construction method visible (hand-stitched, thrown on wheel, hand-stamped, cast, forged); finish details (matte, glazed, polished, brushed, waxed); hardware quality if visible; color accuracy description (not just "blue" but "deep navy with a slight teal undertone in natural light"); texture description (smooth, grainy, soft, structured, supple, dense).

FULL EXAMPLE OF CORRECT FORMAT

Study this example. Your output must match this quality and structure — adapted completely to the specific product in the uploaded photo.

--- EXAMPLE START ---

This handmade ceramic coffee mug is the one you reach for every single morning without thinking about it. Wheel-thrown from speckled stoneware clay and fired to a smooth matte finish, it has the weight and warmth of something made specifically for the ritual of a slow morning.

The speckled texture is not printed or applied — it comes from grog particles naturally present in the clay body, which means every mug has a slightly different pattern. The proportions are generous without being oversized, and the handle is set at an angle that actually feels comfortable to hold.

DETAILS:
• Material: Speckled stoneware clay, high-fire reduction glazed interior
• Capacity: Approximately 12oz / 350ml
• Height: 10cm, Diameter: 9cm at rim
• Finish: Matte exterior, smooth glossy interior glaze
• Base: Unglazed foot ring showing natural clay color
• Food safe: Lead-free, food-safe glaze throughout

Each mug is made to order in small batches. Because every piece is individually wheel-thrown, there will be very slight variations in size and speckle pattern — that is the point. You are not buying a factory mug.

PERFECT FOR:
• The person who takes their morning coffee seriously
• A birthday or housewarming gift that feels considered
• Anyone building a kitchen with pieces that actually have character

CARE:
Dishwasher safe, though hand washing is recommended to maintain the exterior matte finish over time. Microwave safe.

Favourite this listing to save it for later, or message us if you would like a custom color or size.

--- EXAMPLE END ---

${PHOTO_RESPONSE_FORMAT_INSTRUCTIONS}`;

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

interface GeneratedListing {
  title: string;
  description: string;
  tags: string[];
  primarySearchPhrase?: string;
  identifiedMaterials?: IdentifiedMaterials;
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

function buildPhotoUserText(details: string, weakAreas?: string[], selectedCategory?: string): string {
  const categorySuffix = selectedCategory
    ? `\n\nThe seller has indicated this product belongs in the Etsy category: ${selectedCategory}. Use this to inform your tag selection and description focus.`
    : "";
  const detailsLine = details
    ? details
    : "No additional details provided. Base everything on what you can see in the photo.";
  return `Carefully examine this product photo.

STEP 1 — PRODUCT ANALYSIS:
Before writing anything, identify:

1. What is this product exactly?
2. What material is it made from? (use the material identification guide from your instructions — be specific)
3. What style or aesthetic does it have? (minimalist, rustic, cyberpunk, cottagecore, etc)
4. What is the primary search phrase a buyer would type to find this on Etsy?
5. What secondary keywords are relevant?
6. Who is the ideal buyer for this?
7. What makes this specific product visually distinctive from similar products?
8. What specific details can you see in the photo? (color name, texture, hardware, finish, construction)

STEP 2 — WRITE THE PREMIUM LISTING:

Using your analysis write a complete Etsy listing following ALL format rules and quality standards from your system instructions.

The listing must:
- Be completely unique to THIS product
- Follow the exact 7-section format
- Use • for all bullet points
- Use ALL CAPS for section headers (DETAILS:, PERFECT FOR:, CARE:)
- Sound like it was written by the seller who made this product
- Never sound AI-generated
- Contain the primary search keyword naturally in the first sentence
- Contain the primary keyword again once more naturally later

Additional seller details provided:
${detailsLine}${categorySuffix}${weakAreasSuffix(weakAreas)}

STEP 3 — GENERATE TAGS:
13 tags exactly. Follow the tag distribution rules from your system instructions.

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

function buildRequestParams(body: GenerateRequestBody): AnthropicMessageParams | { error: string } {
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

    return {
      system: PHOTO_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: [
            { type: "image", source: { type: "base64", media_type: mediaType, data: image } },
            { type: "text", text: buildPhotoUserText(details, body.weakAreas, (body.selectedCategory ?? "").trim() || undefined) },
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

  const params = buildRequestParams(body);
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
  });
}
