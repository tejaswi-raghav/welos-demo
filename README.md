# WELOS — We engineer what comes next

> We don't just capture energy. We engineer what comes next.

WELOS is an integrated solar, wind and rainwater product concept with a local, offline-first control OS. This repository contains the public site, an interactive 3D product model, a browser control simulator and ESP32-S3 reference firmware.

**Live:** https://tejaswi-raghav.github.io/welos-demo/

## Brand

- **Logo — the Ring:** one loop that shades from water blue through cloud silver to solar orange (sun, wind and water as one system), cut by a blade of light — the intelligence. Vector source: `src/landing/brand.js`; regenerate every file with `node scripts/brand.mjs` → `public/brand/`.
- **Palette:** Carbon `#0B0B0B` · Solar White `#F5F5F5` · Solar Yellow `#FFE135` · Energy Orange `#FF8A00` · Industrial Gray `#6B6B6B` · Deep Amber `#B85C00` (+ Water `#3F8AD8` for water data).
- **Type:** Satoshi (display, via Fontshare) · Inter (interface) · DM Mono (labels).
- **Character:** the Solar Figure (`public/story/`) — campaign art, never the logo.

## Landing story (`/`)

A scroll-driven film in four chapters, built with GSAP ScrollTrigger:
1. **The Solar Figure** — sunrise reveal, glinting glasses, embers, the motto; scroll flies into the sun.
2. **Capture** — the ring artwork with a moving spotlight on sun, wind and water, each with concept-study figures.
3. **Engineer** — the logo assembles: the loop turns into place, the blade cuts across, the name draws in; Sense → Compare → Decide → Act.
4. **What comes next** — the live 3D System 01 tours each subsystem and separates on scroll.

Reduced-motion users get the same content as a static page.

## Run
```bash
npm install
npm run dev
```

GitHub Pages deploys automatically from `main` (`.github/workflows/deploy.yml`, base path from the repo name, `VITE_STATIC=1` so the configurator calls NASA POWER and OpenStreetMap directly). On Vercel the `/api` functions are used instead.

Open the local URL shown by Vite. The product tools are separate entry points:

- `/` — concise problem statement, concept-study numbers, innovation overview and a single exploration hub
- `/model.html` — integrated rooftop 3D appliance with selectable hardware, software stack and full-system separation
- `/explore.html` — scroll-driven exploded-view story of the same appliance, with supplied reference visuals tied to each subsystem
- `/model.html?exploded=1` — opens the 3D assembly with its components separated
- `/configure.html` — climate-informed or manual site configurator with a live 3D add-on preview
- `/control.html` — live WELOS OS simulator

## Product foundation

- Solar photovoltaic canopy with integrated rain catchment
- Compact vertical-axis wind module with independent braking
- First-flush, filtration, UV, tank, pumping and water-quality instrumentation
- 48 V LiFePO4 storage, MPPT, wind rectification and hybrid inverter
- ESP32-S3 edge controller, local API, authenticated commands and offline operation
- Deterministic safety-oriented control modes and fault handling

See [hardware/bom.json](hardware/bom.json) for the structured concept BOM and [docs/HARDWARE_ARCHITECTURE.md](docs/HARDWARE_ARCHITECTURE.md) for interfaces and prototype gates. The 3D model and BOM are an engineering concept, not production CAD or a substitute for licensed structural, electrical, grid and water-safety design.

## Verify

```bash
npm run check
npm run firmware:build  # requires PlatformIO
```
