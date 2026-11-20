import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { Container } from "@/components/ui/Section";
import { Wordmark, Emblem } from "@/components/brand/Logo";
import { SolarFigure } from "@/components/brand/SolarFigure";
import { asset } from "@/lib/asset";
import { wordmarkSVG, stackedSVG, emblemSVG, palette, glyphs, quantum, shapeEl } from "@/lib/brand/geometry";

export const metadata: Metadata = {
  title: "Brand guidelines",
  description: "WELOS identity: wordmark, W emblem, colour and type tokens, character usage and downloads.",
};

const COLORS = [
  { name: "Solar Yellow", hex: palette.solarYellow, role: "Primary energy highlight, CTAs, the quantum", on: "#0B0B0B", contrast: "15.0:1 on Carbon" },
  { name: "Energy Orange", hex: palette.energyOrange, role: "Solar flares, active and simulation states", on: "#0B0B0B", contrast: "8.3:1 on Carbon" },
  { name: "Carbon Black", hex: palette.carbonBlack, role: "Premium dark surfaces, primary ink on light", on: "#F5F5F5", contrast: "18.1:1 with Solar White" },
  { name: "Solar White", hex: palette.solarWhite, role: "Light surfaces, primary text on dark", on: "#0B0B0B", contrast: "18.1:1 with Carbon" },
  { name: "Industrial Gray", hex: palette.industrialGray, role: "Engineering UI, dividers, large secondary text", on: "#F5F5F5", contrast: "3.7:1 on Carbon — large text & UI only" },
  { name: "Deep Amber", hex: palette.deepAmber, role: "Shadows, warm depth, focus on light", on: "#F5F5F5", contrast: "4.2:1 on Solar White — UI & large text only" },
];

const SEMANTIC = [
  ["--bg", "Carbon #0B0B0B"], ["--fg", "Solar White #F5F5F5"], ["--surface", "#121212"], ["--surface-2", "#181818"], ["--border", "Solar White @ 10%"],
  ["--primary", "Solar Yellow"], ["--primary-hover", "#FFF07A"], ["--muted", "#8A8A8A (5.7:1)"], ["--success", "#3CCF91"],
  ["--warning", "#FFB020"], ["--error", "#FF5D4F"], ["--focus", "Solar Yellow ring, 2px + 3px offset"],
];

const DOWNLOADS = [
  ["Horizontal — light", "welos-horizontal-light"], ["Horizontal — dark", "welos-horizontal-dark"],
  ["Horizontal — mono black", "welos-horizontal-mono-black"], ["Horizontal — mono white", "welos-horizontal-mono-white"],
  ["Stacked — light", "welos-stacked-light"], ["Stacked — dark", "welos-stacked-dark"],
  ["W emblem — light", "welos-emblem-light"], ["W emblem — dark", "welos-emblem-dark"],
  ["App icon", "welos-app-icon"], ["App icon — light", "welos-app-icon-light"],
];

function Tile({ svg, label, light = false }: { svg: string; label: string; light?: boolean }) {
  return (
    <figure className={`flex flex-col ${light ? "bg-white" : "bg-carbon"}`}>
      <div className="flex aspect-[16/10] items-center justify-center p-8 [&>svg]:max-h-full [&>svg]:w-full [&>svg]:max-w-[320px]" dangerouslySetInnerHTML={{ __html: svg }} />
      <figcaption className={`border-t px-4 py-3 text-[12px] ${light ? "border-black/10 text-[#555]" : "border-white/10 text-ink-400"}`}>{label}</figcaption>
    </figure>
  );
}

