"use client";

import { useRef, useState } from "react";
import ResultsPanel from "@/components/ResultsPanel";
import { GeneratedListing, PriceResearchResult } from "@/lib/types";

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp"];
const ACCEPTED_EXTENSIONS = "JPG, PNG, or WEBP";
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;

interface UploadedImage {
  file: File;
  previewUrl: string;
  base64: string;
  mediaType: string;
}

interface CategorySuggestion {
  category: string;
  confidence: "high" | "medium" | "low";
  reason: string;
}

const CONFIDENCE_DOT_COLORS: Record<CategorySuggestion["confidence"], string> = {
  high: "bg-emerald-500",
  medium: "bg-amber-500",
  low: "bg-stone-400",
};

function fileToBase64(file: File): Promise<{ data: string; mediaType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== "string") {
        reject(new Error("Could not read file."));
        return;
      }
      const [meta, data] = result.split(",");
      const mediaTypeMatch = /data:(.*);base64/.exec(meta);
      if (!data || !mediaTypeMatch) {
        reject(new Error("Could not read file."));
        return;
      }
      resolve({ data, mediaType: mediaTypeMatch[1] });
    };
    reader.onerror = () => reject(new Error("Could not read file."));
    reader.readAsDataURL(file);
  });
}

function formatBytes(bytes: number): string {
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const textareaClasses =
  "w-full resize-none rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 " +
  "placeholder:text-stone-400 shadow-sm transition focus:border-amber-400 focus:outline-none " +
  "focus:ring-2 focus:ring-amber-200";

interface PhotoToListingProps {
  onCreditsUsed?: (amount: number) => void;
  creditsAvailable?: number;
}

export default function PhotoToListing({ onCreditsUsed, creditsAvailable = Infinity }: PhotoToListingProps = {}) {
  const [image, setImage] = useState<UploadedImage | null>(null);
  const [details, setDetails] = useState("");
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [listing, setListing] = useState<GeneratedListing | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [priceResult, setPriceResult] = useState<PriceResearchResult | null>(null);
  const [isPriceLoading, setIsPriceLoading] = useState(false);
  const [categorySuggestions, setCategorySuggestions] = useState<CategorySuggestion[]>([]);
  const [isCategoryLoading, setIsCategoryLoading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchCategorySuggestions = async (base64: string, mediaType: string) => {
    setIsCategoryLoading(true);
    setCategorySuggestions([]);
    setSelectedCategory(null);
    try {
      const res = await fetch("/api/suggest-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType: mediaType }),
      });
      const data = await res.json();
      if (res.ok && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        setCategorySuggestions(data.suggestions);
        setSelectedCategory(data.suggestions[0].category);
      }
    } catch {
      // silently suppress — category section just won't render
    } finally {
      setIsCategoryLoading(false);
    }
  };

  const fetchPrice = async (forListing: GeneratedListing) => {
    setIsPriceLoading(true);
    setPriceResult(null);
    const productName = forListing.title.split(/[|–—]/)[0].trim().slice(0, 80);
    try {
      const res = await fetch("/api/price-research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productName, category: selectedCategory || "Other", partOfGeneration: true }),
      });
      const data = await res.json();
      if (res.ok) setPriceResult(data as PriceResearchResult);
    } catch {
      // silently suppress — price section just won't render
    } finally {
      setIsPriceLoading(false);
    }
  };

  const acceptFile = async (file: File) => {
    setUploadError(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError(`Please upload a ${ACCEPTED_EXTENSIONS} image.`);
      return;
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      setUploadError(`That file is ${formatBytes(file.size)} — please upload an image under 5 MB.`);
      return;
    }

    try {
      const { data, mediaType } = await fileToBase64(file);
      setImage((prev) => {
        if (prev) URL.revokeObjectURL(prev.previewUrl);
        return { file, previewUrl: URL.createObjectURL(file), base64: data, mediaType };
      });
      setListing(null);
      setError(null);
      fetchCategorySuggestions(data, mediaType);
    } catch {
      setUploadError("Couldn't read that file. Please try a different image.");
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) acceptFile(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) acceptFile(file);
  };

  const handleRemoveImage = () => {
    setImage((prev) => {
      if (prev) URL.revokeObjectURL(prev.previewUrl);
      return null;
    });
    setListing(null);
    setError(null);
    setCategorySuggestions([]);
    setSelectedCategory(null);
    setIsCategoryLoading(false);
  };

  const generate = async (weakAreas?: string[]) => {
    if (!image) return;

    setIsGenerating(true);
    setListing(null);
    setError(null);
    setPriceResult(null);
    setIsPriceLoading(false);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "photo",
          image: image.base64,
          mediaType: image.mediaType,
          details,
          withPriceResearch: true,
          ...(selectedCategory ? { selectedCategory } : {}),
          ...(weakAreas?.length ? { weakAreas } : {}),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.error || "Failed to generate listing.");
      }

      const newListing = { title: data.title, description: data.description, tags: data.tags };
      setListing(newListing);
      onCreditsUsed?.(3);
      fetchPrice(newListing);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
      <div className="rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-8">
        <div className="mb-6">
          <h2 className="text-lg font-semibold text-stone-900">Upload a product photo</h2>
          <p className="mt-1 text-sm text-stone-500">
            We&apos;ll examine your photo and write an SEO-ready title, description, and tags based
            on exactly what we see.
          </p>
        </div>

        {!image ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            className={`flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed
              px-6 py-12 text-center transition ${
                isDragging ? "border-amber-400 bg-amber-50" : "border-amber-200 bg-amber-50/40"
              }`}
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14M14 8h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-stone-700">Drag and drop a photo here</p>
            <p className="text-xs text-stone-400">or</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-lg border border-amber-300 bg-white
                px-4 py-2 text-sm font-medium text-amber-700 shadow-sm transition hover:bg-amber-50"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h3.172a2 2 0 011.414.586l1.828 1.828A2 2 0 0014.828 8H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              </svg>
              Choose a photo
            </button>
            <p className="text-xs text-stone-400">{ACCEPTED_EXTENSIONS} — up to 5MB</p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="overflow-hidden rounded-xl border border-amber-100 bg-stone-50">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={image.previewUrl}
                alt="Uploaded product preview"
                className="max-h-80 w-full object-contain"
              />
            </div>
            <div className="flex items-center justify-between gap-3 text-xs text-stone-500">
              <span className="truncate">
                {image.file.name} · {formatBytes(image.file.size)}
              </span>
              <div className="flex shrink-0 items-center gap-3">
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="font-medium text-amber-700 transition hover:text-amber-800"
                >
                  Change photo
                </button>
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="font-medium text-stone-500 transition hover:text-red-600"
                >
                  Remove
                </button>
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED_TYPES.join(",")}
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        )}

        {uploadError && <p className="mt-3 text-sm text-red-600">{uploadError}</p>}

        {image && (isCategoryLoading || categorySuggestions.length > 0) && (
          <div className="mt-4 animate-fade-in-fast">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-stone-500">
              Suggested Etsy Category
            </p>
            {isCategoryLoading ? (
              <div className="flex items-center gap-2 text-sm text-stone-400">
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                  />
                </svg>
                Analyzing your product...
              </div>
            ) : (
              <>
                <div className="flex flex-wrap gap-2">
                  {categorySuggestions.map((suggestion) => {
                    const isSelected = suggestion.category === selectedCategory;
                    return (
                      <button
                        key={suggestion.category}
                        type="button"
                        title={suggestion.reason}
                        onClick={() => setSelectedCategory(suggestion.category)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium
                          transition ${
                            isSelected
                              ? "border-orange-500 bg-orange-500 text-white"
                              : "border-stone-200 bg-white text-stone-600 hover:border-stone-300"
                          }`}
                      >
                        {isSelected && <span>✓</span>}
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${CONFIDENCE_DOT_COLORS[suggestion.confidence]}`}
                        />
                        {suggestion.category}
                      </button>
                    );
                  })}
                </div>
                <p className="mt-1.5 text-xs text-stone-400">
                  Based on your photo · Click to change category
                </p>
              </>
            )}
          </div>
        )}

        <div className="mt-6">
          <label htmlFor="details" className="mb-1.5 block text-sm font-medium text-stone-700">
            Add details <span className="font-normal text-stone-400">(optional)</span>
          </label>
          <textarea
            id="details"
            rows={3}
            placeholder={'e.g. "it\'s handmade", "size is A4", "scented with vanilla"'}
            className={textareaClasses}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
          />
          <p className="mt-1.5 text-xs text-stone-400">
            Add anything the photo can&apos;t show — materials, size, scent, and so on.
          </p>
        </div>

        <button
          type="button"
          onClick={() => generate()}
          disabled={!image || isGenerating || creditsAvailable < 3}
          className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r
            from-amber-500 to-orange-500 px-6 py-3 text-sm font-semibold text-white shadow-md
            shadow-amber-500/20 transition hover:from-amber-600 hover:to-orange-600
            disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isGenerating ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              Analyzing photo…
            </>
          ) : (
            <>
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate Listing from Photo
            </>
          )}
        </button>

        {creditsAvailable < 3 && creditsAvailable !== Infinity && (
          <p className="mt-3 text-sm text-red-600">
            You need at least 3 credits to generate a listing.
          </p>
        )}

        <div className="mt-3 flex items-center justify-between">
          <p className="text-xs text-stone-400">
            Uses <span className="font-semibold text-amber-600">3 credits</span> — listing + price research + health score
          </p>
        </div>

        <p className="mt-3 rounded-lg border border-amber-100 bg-amber-50/70 px-4 py-3 text-xs
          text-amber-800 sm:text-sm">
          <span className="font-semibold">Tip:</span> Use a clear, well-lit photo that shows the
          whole product — Claude writes the listing purely from what it can see (plus any details
          you add).
        </p>
      </div>

      <div>
        <ResultsPanel
          listing={listing}
          isGenerating={isGenerating}
          error={error}
          onRegenerate={image ? () => generate() : undefined}
          onFix={image ? (wa) => generate(wa) : undefined}
          priceResult={priceResult}
          isPriceLoading={isPriceLoading}
        />
      </div>
    </div>
  );
}
