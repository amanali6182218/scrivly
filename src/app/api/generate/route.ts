import { NextResponse } from "next/server";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient: createServerSupabaseClient } = require("@/lib/supabase/server");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createAdminClient } = require("@/lib/supabase/admin");

export const runtime = "nodejs";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];

const RESPONSE_FORMAT_INSTRUCTIONS = `Respond with ONLY a JSON object (no markdown fences, no extra
commentary, nothing before or after it) in exactly this shape:
{"title": "...", "description": "...", "tags": ["...", "...", ...]}`;

const PHOTO_SYSTEM_PROMPT = `You are an expert Etsy SEO copywriter and product photo analyst.

When given a product photo, examine it carefully and identify:
- The type of product
- Materials and construction
- Style, colors, and overall aesthetic
- Likely use case
- The kind of buyer who would want it

Then write a complete Etsy listing based on what you observe in the photo (and any extra details
the seller provides). Write three things:
1. TITLE — an SEO-optimized Etsy listing title, maximum 140 characters, with the main keyword first.
2. DESCRIPTION — a full listing description, 400-600 words, written in short paragraphs. Weave in
   keywords naturally, and mention materials, style, and size/dimensions when they're visible in the
   photo or provided by the seller.
3. TAGS — exactly 13 Etsy search tags, each under 20 characters, mixing broad terms (e.g. "gift for her")
   with specific long-tail terms grounded in what the photo shows.

${RESPONSE_FORMAT_INSTRUCTIONS}`;

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

interface GeneratedListing {
  title: string;
  description: string;
  tags: string[];
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
  const base = details
    ? `Here is a photo of the product. The seller also shared these extra details: "${details}".\n\nAnalyze the photo (using the details only to fill in what the photo can't show) and write the listing as instructed.`
    : `Here is a photo of the product. The seller didn't provide any extra details — rely entirely on what you can see in the photo.\n\nAnalyze the photo and write the listing as instructed.`;
  const categorySuffix = selectedCategory
    ? `\n\nThe seller has indicated this product belongs in the Etsy category: ${selectedCategory}. Use this to inform your tag selection and description focus.`
    : "";
  return base + categorySuffix + weakAreasSuffix(weakAreas);
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

async function checkAuthAndDeductCredit(description: string, amount: number): Promise<{ userId: string } | NextResponse> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("credits").eq("id", user.id).single();
  if (!profile || profile.credits < amount) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }

  const newBalance = profile.credits - amount;
  await admin.from("profiles").update({ credits: newBalance, updated_at: new Date().toISOString() }).eq("id", user.id);
  await admin.from("credit_transactions").insert({ user_id: user.id, type: "usage", amount: -amount, description });

  return { userId: user.id };
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  // Parse body first so we know how many credits to charge
  let body: GenerateRequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  // 10 credits when price research is bundled in, 6 for basic generation
  const withPriceResearch = !!(body as GenerateRequestBody & { withPriceResearch?: boolean }).withPriceResearch;
  const creditAmount = withPriceResearch ? 10 : 6;
  const creditDescription = withPriceResearch ? "Full listing generation" : "Basic listing generation";

  const authResult = await checkAuthAndDeductCredit(creditDescription, creditAmount);
  if (authResult instanceof NextResponse) return authResult;

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

  return NextResponse.json({
    title: parsed.title,
    description: parsed.description,
    tags: parsed.tags,
  });
}
