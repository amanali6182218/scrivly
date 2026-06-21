export const PRODUCT_CATEGORIES = [
  "Jewelry",
  "Home Decor",
  "Art Prints",
  "Clothing",
  "Digital Downloads",
  "Stickers",
  "Candles",
  "Other",
] as const;

export type ProductCategory = (typeof PRODUCT_CATEGORIES)[number];

export interface ListingFormValues {
  productName: string;
  category: ProductCategory;
  keyFeatures: string;
  targetBuyer: string;
  price: string;
}

export interface IdentifiedMaterials {
  primary?: string;
  secondary?: string;
  finish?: string;
  construction?: string;
}

export interface ListingAttributes {
  color?: string;
  style?: string;
  occasion?: string;
  material?: string;
  closure?: string;
  lining?: string;
}

export interface GeneratedListing {
  title: string;
  description: string;
  tags: string[];
  primarySearchPhrase?: string;
  identifiedMaterials?: IdentifiedMaterials;
  materials?: string;
  attributes?: ListingAttributes;
}

export type MarketDemand = "low" | "medium" | "high";

export interface SpyResult {
  competitorTitle: string;
  competitorPrice: string;
  weaknesses: [string, string, string];
  improvedTitle: string;
  improvedDescription: string;
  improvedTags: string[];
  estimatedMonthlySearches: string;
}

export interface PriceResearchResult {
  suggestedPriceMin: number;
  suggestedPriceMax: number;
  averagePrice: number;
  competitorCount: number;
  pricingTips: string[];
  marketDemand: MarketDemand;
}
