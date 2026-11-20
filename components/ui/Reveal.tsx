"use client";

import { useRef, type ReactNode } from "react";
import { gsap, useGSAP, prefersReducedMotion } from "@/lib/gsap";

/**
 * Choreographed scroll reveal for [data-reveal] descendants. Content is fully
 * visible without JS; motion is only added once hydrated and never for
 * reduced-motion users.
 */
export function Reveal({ children, className, as: Tag = "div", stagger = 0.08 }: { children: ReactNode; className?: string; as?: "div" | "section"; stagger?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useGSAP(
    () => {
      if (prefersReducedMotion()) return;
      const items = gsap.utils.toArray<HTMLElement>("[data-reveal]", ref.current);
      if (!items.length) return;
      gsap.from(items, {
        opacity: 0,
        y: 28,
        duration: 1,
        ease: "power3.out",
        stagger,
        scrollTrigger: { trigger: ref.current, start: "top 82%", once: true },
      });
    },
    { scope: ref },
  );
  return (
    <Tag ref={ref as React.RefObject<HTMLDivElement>} className={className}>
      {children}
    </Tag>
  );
}
