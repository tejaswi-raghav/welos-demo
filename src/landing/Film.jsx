import React, { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger, useGSAP);

/**
 * The landing film — one continuous shot, driven by scroll.
 *
 *   0.00–0.36  the clip plays: the camera pushes in on the Solar Figure
 *   0.36–0.72  it holds on his face while the problem is laid out
 *   0.72–0.88  we fall into his right lens
 *   0.86–1.00  the lens becomes light, and the motto appears in it
 *
 * Frames are an image sequence drawn to a canvas (smooth scrubbing in every
 * browser); the final close-up is a full-resolution still used for the zoom.
 */

const FRAME_COUNT = 64;
const P_CLIP = 0.36;
const P_ZOOM = [0.72, 0.9];
// right-lens core, normalised to the 1920×1080 source
const EYE = { x: 0.5628, y: 0.3523 };
const SM_CROP = { x0: 420 / 1920, w: 1080 / 1920 }; // mobile frames are a centred square crop

const PROBLEM = [
  {
    k: "01", t: "An arid rooftop receives 2,285 kWh of sunlight per square metre, every year.",
    s: "Abundance was never the problem.",
  },
  {
    k: "02", t: "But the sun, the wind and the rain never arrive together.",
    s: "Wind drifts between 1.1 and 4.5 m/s. Rain falls just 94.7–130 mm a year, in a few violent bursts. Most rooftop systems catch one resource and let the others go.",
  },
  {
    k: "03", t: "And dust quietly steals up to 12.7% of a panel's output.",
    s: "Panels are washed on a calendar, not when they need it — spending scarce water to recover power that was already lost.",
  },
  {
    k: "04", t: "Resources exist. Coordination is missing.",
    s: "Separate systems compete for the same roof, report to separate dashboards, and fail separately.",
  },
];

const base = import.meta.env.BASE_URL;
const pad = (n) => String(n).padStart(3, "0");

