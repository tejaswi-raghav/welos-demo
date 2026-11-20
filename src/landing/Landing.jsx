import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Embers } from "./Embers.jsx";
import { wordmark, emblem, STROKE } from "./brand.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────────────────────── content ───────────────────────── */

const FORCES = [
  {
    key: "sun", code: "01", name: "Sun", x: "88%", y: "13%", r: "17%",
    title: "The sun does the heavy lifting.",
    text: "An arid rooftop receives about 2,285 kWh of solar energy per square metre every year. The WELOS canopy turns it into power — and doubles as the surface that catches rain.",
    stat: "2,285", unit: "kWh/m²/yr",
  },
  {
    key: "wind", code: "02", name: "Wind", x: "27%", y: "44%", r: "19%",
    title: "Wind fills the gaps the sun leaves.",
    text: "Sea breezes rise in the afternoon and carry on after sunset. A compact vertical-axis rotor joins the system only where measured wind earns its place.",
    stat: "1.1–4.5", unit: "m/s",
  },
  {
    key: "water", code: "03", name: "Water", x: "53%", y: "79%", r: "18%",
    title: "Water is captured, never wasted.",
    text: "Rain is rare in arid cities, but intense. First flush, filtration, UV and storage turn every rare storm into a monitored supply.",
    stat: "94.7–130", unit: "mm/yr",
  },
];

const LOOP = ["Sense", "Compare", "Decide", "Act"];

const SYSTEMS = [
  { view: "overview", code: "00", name: "System 01", text: "One chassis. One canopy. Five systems engineered to work as a single machine." },
  { view: "solar", code: "01", name: "Solar + catchment", text: "A photovoltaic canopy produces power while its perimeter gutter captures every drop of rain." },
  { view: "wind", code: "02", name: "Urban wind", text: "A low-noise vertical-axis rotor supplements the sun when a site's wind supports it." },
  { view: "water", code: "03", name: "Water system", text: "First flush, filtration, UV, storage and pumping — captured rain becomes a usable supply." },
  { view: "storage", code: "04", name: "Energy core", text: "MPPT, rectification, LiFePO4 storage and a hybrid inverter on one protected DC bus." },
  { view: "controller", code: "05", name: "Control core", text: "WELOS OS — offline-first, deterministic and safety-interlocked. The intelligence in the gap." },
];

const EVIDENCE = [
  { value: "2,285", unit: "kWh/m²/yr", label: "Solar irradiation", detail: "Annual reference used in the WELOS UAE concept study." },
  { value: "1.1–4.5", unit: "m/s", label: "Variable wind", detail: "Onshore wind-speed range considered in the study." },
  { value: "94.7–130", unit: "mm/yr", label: "Limited rainfall", detail: "Annual precipitation range used for concept sizing." },
  { value: "0.29–12.7", unit: "%", label: "Solar soiling loss", detail: "Modelled loss range that motivates condition-based cleaning." },
];

const PRINCIPLES = [
  { n: "01", title: "One surface, many jobs", text: "The solar canopy generates electricity and acts as the rain catchment — two resources from one footprint." },
  { n: "02", title: "Only what the site earns", text: "Wind and water modules are added where local evidence supports them. A sunny roof is never forced into a windy roof's design." },
  { n: "03", title: "Intelligence in the gap", text: "The edge controller compares expected with measured performance, protects battery reserves and coordinates energy, water and cleaning." },
];

const DESTINATIONS = [
  { n: "01", name: "3D model", text: "Orbit the assembled machine and inspect every hardware and software layer.", href: "model.html", cta: "Open the model" },
  { n: "02", name: "Exploded view", text: "Scroll as System 01 comes apart and rebuilds, subsystem by subsystem.", href: "explore.html", cta: "Take it apart" },
  { n: "03", name: "Configure a site", text: "Use your location's 20-year climate record, or set requirements by hand.", href: "configure.html", cta: "Engineer your sun" },
  { n: "04", name: "WELOS OS", text: "Watch the control system dispatch energy and water in a live simulation.", href: "control.html", cta: "Open Control OS" },
];

