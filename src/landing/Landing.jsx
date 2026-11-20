import React, { useEffect, useRef, useState } from "react";
import Lenis from "lenis";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const BASE = import.meta.env.BASE_URL;
const img = (name) => `${BASE}trinity/${name}.webp`;
const prefersReduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────────────────────── the trinity ───────────────────────── */

const ENERGIES = [
  {
    key: "solar", n: "01", name: "Solar", element: "Fire", side: "right",
    spot: { x: "72%", y: "27%", r: "20%" },
    title: ["The sun is", "our engine."],
    text: "Every square metre of an arid rooftop receives around 2,285 kWh of sunlight a year. We turn that light into electricity — the power that runs the day.",
    uses: [
      "A solar canopy generates power from sunrise to sunset",
      "Daytime surplus charges the battery for the evening",
      "Sensors spot dust and clean only when it pays",
    ],
  },
  {
    key: "wind", n: "02", name: "Wind", element: "Air", side: "left",
    spot: { x: "27%", y: "51%", r: "21%" },
    title: ["The wind takes over", "when the sun sets."],
    text: "Afternoon sea breezes and night air keep moving after the light is gone. We catch them so the power doesn't stop when the sun does.",
    uses: [
      "A compact, low-noise vertical-axis turbine",
      "Fills the evening gap the sun leaves behind",
      "Added only where measured wind makes it worth it",
    ],
  },
  {
    key: "water", n: "03", name: "Water", element: "Flow", side: "right",
    spot: { x: "51%", y: "77%", r: "20%" },
    title: ["Water is caught,", "cleaned and kept."],
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

/* ───────────────────────── smooth scrolling ───────────────────────── */

let lenis = null;

/** Inertial scrolling (Lenis) driven by GSAP's ticker so ScrollTrigger stays in lockstep. */
function useSmoothScroll() {
  useEffect(() => {
    if (prefersReduced()) return;
    lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.9, smoothWheel: true });
    lenis.on("scroll", ScrollTrigger.update);
    const raf = (time) => lenis?.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    document.documentElement.classList.add("lenis");
    return () => { gsap.ticker.remove(raf); lenis?.destroy(); lenis = null; document.documentElement.classList.remove("lenis"); };
  }, []);
}

/** Scroll to a section: to its settled scene on the pinned stage, through Lenis when running. */
function goTo(event, target) {
  const el = document.querySelector(target);
  if (!el) return;
  event.preventDefault();
  const st = ScrollTrigger.getById("trinity");
  const y = st && el.dataset.label ? st.labelToScroll(el.dataset.label) : el.getBoundingClientRect().top + window.scrollY - 70;
  if (lenis) lenis.scrollTo(y, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4) });
  else window.scrollTo({ top: y, behavior: prefersReduced() ? "auto" : "smooth" });
  history.replaceState(null, "", target);
}

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
        {["solar", "wind", "water", "explore"].map((k) => (
          <a key={k} href={`#${k}`} onClick={(e) => goTo(e, `#${k}`)}>{k[0].toUpperCase() + k.slice(1)}</a>
        ))}
      </nav>
      <a className="header-cta" href="model.html">Open 3D model <span aria-hidden="true">↗</span></a>
    </header>
  );
}

/** The logo artwork, with a spotlight that can isolate one of its three energies. */
function LogoArt({ spot, className = "", decorative = false }) {
  return (
    <div className={`logo-art ${className}`} style={spot ? { "--x": spot.x, "--y": spot.y, "--r": spot.r, "--dim": 0.82 } : undefined}>
      <img
        src={img("logo")}
        alt={decorative ? "" : "The WELOS logo: one loop made of the sun, the wind and the ocean, cut by a blade of light."}
        aria-hidden={decorative || undefined}
        draggable="false"
      />
      <div className="logo-spot" aria-hidden="true" />
    </div>
  );
}

function EnergyCopy({ e, id }) {
  return (
    <>
      <p className="energy-kicker" data-rise><span>{e.n}</span> {e.name} <i>/</i> {e.element}</p>
      <h2 className="display energy-title" id={id}>
        {e.title.map((line) => <span className="line" key={line}><span data-line>{line}</span></span>)}
      </h2>
      <p className="energy-text" data-rise>{e.text}</p>
      <ul className="energy-uses" aria-label={`How we use ${e.name.toLowerCase()}`}>
        {e.uses.map((u) => <li key={u} data-rise>{u}</li>)}
      </ul>
    </>
  );
}

