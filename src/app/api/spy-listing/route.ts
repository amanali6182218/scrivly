import { NextResponse } from "next/server";
import { SpyResult } from "@/lib/types";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient: createServerSupabaseClient } = require("@/lib/supabase/server");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createAdminClient } = require("@/lib/supabase/admin");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getHistoryLimit, CREDIT_COSTS } = require("@/lib/plans");

export const runtime = "nodejs";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";

function buildPrompt(url: string): string {
  return `You are an expert Etsy SEO analyst. A seller wants you to analyze a competitor's listing and produce a better version.

The competitor's listing URL is: ${url}

Use web search to fetch and read that Etsy listing page. Extract:
- The listing title (exact text)
- The price shown on the page
- The full description text
- Any tags or keywords visible on the page

Then perform your analysis:

STEP 1 — IDENTIFY WEAKNESSES
Find exactly 3 specific weaknesses in their listing. Look for things like:
- Title doesn't lead with the strongest keyword
- Title wastes characters on filler words
- Description buries key selling points or misses them entirely
- Description doesn't address buyer needs or emotions
- Tags are too broad, too narrow, duplicated, or miss high-traffic terms
- Missing social proof, materials, dimensions, or use cases
- Generic language that applies to any product (not specific to theirs)

STEP 2 — GENERATE A BETTER LISTING
Write a superior version of their listing. Write it the way a real Etsy seller would — conversational, using "I"/"we", like you're talking to a buyer, not like a brand or an ad. Sound like Etsy, not Amazon or Shopify. Avoid corporate marketing phrases (e.g. "superior quality", "premium craftsmanship", "meticulously crafted", "elevate your style") — if a sentence could appear on a mass-market retail page, rewrite it.
- TITLE: Use the same core product keywords but improve structure. Put the strongest search term first. Maximum 140 characters. Do not just rephrase — make it genuinely more searchable.
- DESCRIPTION: Write 300-450 words in short, conversational paragraphs (max 2 sentences each). Fix the weaknesses you identified. Repeat the primary search phrase naturally 3 times across the description. Include a gifting angle. Address buyer emotions and needs. Be specific about materials, dimensions, and use cases.
- TAGS: Write exactly 13 tags, each under 20 characters, in Etsy search format. Include tags the competitor missed. Mix broad terms (e.g. "gift for her") with specific long-tail terms (e.g. "gold leaf earrings"). Think about what buyers type when they don't know the seller's brand name.

STEP 3 — ESTIMATE SEARCH VOLUME
Give a rough estimate of monthly Etsy searches for the main keyword (e.g. "~2,000–5,000/mo" or "~10,000+/mo"). This is an educated estimate based on the category and keyword competitiveness — make it useful, not just "unknown".

Respond with ONLY a JSON object (no markdown fences, no extra commentary, nothing before or after it) in exactly this shape:
{
  "competitorTitle": "<exact title from their listing>",
  "competitorPrice": "<price as shown, e.g. '$24.99' or 'From $18.00'>",
  "weaknesses": ["<weakness 1>", "<weakness 2>", "<weakness 3>"],
  "improvedTitle": "<your improved title, ≤140 chars>",
  "improvedDescription": "<your improved description, 400-600 words>",
  "improvedTags": ["<tag1>", "<tag2>", ..., "<tag13>"],
  "estimatedMonthlySearches": "<estimate string, e.g. '~3,000–8,000/mo'>"
}`;
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

function isSpyResult(value: unknown): value is SpyResult {
  if (!value || typeof value !== "object") return false;
  const c = value as Record<string, unknown>;
  return (
    typeof c.competitorTitle === "string" &&
    typeof c.competitorPrice === "string" &&
    Array.isArray(c.weaknesses) &&
    c.weaknesses.length === 3 &&
    c.weaknesses.every((w) => typeof w === "string") &&
    typeof c.improvedTitle === "string" &&
    typeof c.improvedDescription === "string" &&
    Array.isArray(c.improvedTags) &&
    c.improvedTags.every((t) => typeof t === "string") &&
    typeof c.estimatedMonthlySearches === "string"
  );
}

function isEtsyListingUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return (
      (parsed.hostname === "www.etsy.com" || parsed.hostname === "etsy.com") &&
      /^\/listing\/\d+/.test(parsed.pathname)
    );
  } catch {
    return false;
  }
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

  const authResult = await checkAuthAndDeductCredit("Competitor spy analysis", CREDIT_COSTS.spy_improve);
  if (authResult instanceof NextResponse) return authResult;
  const { userId, packTier } = authResult;

  let body: { url?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const url = typeof body.url === "string" ? body.url.trim() : "";
  if (!url) {
    return NextResponse.json({ error: "A listing URL is required." }, { status: 400 });
  }
  if (!isEtsyListingUrl(url)) {
    return NextResponse.json(
      { error: "Please enter a valid Etsy listing URL (e.g. https://www.etsy.com/listing/123456789/...)." },
      { status: 400 }
    );
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
        max_tokens: 4096,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: buildPrompt(url) }],
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
  const textBlocks: string[] = (payload?.content ?? [])
    .filter((block: { type?: string }) => block?.type === "text")
    .map((block: { text?: string }) => block?.text ?? "");
  const rawText = textBlocks.join("\n").trim();

  if (!rawText) {
    return NextResponse.json({ error: "Model response did not contain any text." }, { status: 502 });
  }

  let parsed: unknown;
  try {
    parsed = extractJson(rawText);
  } catch {
    return NextResponse.json({ error: "Could not parse JSON from the model response." }, { status: 502 });
  }

  if (!isSpyResult(parsed)) {
    return NextResponse.json({ error: "Model response JSON was missing expected fields." }, { status: 502 });
  }

  await recordGenerationHistory(userId, packTier, {
    generation_type: "spy_improve",
    generated_title: parsed.improvedTitle,
    generated_description: parsed.improvedDescription,
    generated_tags: parsed.improvedTags,
    credits_used: CREDIT_COSTS.spy_improve,
    included_price_research: false,
    input_details: url,
  });

  return NextResponse.json(parsed);
}
