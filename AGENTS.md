# LatexLabs — agent notes

## Environment (this machine)

- No system Node install / no PATH entry. Standalone Node lives at
  `C:\Users\simon\node\node-v22.23.2-win-x64\` (v22.23.2 + npm 10.9.8).
- PowerShell execution policy blocks `npm.ps1` — always invoke
  `npm.cmd` / `npx.cmd` by full path, e.g.:
  `& "C:\Users\simon\node\node-v22.23.2-win-x64\npm.cmd" run dev`
- No git installed.
- libidex.com returns 403 to non-browser fetches (Cloudflare). Colour data was
  seeded from the customer-facing configurator list; do not scrape it at runtime.

## Run

```powershell
$env:PATH = "C:\Users\simon\node\node-v22.23.2-win-x64;$env:PATH"
cd latexlabs
& "C:\Users\simon\node\node-v22.23.2-win-x64\npm.cmd" run dev   # http://localhost:3000
```

Verify: `npx tsc --noEmit`, `npm run build`.

## Data iteration points (no code changes needed)

- Colours: `data/colours/libidex.json` — regen via `python scripts/seed-colours.py`
- Garment templates (zones + colour-count mapping): `data/garments/{c,s1,sh1}.json`
- Generation references: `data/references/garments`, `data/references/studies`
- Prompt composition: `src/lib/prompt.ts` (bump `PROMPT_VERSION` on edits — stored on studies)

## Notes

- Runtime studies land in `data/studies/` (gitignored): `<id>.json` + `<id>.png`.
- No API keys set → `mock` provider returns canonical study sheets by colour count.
- npm audit: remaining PostCSS advisories are build-time-only; Next pinned at 15.5.x.
