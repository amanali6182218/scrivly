import { GeneratedListing } from "@/lib/types";

export interface CategoryScore {
  label: string;
  score: number;
  maxScore: number;
  tip: string | null;
}

export interface HealthScore {
  total: number;
  categories: CategoryScore[];
}

const STOP_WORDS = new Set([
  "a", "an", "the", "and", "for", "with", "in", "on", "of", "to", "your",
  "our", "my", "is", "are", "be", "this", "by", "at", "or", "as", "from",
]);

export function scoreListingHealth(listing: GeneratedListing): HealthScore {
  const categories: CategoryScore[] = [];

  // ── 1. Title length (20 pts) ───────────────────────────────────────────
  const tLen = listing.title.length;
  let titleScore: number;
  let titleTip: string | null = null;

  if (tLen > 140) {
    titleScore = 12;
    titleTip = `Title is ${tLen} chars — Etsy truncates at 140; trim it so nothing is cut off.`;
  } else if (tLen >= 120) {
    titleScore = 20;
  } else if (tLen >= 100) {
    titleScore = 13;
    titleTip = `Title is ${tLen} chars — aim for 120–140 to fill all of Etsy's keyword space.`;
  } else if (tLen >= 70) {
    titleScore = 7;
    titleTip = `Title is ${tLen} chars — a longer, keyword-rich title ranks for many more searches.`;
  } else {
    titleScore = 3;
    titleTip = `Title is only ${tLen} chars — expand to 120–140 to capture far more searches.`;
  }
  categories.push({ label: "Title length (120–140 chars)", score: titleScore, maxScore: 20, tip: titleTip });

  // ── 2. Keyword placement (20 pts) ─────────────────────────────────────
  const titleWords = listing.title.split(/\s+/);
  let charPos = 0;
  let firstContentWordPos = Infinity;
  for (const w of titleWords) {
    const clean = w.toLowerCase().replace(/[^a-z]/g, "");
    if (clean.length >= 3 && !STOP_WORDS.has(clean)) {
      firstContentWordPos = charPos;
      break;
    }
    charPos += w.length + 1;
  }
  let kwScore: number;
  let kwTip: string | null = null;
  if (firstContentWordPos < 20) {
    kwScore = 20;
  } else if (firstContentWordPos < 40) {
    kwScore = 12;
    kwTip = "Move the main product keyword even closer to the start — Etsy weights the first words most heavily.";
  } else {
    kwScore = 5;
    kwTip = "Your title buries the main keyword — front-load it so Etsy (and buyers) see it first.";
  }
  categories.push({ label: "Keyword in first 40 characters", score: kwScore, maxScore: 20, tip: kwTip });

  // ── 3. Description length (20 pts) ────────────────────────────────────
  const descWords = listing.description.trim().split(/\s+/).filter(Boolean).length;
  let descScore: number;
  let descTip: string | null = null;
  if (descWords >= 400 && descWords <= 600) {
    descScore = 20;
  } else if (descWords >= 300) {
    descScore = 14;
    descTip = `Description is ${descWords} words — adding more detail (aim 400–600) improves SEO.`;
  } else if (descWords > 600) {
    descScore = 14;
    descTip = `Description is ${descWords} words — Etsy buyers prefer concise copy; trim to 400–600.`;
  } else if (descWords >= 150) {
    descScore = 8;
    descTip = `Description is ${descWords} words — expand to 400–600 to rank for more long-tail searches.`;
  } else {
    descScore = 3;
    descTip = `Description is very short (${descWords} words) — aim for 400–600 to satisfy buyers and Etsy's algorithm.`;
  }
  categories.push({ label: "Description length (400–600 words)", score: descScore, maxScore: 20, tip: descTip });

  // ── 4. Tag count (20 pts) ─────────────────────────────────────────────
  const tagCount = listing.tags.length;
  let tagCountScore: number;
  let tagCountTip: string | null = null;
  if (tagCount === 13) {
    tagCountScore = 20;
  } else if (tagCount >= 10) {
    tagCountScore = 13;
    tagCountTip = `${tagCount}/13 tags used — fill all 13 to maximise search coverage.`;
  } else if (tagCount >= 7) {
    tagCountScore = 7;
    tagCountTip = `Only ${tagCount}/13 tags — every unused slot is a missed ranking opportunity.`;
  } else {
    tagCountScore = 2;
    tagCountTip = `Only ${tagCount}/13 tags — Etsy allows 13; use every slot to maximise discoverability.`;
  }
  categories.push({ label: "All 13 tags filled", score: tagCountScore, maxScore: 20, tip: tagCountTip });

  // ── 5. Tag variety (20 pts) ───────────────────────────────────────────
  const tagLens = listing.tags.map((t) => t.trim().split(/\s+/).filter(Boolean).length);
  const has1 = tagLens.some((l) => l === 1);
  const has2 = tagLens.some((l) => l === 2);
  const has3plus = tagLens.some((l) => l >= 3);
  const varieties = [has1, has2, has3plus].filter(Boolean).length;
  let varietyScore: number;
  let varietyTip: string | null = null;
  if (varieties === 3) {
    varietyScore = 20;
  } else if (varieties === 2) {
    varietyScore = 12;
    if (!has1) varietyTip = "Add a single-word tag (e.g. 'earrings') to capture broad-search traffic.";
    else if (!has2) varietyTip = "Add 2-word phrase tags to balance broad and specific search intent.";
    else varietyTip = "Add a long-tail 3-word tag (e.g. 'gold hoop earrings') for lower-competition traffic.";
  } else {
    varietyScore = 4;
    varietyTip = "Use a mix of 1-word, 2-word, and 3-word tags to reach shoppers at every stage of their search.";
  }
  categories.push({ label: "Tag variety (1, 2 & 3-word mix)", score: varietyScore, maxScore: 20, tip: varietyTip });

  return {
    total: categories.reduce((s, c) => s + c.score, 0),
    categories,
  };
}

export function healthColor(total: number): "green" | "amber" | "red" {
  if (total >= 80) return "green";
  if (total >= 60) return "amber";
  return "red";
}
