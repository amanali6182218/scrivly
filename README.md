# Etsy Listing Writer

A Next.js (App Router + TypeScript + Tailwind CSS) app that helps Etsy sellers
generate SEO-optimized listing titles, descriptions, and tags from a few
product details.

## Getting started

1. Add your Anthropic API key to `.env.local`:

   ```
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ```

2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

Then open [http://localhost:3000](http://localhost:3000).

## Project structure

```
src/
  app/
    layout.tsx           Root layout, fonts, metadata
    page.tsx             Main single-page UI (form + results)
    globals.css          Tailwind directives + base styles
    api/
      generate/route.ts  POST endpoint that calls the Claude API
  components/
    Header.tsx           Top app bar
    ListingForm.tsx      Left-side input form
    ResultsPanel.tsx     Right-side generated listing display
  lib/
    types.ts             Shared types and category options
```

## How generation works

Submitting the form sends a `POST` to `/api/generate` with
`{ productName, category, features, targetBuyer }`. The route
([src/app/api/generate/route.ts](src/app/api/generate/route.ts)) builds a
prompt, calls the Anthropic Messages API with the `claude-sonnet-4-6` model,
and asks it to return a JSON object with `title`, `description`, and `tags`.
The route validates and forwards that JSON back to the browser, where
`ResultsPanel` renders it with copy-to-clipboard buttons.

## Notes

- Styling uses Tailwind CSS with a warm orange/amber color scheme.
- `ANTHROPIC_API_KEY` must be set in `.env.local` (gitignored) for the API
  route to work; without it the route returns a clear error message.