/* ───────────────────────── pieces ───────────────────────── */

/** The WELOS ring + wordmark, built for animation (band, blade, cut, letters are separate targets). */
function LogoMark({ className }) {
  const g = emblem.gradientLine;
  return (
    <svg className={className} viewBox="-166 -44 562 124" role="img" aria-label="welos">
      <defs>
        <linearGradient id="lm-band" gradientUnits="userSpaceOnUse" x1={g.x1} y1={g.y1} x2={g.x2} y2={g.y2} gradientTransform={emblem.rotate}>
          {emblem.gradient.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
        </linearGradient>
        <linearGradient id="lm-blade" gradientUnits="userSpaceOnUse" x1="3" y1="101" x2="126" y2="45">
          {emblem.bladeGradient.map(([o, c]) => <stop key={o} offset={o} stopColor={c} />)}
        </linearGradient>
        <mask id="lm-cut" maskUnits="userSpaceOnUse" x="-40" y="-40" width="208" height="208">
          <rect x="-40" y="-40" width="208" height="208" fill="#fff" />
          <path data-cut d={emblem.cut} fill="#000" />
        </mask>
      </defs>
      <g transform="translate(-158 -37) scale(1.05)">
        <g mask="url(#lm-cut)">
          <g data-band>
            <path d={emblem.band} fill="url(#lm-band)" fillRule="evenodd" transform={emblem.rotate} />
          </g>
        </g>
        <path data-blade d={emblem.blade} fill="url(#lm-blade)" />
      </g>
      {wordmark.map((w, i) =>
        w.kind === "fill" ? (
          <path key={i} data-fill d={w.d} fill="currentColor" />
        ) : (
          <path key={i} data-stroke d={w.d} fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinejoin="miter" />
        ),
      )}
    </svg>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const on = () => setScrolled(window.scrollY > 40);
    on(); window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  return (
    <header className={`site-header ${scrolled ? "is-scrolled" : ""}`}>
      <a className="site-brand" href="./" aria-label="WELOS home"><img src="brand/welos-logo.svg" alt="welos" /></a>
      <nav aria-label="Page sections">
        <a href="#motto">Motto</a>
        <a href="#capture">Capture</a>
        <a href="#engineer">Engineer</a>
        <a href="#next">What's next</a>
        <a href="#explore">Explore</a>
      </nav>
      <a className="header-cta" href="model.html">Open 3D model <span aria-hidden="true">↗</span></a>
    </header>
  );
}

/* ───────────────────────── chapters ───────────────────────── */

function Hero() {
  const root = useRef(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (reducedMotion()) return;
    // Scene 1 — the solar arrival
    const intro = gsap.timeline({ defaults: { ease: "expo.out" } });
    intro
      .fromTo(q(".hero-art"), { scale: 1.14, filter: "brightness(0) saturate(1.4)" }, { scale: 1, filter: "brightness(1) saturate(1)", duration: 3.2 }, 0)
      .fromTo(q(".sun-bloom"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 3, ease: "power2.out" }, 0.3)
      .fromTo(q(".glint"), { opacity: 0 }, { opacity: 1, duration: 0.25, ease: "power1.in" }, 1.9)
      .to(q(".glint"), { opacity: 0.75, duration: 0.6, ease: "power1.out" }, 2.15)
      .from(q("[data-line]"), { yPercent: 110, duration: 1.4, stagger: 0.14 }, 0.7)
      .from(q("[data-fade]"), { opacity: 0, y: 16, duration: 1.1, stagger: 0.1, ease: "power3.out" }, 1.4);
    // Scroll — fly into the sun
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.7 }, defaults: { ease: "none" } })
      .to(q(".hero-art"), { scale: 2.1, duration: 1 }, 0)
      .to(q(".hero-copy"), { yPercent: -14, opacity: 0, duration: 0.45 }, 0)
      .to(q(".hero-chrome"), { opacity: 0, duration: 0.25 }, 0)
      .to(q(".flash"), { opacity: 1, duration: 0.35 }, 0.62)
      .to(q(".flash"), { opacity: 0.0, duration: 0.03 }, 0.97);
  }, { scope: root });

  return (
    <section className="hero" id="motto" ref={root} aria-labelledby="hero-title">
      <div className="pin">
        <div className="hero-art">
          <picture>
            <source media="(max-aspect-ratio: 1/1)" srcSet="story/solar-figure-portrait.webp" />
            <img src="story/solar-figure.webp" alt="The Solar Figure: a young man with curly hair and glowing amber glasses stands before an immense sun." fetchpriority="high" />
          </picture>
          <span className="sun-bloom" aria-hidden="true" />
          <span className="glint glint-l" aria-hidden="true" />
          <span className="glint glint-r" aria-hidden="true" />
        </div>
        <Embers className="embers" />
        <div className="hero-grade" aria-hidden="true" />
        <div className="flash" aria-hidden="true" />

        <div className="hero-copy">
          <p className="eyebrow" data-fade><span className="dot" /> WELOS · Solar · Wind · Water</p>
          <h1 id="hero-title" className="display hero-title">
            <span className="line"><span data-line>We don&rsquo;t just capture energy.</span></span>
            <span className="line"><span data-line className="gradient">We engineer what comes next.</span></span>
          </h1>
          <p className="hero-sub" data-fade>One rooftop machine that captures the sun, the wind and the rain — and the intelligence that makes them work as one.</p>
          <div className="hero-actions" data-fade>
            <a className="btn btn-solar" href="#capture">See how <span aria-hidden="true">↓</span></a>
            <a className="btn btn-ghost" href="model.html">Explore the machine</a>
          </div>
        </div>
        <div className="hero-chrome" aria-hidden="true">
          <span>WLS / 001 — THE SOLAR FIGURE</span>
          <span className="scroll-cue">SCROLL <i /></span>
        </div>
      </div>
    </section>
  );
}

