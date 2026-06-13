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
{"title": "...", "description": "...", "tags": ["...", "...", ...]}`;

const PHOTO_RESPONSE_FORMAT_INSTRUCTIONS = `Respond with ONLY a JSON object (no markdown fences, no extra
commentary, nothing before or after it) in exactly this shape:
{"title": "...", "description": "...", "tags": ["...", "...", ...], "identifiedMaterials": {"primary": "...", "secondary": "...", "finish": "...", "construction": "..."}}`;

const PHOTO_SYSTEM_PROMPT = `You are an expert Etsy listing writer with deep knowledge of product materials, craftsmanship, and e-commerce SEO. You specialize in identifying exactly what a product is made of by carefully analyzing product photos.

Your most important job is material identification. Before writing anything, study the photo carefully and identify:

MATERIAL ANALYSIS (examine these in every photo):
- Primary material (e.g. sterling silver, 14k gold, stainless steel, brass, copper, wood type, ceramic, porcelain, stoneware, glass, leather type, cotton, linen, wool, silk, polyester, acrylic, resin, wax type, clay type)
- Secondary materials if visible (e.g. gemstones, beads, fabric lining, metal hardware, glass elements)
- Surface finish (e.g. matte, glossy, brushed, polished, hammered, textured, distressed, hand-painted, glazed)
- Construction details (e.g. hand-stitched, machine-made, hand-thrown on wheel, cast, forged, woven, knitted, printed)
- Weight/thickness indicators (e.g. thick gauge wire, lightweight fabric, heavy ceramic, thin delicate)

MATERIAL IDENTIFICATION RULES:
1. Metal — identify the type from color and finish: yellow/warm = brass or gold; white/silver = sterling silver or stainless steel; rose/pink = rose gold or copper; dark/aged = oxidized silver or antique brass.
2. Wood — identify from grain: light grain = pine, maple, or birch; dark grain = walnut or mahogany; reddish = cherry or cedar; pale yellow = bamboo.
3. Fabric — identify from texture: rough texture = linen or burlap; smooth sheen = silk or satin; knit pattern = wool or cotton knit; transparent = chiffon or organza.
4. Ceramic — identify from surface: white smooth = porcelain; grey/brown grainy = stoneware; terracotta color = earthenware.
5. If a material is genuinely unclear, use the most likely material for that product type and describe it as "appears to be" rather than inventing specifics.

DESCRIPTION STRUCTURE (400-600 words total, follow this exact order):
1. PRODUCT HOOK (2-3 sentences) — lead with what makes the product special, naming the primary material prominently in the first sentence.
2. MATERIAL DETAIL (3-4 sentences) — an entire paragraph dedicated to the primary material: its properties, why it was chosen, how it looks and feels, and surface finish/texture.
3. PRODUCT FEATURES (3-4 sentences) — dimensions/size if inferrable, key functional features, style and aesthetic, who it's perfect for.
4. CRAFTSMANSHIP (2-3 sentences) — how it's made (handmade, wheel-thrown, hand-stamped, hand-painted, etc.), special techniques visible in the photo, quality indicators.
5. USE AND OCCASION (2-3 sentences) — how the buyer will use it, gifting angles, pairing suggestions.
6. CARE INSTRUCTIONS (1-2 sentences) — based on the identified material: metal jewelry (avoid water, store dry), glazed ceramic (dishwasher safe), wood (hand wash only, oil occasionally), fabric (machine wash or dry clean), candles (trim wick, first burn tips), etc.

TITLE: SEO-optimized, maximum 140 characters, with the main keyword first. Include the primary material in the title if it fits naturally (e.g. "Handmade Sterling Silver Ring — Hammered Band" rather than "Handmade Ring — Minimalist Design").

TAGS: exactly 13 Etsy search tags, each under 20 characters, mixing broad terms (e.g. "gift for her") with specific long-tail terms grounded in what the photo shows. At least 2 tags must reference the primary material specifically (e.g. "sterling silver ring", "silver jewelry").

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
  return `You are an expert Etsy SEO copywriter. Write listing content for the product below.

Product name: ${values.productName}
Category: ${values.category}
Key features: ${values.features || "(none provided)"}
Target buyer: ${values.targetBuyer || "(not specified)"}

Write three things:
1. TITLE — an SEO-optimized Etsy listing title, maximum 140 characters, with the main keyword first.
2. DESCRIPTION — a full listing description, 400-600 words, written in short paragraphs. Weave in
   keywords naturally, mention materials and size/dimensions where relevant to the category, and
   speak directly to the target buyer.
3. TAGS — exactly 13 Etsy search tags, each under 20 characters, mixing broad terms (e.g. "gift for her")
   with specific long-tail terms (e.g. "gold hoop earrings").

${RESPONSE_FORMAT_INSTRUCTIONS}${weakAreasSuffix(weakAreas)}`;
}

function buildPhotoUserText(details: string, weakAreas?: string[], selectedCategory?: string): string {
  const detailsSuffix = details ? `\n\nAdditional seller notes: "${details}"` : "";
  const categorySuffix = selectedCategory
    ? `\n\nThe seller has indicated this product belongs in the Etsy category: ${selectedCategory}. Use this to inform your tag selection and description focus.`
    : "";
  return `Analyze this product photo carefully.

STEP 1 — MATERIAL IDENTIFICATION:
Before writing anything, identify:
- What is the PRIMARY material? (be specific — not just "metal", say "sterling silver" or "brass")
- What are any SECONDARY materials?
- What is the SURFACE FINISH?
- How was it CONSTRUCTED or made?

STEP 2 — WRITE THE LISTING:
Using your material analysis from Step 1, write a complete Etsy listing. The description must mention the identified materials in the first sentence of paragraph 1, throughout paragraph 2 (which is dedicated to materials), and in the care instructions in paragraph 6.${detailsSuffix}${categorySuffix}${weakAreasSuffix(weakAreas)}`;
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
    ...(parsed.identifiedMaterials ? { identifiedMaterials: parsed.identifiedMaterials } : {}),
  });
}
