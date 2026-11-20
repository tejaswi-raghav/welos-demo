"use client";

import { useEffect, useRef } from "react";

export type DrawFn = (ctx: CanvasRenderingContext2D, w: number, h: number, t: number, dt: number) => void;

/**
 * Runs a 2D canvas render loop that respects device pixel ratio, pauses when
 * off-screen or the tab is hidden, and renders a single still frame (t fixed)
 * under prefers-reduced-motion — re-drawing when `deps` change.
 */
export function useCanvasLoop(draw: DrawFn, deps: unknown[] = []) {
  const ref = useRef<HTMLCanvasElement>(null);
  const drawRef = useRef(draw);
  drawRef.current = draw;

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (reduced) drawRef.current(ctx, w, h, 2, 0);
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let raf = 0, visible = false, running = false, last = performance.now();
    const start = last;
    const loop = (now: number) => {
      if (!visible || document.hidden) { running = false; return; }
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      drawRef.current(ctx, w, h, (now - start) / 1000, dt);
      raf = requestAnimationFrame(loop);
    };
    const kick = () => {
      if (reduced) { drawRef.current(ctx, w, h, 2, 0); return; }
      if (running) return;
      running = true;
      last = performance.now();
      raf = requestAnimationFrame(loop);
    };
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) kick(); });
    io.observe(canvas);
    const onVis = () => !document.hidden && visible && kick();
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  // Re-render still frame for reduced-motion users when inputs change.
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    if (ctx) drawRef.current(ctx, canvas.clientWidth, canvas.clientHeight, 2, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