function Capture() {
  const root = useRef(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (reducedMotion()) return;
    const stage = q(".spot")[0];
    const set = (f) => ({ "--x": f.x, "--y": f.y, "--r": f.r });
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 }, defaults: { ease: "power2.inOut" } });
    tl.fromTo(q(".ring"), { scale: 0.86, rotate: -7, opacity: 0.35 }, { scale: 1, rotate: 0, opacity: 1, duration: 1 }, 0)
      .fromTo(stage, { "--x": "50%", "--y": "50%", "--r": "90%", "--dim": 0 }, { "--dim": 0.78, duration: 0.6 }, 0.8);
    FORCES.forEach((f, i) => {
      const at = 1.4 + i * 1.6;
      tl.to(stage, { ...set(f), duration: 0.8 }, at)
        .to(q(`[data-step="${f.key}"]`), { opacity: 1, y: 0, duration: 0.5 }, at + 0.2)
        .to(q(`[data-pin="${f.key}"]`), { opacity: 1, scale: 1, duration: 0.4 }, at + 0.3)
        .fromTo(q(".beam"), { xPercent: -120, opacity: 0 }, { xPercent: 120, opacity: 1, duration: 0.9, ease: "power1.inOut" }, at)
        .to(q(`[data-tick="${i}"]`), { scaleX: 1, duration: 0.6 }, at);
      tl.to(q(`[data-step="${f.key}"]`), { opacity: 0, y: -20, duration: 0.4 }, at + 1.35);
    });
    tl.to(stage, { "--r": "140%", "--dim": 0, duration: 0.9 }, 6.3)
      .to(q("[data-step='all']"), { opacity: 1, y: 0, duration: 0.5 }, 6.5)
      .to(q(".capture-intro"), { opacity: 0.0, duration: 0.3 }, 1.3)
      .to({}, { duration: 0.6 });
  }, { scope: root });

  return (
    <section className="capture" id="capture" ref={root} aria-labelledby="capture-title">
      <div className="pin">
        <div className="capture-text">
          <p className="chapter"><span>01</span> Capture</p>
          <div className="steps">
            <div className="capture-intro step-card">
              <h2 id="capture-title" className="display">Three forces.<br /><span className="muted">Never at the same time.</span></h2>
              <p>Sun, wind and rain arrive in different amounts, at different hours. Most systems catch one of them. WELOS is built to catch all three — on a single footprint.</p>
            </div>
            {FORCES.map((f) => (
              <article className="step-card is-hidden" data-step={f.key} key={f.key}>
                <span className="step-code">{f.code} / {f.name}</span>
                <h3 className="display">{f.title}</h3>
                <p>{f.text}</p>
                <p className="stat"><strong>{f.stat}</strong> <span>{f.unit}</span></p>
              </article>
            ))}
            <article className="step-card is-hidden" data-step="all">
              <span className="step-code">01 + 02 + 03</span>
              <h3 className="display">One loop.<br /><span className="gradient">Nothing left on the roof.</span></h3>
              <p>When the sun fades, wind picks up. When storms pass, the tank is full. Captured together, three uneven resources become one steady supply.</p>
            </article>
          </div>
          <div className="ticks" aria-hidden="true">
            {FORCES.map((f, i) => <span key={f.key}><i data-tick={i} /><b>{f.name}</b></span>)}
          </div>
        </div>

        <div className="ring-wrap">
          <div className="ring">
            <img src="story/three-forces.webp" alt="A ring that is part sun, part cloud and part ocean wave, sliced by a blade of light." loading="lazy" />
            <div className="spot" aria-hidden="true" />
            <div className="beam" aria-hidden="true" />
            {FORCES.map((f) => (
              <span className={`pin-label ${f.key === "sun" ? "flip" : ""}`} data-pin={f.key} key={f.key} style={{ left: f.x, top: f.y }} aria-hidden="true">
                <i /><b>{f.code} · {f.name}</b>
              </span>
            ))}
          </div>
          <p className="ring-caption">The WELOS mark — sun, wind and water as one loop, cut by a blade of light.</p>
        </div>
      </div>
    </section>
  );
}

