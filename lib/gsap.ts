"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  gsap.defaults({ ease: "power3.out", duration: 0.9 });
}

/** Motion language — see docs/BRAND.md §Motion */
export const motion = {
  solar: { ease: "expo.inOut", duration: 2.6 }, // slow, expansive
  flow: { ease: "sine.inOut", duration: 1.4 }, // directional, precise
  ui: { ease: "power2.out", duration: 0.25 }, // fast, subtle
} as const;

export const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export { gsap, ScrollTrigger, useGSAP };
