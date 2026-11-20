import React, { useEffect, useRef } from "react";

/** Drifting solar embers — a light 2D canvas layer that pauses off-screen. */
export function Embers({ className, density = 70 }) {
  const ref = useRef(null);
  useEffect(() => {
    const canvas = ref.current;
    if (!canvas || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = canvas.getContext("2d");
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = 0, h = 0, raf = 0, visible = true, last = performance.now();
    const parts = [];
    const resize = () => {
      w = canvas.clientWidth; h = canvas.clientHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const target = Math.round(density * Math.min(1.4, (w * h) / (1440 * 900)));
      while (parts.length < target) parts.push(spawn(true));
      parts.length = target;
    };
    const spawn = (anywhere = false) => ({
      x: Math.random() * w,
      y: anywhere ? Math.random() * h : h + 10,
      r: 0.6 + Math.random() * 1.8,
      v: 12 + Math.random() * 38,
      drift: (Math.random() - 0.5) * 14,
      phase: Math.random() * Math.PI * 2,
      life: 0.4 + Math.random() * 0.6,
    });
    const tick = (now) => {
      if (!visible) return;
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      for (const p of parts) {
        p.y -= p.v * dt;
        p.x += (p.drift + Math.sin(now / 900 + p.phase) * 8) * dt;
        if (p.y < -10) Object.assign(p, spawn());
        const fade = Math.min(1, p.y / (h * 0.25)) * Math.min(1, (h - p.y) / 60) * p.life;
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.r * 4);
        g.addColorStop(0, `rgba(255,236,170,${0.95 * fade})`);
        g.addColorStop(0.35, `rgba(255,150,30,${0.45 * fade})`);
        g.addColorStop(1, "rgba(255,120,0,0)");
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 4, 0, Math.PI * 2); ctx.fill();
      }
      raf = requestAnimationFrame(tick);
    };
    resize();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) { last = performance.now(); cancelAnimationFrame(raf); raf = requestAnimationFrame(tick); }
    });
    io.observe(canvas);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [density]);
  return <canvas ref={ref} className={className} aria-hidden="true" />;
}
