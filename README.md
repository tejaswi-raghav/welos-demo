# WELOS — Engineer the Sun

Website, brand system and interactive energy simulations for **WELOS**, a renewable
energy technology company working across solar, wind and water.

- **Brand:** custom `welos` wordmark, standalone W emblem, app icon — editable SVG +
  PNG in `public/brand/`, generated from `lib/brand/geometry.ts`.
- **Experience:** cinematic WebGL sunrise hero with the Solar Figure, three working
  physics demos, an explorable 3D installation (React Three Fiber), a character
  campaign section, and a 24-hour energy-dispatch dashboard.
- **Pages:** Technology, Solutions, Innovation, About, Contact (validated form + API), Brand guidelines.

Design direction, tokens, wireframes, motion and mobile rules: [`docs/BRAND.md`](docs/BRAND.md).

## Stack

Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · React Three Fiber / Three.js ·
GSAP + ScrollTrigger · Recharts · Zod · self-hosted Inter & Manrope.

## Getting started

```bash
npm install
npm run dev          # http://localhost:3000
npm test             # physics + simulation unit tests (Node ≥ 22.6)
npm run lint         # TypeScript type-check
npm run build && npm start
```

Regenerate logo files after editing the geometry:

```bash
npm run brand:export
```

## Contact form delivery

The form never claims success unless delivery succeeded. Copy `.env.example` to
`.env.local` and configure **one** option:

| Option | Variables |
|---|---|
| Resend email | `RESEND_API_KEY`, `CONTACT_TO_EMAIL`, `CONTACT_FROM_EMAIL` |
| Any JSON webhook | `CONTACT_WEBHOOK_URL` |
| Static hosting only | `NEXT_PUBLIC_CONTACT_ENDPOINT` (e.g. a Formspree endpoint) |

Without configuration the API returns `503` and the form shows *“Not sent”*.

## Deploy to Vercel

`vercel.json` sets the framework, security headers and long-lived caching for brand assets.

```bash
git init && git add -A && git commit -m "WELOS website"
gh repo create welos --private --source=. --push      # or push to an existing repo
npm i -g vercel
vercel link
vercel env add RESEND_API_KEY production               # repeat for each variable
vercel --prod
```

Or import the repository at vercel.com/new — no extra settings are needed.

### Static export

```bash
npm run build:static   # → /out, API route excluded; set NEXT_PUBLIC_CONTACT_ENDPOINT
```

## Data honesty

- Figures marked **Illustrative simulation** come from `lib/energy/model.ts`
  (documented, simplified physics) — not operating data.
- Study figures (2,285 kWh/m²/yr; 1.1–4.5 m/s; 94.7–130 mm/yr; 0.29–12.7% soiling)
  are reference inputs from the WELOS UAE concept study.
- Company facts that aren’t known yet are shown as dashed orange placeholders
  (`<Placeholder>` in `components/ui/PageIntro.tsx`) — search for `[` in `app/about` and `app/contact`.

## Quality checks run

- Production build ✓ · TypeScript ✓ · 7/7 model tests ✓
- axe-core (WCAG 2.1 AA): 0 violations on all 7 pages
- Lighthouse: Accessibility 100 · Best Practices 100 · SEO 100 (all pages tested)
- Visual review at 1440 × 900, 834 × 1112 and 390 × 844

## Credits & licences

- The Solar Figure key art in `public/campaign/` was supplied by the WELOS team.
- Inter and Manrope: SIL Open Font License (via Fontsource).
- All other visuals are original procedural code (shaders, canvas, SVG).