function Together({ headingId }) {
  return (
    <div className="together-copy">
      <p className="energy-kicker" data-rise><span>01 + 02 + 03</span> One loop</p>
      <h2 className="display together-title" id={headingId}>
        <span className="line"><span data-line>Three energies.</span></span>
        <span className="line"><span data-line className="gradient">Engineered as one.</span></span>
      </h2>
      <p className="energy-text" data-rise>When the sun fades, the wind picks up. When the storm passes, the tank is full. The WELOS controller decides, every moment, what to use, what to store and what to save.</p>
      <nav className="destinations" aria-label="Explore System 01" data-rise>
        {DESTINATIONS.map((d) => <a key={d.href} href={d.href}>{d.name} <span aria-hidden="true">↗</span></a>)}
      </nav>
    </div>
  );
}

/* ───────────────────────── desktop: one pinned stage ───────────────────────── */

const T = { intro: 0.7, move: 1.3, hold: 1.5 }; // scene timing, in timeline units

function TrinityPinned() {
  const root = useRef(null);

  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const logo = q(".stage-logo")[0];
    const spot = q(".stage-logo .logo-art")[0];
    const vw = () => window.innerWidth;
    const vh = () => window.innerHeight;
    const dock = (side) => ({ x: () => (side === "right" ? -1 : 1) * vw() * 0.25, y: () => -vh() * 0.13, scale: 0.5 });

    // start states for everything the scroll reveals (set by GSAP so its transforms stay consistent)
    gsap.set(q(".copy [data-line], .stage-together [data-line]"), { yPercent: 115 });
    gsap.set(q(".copy [data-rise], .stage-together [data-rise]"), { opacity: 0 });
    root.current.classList.add("is-ready");

    // opening — the logo resolves out of the dark
    gsap.timeline({ defaults: { ease: "expo.out" } })
      .fromTo(logo, { opacity: 0, scale: 0.9, filter: "blur(14px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 2.4, clearProps: "filter" }, 0.1)
      .fromTo(q(".intro-copy [data-line]"), { yPercent: 115 }, { yPercent: 0, duration: 1.4, stagger: 0.1 }, 0.7)
      .fromTo(q(".intro-copy [data-rise]"), { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1.2, stagger: 0.1, ease: "power3.out" }, 1.0);

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      scrollTrigger: {
        id: "trinity",
        trigger: root.current, start: "top top", end: "bottom bottom",
        scrub: 1.1, invalidateOnRefresh: true,
        // settle every scene in a composed state
        snap: { snapTo: "labels", duration: { min: 0.4, max: 1 }, delay: 0.15, ease: "power2.inOut" },
      },
    });
    const copyIn = (sel, at) => tl
      .fromTo(q(`${sel} [data-line]`), { yPercent: 115 }, { yPercent: 0, duration: 0.75, stagger: 0.08, ease: "expo.out", immediateRender: false }, at)
      .fromTo(q(`${sel} [data-rise]`), { opacity: 0, y: 22 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.06, ease: "power3.out", immediateRender: false }, at + 0.15);
    const copyOut = (sel, at) => tl
      .to(q(`${sel} [data-line]`), { yPercent: -115, duration: 0.55, stagger: 0.04, ease: "power3.in" }, at)
      .to(q(`${sel} [data-rise]`), { opacity: 0, y: -16, duration: 0.4, stagger: 0.03, ease: "power2.in" }, at);

    tl.addLabel("intro", 0).to(q(".scroll-cue"), { opacity: 0, duration: 0.3 }, 0.1);

    let t = T.intro;
    let prev = null;
    ENERGIES.forEach((e, i) => {
      // the previous scene leaves as this one arrives — overlapping, never a blank frame
      if (prev) {
        tl.to(q(`[data-panel="${prev.key}"]`), { opacity: 0, scale: 1.04, duration: 0.8, ease: "power2.inOut" }, t)
          .to(q(`[data-tint="${prev.key}"]`), { opacity: 0, duration: 1.1 }, t);
        copyOut(`[data-copy="${prev.key}"]`, t);
      } else {
        copyOut(".intro-copy", t - 0.1);
        tl.to(q(".ticks"), { opacity: 1, duration: 0.6 }, t + 0.4);
      }
      // the logo glides to the far side and isolates this energy
      tl.to(logo, { ...dock(e.side), duration: T.move }, t)
        .to(spot, { "--x": e.spot.x, "--y": e.spot.y, "--r": e.spot.r, "--dim": 0.86, duration: T.move * 0.9 }, t + 0.05)
        .to(q(`[data-tint="${e.key}"]`), { opacity: 1, duration: 1.1 }, t + 0.15)
        // the figure wipes in from the centre line, with a slow push-in that carries through the hold
        .fromTo(q(`[data-panel="${e.key}"]`),
          { opacity: 1, scale: 1, clipPath: e.side === "right" ? "inset(0% 0% 0% 100%)" : "inset(0% 100% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.15, ease: "expo.inOut", immediateRender: false }, t + 0.3)
        .fromTo(q(`[data-panel="${e.key}"] img`), { scale: 1.16 }, { scale: 1.02, duration: T.move + T.hold, ease: "power1.out", immediateRender: false }, t + 0.3)
        .to(q(`[data-tick="${i}"]`), { scaleX: 1, duration: T.move + T.hold * 0.5, ease: "none" }, t);
      copyIn(`[data-copy="${e.key}"]`, t + 0.75);
      tl.addLabel(e.key, t + T.move + 0.25);
      t += T.move + T.hold;
      prev = e;
    });

    // together — the whole loop, lit
    tl.to(q(`[data-panel="${prev.key}"]`), { opacity: 0, scale: 1.04, duration: 0.8, ease: "power2.inOut" }, t)
      .to(q(`[data-tint="${prev.key}"]`), { opacity: 0, duration: 1.1 }, t)
      .to(q(".ticks"), { opacity: 0, duration: 0.5 }, t);
    copyOut(`[data-copy="${prev.key}"]`, t);
    tl.to(logo, { x: 0, y: () => -vh() * 0.11, scale: 0.68, duration: T.move }, t)
      .to(spot, { "--r": "140%", "--dim": 0, duration: T.move }, t + 0.1)
      .to(q('[data-tint="together"]'), { opacity: 1, duration: 1.1 }, t + 0.2);
    copyIn(".stage-together", t + 0.7);
    tl.addLabel("explore", t + T.move + 0.3).to({}, { duration: 0.6 });
    if (import.meta.env.DEV) window.__trinity = tl.scrollTrigger; // test hook (stripped from production)
  }, { scope: root });

  return (
    <section className="trinity" ref={root} aria-label="Solar, wind and water">
      {/* header targets — scrolled to through the timeline's labels */}
      {["solar", "wind", "water", "explore"].map((k) => <span key={k} id={k} data-label={k} className="anchor" />)}
      <div className="stage">
        {[...ENERGIES.map((e) => e.key), "together"].map((k) => <div key={k} className={`stage-tint tint-${k}`} data-tint={k} aria-hidden="true" />)}

        {ENERGIES.map((e) => (
          <figure className={`panel panel-${e.side}`} data-panel={e.key} key={e.key}>
            <img src={img(e.key)} alt={ALT[e.key]} draggable="false" />
          </figure>
        ))}

        <div className="stage-logo"><LogoArt /></div>

        <div className="intro-copy">
          <p className="eyebrow" data-rise><span className="dot" /> WELOS · Solar · Wind · Water</p>
          <h1 className="display intro-title">
            <span className="line"><span data-line>Three energies.</span></span>
            <span className="line"><span data-line className="gradient">One loop.</span></span>
          </h1>
          <p className="intro-sub" data-rise>A holy trinity of energy — the sun, the wind and the water — engineered to work as one.</p>
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
    if (prefersReduced()) return;
    const q = gsap.utils.selector(root);
    gsap.fromTo(q(".stack-intro .logo-art"), { opacity: 0, scale: 0.92, filter: "blur(10px)" }, { opacity: 1, scale: 1, filter: "blur(0px)", duration: 1.8, ease: "expo.out", clearProps: "filter" });
    q(".stack-figure").forEach((fig) => {
      gsap.fromTo(fig, { clipPath: "inset(10% 8% 10% 8%)" }, { clipPath: "inset(0% 0% 0% 0%)", ease: "none", scrollTrigger: { trigger: fig, start: "top 95%", end: "top 40%", scrub: 0.6 } });
      gsap.fromTo(fig.querySelector("img"), { scale: 1.18 }, { scale: 1, ease: "none", scrollTrigger: { trigger: fig, start: "top bottom", end: "bottom top", scrub: 0.6 } });
    });
    q(".stack-reveal").forEach((el) => {
      gsap.fromTo(el.querySelectorAll("[data-line]"), { yPercent: 115 }, { yPercent: 0, duration: 1.1, stagger: 0.08, ease: "expo.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
      gsap.fromTo(el.querySelectorAll("[data-rise], .logo-mini"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.06, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 85%", once: true } });
    });
  }, { scope: root });

  return (
    <div className="stack" ref={root}>
      <section className="stack-intro">
        <LogoArt />
        <div className="stack-reveal">
          <p className="eyebrow" data-rise><span className="dot" /> WELOS · Solar · Wind · Water</p>
          <h1 className="display intro-title">
            <span className="line"><span data-line>Three energies.</span></span>
            <span className="line"><span data-line className="gradient">One loop.</span></span>
          </h1>
          <p className="intro-sub" data-rise>A holy trinity of energy — the sun, the wind and the water — engineered to work as one.</p>
        </div>
      </section>
      {ENERGIES.map((e) => (
        <section className={`stack-energy stack-${e.side}`} id={e.key} key={e.key} aria-labelledby={`${e.key}-title`}>
          <figure className="stack-figure">
            <img src={img(`${e.key}-sm`)} alt={ALT[e.key]} loading="lazy" draggable="false" />
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
  useSmoothScroll();
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