export default function BrandPage() {
  const onLight = { ink: palette.carbonBlack, quantum: palette.energyOrange };
  const onDark = { ink: palette.solarWhite, quantum: palette.solarYellow };
  return (
    <>
      <PageIntro
        code="B—00"
        eyebrow="Brand guidelines"
        title={<>One geometry.<br /><span className="text-ink-400">Every surface.</span></>}
        lede="The WELOS identity is drawn, not typed: monoline strokes on a 60-unit grid, machined corners, and a single coloured square. It works in one ink, at 16 pixels, on a panel frame or a uniform."
      />

      {/* Rationale + construction */}
      <section aria-labelledby="mark-title" className="border-b border-white/10 py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <h2 id="mark-title" className="display text-3xl md:text-5xl">The transfer gap &amp; the quantum</h2>
            <div className="mt-6 space-y-4 text-[15px] leading-relaxed text-ink-300">
              <p>The w is two load-bearing chevrons cut with horizontal, machined ends. Its centre apex is deliberately left open — the <em className="text-paper not-italic">transfer gap</em> — and the energy that would close it is lifted out as a solid square: the <em className="text-paper not-italic">quantum</em>.</p>
              <p>The e repeats the idea: its crossbar stops short of the stem. Energy is shown not as a lightning bolt or a sun, but as a measured unit moving through an engineered system.</p>
              <p>Letterforms derive from Orbitron&apos;s squared geometry, redrawn as outlines: 12-unit stroke (⅕ x-height), 12-unit corner radius, flat feet on the w and l for stability on signage.</p>
            </div>
          </div>
          <div className="lg:col-span-7">
            <div className="bg-grid relative border border-white/10 p-6 md:p-10">
              <svg viewBox="-20 -50 430 140" className="w-full" role="img" aria-label="Wordmark construction grid">
                {[-36, -6, 30, 66].map((y) => <line key={y} x1="-20" x2="410" y1={y} y2={y} stroke="rgba(255,138,0,.5)" strokeDasharray="2 3" strokeWidth=".6" />)}
                {Object.values(glyphs).flat().map((s, i) => <g key={i} dangerouslySetInnerHTML={{ __html: shapeEl(s, "rgba(245,245,245,.92)") }} />)}
                <rect x={quantum.x} y={quantum.y} width={quantum.size} height={quantum.size} fill="#FFE135" />
                <text x="398" y="-33" fill="#FF8A00" fontSize="7" textAnchor="end">ascender</text>
                <text x="398" y="-3" fill="#FF8A00" fontSize="7" textAnchor="end">x-height</text>
                <text x="398" y="33" fill="#FF8A00" fontSize="7" textAnchor="end">bar</text>
                <text x="398" y="78" fill="#FF8A00" fontSize="7" textAnchor="end">baseline</text>
                <line x1="50" x2="58" y1="88" y2="88" stroke="#FFE135" />
                <text x="54" y="97" fill="#FFE135" fontSize="6" textAnchor="middle">gap</text>
              </svg>
            </div>
            <div className="mt-px grid grid-cols-2 gap-px border border-t-0 border-white/10 bg-white/10 text-[13px] sm:grid-cols-4">
              {[["Clear space", "1 × quantum (x) on all sides"], ["Min. wordmark", "64 px / 18 mm wide"], ["Min. emblem", "16 px / 5 mm"], ["Colour", "Quantum only"]].map(([k, v]) => (
                <div key={k} className="bg-carbon p-4"><p className="text-ink-400">{k}</p><p className="mt-1 text-paper">{v}</p></div>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* Variants */}
      <section aria-labelledby="variants-title" className="border-b border-white/10 py-20 md:py-28">
        <Container>
          <h2 id="variants-title" className="display text-3xl md:text-5xl">Variants</h2>
          <div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            <Tile svg={wordmarkSVG(onLight)} label="1 · Primary horizontal — white background" light />
            <Tile svg={wordmarkSVG(onDark)} label="1 · Primary horizontal — dark background" />
            <Tile svg={stackedSVG(onLight)} label="2 · Vertical stacked" light />
            <Tile svg={stackedSVG(onDark)} label="2 · Vertical stacked — dark" />
            <Tile svg={emblemSVG(onDark)} label="3 · Standalone W emblem" />
            <Tile svg={emblemSVG({ ink: palette.carbonBlack, quantum: palette.carbonBlack })} label="4 · Monochrome — one ink, no colour" light />
            <Tile svg={emblemSVG(onDark, true)} label="Favicon / app icon" />
            <Tile svg={wordmarkSVG({ ink: "#FFFFFF", quantum: "#FFFFFF" })} label="4 · Monochrome white — equipment, uniforms" />
          </div>

          <div className="mt-12 grid gap-8 lg:grid-cols-12">
            <div className="lg:col-span-5">
              <h3 className="display text-2xl">Small sizes</h3>
              <div className="mt-6 flex items-end gap-8 border border-white/10 p-6">
                {[16, 24, 32, 48].map((s) => (
                  <div key={s} className="flex flex-col items-center gap-2">
                    <div style={{ width: s, height: s }} dangerouslySetInnerHTML={{ __html: emblemSVG(onDark, true) }} />
                    <span className="tabular text-[10px] text-ink-400">{s}px</span>
                  </div>
                ))}
                <div className="flex flex-col items-start gap-2">
                  <Wordmark className="h-4 w-auto text-paper" title="" />
                  <span className="tabular text-[10px] text-ink-400">64px</span>
                </div>
              </div>
            </div>
            <div className="lg:col-span-7">
              <h3 className="display text-2xl">Don&rsquo;t</h3>
              <ul className="mt-6 grid gap-px border border-white/10 bg-white/10 text-[13px] text-ink-300 sm:grid-cols-2">
                {["Fill the logo with the signature gradient", "Close the transfer gap or move the quantum", "Colour any element other than the quantum", "Add glows, bevels or animation to the static mark", "Set the name in a typeface instead of using the artwork", "Use the Solar Figure as the logo, favicon or app icon"].map((x) => (
                  <li key={x} className="flex gap-3 bg-carbon p-4"><span aria-hidden className="text-error">✕</span>{x}</li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* Colour + type */}
      <section aria-labelledby="color-title" className="border-b border-white/10 py-20 md:py-28">
        <Container>
          <h2 id="color-title" className="display text-3xl md:text-5xl">Colour</h2>
          <p className="mt-4 max-w-2xl text-[15px] text-ink-300">Warm accents against black, white and gray. The signature gradient <code className="font-mono text-[13px] text-solar">linear-gradient(120deg, #FFE135, #FF8A00)</code> is reserved for single moments — never a background for text-heavy UI, never the logo.</p>
          <div className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
            {COLORS.map((c) => (
              <div key={c.hex} className="bg-carbon">
                <div className="flex h-32 items-end p-4" style={{ background: c.hex, color: c.on }}>
                  <span className="tabular text-[19px] font-bold">{c.hex}</span>
                </div>
                <div className="p-4">
                  <p className="text-[15px] font-semibold">{c.name}</p>
                  <p className="mt-1 text-[13px] text-ink-300">{c.role}</p>
                  <p className="tabular mt-3 text-[12px] text-ink-400">{c.contrast}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 h-16 border border-white/10" style={{ background: "linear-gradient(120deg, #FFE135 0%, #FF8A00 100%)" }} aria-label="Signature gradient" role="img" />
          <h3 className="display mt-16 text-2xl">Semantic tokens</h3>
          <dl className="mt-6 grid gap-px border border-white/10 bg-white/10 text-[13px] sm:grid-cols-2 lg:grid-cols-4">
            {SEMANTIC.map(([k, v]) => (
              <div key={k} className="bg-carbon p-4"><dt className="font-mono text-solar">{k}</dt><dd className="mt-1 text-ink-300">{v}</dd></div>
            ))}
          </dl>

          <h2 className="display mt-24 text-3xl md:text-5xl">Typography</h2>
          <div className="mt-12 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-3">
            <div className="bg-carbon p-8"><p className="text-[12px] text-ink-400">Brand · custom vector, Orbitron-derived</p><Wordmark className="mt-8 h-12 w-auto text-paper" title="" /><p className="mt-8 text-[13px] text-ink-300">Never typeset. Always the artwork.</p></div>
            <div className="bg-carbon p-8"><p className="text-[12px] text-ink-400">Headline · Manrope (Satoshi-compatible)</p><p className="display mt-6 text-5xl">Engineer the sun.</p><p className="mt-6 text-[13px] text-ink-300">700 weight, −3.5% tracking, 0.95 leading. Swap to Satoshi via <code className="font-mono text-solar">--font-display</code> with a Fontshare licence.</p></div>
            <div className="bg-carbon p-8"><p className="text-[12px] text-ink-400">Interface · Inter</p><p className="mt-6 text-xl">Navigation, data, forms.</p><p className="tabular mt-3 text-3xl font-semibold">437.6 kWh · 94%</p><p className="mt-6 text-[13px] text-ink-300">Tabular figures for every number that changes.</p></div>
          </div>
        </Container>
      </section>

      {/* Character */}
      <section aria-labelledby="char-title" className="border-b border-white/10 py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="relative overflow-hidden border border-white/10 bg-[radial-gradient(circle_at_50%_35%,#ffe9a0_0,#ffb02e_14%,#ff8a00_24%,rgba(184,92,0,.35)_40%,#0b0b0b_68%)] lg:col-span-5">
            <SolarFigure id="brand-sf" className="mx-auto h-auto w-[86%] translate-y-[2px]" />
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow text-ink-400">Brand character</p>
            <h2 id="char-title" className="display mt-6 text-3xl md:text-5xl">The Solar Figure</h2>
            <p className="mt-6 text-[15px] leading-relaxed text-ink-300">The human ambition behind WELOS: a young man before the sun — curly hair, round amber-glowing glasses, a faceted high collar in black and gold. His face is never shown. He represents ambition, not a real founder or spokesperson.</p>
            <ul className="mt-8 grid gap-3 text-[14px] text-ink-200 sm:grid-cols-2">
              {["Always backlit; the glasses are the only lit feature", "Campaigns, film, merchandise, storytelling", "Never the logo, favicon or navigation mark", "No robotic arms, tentacles or superhero tropes"].map((x) => (
                <li key={x} className="flex gap-3"><span aria-hidden className="mt-2 h-1 w-1 shrink-0 bg-solar" />{x}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* Downloads */}
      <section aria-labelledby="dl-title" className="py-20 md:py-28">
        <Container>
          <h2 id="dl-title" className="display text-3xl md:text-5xl">Downloads</h2>
          <ul className="mt-10 divide-y divide-white/10 border-y border-white/10">
            {DOWNLOADS.map(([label, file]) => (
              <li key={file} className="flex flex-wrap items-center justify-between gap-4 py-4 text-[14px]">
                <span className="flex items-center gap-4"><Emblem className="h-4 w-auto text-ink-400" title="" />{label}</span>
                <span className="flex gap-4">
                  <a className="text-solar underline-offset-4 hover:underline" href={asset(`/brand/${file}.svg`)} download>SVG</a>
                  <a className="text-ink-300 underline-offset-4 hover:text-paper hover:underline" href={asset(`/brand/${file}@${file.includes("app-icon") ? 512 : file.includes("horizontal") ? 2048 : file.includes("stacked") ? 1024 : 512}.png`)} download>PNG</a>
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>
    </>
  );
}