function Engineer() {
  const root = useRef(null);
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    if (reducedMotion()) return;
    const strokes = q("[data-stroke]");
    strokes.forEach((p) => { const len = p.getTotalLength() + 2; gsap.set(p, { strokeDasharray: `${len} ${len}`, strokeDashoffset: len, opacity: 0 }); });
    const tl = gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.6 }, defaults: { ease: "none" } });
    tl.from(q(".eng-head > *"), { opacity: 0, y: 30, stagger: 0.1, duration: 0.4 }, 0)
      // one loop: the band turns into place
      .fromTo(q("[data-band]"), { opacity: 0, rotate: -150, scale: 0.6, svgOrigin: "64 64" }, { opacity: 1, rotate: 0, scale: 1, svgOrigin: "64 64", duration: 0.9, ease: "power3.out" }, 0.2)
      // three forces named on the band
      .fromTo(q("[data-force]"), { opacity: 0, y: 8 }, { opacity: 1, y: 0, stagger: 0.18, duration: 0.25 }, 0.9)
      // the blade of light cuts across all three
      .fromTo([q("[data-blade]"), q("[data-cut]")], { x: -150, opacity: 0 }, { x: 0, opacity: 1, duration: 0.5, ease: "power2.out" }, 1.55)
      .fromTo(q(".blade-note"), { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: 0.3 }, 1.85)
      // the name follows
      .fromTo(q("[data-fill]"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.3, ease: "power2.out" }, 2.0)
      .set(strokes, { opacity: 1 }, 2.04)
      .to(strokes, { strokeDashoffset: 0, stagger: 0.12, duration: 0.5, ease: "power1.inOut" }, 2.05);
    LOOP.forEach((_, i) => tl.to(q(`[data-node="${i}"]`), { "--on": 1, duration: 0.25 }, 2.7 + i * 0.3));
    tl.to(q(".loop-bar i"), { scaleX: 1, duration: 1.2 }, 2.7).to({}, { duration: 0.5 });
  }, { scope: root });

  return (
    <section className="engineer" id="engineer" ref={root} aria-labelledby="engineer-title">
      <div className="pin">
        <div className="eng-head">
          <p className="chapter"><span>02</span> Engineer</p>
          <h2 id="engineer-title" className="display">Capturing is the easy part.<br /><span className="gradient">Engineering is the point.</span></h2>
          <p className="lede">Our mark is the system. One loop where water, wind and sun shade into each other — and a blade of light that cuts across all three. That blade is the intelligence: it is what turns three uneven forces into one supply.</p>
        </div>
        <div className="eng-mark">
          <div className="eng-logo">
            <LogoMark className="eng-wordmark" />
            <span className="force-tag" data-force style={{ left: "4%", top: "97%" }}>Water</span>
            <span className="force-tag" data-force style={{ left: "-8%", top: "34%" }}>Wind</span>
            <span className="force-tag" data-force style={{ left: "22%", top: "-6%" }}>Sun</span>
          </div>
          <p className="blade-note"><i /> The blade — intelligence cutting across every resource.</p>
        </div>
        <div className="loop">
          <div className="loop-bar" aria-hidden="true"><i /></div>
          <ol>
            {LOOP.map((step, i) => (
              <li key={step} data-node={i}><span>0{i + 1}</span><b>{step}</b></li>
            ))}
          </ol>
          <p>Every cycle, the edge controller compares expected with measured output, protects battery reserves, and decides when to store, clean and share — locally, even offline.</p>
        </div>
      </div>
    </section>
  );
}

