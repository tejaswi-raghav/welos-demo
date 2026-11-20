import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const BASE = import.meta.env.BASE_URL;
const img = (name) => `${BASE}trinity/${name}.webp`;

/* ───────────────────────── the trinity ───────────────────────── */

const ENERGIES = [
  {
    key: "solar", n: "01", name: "Solar", element: "Fire", side: "right",
    spot: { x: "79%", y: "21%", r: "21%" },
    tint: "rgba(255,138,0,.26)",
    title: "The sun is our engine.",
    text: "Every square metre of an arid rooftop receives around 2,285 kWh of sunlight a year. We turn that light into electricity — the power that runs the day.",
    uses: [
      "A solar canopy generates power from sunrise to sunset",
      "Daytime surplus charges the battery for the evening",
      "Sensors spot dust and clean only when it pays",
    ],
  },
  {
    key: "wind", n: "02", name: "Wind", element: "Air", side: "left",
    spot: { x: "29%", y: "46%", r: "22%" },
    tint: "rgba(200,214,226,.16)",
    title: "The wind takes over when the sun sets.",
    text: "Afternoon sea breezes and night air keep moving after the light is gone. We catch them so the power doesn't stop when the sun does.",
    uses: [
      "A compact, low-noise vertical-axis turbine",
      "Fills the evening gap the sun leaves behind",
      "Added only where measured wind makes it worth it",
    ],
  },
  {
    key: "water", n: "03", name: "Water", element: "Flow", side: "right",
    spot: { x: "53%", y: "79%", r: "21%" },
    tint: "rgba(31,170,190,.22)",
    title: "Water is caught, cleaned and kept.",
    text: "Rain is rare in arid cities, but it comes in powerful bursts. The same canopy that makes power also catches every storm — and turns it into water you can use.",
    uses: [
      "Gutters on the solar canopy collect the rain",
      "First flush, filtration and UV make it usable",
      "Where pipes carry pressure, a micro-turbine makes power too",
    ],
  },
];

const ALT = {
  solar: "The Solar Figure standing before a blazing sun, his glasses glowing orange.",
  wind: "The Solar Figure standing inside a storm vortex, his glasses glowing white.",
  water: "The Solar Figure standing before a breaking ocean wave, his glasses glowing cyan.",
};

const DESTINATIONS = [
  { name: "3D model", href: "model.html" },
  { name: "Exploded view", href: "explore.html" },
  { name: "Configure a site", href: "configure.html" },
  { name: "WELOS OS", href: "control.html" },
];

const useMedia = (query) => {
  const [match, setMatch] = useState(() => window.matchMedia(query).matches);
  useEffect(() => {
    const m = window.matchMedia(query);
    const on = () => setMatch(m.matches);
    m.addEventListener("change", on);
    return () => m.removeEventListener("change", on);
  }, [query]);
  return match;
};

/* ───────────────────────── shared pieces ───────────────────────── */

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <a className="site-brand" href="./" aria-label="WELOS home"><img src={`${BASE}brand/welos-logo.svg`} alt="welos" /></a>
      <nav aria-label="Energies">
        <a href="#solar">Solar</a>
        <a href="#wind">Wind</a>
        <a href="#water">Water</a>
        <a href="#explore">Explore</a>
      </nav>
      <a className="header-cta" href="model.html">Open 3D model <span aria-hidden="true">↗</span></a>
    </header>
  );
}

/** The logo artwork, with a spotlight that can isolate one of its three energies. */
function LogoArt({ spot, className = "", decorative = false }) {
  return (
    <div className={`logo-art ${className}`} style={spot ? { "--x": spot.x, "--y": spot.y, "--r": spot.r, "--dim": 0.8 } : undefined}>
      <img
        src={img("logo")}
        alt={decorative ? "" : "The WELOS logo: one loop made of the sun, the wind and the ocean, cut by a blade of light."}
        aria-hidden={decorative || undefined}
      />
      <div className="logo-spot" aria-hidden="true" />
    </div>
  );
}

