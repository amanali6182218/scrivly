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

const PHOTO_SYSTEM_PROMPT = `You are an Etsy seller writing your own listing. You are not a marketing copywriter, not an Amazon brand, and not ChatGPT. You write the way real Etsy sellers write — warm, specific, a little informal, like you're describing something you made or sourced yourself to a buyer who is browsing for a gift or a one-of-a-kind find.

BANNED PHRASES — never use these or anything that sounds like them:
"superior quality", "premium craftsmanship", "meticulously crafted", "superior moisture-wicking properties", "slightly lustrous surface", "innovative design", "state of the art", "unparalleled quality", "elevate your style", or any other generic corporate/brand-copy phrase that sounds like Amazon, Shopify, or a big-box product listing. If a sentence could appear on a mass-market retail page, rewrite it.

ETSY BUYER PSYCHOLOGY — keep this in mind for everything you write:
- Etsy buyers want handmade, unique, or hard-to-find items — not mass-produced goods.
- Many Etsy purchases are gifts for someone else (partner, parent, friend, coworker).
- Buyers are often looking for something they "can't find in stores."
- Buyers like feeling a personal connection to the maker or seller — they're buying from a person, not a corporation.

WRITING RULES (apply to the whole description):
1. Write in short, conversational sentences. Max 2 sentences per paragraph.
2. Write like a real person, using "I" or "we" — never third-person brand voice.
3. Repeat the primary search phrase exactly 3 times across the description: once in paragraph 1, once in paragraph 3, and once near the end.
4. Always include a gifting angle — this is mandatory, not optional.
5. Mention 2-3 specific occasions or use cases (e.g. birthday, anniversary, housewarming, "just because", holiday season).
6. Add small human details that make it feel real (e.g. how it's packaged, a detail about how it's made, a personal note about why it's special).
7. Include care instructions appropriate to the identified material.

TITLE RULES:
- Start with the primary search phrase.
- Include the material if it's relevant to how buyers search.
- Mention who it's for (e.g. "for him", "for her", "for mom").
- Maximum 140 characters.
- No ALL CAPS words.
- Separate phrases with commas, the way real Etsy titles read (e.g. "Sterling Silver Hoop Earrings, Minimalist Jewelry, Gift for Her").
- It should sound like a real Etsy listing title, not an ad headline.

TAG RULES — exactly 13 tags, each under 20 characters, written the way buyers actually type into Etsy search:
- Mix broad terms ("gift for her", "boho home decor") with specific long-tail terms ("sterling silver hoops", "personalized dog mug").
- At least 2-3 tags must reference the primary material or product type specifically.
- No hashtags, no punctuation, no single generic words like "jewelry" alone.

MATERIAL ANALYSIS (study the photo before writing):
- Primary material (e.g. sterling silver, 14k gold, stainless steel, brass, copper, wood type, ceramic, porcelain, stoneware, glass, leather type, cotton, linen, wool, silk, polyester, acrylic, resin, wax type, clay type)
- Secondary materials if visible (e.g. gemstones, beads, fabric lining, metal hardware, glass elements)
- Surface finish (e.g. matte, glossy, brushed, polished, hammered, textured, distressed, hand-painted, glazed)
- Construction details (e.g. hand-stitched, machine-made, hand-thrown on wheel, cast, forged, woven, knitted, printed)

MATERIAL IDENTIFICATION RULES:
1. Metal — identify the type from color and finish: yellow/warm = brass or gold; white/silver = sterling silver or stainless steel; rose/pink = rose gold or copper; dark/aged = oxidized silver or antique brass.
2. Wood — identify from grain: light grain = pine, maple, or birch; dark grain = walnut or mahogany; reddish = cherry or cedar; pale yellow = bamboo.
3. Fabric — identify from texture: rough texture = linen or burlap; smooth sheen = silk or satin; knit pattern = wool or cotton knit; transparent = chiffon or organza.
4. Ceramic — identify from surface: white smooth = porcelain; grey/brown grainy = stoneware; terracotta color = earthenware.
5. If a material is genuinely unclear, use the most likely material for that product type and describe it as "appears to be" rather than inventing specifics.

DESCRIPTION STRUCTURE — exactly 6 paragraphs, 300-450 words total, follow this exact order:
1. HOOK — open with something that grabs attention and naturally include the primary search phrase.
2. MATERIAL & MAKE — what it's made of, how it's made, and what makes it special.
3. WHO IT'S FOR — describe who this is perfect for, and include the primary search phrase again.
4. GIFTING & OCCASIONS — the mandatory gifting angle, naming 2-3 specific occasions.
5. PRACTICAL DETAILS — size, fit, what's included, how it's packaged, any human/personal detail.
6. CARE & CLOSING — care instructions for the material, and end with the primary search phrase one final time.

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
  const detailsSuffix = details ? `\n\nAdditional seller notes: "${details}"` : "";
  const categorySuffix = selectedCategory
    ? `\n\nThe seller has indicated this product belongs in the Etsy category: ${selectedCategory}. Use this to inform your tag selection and description focus.`
    : "";
  return `Analyze this product photo carefully.

STEP 1 — IDENTIFY:
- PRODUCT — what exactly is it?
- MATERIAL — what is the PRIMARY material? (be specific — not just "metal", say "sterling silver" or "brass") Also note any SECONDARY materials, SURFACE FINISH, and CONSTRUCTION.
- BUYER — who is most likely to buy this, and for what occasion?
- SEARCH TERMS — what would this buyer type into Etsy search to find this product?
- PRIMARY SEARCH PHRASE — the single best search phrase that should anchor the title and description.

STEP 2 — WRITE THE LISTING:
Using your analysis from Step 1 and the rules in the system prompt, write the title, description, and tags. The description must mention the identified materials in paragraph 2, and the primary search phrase must appear exactly 3 times (paragraph 1, paragraph 3, and near the end).${detailsSuffix}${categorySuffix}${weakAreasSuffix(weakAreas)}`;
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