function Next() {
  const root = useRef(null);
  const canvas = useRef(null);
  const sceneRef = useRef(null);
  const [active, setActive] = useState(0);
  const [failed, setFailed] = useState(false);

  // Lazy-load the real WELOS 3D model only when the chapter approaches.
  useEffect(() => {
    let disposed = false;
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting || sceneRef.current) return;
      io.disconnect();
      try {
        const { createWelosScene } = await import("../model/scene.js");
        if (disposed) return;
        sceneRef.current = createWelosScene(canvas.current, { transparent: true, controlsEnabled: false, onError: (e) => { console.error("[welos] renderer", e); setFailed(true); } });
        if (!sceneRef.current) setFailed(true);
      } catch (error) { console.error("[welos] 3D scene failed", error); setFailed(true); }
    }, { rootMargin: "120% 0px" });
    if (root.current) io.observe(root.current);
    return () => { disposed = true; io.disconnect(); sceneRef.current?.dispose(); sceneRef.current = null; };
  }, []);

  useEffect(() => { sceneRef.current?.setView(SYSTEMS[Math.min(active, SYSTEMS.length - 1)].view); }, [active]);

  useGSAP(() => {
    if (reducedMotion()) return;
    ScrollTrigger.create({
      trigger: root.current, start: "top top", end: "bottom bottom",
      onUpdate: (self) => {
        const p = self.progress;
        const steps = SYSTEMS.length + 1; // last step = exploded
        const idx = Math.min(steps - 1, Math.floor(p * steps));
        setActive(idx);
        const ex = gsap.utils.clamp(0, 1, (p - (steps - 1) / steps) * steps * 1.4);
        sceneRef.current?.setExploded(ex);
        if (idx === steps - 1) sceneRef.current?.setView("overview");
      },
    });
  }, { scope: root });

  const exploded = active >= SYSTEMS.length;
  return (
    <section className="next" id="next" ref={root} aria-labelledby="next-title">
      <div className="pin">
        <div className="next-copy">
          <p className="chapter"><span>03</span> What comes next</p>
          <h2 id="next-title" className="display">This is System 01.</h2>
          <ol className="system-steps">
            {SYSTEMS.map((s, i) => (
              <li key={s.view} className={i === active ? "on" : i < active ? "done" : ""}>
                <span>{s.code}</span>
                <div><b>{s.name}</b><p>{s.text}</p></div>
              </li>
            ))}
            <li className={exploded ? "on" : ""}>
              <span>↯</span>
              <div><b>Taken apart</b><p>Every component, separated along the path it leaves during service.</p></div>
            </li>
          </ol>
          <a className="btn btn-ghost" href="model.html">Inspect it in 3D <span aria-hidden="true">↗</span></a>
        </div>
        <div className="next-stage">
          <div className="next-glow" aria-hidden="true" />
          <div className="next-canvas" ref={canvas} />
          {failed && <img className="next-fallback" src="explore/ref-full.jpg" alt="The WELOS System 01 rooftop appliance" />}
          <span className="sim-tag">Concept model · not production CAD</span>
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────── page ───────────────────────── */

export function Landing() {
  const root = useRef(null);
  useGSAP(() => {
    if (reducedMotion()) return;
    gsap.utils.toArray(".reveal").forEach((el) => {
      gsap.from(el.children, { opacity: 0, y: 28, duration: 1, stagger: 0.08, ease: "power3.out", scrollTrigger: { trigger: el, start: "top 82%", once: true } });
    });
  }, { scope: root });

  return (
    <div className={`site ${typeof window !== "undefined" && reducedMotion() ? "rm" : ""}`} ref={root}>
      <a className="skip" href="#main">Skip to content</a>
      <Header />
      <main id="main">
        <Hero />
        <Capture />
        <Engineer />
        <Next />

        <section className="evidence wrap" aria-labelledby="evidence-title">
          <div className="reveal section-head">
            <p className="chapter"><span>04</span> The motto, measured</p>
            <h2 id="evidence-title" className="display">Ambition needs numbers.</h2>
            <p className="lede">Reference ranges from the WELOS UAE concept study — the conditions System 01 is engineered for.</p>
          </div>
          <div className="evidence-grid reveal">
            {EVIDENCE.map((e) => (
              <article key={e.label}>
                <span>{e.label}</span>
                <strong>{e.value}<small>{e.unit}</small></strong>
                <p>{e.detail}</p>
              </article>
            ))}
          </div>
          <p className="footnote">Study inputs, not guaranteed performance at a particular address. Every site design starts with local measurement.</p>
        </section>

        <section className="principles wrap" aria-labelledby="principles-title">
          <div className="reveal section-head">
            <p className="chapter"><span>05</span> How we engineer</p>
            <h2 id="principles-title" className="display">Three rules, one machine.</h2>
          </div>
          <div className="principle-grid reveal">
            {PRINCIPLES.map((p) => (
              <article key={p.n}><span>{p.n}</span><h3 className="display">{p.title}</h3><p>{p.text}</p></article>
            ))}
          </div>
        </section>

        <section className="explore wrap" id="explore" aria-labelledby="explore-title">
          <div className="reveal section-head">
            <p className="chapter"><span>06</span> Explore the work</p>
            <h2 id="explore-title" className="display">Go inside System 01.</h2>
            <p className="lede">Interactive concepts — engineering explorations, not fabrication-ready documents.</p>
          </div>
          <div className="destination-grid reveal">
            {DESTINATIONS.map((d) => (
              <a className="destination" key={d.name} href={d.href}>
                <span className="d-n">{d.n} / Explore</span>
                <h3 className="display">{d.name}</h3>
                <p>{d.text}</p>
                <span className="d-cta">{d.cta} <i aria-hidden="true">↗</i></span>
              </a>
            ))}
          </div>
        </section>

        <section className="closing" aria-labelledby="closing-title">
          <img src="story/solar-figure.webp" alt="" aria-hidden="true" loading="lazy" />
          <div className="closing-inner wrap reveal">
            <h2 id="closing-title" className="display">We were never meant<br /><span className="gradient">to fear the sun.</span></h2>
            <a className="btn btn-solar" href="configure.html">Engineer your sun <span aria-hidden="true">→</span></a>
          </div>
        </section>
      </main>

      <footer className="site-footer wrap">
        <img src="brand/welos-logo.svg" alt="welos" />
        <p>We don&rsquo;t just capture energy. We engineer what comes next.</p>
        <p className="small">Concept hardware · figures are roadmap design targets · © {new Date().getFullYear()} WELOS</p>
      </footer>
    </div>
  );
}
