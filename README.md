# WELOS

WELOS is an integrated rooftop resource system: a solar canopy that is also a rain catchment, an optional vertical-axis wind module, LiFePO4 storage, a first-flush / filter / UV water train, and a deterministic, offline-first edge controller. This repository contains the website (a shared 3D digital twin), the browser control engine, the sizing engine, the WELOS AI advisor API and ESP32-S3 reference firmware.

## Run

```bash
npm install
npm run dev
```

## The site

Every page shows the same digital twin in a different context. See [docs/EXPERIENCE.md](docs/EXPERIENCE.md) for the architecture and design decisions.

| Page | What it is |
| --- | --- |
| `/` Story | Seven-scene scroll story: rooftop reveal, sun / wind / rain, the integrated network, the controller's rulebook, the exploded machine, a combined-stress day, and the transition into the OS. |
| `/explorer.html` System Explorer | Select any of the 27 parts, isolate layers, separate the assembly, trace power and water connections, switch physical ↔ schematic. Deep links: `/explorer.html#water-pump`. |
| `/control.html` Control OS | Operator view: SVG topology with upstream/downstream tracing, decision trace, supervisor requests, scenario replay and activity log. |
| `/product.html` Product | Configurator with the 3D canopy: building type, emirate, your usage, package (Solar-first, Essential, Complete, Max), battery and add-ons. Shows the price breakdown and the full savings arithmetic (electricity and water kept separate), a variations matrix and a per-emirate table built from the same inputs, monthly bills and the specification. |
| `/signin.html` Sign in | Demo sign-in. Credentials are shown on the page: `demo@welos.ae` / `welos-demo`. Session lives in sessionStorage only. |
| `/os.html` welOS | Owner OS demo (macOS-style): savings, output, bills, payback, water, storage or grid credit, system health and activity for the build chosen on the product page. Simulated data, labelled as such. |

`/model.html`, `/configure.html`, `/explore.html`, `/studio.html` and `/lab.html` (the retired Simulation Lab) redirect to current pages.

## Where the numbers come from

- **Controller decisions**: `src/control/engine.js` (unchanged rules, mirrored by `firmware/src/ControlEngine.cpp`).
- **Operating-day simulation**: `src/twin/sim.js` drives the engine with a deterministic environment (solar geometry for Dubai, clear-sky irradiance, scenario shapes for wind, rain, dust and load). It is labelled as a simulation of a concept reference unit everywhere it appears; there is no random number and no real telemetry.
- **Sizing and prices**: `src/site/sizing.js` (indicative AED estimates, not a quotation). Calibrated to UAE market ranges in Nov 2026 (10 kW villa installed ≈ AED 40–55k; LiFePO4 ≈ AED 410–530/kWh retail).
- **Bills and savings**: `src/site/economics.js` with tariffs in `src/site/regions.js` — DEWA, SEWA and EtihadWE slabs (23/28/32/38 fils + fuel surcharge + 5% VAT) and TAQA daily bands (expat / UAE national). DEWA (Shams Dubai) and Abu Dhabi net metering are modelled as monthly netting with credit rollover. SEWA and EtihadWE export credit is not verified, so exports are valued at zero there; that is why a battery pays off in those emirates and not under net metering. Monthly sun per emirate is NASA POWER climatology. Household load shape is an assumption.
- **Packages**: Solar-first (solar sized to 100% of use, no water system; grid protection, inverter and controller kept), Essential (integrated, ~60% of use, lighter water kit), Complete (integrated, 100% of use; called "Recommended" before 22 Nov 2026, old saved builds migrate) and Max (fills the roof).
- **Savings**: electricity = bill before − bill after. Water is valued only when it replaces metered utility water, up to your stated use, at AED 9.24/m³ (DEWA green slab + fuel surcharge + VAT; a proxy outside Dubai). Payback = installed price ÷ (electricity + water) in year one; 25-year net applies 0.5%/yr ageing to electricity and excludes maintenance, replacements, tariff changes, financing interest and discounting. `explainSavings()` in `sizing.js` produces the exact sentences used by the page, the downloaded summary and the advisor.
- **Suggestions**: `src/site/recommend.js` suggests the integrated package with the highest modelled 25-year net savings and compares Solar-first beside it; a battery is suggested for outage backup or a ≤ 10-year battery payback.

The 3D model and BOM are an engineering concept, not production CAD or a substitute for licensed structural, electrical, grid and water-safety design.

## Code map

```
src/twin/       sim.js (day simulation) · model.js (assembly, layers, routes) · rooftop.js · stage.js (renderer)
                topology.js (nodes/edges shared by Explorer and Control OS) · useStage.js (React hook)
src/ui/         base.css (design system) · chrome-html.js (header/footer injected at build) · chrome.js
src/home/       scroll story
src/explorer/   System Explorer
src/control/    engine.js, simulator.js (legacy live simulator, kept for tests), Control OS UI
src/product/    product page
src/account/    demo sign-in session
src/os/         welOS owner OS (data.js, charts.jsx, main.jsx)
src/site/       sizing.js, economics.js, regions.js, recommend.js, addons.js, presets.js
src/ai/         WELOS AI sidebar
api/            Vercel functions: advisor, climate (NASA POWER), location (OSM)
firmware/       ESP32-S3 reference firmware
```

Brand: the Solar Ember identity. The `WELOS` wordmark is vector (`public/brand/welos-wordmark-ink.svg` / `-ivory.svg`), the app icon is `welos-icon.svg`, and `welos-key.jpg` is the key visual. Tokens, colour roles and motion rules: [docs/DESIGN.md](docs/DESIGN.md).

## WELOS AI

`api/advisor.js` explains the sizing engine's build; it never changes the numbers. Provider order: Groq → Claude (optional) → rule-based advice. Set `GROQ_API_KEY` (and optionally `ANTHROPIC_API_KEY`) in Vercel to enable it.

## Verify

```bash
npm run check            # engine, parts, sizing, twin simulation + topology tests, production build
npm run firmware:build   # requires PlatformIO
```

## Premium commercial experience (isolated extension)

Repository: [tejaswi-raghav/welos-demo](https://github.com/tejaswi-raghav/welos-demo). The approved showroom, models, animation, Control OS, configurator, Owner OS and optional battery scenarios remain unchanged.

Start at `/business`: Prototype Lab (`/prototype`), Energy Economics (`/economics`), Developer Studio (`/developers`), welOS Network (`/network`), Incentive Finder (`/incentives`) and Company (`/company`). Existing commercial URLs remain compatible aliases. The showroom header stays unchanged; one footer link opens the commercial portal, which has its own navigation and return link.

See [business/README.md](business/README.md), [hardware/gen1](hardware/gen1) and [public resource policy](docs/integration/PUBLIC_RESOURCE_POLICY.md). Company forecasts, investor decks, founder details and application drafts are excluded from current public resources; old history/caches cannot be retracted by this change. The demo login is not used as access control.

- `npm run export:business`: publish only explicitly allowlisted product/research resources.
- `npm run test:commercial`: customer/developer economics, eligibility, data and privacy tests.
- `npm run check`: all existing/new tests, protected-file check and build.
- `node scripts/check-commercial-ssr.mjs`: render new routes and check download targets.
- `node scripts/check-commercial-http.mjs`: development/preview route and private-resource checks.

Three-dimensional concept views and rollout scenarios are illustrative. No physical validation, professional approval, customer installations, partner contracts or financing offer is implied. Inquiry drafts stay local; no backend submission is claimed. Source dates, eligibility gaps and model assumptions remain visible. Do not merge or deploy without the owner's explicit approval.
