"use client";

import Link from "next/link";
import { useRef } from "react";
import { SunCanvas, type SunParams } from "@/components/visual/SunCanvas";
import { SolarFigure } from "@/components/brand/SolarFigure";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

export function Hero() {
  const root = useRef<HTMLElement>(null);
  const params = useRef<SunParams>({ reveal: 0, scroll: 0, sweep: 0, x: 0 });

  useGSAP(
    () => {
      const el = root.current!;
      // Hand intro elements from the CSS failsafe to GSAP (idempotent for StrictMode re-runs)
      const intro = gsap.utils.toArray<HTMLElement>("[data-intro], [data-intro-done]", el);
      intro.forEach((n) => { n.removeAttribute("data-intro"); n.setAttribute("data-intro-done", ""); });
      gsap.set(intro, { opacity: 0 });

      const mm = gsap.matchMedia();
      mm.add({ wide: "(min-width: 1024px)", narrow: "(max-width: 1023px)" }, (ctx) => {
        params.current.x = ctx.conditions?.wide ? 0.4 : 0;
      });

      if (prefersReducedMotion()) {
        params.current.reveal = 1;
        gsap.set(intro, { opacity: 1 });
        gsap.set("[data-glasses]", { "--glow": 1 });
        return;
      }

      // ── Scene 1: the solar arrival (≈3 s, never blocks scrolling) ──
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
      tl.to(params.current, { reveal: 1, duration: 3.2, ease: "expo.inOut" }, 0)
        .fromTo("[data-figure]", { opacity: 0, yPercent: 4 }, { opacity: 1, yPercent: 0, duration: 2.2, ease: "power2.out" }, 0.9)
        .fromTo("[data-glasses]", { "--glow": 0 }, { "--glow": 1, duration: 1.2, ease: "power2.inOut" }, 2.1)
        .fromTo("[data-line]", { opacity: 0, yPercent: 60 }, { opacity: 1, yPercent: 0, duration: 1.1, stagger: 0.12 }, 0.3)
        .fromTo("[data-intro-done][data-fade]", { opacity: 0, y: 14 }, { opacity: 1, y: 0, duration: 0.9 }, 0.8)
        .from("[data-fade]:not([data-intro-done])", { y: 18, duration: 1.2, stagger: 0.08 }, 0.5)
        .fromTo("[data-chrome]", { opacity: 0 }, { opacity: 1, duration: 1 }, 2.0);

      // ── Scroll: camera moves past the figure toward the horizon ──
      const st = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.6 },
        defaults: { ease: "none" },
      });
      st.to(params.current, { scroll: 1, duration: 1 }, 0)
        .to("[data-figure-wrap]", { scale: 1.55, yPercent: 26, opacity: 0, duration: 0.75 }, 0)
        .to("[data-copy]", { yPercent: -18, opacity: 0, duration: 0.45 }, 0)
        .to("[data-chrome-wrap]", { opacity: 0, duration: 0.3 }, 0)
        .to("[data-flood]", { opacity: 1, duration: 0.45 }, 0.55);
    },
    { scope: root },
  );

  return (
    <section ref={root} aria-labelledby="hero-title" className="relative h-[175svh]">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <SunCanvas params={params} mode="hero" className="absolute inset-0 h-full w-full" />

        {/* The Solar Figure — backlit, face lost in the light */}
        <div
          data-figure-wrap
          className="pointer-events-none absolute left-1/2 top-[12svh] w-[min(84vw,46svh)] origin-bottom -translate-x-1/2 sm:top-auto sm:bottom-0 sm:w-[min(80vw,60svh)] lg:left-[calc(50%+40svh)] lg:w-[min(44vw,72svh)]"
        >
          <div data-figure data-intro data-glasses style={{ ["--glow" as string]: 1 }}>
            <SolarFigureGlow />
          </div>
        </div>

        {/* Light flood that carries into the next section */}
        <div
          data-flood
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-0"
          style={{ background: "radial-gradient(70% 45% at 50% 100%, rgba(255,138,0,.28), rgba(255,138,0,0) 70%), linear-gradient(to bottom, rgba(11,11,11,0) 0%, rgba(11,11,11,.55) 45%, #0b0b0b 92%)" }}
        />

        {/* Top scrim keeps navigation legible over the sun */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-44 bg-gradient-to-b from-carbon/75 to-transparent" />
        {/* Legibility scrim behind copy */}
        <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 h-[55%] bg-gradient-to-t from-carbon via-carbon/70 to-transparent lg:h-[45%] lg:via-carbon/40" />

        <div data-copy className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-[max(2.5rem,6svh)] md:px-10 lg:pb-[9svh]">
          <p data-fade data-intro className="eyebrow mb-6 hidden items-center gap-3 text-ink-300 sm:flex">
            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-solar" />
            Renewable energy technology — solar · wind · water
          </p>
          <h1 id="hero-title" className="display max-w-[15ch] text-[clamp(2.6rem,6.4vw,6.5rem)] text-paper">
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line data-intro className="block">The future isn&rsquo;t powered.</span>
            </span>
            <span className="block overflow-hidden pb-[0.06em]">
              <span data-line data-intro className="block">
                It&rsquo;s <span className="text-gradient-solar">engineered.</span>
              </span>
            </span>
          </h1>
          <p data-fade className="mt-7 max-w-[46ch] text-base leading-relaxed text-ink-200 md:text-lg">
            Intelligent renewable energy systems built to capture more, waste less, and power what comes next.
          </p>
          <div data-fade className="mt-9 flex flex-wrap items-center gap-3">
            <Link
              href="#energy"
              className="group inline-flex h-12 items-center gap-3 bg-solar px-6 text-sm font-semibold text-carbon transition-colors hover:bg-[#fff07a]"
            >
              Explore Our Technology
              <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-0.5">→</span>
            </Link>
            <Link
              href="#campaign"
              className="inline-flex h-12 items-center border border-white/20 px-6 text-sm font-semibold text-paper transition-colors hover:border-paper"
            >
              Discover WELOS
            </Link>
          </div>
        </div>

        {/* Engineering chrome: coordinates + scroll cue */}
        <div data-chrome-wrap className="pointer-events-none absolute inset-x-0 top-0 z-10 hidden h-full md:block">
          <div data-chrome data-intro className="mx-auto flex h-full max-w-[1440px] flex-col justify-between px-10 pb-10 pt-28">
            <div className="flex justify-between text-[11px] tabular tracking-[0.12em] text-ink-400">
              <span>WLS / 001 — SOLAR ARRIVAL</span>
            </div>
            <div className="flex items-end justify-end gap-3 text-[11px] tracking-[0.12em] text-ink-300">
              <span className="tabular">G ≈ 1,000 W/m² · AM 1.5</span>
              <span aria-hidden className="mx-2 h-3 w-px bg-white/20" />
              <span>SCROLL</span>
              <span aria-hidden className="relative block h-10 w-px overflow-hidden bg-white/15">
                <span className="absolute inset-x-0 top-0 h-1/2 animate-[scrollcue_2.4s_ease-in-out_infinite] bg-solar" />
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/** Figure whose glasses glow is driven by the --glow CSS variable (animated by GSAP). */
function SolarFigureGlow() {
  return (
    <div className="[&_[data-g]]:opacity-[var(--glow)]">
      <SolarFigure id="hero-sf" className="h-auto w-full" />
    </div>
  );
}
