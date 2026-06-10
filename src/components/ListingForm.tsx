"use client";

import { PRODUCT_CATEGORIES, ListingFormValues } from "@/lib/types";

interface ListingFormProps {
  values: ListingFormValues;
  onChange: (values: ListingFormValues) => void;
  onSubmit: () => void;
  isGenerating: boolean;
}

const inputClasses =
  "w-full rounded-lg border border-amber-200 bg-white px-4 py-2.5 text-sm text-stone-800 " +
  "placeholder:text-stone-400 shadow-sm transition focus:border-amber-400 focus:outline-none " +
  "focus:ring-2 focus:ring-amber-200";

export default function ListingForm({
  values,
  onChange,
  onSubmit,
  isGenerating,
}: ListingFormProps) {
  const update = <K extends keyof ListingFormValues>(key: K, value: ListingFormValues[K]) => {
    onChange({ ...values, [key]: value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-amber-100 bg-white/80 p-5 shadow-sm backdrop-blur-sm sm:p-8"
    >
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-stone-900">Tell us about your product</h2>
        <p className="mt-1 text-sm text-stone-500">
          Fill in a few details and we&apos;ll draft an SEO-friendly title, description, and tags.
        </p>
      </div>

      <div className="space-y-5">
        <div>
          <label htmlFor="productName" className="mb-1.5 block text-sm font-medium text-stone-700">
            Product Name
          </label>
          <input
            id="productName"
            type="text"
            required
            placeholder="e.g. Hand-painted ceramic mug"
            className={inputClasses}
            value={values.productName}
            onChange={(e) => update("productName", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-1.5 block text-sm font-medium text-stone-700">
            Product Category
          </label>
          <select
            id="category"
            className={`${inputClasses} cursor-pointer appearance-none bg-[url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23a8a29e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>')] bg-[right_1rem_center] bg-no-repeat pr-10`}
            value={values.category}
            onChange={(e) => update("category", e.target.value as ListingFormValues["category"])}
          >
            {PRODUCT_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="keyFeatures" className="mb-1.5 block text-sm font-medium text-stone-700">
            Key Features
          </label>
          <textarea
            id="keyFeatures"
            rows={3}
            placeholder="e.g. handmade, watercolor, A4 size, gold plated"
            className={`${inputClasses} resize-none`}
            value={values.keyFeatures}
            onChange={(e) => update("keyFeatures", e.target.value)}
          />
          <p className="mt-1.5 text-xs text-stone-400">Separate features with commas or new lines.</p>
        </div>

        <div>
          <label htmlFor="targetBuyer" className="mb-1.5 block text-sm font-medium text-stone-700">
            Target Buyer
          </label>
          <input
            id="targetBuyer"
            type="text"
            placeholder="e.g. home decorators, teachers, brides"
            className={inputClasses}
            value={values.targetBuyer}
            onChange={(e) => update("targetBuyer", e.target.value)}
          />
        </div>

        <div>
          <label htmlFor="price" className="mb-1.5 block text-sm font-medium text-stone-700">
            Listing Price{" "}
            <span className="font-normal text-stone-400">(optional — or use the Price Suggester)</span>
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-sm text-stone-400">
              $
            </span>
            <input
              id="price"
              type="number"
              min="0"
              step="0.01"
              inputMode="decimal"
              placeholder="e.g. 24.99"
              className={`${inputClasses} pl-7`}
              value={values.price}
              onChange={(e) => update("price", e.target.value)}
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={isGenerating || !values.productName.trim()}
        className="mt-7 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r
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
            Generating…
          </>
        ) : (
          <>
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Generate Listing
          </>
        )}
      </button>
    </form>
  );
}
