# Hive Scribe live NLT / NKJV (API.Bible)

The NLT and NKJV are copyrighted, so they are never stored in Hive Scribe. Each chapter loads live from
API.Bible (free Starter plan, non-commercial) through this small proxy. The proxy holds the API key, because
API.Bible's terms (section 12) forbid sharing the key and a static site would publish it.

## Setup (about 15 minutes, all free)
1. API.Bible: sign up at https://api.bible/sign-up, choose **Starter (free)**, mark the app **non-commercial**,
   pick **NLT** and **NKJV** as licensed Bibles (Starter allows up to 3), end users **0–1K** (NKJV is only allowed
   on Starter up to 5,000 monthly users). Copy the API key from the dashboard.
2. Cloudflare: free account at https://dash.cloudflare.com/sign-up (Workers Free: 100,000 requests/day).
3. In this folder: `npx wrangler login`, `npx wrangler secret put API_BIBLE_KEY` (paste the key), `npx wrangler deploy`.
   It prints the Worker address, e.g. `https://hive-scribe-bible.<name>.workers.dev`.
4. Put that address in `js/apibible.config.js` (`proxy: '...'`) and publish. Nothing else changes.
5. Check the Bible IDs in `js/apibible.config.js` against the dashboard (`/v1/bibles` list) and the copyright
   notices against the dashboard's ready-made citations.

## What the proxy allows
Only `GET /v1/bibles/<NLT or NKJV id>/chapters/<BOOK.chapter>`, only from https://scribe.codex-hive.com,
with a fixed query, 60 requests per 10 minutes per visitor, nothing cached. Tests: `node test_worker.mjs`.

## Limits to know
- Starter = 5,000 API calls per month (no overage on Starter; after that NLT/NKJV fall back to the KJV until the month resets).
  Each chapter opened in NLT/NKJV is one call (re-opening it in the same tab is free).
- If the site ever takes ads, sales or sponsorships it becomes commercial and needs a paid plan.
