import React, { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Film } from "./Film.jsx";
import { wordmark, emblem, STROKE } from "./brand.js";

gsap.registerPlugin(ScrollTrigger, useGSAP);

const reducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ───────────────────────── content ───────────────────────── */

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
        <a href="#film">The problem</a>
        <a href="#next">System 01</a>
        <a href="#engineer">Engineer</a>
        <a href="#explore">Explore</a>
      </nav>
      <a className="header-cta" href="model.html">Open 3D model <span aria-hidden="true">↗</span></a>
    </header>
  );
}

/* ───────────────────────── chapters ───────────────────────── */

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
    const q = gsap.utils.selector(root);
    // the hero arises: out of the film's light, the machine rises into place
    gsap.timeline({ scrollTrigger: { trigger: root.current, start: "top 40%", end: "top top", scrub: 0.6 }, defaults: { ease: "none" } })
      .fromTo(q(".next-light"), { opacity: 1 }, { opacity: 0, duration: 1, ease: "power1.in" }, 0)
      .fromTo(q(".next-rise"), { yPercent: 38, scale: 0.62, opacity: 0.15 }, { yPercent: 0, scale: 1, opacity: 1, duration: 1, ease: "power2.out" }, 0)
      .fromTo(q(".next-copy"), { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.5 }, 0.5);
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
          <p className="chapter"><span>01</span> What comes next</p>
          <h2 id="next-title" className="display">Out of the light:<br /><span className="gradient">System 01.</span></h2>
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
          <div className="next-rise">
            <div className="next-canvas" ref={canvas} />
            {failed && <img className="next-fallback" src="explore/ref-full.jpg" alt="The WELOS System 01 rooftop appliance" />}
          </div>
          <span className="sim-tag">Concept model · not production CAD</span>
        </div>
        <div className="next-light" aria-hidden="true" />
      </div>
    </section>
  );
}

/** Looping film behind the closing line — fetched only when it's about to be seen. */
function ClosingVideo() {
  const ref = useRef(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || reducedMotion()) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        if (!v.src) v.src = `${import.meta.env.BASE_URL}film/loop.mp4`;
        v.play().catch(() => {});
      } else v.pause();
    }, { rootMargin: "50% 0px" });
    io.observe(v);
    return () => io.disconnect();
  }, []);
  return <video ref={ref} className="closing-video" poster={`${import.meta.env.BASE_URL}film/final.webp`} muted loop playsInline preload="none" aria-hidden="true" />;
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
        <Film />
        <Next />
        <Engineer />

        <section className="evidence wrap" aria-labelledby="evidence-title">
          <div className="reveal section-head">
            <p className="chapter"><span>03</span> The conditions</p>
            <h2 id="evidence-title" className="display">The numbers behind the problem.</h2>
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
            <p className="chapter"><span>04</span> How we engineer</p>
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
            <p className="chapter"><span>05</span> Explore the work</p>
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
          <ClosingVideo />
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