function EnergyCopy({ e, id }) {
  return (
    <>
      <p className="energy-kicker"><span>{e.n}</span> {e.name} <i>·</i> {e.element}</p>
      <h2 className="display energy-title" id={id}>{e.title}</h2>
      <p className="energy-text">{e.text}</p>
      <ul className="energy-uses" aria-label={`How we use ${e.name.toLowerCase()}`}>
        {e.uses.map((u) => <li key={u}>{u}</li>)}
      </ul>
    </>
  );
}

function Together() {
  return (
    <div className="together-copy">
      <p className="energy-kicker"><span>01 + 02 + 03</span> One loop</p>
      <h2 className="display together-title">Three energies.<br /><span className="gradient">Engineered as one.</span></h2>
      <p className="energy-text">When the sun fades, the wind picks up. When the storm passes, the tank is full. The WELOS controller decides, every moment, what to use, what to store and what to save.</p>
      <nav className="destinations" aria-label="Explore System 01">
        {DESTINATIONS.map((d) => <a key={d.href} href={d.href}>{d.name} <span aria-hidden="true">↗</span></a>)}
      </nav>
    </div>
  );
}

/* ───────────────────────── desktop: one pinned stage ───────────────────────── */

function TrinityPinned() {
  const root = useRef(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const logo = q(".stage-logo")[0];
    const spot = q(".stage-logo .logo-art")[0];
    const vw = () => window.innerWidth;
    const vh = () => window.innerHeight;
    // the logo docks above the text column — opposite the image
    const dock = (side) => ({ x: () => (side === "right" ? -1 : 1) * vw() * 0.25, y: () => -vh() * 0.12, scale: 0.5 });

    // opening: the logo arrives
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .fromTo(logo, { opacity: 0, scale: 0.86, rotate: -6 }, { opacity: 1, scale: 1, rotate: 0, duration: 2.2 }, 0.1)
      .from(q(".intro-copy > *"), { opacity: 0, y: 24, stagger: 0.12, duration: 1.4, ease: "power3.out" }, 0.8);

    const tl = gsap.timeline({
      defaults: { ease: "power2.inOut" },
      scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.7, invalidateOnRefresh: true },
    });
    tl.to(q(".intro-copy"), { opacity: 0, y: -30, duration: 0.6 }, 0.4)
      .to(q(".scroll-cue"), { opacity: 0, duration: 0.3 }, 0.2)
      .fromTo(q(".ticks"), { opacity: 0 }, { opacity: 1, duration: 0.4 }, 0.8);

    ENERGIES.forEach((e, i) => {
      const at = 1 + i * 2.4;
      const fromX = e.side === "right" ? 90 : -90;
      // the logo moves aside and isolates this energy
      tl.to(logo, { ...dock(e.side), duration: 1 }, at)
        .to(spot, { "--x": e.spot.x, "--y": e.spot.y, "--r": e.spot.r, "--dim": 0.84, duration: 0.9 }, at)
        .to(q(".stage-tint"), { background: `radial-gradient(60% 75% at ${e.side === "right" ? "72%" : "28%"} 50%, ${e.tint}, rgba(11,11,11,0) 70%)`, duration: 0.9 }, at)
        // the figure for this element appears on its side
        .fromTo(q(`[data-panel="${e.key}"]`), { opacity: 0, x: fromX, scale: 1.06 }, { opacity: 1, x: 0, scale: 1, duration: 1, ease: "power3.out" }, at + 0.25)
        .fromTo(q(`[data-copy="${e.key}"] > *`), { opacity: 0, y: 26 }, { opacity: 1, y: 0, stagger: 0.08, duration: 0.5, ease: "power3.out" }, at + 0.6)
        .to(q(`[data-tick="${i}"]`), { scaleX: 1, duration: 0.6 }, at + 0.2);
      // and leaves again
      tl.to(q(`[data-panel="${e.key}"]`), { opacity: 0, x: -fromX * 0.4, duration: 0.7 }, at + 2.1)
        .to(q(`[data-copy="${e.key}"] > *`), { opacity: 0, y: -24, duration: 0.5 }, at + 2.1);
    });

    // together: the whole loop, lit
    const end = 1 + ENERGIES.length * 2.4;
    tl.to(logo, { x: 0, y: () => -vh() * 0.1, scale: 0.66, duration: 1 }, end)
      .to(spot, { "--r": "140%", "--dim": 0, duration: 0.9 }, end)
      .to(q(".stage-tint"), { background: "radial-gradient(60% 60% at 50% 35%, rgba(255,138,0,.16), rgba(11,11,11,0) 70%)", duration: 0.9 }, end)
      .to(q(".ticks"), { opacity: 0, duration: 0.4 }, end)
      .fromTo(q(".stage-together"), { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 0.7 }, end + 0.5)
      .to({}, { duration: 0.8 });
  }, { scope: root });

  return (
    <section className="trinity" ref={root} aria-label="Solar, wind and water">
      {/* anchors for the header links, placed where each energy is on stage */}
      <span id="solar" className="anchor" style={{ top: "14%" }} />
      <span id="wind" className="anchor" style={{ top: "37%" }} />
      <span id="water" className="anchor" style={{ top: "60%" }} />
      <span id="explore" className="anchor" style={{ top: "86%" }} />
      <div className="stage">
        <div className="stage-tint" aria-hidden="true" />

        {ENERGIES.map((e) => (
          <figure className={`panel panel-${e.side}`} data-panel={e.key} key={e.key}>
            <img src={img(e.key)} alt={ALT[e.key]} />
          </figure>
        ))}

        <div className="stage-logo"><LogoArt /></div>

        <div className="intro-copy">
          <p className="eyebrow"><span className="dot" /> WELOS · Solar · Wind · Water</p>
          <h1 className="display intro-title">Three energies.<br /><span className="gradient">One loop.</span></h1>
          <p className="intro-sub">A holy trinity of energy — the sun, the wind and the water — engineered to work as one.</p>
        </div>
        <p className="scroll-cue">Scroll <i aria-hidden="true" /></p>

        {ENERGIES.map((e) => (
          <div className={`copy copy-${e.side === "right" ? "left" : "right"}`} data-copy={e.key} key={e.key}>
            <EnergyCopy e={e} />
          </div>
        ))}

        <div className="stage-together"><Together /></div>

        <div className="ticks" aria-hidden="true">
          {ENERGIES.map((e, i) => <span key={e.key}><i data-tick={i} /><b>{e.name}</b></span>)}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── phones + reduced motion: stacked ───────────────────────── */

function TrinityStacked() {
  const root = useRef(null);
  useGSAP(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    gsap.utils.toArray(".stack-reveal", root.current).forEach((el) => {
      gsap.from(el.children, { opacity: 0, y: 30, stagger: 0.1, duration: 0.9, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    });
  }, { scope: root });

  return (
    <div className="stack" ref={root}>
      <section className="stack-intro">
        <LogoArt />
        <div className="stack-reveal">
          <p className="eyebrow"><span className="dot" /> WELOS · Solar · Wind · Water</p>
          <h1 className="display intro-title">Three energies.<br /><span className="gradient">One loop.</span></h1>
          <p className="intro-sub">A holy trinity of energy — the sun, the wind and the water — engineered to work as one.</p>
        </div>
      </section>
      {ENERGIES.map((e) => (
        <section className={`stack-energy stack-${e.side}`} id={e.key} key={e.key} aria-labelledby={`${e.key}-title`}>
          <figure className="stack-figure">
            <img src={img(`${e.key}-sm`)} alt={ALT[e.key]} loading="lazy" />
          </figure>
          <div className="stack-copy stack-reveal">
            <LogoArt spot={e.spot} className="logo-mini" decorative />
            <EnergyCopy e={e} id={`${e.key}-title`} />
          </div>
        </section>
      ))}
      <section className="stack-together stack-reveal" id="explore">
        <LogoArt decorative />
        <Together />
      </section>
    </div>
  );
}

/* ───────────────────────── page ───────────────────────── */

export function Landing() {
  const pinned = useMedia("(min-width: 900px) and (prefers-reduced-motion: no-preference)");
  return (
    <div className="site">
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">{pinned ? <TrinityPinned key="pinned" /> : <TrinityStacked key="stacked" />}</main>
      <footer className="site-footer wrap">
        <img src={`${BASE}brand/welos-logo.svg`} alt="welos" />
        <p>We don&rsquo;t just capture energy. We engineer what comes next.</p>
        <p className="small">Concept hardware · figures are design targets · © {new Date().getFullYear()} WELOS</p>
      </footer>
    </div>
  );
}
