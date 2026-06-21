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

// Real, deterministic point calculation — title 30 / description 25 / tags 25 /
// materials 10 / attributes 10. Recomputes live from whatever is currently in
// the listing, so editing any field immediately moves the score.
export function scoreListingHealth(listing: GeneratedListing): HealthScore {
  const categories: CategoryScore[] = [];

  // ── 1. Title length (30 pts) ───────────────────────────────────────────
  const titleLength = (listing.title || "").length;
  let titleScore = 0;
  let titleTip: string | null = null;

  if (titleLength >= 100 && titleLength <= 140) {
    titleScore = 30;
  } else if (titleLength >= 80 && titleLength < 100) {
    titleScore = 20;
    titleTip = `Title is ${titleLength} chars — expand to 100–140 to stack more keywords.`;
  } else if (titleLength >= 50 && titleLength < 80) {
    titleScore = 10;
    titleTip = `Title is ${titleLength} chars — aim for 100–140 characters for maximum SEO coverage.`;
  } else if (titleLength > 140) {
    titleTip = `Title is ${titleLength} chars — Etsy truncates at 140; shorten it so nothing is cut off.`;
  } else {
    titleTip = `Title is only ${titleLength} chars — expand to 100–140 characters.`;
  }
  categories.push({ label: "Title length (100–140 chars)", score: titleScore, maxScore: 30, tip: titleTip });

  // ── 2. Description length (25 pts) ────────────────────────────────────
  const wordCount = (listing.description || "").split(/\s+/).filter(Boolean).length;
  let descScore = 0;
  let descTip: string | null = null;

  if (wordCount >= 150) {
    descScore = 25;
  } else if (wordCount >= 100) {
    descScore = 15;
    descTip = `Description is ${wordCount} words — add more detail to reach 150+ words.`;
  } else if (wordCount >= 50) {
    descScore = 8;
    descTip = `Description is ${wordCount} words — expand to at least 150 words.`;
  } else {
    descTip = `Description is very short (${wordCount} words) — aim for 150–300 words.`;
  }
  categories.push({ label: "Description length (150+ words)", score: descScore, maxScore: 25, tip: descTip });

  // ── 3. Tags (25 pts) ───────────────────────────────────────────────────
  const tags = listing.tags || [];
  const validTags = tags.filter((t) => t.length <= 20 && t.length > 0);
  let tagsScore = 0;
  let tagsTip: string | null = null;

  if (validTags.length === 13) {
    tagsScore = 25;
  } else if (validTags.length >= 10) {
    tagsScore = 15;
    tagsTip = `${validTags.length}/13 valid tags — fill all 13 to maximize search coverage.`;
  } else if (validTags.length >= 5) {
    tagsScore = 8;
    tagsTip = `Only ${validTags.length}/13 valid tags — every unused slot is a missed opportunity.`;
  } else {
    tagsTip = `Only ${validTags.length}/13 valid tags — use all 13 slots, each 20 characters or less.`;
  }
  categories.push({ label: "All 13 tags filled (≤20 chars)", score: tagsScore, maxScore: 25, tip: tagsTip });

  // ── 4. Materials filled (10 pts) ───────────────────────────────────────
  const materials = (listing.materials || "").trim();
  const materialsScore = materials.length > 3 ? 10 : 0;
  const materialsTip = materialsScore === 0
    ? `No materials identified — list the specific materials used (e.g. "cowhide leather, brass hardware").`
    : null;
  categories.push({ label: "Materials identified", score: materialsScore, maxScore: 10, tip: materialsTip });

  // ── 5. Attributes filled (10 pts — 2 each) ─────────────────────────────
  const attrs = listing.attributes || {};
  const ATTRIBUTE_FIELDS: Array<{ key: keyof typeof attrs; label: string }> = [
    { key: "color", label: "color" },
    { key: "style", label: "style" },
    { key: "occasion", label: "occasion" },
    { key: "material", label: "material" },
    { key: "closure", label: "closure" },
  ];
  const missingAttrs = ATTRIBUTE_FIELDS.filter((f) => !(attrs[f.key] || "").trim());
  const attrsScore = (ATTRIBUTE_FIELDS.length - missingAttrs.length) * 2;
  const attrsTip = missingAttrs.length > 0
    ? `${missingAttrs.length} attribute${missingAttrs.length !== 1 ? "s" : ""} missing (${missingAttrs.map((f) => f.label).join(", ")}) — fill in every visible detail.`
    : null;
  categories.push({ label: "Attributes filled (color, style, occasion, material, closure)", score: attrsScore, maxScore: 10, tip: attrsTip });

  return {
    total: Math.min(categories.reduce((s, c) => s + c.score, 0), 100),
    categories,
  };
}

export function healthColor(total: number): "green" | "amber" | "red" {
  if (total >= 80) return "green";
  if (total >= 60) return "amber";
  return "red";
}
