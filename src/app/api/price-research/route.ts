import { NextResponse } from "next/server";
import { MarketDemand, PriceResearchResult } from "@/lib/types";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient: createServerSupabaseClient } = require("@/lib/supabase/server");
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createAdminClient } = require("@/lib/supabase/admin");

export const runtime = "nodejs";

const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";
const ANTHROPIC_MODEL = "claude-sonnet-4-6";
const ANTHROPIC_VERSION = "2023-06-01";
const MARKET_DEMAND_VALUES: MarketDemand[] = ["low", "medium", "high"];

interface PriceResearchRequestBody {
  productName?: string;
  category?: string;
}

function buildPrompt(productName: string, category: string): string {
  return `You are an Etsy market research analyst. Use web search to research current pricing for
listings similar to this product:

Product name: ${productName}
Category: ${category}

Search Etsy (and any other sources you find useful) for active listings of similar handmade or
small-shop products in this category. Look at how sellers price comparable items, and use that to
build a realistic price recommendation.

Once you've gathered enough information, respond with ONLY a JSON object (no markdown fences, no
extra commentary, nothing before or after it) in exactly this shape:
{
  "suggestedPriceMin": <number, lowest reasonable price in USD>,
  "suggestedPriceMax": <number, highest reasonable price in USD>,
  "averagePrice": <number, typical/average price in USD across similar listings>,
  "competitorCount": <integer, how many similar listings you found and analyzed>,
  "pricingTips": [<string>, <string>, <string>] (exactly 3 short, specific pricing tips for this product),
  "marketDemand": <"low" | "medium" | "high", how much buyer demand this category/product seems to have>
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

function isPriceResearchResult(value: unknown): value is PriceResearchResult {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.suggestedPriceMin === "number" &&
    typeof candidate.suggestedPriceMax === "number" &&
    typeof candidate.averagePrice === "number" &&
    typeof candidate.competitorCount === "number" &&
    Array.isArray(candidate.pricingTips) &&
    candidate.pricingTips.every((tip) => typeof tip === "string") &&
    typeof candidate.marketDemand === "string" &&
    MARKET_DEMAND_VALUES.includes(candidate.marketDemand as MarketDemand)
  );
}

async function checkAuthUser(): Promise<{ userId: string } | NextResponse> {
  const supabase = createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return { userId: user.id };
}

async function deductCredits(userId: string, amount: number, description: string): Promise<NextResponse | null> {
  const admin = createAdminClient();
  const { data: profile } = await admin.from("profiles").select("credits").eq("id", userId).single();
  if (!profile || profile.credits < amount) {
    return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
  }
  const newBalance = profile.credits - amount;
  await admin.from("profiles").update({ credits: newBalance, updated_at: new Date().toISOString() }).eq("id", userId);
  await admin.from("credit_transactions").insert({ user_id: userId, type: "usage", amount: -amount, description });
  return null;
}

export async function POST(request: Request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Server is missing ANTHROPIC_API_KEY. Add it to .env.local and restart the dev server." },
      { status: 500 }
    );
  }

  let body: PriceResearchRequestBody & { partOfGeneration?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const authResult = await checkAuthUser();
  if ("error" in authResult && authResult instanceof NextResponse) return authResult;
  const { userId } = authResult as { userId: string };

  // When called as part of a full generation (credits already deducted there), skip deduction.
  // When called standalone, charge 4 credits.
  if (!body.partOfGeneration) {
    const deductErr = await deductCredits(userId, 4, "Price research");
    if (deductErr) return deductErr;
  }

  const productName = (body.productName ?? "").trim();
  const category = (body.category ?? "").trim();

  if (!productName || !category) {
    return NextResponse.json(
      { error: "productName and category are required." },
      { status: 400 }
    );
  }

  const prompt = buildPrompt(productName, category);

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
        messages: [{ role: "user", content: prompt }],
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

  if (!isPriceResearchResult(parsed)) {
    return NextResponse.json({ error: "Model response JSON was missing expected fields." }, { status: 502 });
  }

  return NextResponse.json(parsed);
}
