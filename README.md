# Novem Audit AI

Lead-magnet web app for **Novem.pl** — a 90-second AI marketing audit.

Flow: landing → 3-step form (URL → goals/budget/measurement → email) → loader with real-time progress → interactive report with radar chart and recommendation → CTA to 30-min consultation.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind
- Cheerio (site scraper, runs on Node runtime)
- Apify Google Ads Transparency actor (optional — graceful fallback)
- Anthropic Claude Sonnet 4.6 (optional — polishes report narrative)
- GetResponse API (optional — pushes lead with tags)
- Supabase (optional — persists report)
- Slack webhook (optional — notify Novem on new lead)

All integrations degrade gracefully — without any keys the app still produces a deterministic, heuristic report. Add keys when ready.

## Local

```bash
npm install
cp .env.example .env.local   # paste keys when you have them
npm run dev
```

Open http://localhost:3000.

## Deploy (Netlify)

1. Push to GitHub.
2. Netlify → Add new site → Import from GitHub.
3. Build command: `npm run build`. Publish: `.next`. The `@netlify/plugin-nextjs` plugin is loaded automatically by `netlify.toml`.
4. Set env vars in Netlify UI (Site → Environment variables) — see `.env.example`.
5. Done. Custom domain: point `audyt.novem.pl` (or similar) when ready.

> The in-memory `store` (`lib/store.ts`) means reports live only inside the lambda that processed the lead. For real production traffic, swap it for Supabase (already stubbed in `lib/integrations.ts`) and have the `/api/lead?id=` GET read from there.

## Architecture

```
app/
  page.tsx                     Landing (Nav + Hero + SocialProof + HowItWorks + AuditForm)
  report/[id]/page.tsx         Polling status → Loader or Report
  api/
    scrape/route.ts            Cheerio scan of the submitted URL (also used as warmup)
    lead/route.ts              POST creates lead + spawns pipeline; GET returns status/report
components/
  Nav, Hero, SocialProof, HowItWorks, AuditForm, Loader, Report, RadarChart
lib/
  types.ts                     LeadForm, ScrapeSignals, AdSignals, Report
  store.ts                     In-memory map (swap for Supabase in prod)
  scrapers/site.ts             Tracking, CTAs, blog, lead magnet, tech stack
  scrapers/ads.ts              Apify Google Ads Transparency (fallback placeholder)
  synthesize.ts                Deterministic radar + findings + recommendation matrix + Claude polish
  integrations.ts              GetResponse, Supabase, Slack
```

## How the recommendation engine works

The matrix is `budget (4) × goal (5) × measurement (4) = 80 combinations`. The deterministic core in `lib/synthesize.ts:buildRecommendation()` always produces a sane plan. If `ANTHROPIC_API_KEY` is set, Claude rewrites the `business` block and `recommendation.headline + rationale` for sharper, Novem-style language. The plan steps themselves stay deterministic so they remain consistent with Novem's methodology — Claude only polishes prose.

## Replacing placeholders

| Placeholder | File | What to swap |
|---|---|---|
| In-memory store | `lib/store.ts` | Supabase table `audits` |
| Apify fallback | `lib/scrapers/ads.ts` | Set `APIFY_TOKEN` |
| LLM polish | `lib/synthesize.ts` | Set `ANTHROPIC_API_KEY` |
| GetResponse | `lib/integrations.ts` | Set `GETRESPONSE_*` |
| Cal link | `lib/synthesize.ts` + `.env` | `NOVEM_CAL_LINK` |
| Brand assets | `components/Nav.tsx` | Replace text logo with `<img src="/brand/novem.svg" />` once we have it |

## TODO before production

- [ ] Real Novem brandbook (logo SVG, exact hex)
- [ ] Cal.com / Calendly link from Novem
- [ ] Supabase project + `audits` table migration
- [ ] Apify token + verify actor returns the expected shape
- [ ] GetResponse campaign ID + custom field IDs
- [ ] LinkedIn / Trustpilot / SimilarWeb integrations (Premium tier)
- [ ] Admin dashboard at `/admin` (Premium tier)
- [ ] PDF export (react-pdf or Puppeteer)
