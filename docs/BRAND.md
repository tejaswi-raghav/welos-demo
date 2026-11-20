# WELOS — Visual Direction & Design System

## 1. Identity brief

**Big idea:** *Engineer the Sun.* WELOS should feel like stepping into an advanced
renewable-energy research facility: cinematic natural phenomena framed by
precise, honest engineering software.

| Quality | How it shows up |
|---|---|
| Technical intelligence | Live physics models, documented assumptions, tabular numerals |
| Engineering precision | 1px hairlines, machined 12-unit radii, strict 12-column grid |
| Energy & motion | Solar shader, flowing particles, scroll-scrubbed light |
| Reliability | Everything simulated is labelled; study figures are cited |
| Optimism | Warm light against carbon; human figure facing the sun |

Avoided on purpose: leaves, lightning bolts, sun icons, orbit rings, glassmorphism,
gradient-filled UI, glowing borders.

## 2. Logo rationale

- **Wordmark** — lowercase `welos`, drawn from Orbitron's squared geometry as
  outlines on a 60-unit x-height grid. 12-unit stroke (⅕ x-height), 12-unit corner
  radius (= stroke), flat machined feet on **w** and **l**.
- **Transfer gap** — the w's centre apex is left open (one gap, 6 units). The e's
  crossbar stops short of its stem — the same idea.
- **Quantum** — the energy that would close the gap is lifted out as a solid 12×12
  square. It is the only element that may carry colour (Solar Yellow on dark,
  Energy Orange on light).
- **Emblem** — the w + quantum alone. Favicon/app tile on a 128 grid, radius 28.
- Geometry lives in `lib/brand/geometry.ts`; `npm run brand:export` regenerates
  every SVG/PNG in `public/brand/`.

Clear space = 1 quantum on all sides. Min sizes: wordmark 64 px / 18 mm; emblem 16 px / 5 mm.

## 3. Tokens

### Colour
| Token | Hex | Use |
|---|---|---|
| Solar Yellow | `#FFE135` | Primary highlight, CTA, quantum (15.1:1 on Carbon) |
| Energy Orange | `#FF8A00` | Flares, simulation tags, active states (8.3:1) |
| Carbon Black | `#0B0B0B` | Dark surfaces, ink on light |
| Solar White | `#F5F5F5` | Light surfaces, text on dark (18.1:1) |
| Industrial Gray | `#6B6B6B` | Engineering UI, large secondary text only (3.7:1) |
| Deep Amber | `#B85C00` | Warm depth, light-theme focus ring |

Semantic (CSS custom properties in `app/globals.css`): `--bg --fg --surface --surface-2
--border --border-strong --primary --primary-hover --primary-fg --muted --focus`,
plus `--color-success #3CCF91`, `--color-warning #FFB020`, `--color-error #FF5D4F`.
`.theme-light` flips surfaces for light sections.

Signature gradient `linear-gradient(120deg,#FFE135,#FF8A00)` — one word or one bar
per view, never on UI chrome or the logo.

**Chart palette** (validated with the dataviz CVD checker on Carbon — all checks pass):
Solar `#B3900F` · Water `#3F8AD8` · Wind `#DC5F2A`; demand line in Solar White;
battery SOC in Solar Yellow (single series).

### Typography
| Level | Face | Settings |
|---|---|---|
| Brand | Custom vector (Orbitron-derived) | Never typeset |
| Display | Manrope Variable (Satoshi-compatible) | 700, −3.5% tracking, 0.95 leading |
| Interface | Inter Variable | 13–16 px; `tabular` utility for changing numbers |
| Eyebrow | Inter 500 | 0.72 rem, +16% tracking, uppercase |

To switch to Satoshi, self-host it from Fontshare and change `--font-display`.

## 4. Page wireframes (desktop → mobile)

```
HOME
┌──────────────────────────────────────────────┐
│ nav: wordmark · 5 links · [Explore ■]        │
│ HERO (175svh, sticky 100svh)                 │
│  copy bottom-left        Solar Figure right  │  mobile: figure top, copy bottom
│  WebGL sun behind figure, horizon line       │
├──────────────────────────────────────────────┤
│ 01 ENERGY  header 8/4 · tabs Solar|Wind|Water│
│  canvas 7 cols │ readouts + sliders 5 cols   │  mobile: stacked
├──────────────────────────────────────────────┤
│ 02 INSTALLATION  3D viewport 8 │ inspector 4 │  mobile: viewport 58svh, inspector below
│  system strip: 5 KPIs                        │
├──────────────────────────────────────────────┤
│ CAMPAIGN (230svh, sticky) key art + sweep    │  mobile: portrait crop, copy low
├──────────────────────────────────────────────┤
│ 03 INTELLIGENCE builder 4 │ gauges, KPIs,    │
│                           │ charts / table 8 │
├──────────────────────────────────────────────┤
│ CTA (light theme) · footer                   │
└──────────────────────────────────────────────┘
INNER PAGES: PageIntro (code · eyebrow · headline · lede) → content bands
separated by hairlines; tables of parameters on a 4/4/4 split.
```

## 5. Component architecture

```
app/                     routes (server components by default)
  page.tsx               home composition
  technology|solutions|innovation|about|contact|brand/page.tsx
  api/contact/route.ts   zod-validated delivery (Resend or webhook)
components/
  brand/   Logo (Wordmark, Emblem) · SolarFigure
  layout/  SiteHeader (client: scroll state, mobile menu) · SiteFooter
  visual/  SunCanvas (raw WebGL shader) · useCanvasLoop (2D loop helper)
  home/    Hero · EnergyTransformation (+ energy/Solar|Wind|WaterDemo)
           Installation (+ installation/InstallationScene — R3F, dynamic)
           Campaign · Dashboard
  ui/      Section · PageIntro · Instrument (Readout, Control, SimTag, ModelNote) · Reveal
lib/
  energy/model.ts        all physics + daily dispatch simulation (unit-tested)
  installation.ts        component data + scenario runner
  brand/geometry.ts      logo geometry + SVG generators
  gsap.ts                plugin registration + motion tokens
```

## 6. Motion specification

| Language | Ease | Duration | Used for |
|---|---|---|---|
| Solar | `expo.inOut` | 2.6–3.2 s | Sunrise, campaign light sweep |
| Energy flow | `sine.inOut` / linear | 1.4 s loops | Particles, flow dots, turbines |
| Interface | `power2.out` / `cubic-bezier(.2,0,0,1)` | 150–300 ms | Hover, tabs, gauges |

- Intro never blocks scrolling; text visible ≤ 1.4 s; a CSS failsafe reveals intro
  content after 4 s if JS stalls.
- Scroll: natural scrolling; only two sticky stages (hero, campaign) scrub with
  ScrollTrigger (`scrub: 0.6–0.8`). No hijacking.
- Pointer/device-orientation parallax eased at 4% per frame, ≤ 2% of view.
- `prefers-reduced-motion`: static final frames, no time-based animation,
  canvases render still frames that update on input.
- All canvases pause off-screen and in hidden tabs.

## 7. Mobile rules

- Breakpoints: `sm 640 · md 768 · lg 1024 · xl 1280`; content max 1440, gutters 20/40.
- Display type uses `clamp()`; never below 2.25 rem for H2.
- Hero: figure moves above the copy; eyebrow hidden < 640 px.
- 3D: zoom disabled on touch (prevents scroll traps), DPR capped 1.25, panel stacks below.
- Touch targets ≥ 40 px; sliders 28 px tall hit area.
- Shader starts at 60% resolution on coarse pointers and adapts by frame time.
