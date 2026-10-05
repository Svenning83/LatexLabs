# LatexLabs — MVP

Explore latex. Create your own colour combinations. Choose a garment,
experiment with colours and see what works together — the result is a
LatexLabs Colour Study.

Journey (one screen, one decision):
`/` Explore → `/create` garment → `/create/colours` colour wheel →
`/study/<id>` creation + result.

Customer-facing names are Catsuit / Singlet / Shorts; internal template
identifiers (C / S1 / SH1, zones, mapping) stay in the data layer.

Next.js 15 (App Router) · TypeScript · no database — studies are stored as
auditable JSON + PNG files under `data/studies/`.

## Run

```powershell
npm install
npm run dev          # http://localhost:3000
```

On this machine see `AGENTS.md` for the standalone Node path.

## Image generation

Configured via env (see `.env.example`):

| `LATEXLABS_IMAGE_PROVIDER` | Behaviour |
|---|---|
| `gemini` (default when `GEMINI_API_KEY` set) | Gemini 2.5 Flash Image, multi-image conditioning: garment master + canonical layout + colour swatches |
| `openai` | `gpt-image-1` via Images API edits endpoint |
| `mock` (default with no keys) | Returns the canonical study sheet matching the colour count — full product flow without credentials |

## Architecture

```
GARMENT   data/garments/*.json        templates: zones, views, mapping rules
COLOURS   data/colours/libidex.json   manufacturer-agnostic colour records
          public/swatches/*.png       locally cached swatch tiles
GENERATE  src/lib/prompt.ts           structured request -> prompt + references
          src/lib/providers/*         gemini | openai | mock
RESULT    data/studies/<id>.{json,png}  reproducible study records
```

Colour mapping (spec rule): the number of selected colours determines
complexity. `garment.mapping["1"|"2"|"3"]` assigns each garment zone
(`core` / `accent` / `shell`) an index into the ordered colour list —
never more garment colours than selected colours.

- 1 colour → all zones monochrome (panel construction via seams/shadows only)
- 2 colours → canonical split: `accent`+`shell` = colour 1, `core` = colour 2
- 3 colours → `accent` = 1, `shell` = 2, `core` = 3

## Iterating

- **Colours**: edit `scripts/seed-colours.py` (names are the exact Libidex
  customer-facing names), run `python scripts/seed-colours.py` — rewrites the
  JSON + swatch tiles. Or hand-edit `data/colours/libidex.json`; bump
  `reference_version` when the reference set changes.
- **Garments**: edit `data/garments/*.json` — construction text, zones,
  mapping, view/detail labels, customer-facing `display_name`/`descriptor`.
- **Garment card imagery + homepage hero**: regenerated from the canonical
  boards via `python scripts/make-garment-cards.py` (crops tuned by hand —
  see `CROPS` / hero box in the script).
- **Prompt**: `src/lib/prompt.ts`; bump `PROMPT_VERSION` so studies record the
  version that produced them.
- **Study layout**: the canonical sheets in `data/references/studies/` are
  passed to the model as layout references.

## MVP scope

Built: garment picker (C/S1/SH1), colour picker (search, categories, swatches,
exact Libidex names, 1–3 ordered selection), staged generation progress,
Colour Study result page, Regenerate / Change colours / Share (study URL),
study records with `reference_versions` + resolved `colour_mapping`.

Deliberately excluded per spec: accounts, gallery, social, custom panel
placement, uploads, checkout, editing, extra manufacturers.