export function Film() {
  const root = useRef(null);
  const canvas = useRef(null);
  const state = useRef({ p: 0, frames: [], final: null, small: false, ready: false });

  /* ── load frames progressively: keyframes first, then fill the gaps ── */
  useEffect(() => {
    const s = state.current;
    s.small = window.matchMedia("(max-aspect-ratio: 1/1)").matches;
    const dir = s.small ? "sm" : "lg";
    s.frames = new Array(FRAME_COUNT).fill(null);
    const order = [];
    for (const step of [16, 8, 4, 2, 1]) for (let i = 0; i < FRAME_COUNT; i += step) if (!order.includes(i)) order.push(i);
    let cancelled = false;
    const load = (src) => new Promise((resolve) => { const img = new Image(); img.decoding = "async"; img.onload = () => resolve(img); img.onerror = () => resolve(null); img.src = src; });
    (async () => {
      const first = await load(`${base}film/${dir}/f001.webp`);
      if (cancelled) return;
      s.frames[0] = first; s.ready = true;
      const finalP = load(`${base}film/final.webp`).then((img) => { s.final = img; });
      // load in small parallel batches, in priority order
      for (let i = 1; i < order.length; i += 6) {
        const batch = order.slice(i, i + 6);
        const imgs = await Promise.all(batch.map((n) => load(`${base}film/${dir}/f${pad(n + 1)}.webp`)));
        if (cancelled) return;
        batch.forEach((n, j) => { s.frames[n] = imgs[j]; });
      }
      await finalP;
    })();
    return () => { cancelled = true; };
  }, []);

  /* ── render loop ── */
  useEffect(() => {
    const cv = canvas.current;
    const ctx = cv.getContext("2d");
    const s = state.current;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let raf = 0, visible = true, lastDrawn = -1;
    const resize = () => { cv.width = Math.round(cv.clientWidth * dpr); cv.height = Math.round(cv.clientHeight * dpr); lastDrawn = -1; };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(cv);
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) loop(); });
    io.observe(cv);

    const nearest = (i) => {
      for (let d = 0; d < FRAME_COUNT; d++) {
        if (s.frames[i - d]) return s.frames[i - d];
        if (s.frames[i + d]) return s.frames[i + d];
      }
      return null;
    };
    const ease = (t) => t * t * t; // accelerating fall into the lens

    function draw() {
      const p = s.p;
      const W = cv.width, H = cv.height;
      let img, fx = EYE.x, fy = EYE.y, zoom = 1;
      if (p < P_CLIP || !s.final) {
        img = nearest(Math.round(Math.min(1, p / P_CLIP) * (FRAME_COUNT - 1)));
        if (s.small) fx = (EYE.x - SM_CROP.x0) / SM_CROP.w;
      } else {
        img = s.final;
      }
      if (!img) return;
      // hold: a slow push; zoom: accelerate into the lens
      if (p >= P_CLIP) {
        const hold = gsap.utils.clamp(0, 1, (p - P_CLIP) / (P_ZOOM[0] - P_CLIP));
        const z = gsap.utils.clamp(0, 1, (p - P_ZOOM[0]) / (P_ZOOM[1] - P_ZOOM[0]));
        zoom = 1 + hold * 0.14 + ease(z) * 26;
      }
      const iw = img.naturalWidth, ih = img.naturalHeight;
      // on portrait screens the full-res final still is cropped like the mobile frames
      let cropX = 0, cropW = iw;
      if (s.small && img === s.final) { cropX = SM_CROP.x0 * iw; cropW = SM_CROP.w * iw; }
      const k = Math.max(W / cropW, H / ih) * zoom;
      const dw = cropW * k, dh = ih * k;
      // the focal point drifts from where it sits in the frame to the screen centre as we zoom
      const z01 = gsap.utils.clamp(0, 1, (zoom - 1) / 4);
      const fxImg = (img === s.final && s.small ? (EYE.x * iw - cropX) / cropW : img === s.final ? EYE.x : fx);
      const coverX = W / 2 + (fxImg - 0.5) * (cropW * Math.max(W / cropW, H / ih));
      const coverY = H / 2 + (fy - 0.5) * (ih * Math.max(W / cropW, H / ih));
      const tx = coverX + (W / 2 - coverX) * z01;
      const ty = coverY + (H * 0.45 - coverY) * z01;
      const x = tx - fxImg * dw;
      const y = ty - fy * dh;
      ctx.drawImage(img, cropX, 0, cropW, ih, x, y, dw, dh);
    }

    function loop() {
      cancelAnimationFrame(raf);
      const tick = () => {
        if (!visible) return;
        const key = Math.round(state.current.p * 4000) + (state.current.final ? 1 : 0) + state.current.frames.filter(Boolean).length * 10000;
        if (key !== lastDrawn) { draw(); lastDrawn = key; }
        raf = requestAnimationFrame(tick);
      };
      raf = requestAnimationFrame(tick);
    }
    loop();
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, []);

  /* ── scroll choreography ── */
  useGSAP(() => {
    const q = gsap.utils.selector(root);
    const s = state.current;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) { s.p = 0.6; return; }
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: { trigger: root.current, start: "top top", end: "bottom bottom", scrub: 0.8 },
      onUpdate() { s.p = tl.progress(); },
    });
    tl.set({}, {}, 1); // timeline spans exactly 0 → 1
    // opening chrome
    tl.to(q(".film-open"), { opacity: 0, y: -20, duration: 0.05 }, 0.03);
    // hold: shade the left side so the problem reads
    tl.fromTo(q(".film-shade"), { opacity: 0 }, { opacity: 1, duration: 0.04 }, P_CLIP + 0.01)
      .to(q(".film-shade"), { opacity: 0, duration: 0.04 }, 0.71);
    tl.fromTo(q(".film-problem-head"), { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.03 }, P_CLIP + 0.02)
      .to(q(".film-problem-head"), { opacity: 0, duration: 0.03 }, 0.7);
    PROBLEM.forEach((_, i) => {
      const a = 0.4 + i * 0.08;
      tl.fromTo(q(`[data-problem="${i}"]`), { opacity: 0, y: 26 }, { opacity: 1, y: 0, duration: 0.025 }, a)
        .to(q(`[data-problem="${i}"]`), { opacity: 0, y: -18, duration: 0.02 }, a + 0.06)
        .to(q(`[data-dot="${i}"]`), { backgroundColor: "#FFE135", duration: 0.01 }, a);
    });
    tl.fromTo(q(".film-ticks"), { opacity: 0 }, { opacity: 1, duration: 0.02 }, 0.39).to(q(".film-ticks"), { opacity: 0, duration: 0.02 }, 0.71);
    // the fall
    tl.fromTo(q(".film-eye-line"), { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.03 }, 0.735)
      .to(q(".film-eye-line"), { opacity: 0, duration: 0.03 }, 0.82);
    tl.fromTo(q(".film-light"), { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "power2.in" }, 0.82);
    // the motto, inside the light
    tl.fromTo(q(".film-motto > *"), { opacity: 0, y: 30 }, { opacity: 1, y: 0, stagger: 0.015, duration: 0.04 }, 0.89);
  }, { scope: root });

  return (
    <section className="film" id="film" ref={root} aria-labelledby="film-title">
      <div className="pin">
        <img className="film-poster" src={`${base}film/${typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "final" : "poster"}.webp`} alt="" aria-hidden="true" />
        <canvas ref={canvas} className="film-canvas" role="img" aria-label="The Solar Figure stands before an immense sun; the camera moves in until his glowing glasses fill the screen." />
        <div className="film-grade" aria-hidden="true" />
        <div className="film-shade" aria-hidden="true" />

        <div className="film-open">
          <p className="eyebrow"><span className="dot" /> WELOS presents · System 01</p>
          <h1 id="film-title" className="display film-title">Engineer the sun.</h1>
          <p className="scroll-hint">Scroll to play <span aria-hidden="true">↓</span></p>
        </div>

        <div className="film-problem">
          <p className="chapter film-problem-head"><span>00</span> The problem</p>
          <div className="film-cards">
            {PROBLEM.map((c, i) => (
              <article className="film-card" data-problem={i} key={c.k}>
                <h2 className="display">{c.t}</h2>
                <p>{c.s}</p>
              </article>
            ))}
          </div>
          <div className="film-ticks" aria-hidden="true">
            {PROBLEM.map((c, i) => <i key={c.k} data-dot={i} />)}
          </div>
        </div>

        <p className="film-eye-line display">He doesn&rsquo;t look away from the sun.<br /><span>Neither do we.</span></p>

        <div className="film-light" aria-hidden="true" />
        <div className="film-motto">
          <p className="eyebrow ink">WELOS</p>
          <p className="display motto-line">We don&rsquo;t just capture energy.</p>
          <p className="display motto-line strong">We engineer what comes next.</p>
          <p className="motto-sub">Out of the light — System 01 <span aria-hidden="true">↓</span></p>
        </div>
      </div>
    </section>
  );
}
