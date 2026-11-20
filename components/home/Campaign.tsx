"use client";

import { useRef } from "react";
import { Wordmark } from "@/components/brand/Logo";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";
import { asset } from "@/lib/asset";

/**
 * Campaign 01 — the Solar Figure key art. On scroll the sunlight travels across
 * the frame, and the wordmark is revealed where the light passes.
 */
export function Campaign() {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const el = root.current!;
      if (prefersReducedMotion()) {
        el.style.setProperty("--sweep", "1");
        return;
      }
      const tl = gsap.timeline({
        scrollTrigger: { trigger: el, start: "top top", end: "bottom bottom", scrub: 0.8 },
        defaults: { ease: "none" },
      });
      tl.fromTo(el, { "--sweep": 0 }, { "--sweep": 1, duration: 1 }, 0)
        .fromTo("[data-c-art]", { scale: 1.12, yPercent: 3 }, { scale: 1, yPercent: 0, duration: 1 }, 0)
        .fromTo("[data-c-line]", { opacity: 0, y: 36 }, { opacity: 1, y: 0, stagger: 0.06, duration: 0.2 }, 0.04)
        .to("[data-c-copy]", { opacity: 0, y: -30, duration: 0.15 }, 0.85);
    },
    { scope: root },
  );

  return (
    <section id="campaign" ref={root} aria-labelledby="campaign-title" className="relative h-[230svh]" style={{ ["--sweep" as string]: 1 }}>
      <div className="sticky top-0 h-[100svh] overflow-hidden bg-carbon">
        <div data-c-art className="absolute inset-0 origin-[52%_35%]">
          <picture>
            <source media="(max-aspect-ratio: 1/1)" srcSet={asset("/campaign/solar-figure-portrait.webp")} />
            <source media="(max-width: 1100px)" srcSet={asset("/campaign/solar-figure-keyart-960.webp")} />
            <img
              src={asset("/campaign/solar-figure-keyart.webp")}
              alt="The Solar Figure: a young man with curly hair and glowing amber glasses stands before an immense sun, his face in shadow."
              className="h-full w-full object-cover object-[52%_30%]"
              loading="lazy"
              decoding="async"
            />
          </picture>
        </div>

        {/* Travelling sunlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 mix-blend-screen"
          style={{ background: "radial-gradient(40% 70% at calc(var(--sweep) * 120% - 10%) 40%, rgba(255,225,53,.35), rgba(255,138,0,.12) 40%, transparent 70%)" }}
        />
        {/* Cinematic grade + legibility */}
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_bottom,rgba(11,11,11,.55),transparent_30%,transparent_55%,rgba(11,11,11,.92)_88%)]" />
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,rgba(11,11,11,.9)_0%,rgba(11,11,11,.7)_32%,transparent_58%)] max-md:bg-[linear-gradient(to_top,#0b0b0b_0%,rgba(11,11,11,.85)_40%,transparent_65%)] md:max-lg:bg-[linear-gradient(to_bottom,rgba(11,11,11,.85)_0%,rgba(11,11,11,.6)_45%,transparent_70%)]" />

        {/* Wordmark revealed by the light */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-[7svh] flex justify-center px-6"
          style={{
            WebkitMaskImage: "linear-gradient(90deg, #000 calc(var(--sweep) * 140% - 40%), transparent calc(var(--sweep) * 140% - 5%))",
            maskImage: "linear-gradient(90deg, #000 calc(var(--sweep) * 140% - 40%), transparent calc(var(--sweep) * 140% - 5%))",
          }}
        >
          <Wordmark title="" className="w-[min(86vw,980px)] text-paper" quantumColor="#FFE135" />
        </div>

        <div data-c-copy className="relative z-10 mx-auto flex h-full max-w-[1440px] flex-col justify-end px-5 pb-[24svh] md:justify-start md:px-10 md:pb-0 md:pt-32">
          <div className="max-w-[640px]">
            <p data-c-line className="eyebrow text-ink-200">Campaign 01 — The Solar Figure</p>
            <h2 id="campaign-title" className="display mt-5 text-[clamp(2.4rem,5vw,4.5rem)] text-paper">
              <span data-c-line className="block">We were never meant</span>
              <span data-c-line className="block">to fear the sun.</span>
            </h2>
            <p data-c-line className="mt-6 max-w-[42ch] text-base leading-relaxed text-ink-200 md:text-lg">
              For most of history the sun was something to shelter from. Engineering changes the relationship: what once
              overwhelmed us becomes our most abundant resource.
            </p>
            <p data-c-line className="mt-5 text-[11px] uppercase tracking-[0.14em] text-ink-300">Brand character · not a company spokesperson</p>
          </div>
        </div>
      </div>
    </section>
  );
}
