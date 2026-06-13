export const CREDIT_PACKS = {
  starter_pack: {
    name: 'Starter Pack',
    credits: 100,
    bonusCredits: 0,
    totalCredits: 100,
    price: 9,
    priceDisplay: '$9',
    generationsBasic: 33,
    generationsWithResearch: 6,
    variantIdEnv: 'LS_VARIANT_STARTER_PACK',
    popular: false,
    etsy_url: 'https://www.etsy.com/shop/AmanCraftio',
    tier: 'starter',
    features: {
      historyLimit: 10,
      bulkCsvExport: false,
      prioritySupport: false,
      priceResearchCredits: 12,
    },
    highlights: [
      '100 credits',
      '~33 listings without price research',
      '~6 listings with price research',
      'Last 10 generations saved',
      'All core features included',
    ],
  },
  pro_pack: {
    name: 'Pro Pack',
    credits: 250,
    bonusCredits: 0,
    totalCredits: 250,
    price: 19,
    priceDisplay: '$19',
    generationsBasic: 83,
    generationsWithResearch: 16,
    variantIdEnv: 'LS_VARIANT_PRO_PACK',
    popular: true,
    etsy_url: 'https://www.etsy.com/shop/AmanCraftio',
    tier: 'pro',
    features: {
      historyLimit: 50,
      bulkCsvExport: true,
      prioritySupport: false,
      priceResearchCredits: 12,
    },
    highlights: [
      '250 credits',
      '~83 listings without price research',
      '~16 listings with price research',
      'Last 50 generations saved',
      'Bulk CSV export',
      'All core features included',
    ],
  },
  power_pack: {
    name: 'Power Seller Pack',
    credits: 500,
    bonusCredits: 50,
    totalCredits: 550,
    price: 35,
    priceDisplay: '$35',
    generationsBasic: 183,
    generationsWithResearch: 36,
    variantIdEnv: 'LS_VARIANT_POWER_PACK',
    popular: false,
    etsy_url: 'https://www.etsy.com/shop/AmanCraftio',
    tier: 'power',
    features: {
      historyLimit: null, // null = unlimited
      bulkCsvExport: true,
      prioritySupport: true,
      priceResearchCredits: 10, // Power gets discount
    },
    highlights: [
      '500 + 50 bonus = 550 credits',
      '~183 listings without price research',
      '~36 listings with price research',
      'Unlimited generation history',
      'Bulk CSV export',
      'Priority support (4hr response)',
      'Price research: 10 credits (save 2)',
    ],
  },
}

export const CREDIT_COSTS = {
  full_generation: 3,
  price_research_starter: 12,
  price_research_pro: 12,
  price_research_power: 10,
  full_generation_with_research_starter: 15,
  full_generation_with_research_pro: 15,
  full_generation_with_research_power: 13,
  spy_improve: 6,
  fix_weak_areas: 2,
  category_suggestion: 0,
}

// Returns the price research cost (credits) for a given pack tier.
export function getPriceResearchCost(packTier) {
  return packTier === 'power' ? CREDIT_COSTS.price_research_power : CREDIT_COSTS.price_research_starter
}

// Returns the generation history limit for a given pack tier (null = unlimited).
export function getHistoryLimit(packTier) {
  const pack = Object.values(CREDIT_PACKS).find((p) => p.tier === packTier)
  return pack ? pack.features.historyLimit : 10
}

// Returns whether a given pack tier has access to bulk CSV export.
export function hasBulkCsvExport(packTier) {
  const pack = Object.values(CREDIT_PACKS).find((p) => p.tier === packTier)
  return pack ? pack.features.bulkCsvExport : false
}

export const TIER_RANK = {
  none: 0,
  starter: 1,
  pro: 2,
  power: 3,
}

// Returns the higher-ranked of two pack tiers (used for highest_pack_tier tracking).
export function getHigherTier(tierA, tierB) {
  const rankA = TIER_RANK[tierA] ?? 0
  const rankB = TIER_RANK[tierB] ?? 0
  return rankA >= rankB ? tierA : tierB
}
