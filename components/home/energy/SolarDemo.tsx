"use client";

import { useMemo, useRef, useState } from "react";
import { useCanvasLoop } from "@/components/visual/useCanvasLoop";
import { Control, ModelNote, Readout } from "@/components/ui/Instrument";
import { solarPower } from "@/lib/energy/model";

const TILT = 25; // °, panel tilt toward south (equator-facing, northern hemisphere)
const DNI = 900; // W/m² direct normal irradiance (clear sky, assumption)
const DIFFUSE = 90; // W/m² diffuse on the tilted plane (assumption)
const AREA = 20; // m² array (≈ 4.2 kWp at 21 %)

const rad = (d: number) => (d * Math.PI) / 180;

/** Plane-of-array irradiance from sun elevation/azimuth (azimuth 0 = due south). */
function poa(elevation: number, azimuth: number) {
  const e = rad(elevation), a = rad(azimuth), t = rad(TILT);
  const s = [Math.cos(e) * Math.sin(a), Math.sin(e), Math.cos(e) * Math.cos(a)];
  const n = [0, Math.cos(t), Math.sin(t)];
  const cosTheta = s[0] * n[0] + s[1] * n[1] + s[2] * n[2];
  const incidence = (Math.acos(Math.max(-1, Math.min(1, cosTheta))) * 180) / Math.PI;
  const G = elevation > 0 ? DNI * Math.max(0, cosTheta) + DIFFUSE * Math.min(1, elevation / 15) : 0;
  return { G, incidence };
}

export function SolarDemo() {
  const [elev, setElev] = useState(58);
  const [azim, setAzim] = useState(-20);
  const [soil, setSoil] = useState(3);
  const live = useRef({ elev, azim });
  live.current = { elev, azim };

  const { G, incidence } = poa(elev, azim);
  const out = useMemo(() => solarPower({ irradiance: G, area: AREA, ambientC: 36, soilingLoss: soil / 100 }), [G, soil]);

  const canvas = useCanvasLoop((ctx, w, h, t) => {
    const { elev: e, azim: a } = live.current;
    const sunX = w * (0.5 + a / 180);
    const sunY = h * (0.92 - (e / 90) * 0.85);
    const { G: g } = poa(e, a);
    const k = g / (DNI + DIFFUSE);

    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);
    // sky glow around sun
    const sky = ctx.createRadialGradient(sunX, sunY, 0, sunX, sunY, Math.max(w, h) * 0.7);
    sky.addColorStop(0, `rgba(255,225,53,${0.55 * Math.min(1, e / 20)})`);
    sky.addColorStop(0.08, `rgba(255,138,0,${0.35 * Math.min(1, e / 20)})`);
    sky.addColorStop(0.5, "rgba(184,92,0,0.05)");
    sky.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);
    ctx.beginPath();
    ctx.arc(sunX, sunY, 7, 0, Math.PI * 2);
    ctx.fillStyle = e > 0 ? "#fff6c8" : "#3a3a3a";
    ctx.fill();

    // PV array in perspective (bilinear grid)
    const TL = [w * 0.2, h * 0.42], TR = [w * 0.8, h * 0.42], BR = [w * 0.97, h * 0.97], BL = [w * 0.03, h * 0.97];
    const lerp = (p: number[], q: number[], s: number) => [p[0] + (q[0] - p[0]) * s, p[1] + (q[1] - p[1]) * s];
    const pt = (u: number, v: number) => lerp(lerp(TL, TR, u), lerp(BL, BR, u), v);
    const cols = 12, rows = 6;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const gap = 0.012;
        const u0 = c / cols + gap, u1 = (c + 1) / cols - gap, v0 = r / rows + gap * 1.6, v1 = (r + 1) / rows - gap * 1.6;
        const p = [pt(u0, v0), pt(u1, v0), pt(u1, v1), pt(u0, v1)];
        const cx = (p[0][0] + p[2][0]) / 2, cy = (p[0][1] + p[2][1]) / 2;
        // specular: reflection of the sun travels across the glass
        const rx = sunX, ry = h * 1.35 - sunY * 0.55;
        const dist = Math.hypot(cx - rx, (cy - ry) * 1.6) / w;
        const spec = Math.exp(-dist * dist * 14) * k;
        const shimmer = 0.04 * Math.sin(t * 1.3 + c * 0.6 + r);
        const base = 14 + 30 * k;
        ctx.beginPath();
        ctx.moveTo(p[0][0], p[0][1]);
        for (let i = 1; i < 4; i++) ctx.lineTo(p[i][0], p[i][1]);
        ctx.closePath();
        const grd = ctx.createLinearGradient(p[0][0], p[0][1], p[2][0], p[2][1]);
        grd.addColorStop(0, `rgb(${base + 8},${base + 10},${base + 16})`);
        grd.addColorStop(1, `rgb(${base},${base + 2},${base + 8})`);
        ctx.fillStyle = grd;
        ctx.fill();
        if (spec + shimmer > 0.01) {
          ctx.fillStyle = `rgba(255,${190 + 50 * spec},${80 + 80 * spec},${Math.min(0.85, spec * 0.9 + shimmer)})`;
          ctx.fill();
        }
        // busbars
        ctx.strokeStyle = "rgba(245,245,245,0.08)";
        ctx.lineWidth = 0.6;
        for (let b = 1; b < 3; b++) {
          const a0 = lerp(p[0], p[1], b / 3), a1 = lerp(p[3], p[2], b / 3);
          ctx.beginPath();
          ctx.moveTo(a0[0], a0[1]);
          ctx.lineTo(a1[0], a1[1]);
          ctx.stroke();
        }
      }
    }
    // frame
    ctx.strokeStyle = "rgba(245,245,245,0.25)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(TL[0], TL[1]); ctx.lineTo(TR[0], TR[1]); ctx.lineTo(BR[0], BR[1]); ctx.lineTo(BL[0], BL[1]); ctx.closePath();
    ctx.stroke();
    // incident ray
    ctx.setLineDash([3, 5]);
    ctx.strokeStyle = "rgba(255,225,53,0.5)";
    ctx.beginPath();
    ctx.moveTo(sunX, sunY);
    ctx.lineTo(w * 0.5, h * 0.66);
    ctx.stroke();
    ctx.setLineDash([]);
  }, [elev, azim]);

  const onPointer = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.pointerType === "touch" && e.type === "pointermove" && e.buttons === 0) return;
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    setAzim(Math.round(Math.max(-90, Math.min(90, (x - 0.5) * 180))));
    setElev(Math.round(Math.max(0, Math.min(90, ((0.92 - y) / 0.85) * 90))));
  };

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <canvas
          ref={canvas}
          className="aspect-[16/11] w-full cursor-crosshair touch-none border border-white/10"
          onPointerMove={onPointer}
          onPointerDown={onPointer}
          role="img"
          aria-label={`Photovoltaic array lit by the sun at ${elev}° elevation. Output ${out.kW.toFixed(2)} kilowatts.`}
        />
        <p className="mt-3 text-[12px] text-ink-400">Move across the array to position the sun. Sliders offer the same control by keyboard.</p>
      </div>
      <div className="flex flex-col gap-6 lg:col-span-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Readout label="Array output" value={out.kW.toFixed(2)} unit="kW" tone="solar" />
          <Readout label="Plane-of-array" value={G.toFixed(0)} unit="W/m²" />
          <Readout label="Incidence angle" value={incidence.toFixed(0)} unit="°" />
          <Readout label="Cell temperature" value={out.cellC.toFixed(0)} unit="°C" />
          <Readout label="Effective efficiency" value={(out.effectiveEfficiency * 100).toFixed(1)} unit="%" hint="after heat, dust, system losses" />
          <Readout label="Array" value={`${AREA}`} unit="m² · 25° tilt" tone="muted" />
        </dl>
        <div className="space-y-4">
          <Control id="sol-elev" label="Sun elevation" value={elev} min={0} max={90} step={1} unit="°" onChange={setElev} />
          <Control id="sol-azim" label="Sun azimuth (0 = south)" value={azim} min={-90} max={90} step={1} unit="°" onChange={setAzim} />
          <Control id="sol-soil" label="Dust soiling loss" value={soil} min={0} max={13} step={0.5} unit="%" onChange={setSoil} />
        </div>
        <ModelNote>
          <p>POA irradiance G = DNI·cos θ + diffuse, with DNI = {DNI} W/m² and diffuse = {DIFFUSE} W/m² (clear-sky assumptions).</p>
          <p>Cell temperature Tc = Ta + (NOCT − 20)/800 · G, Ta = 36 °C, NOCT = 45 °C. P = G·A·η·(1 − 0.35%/°C·(Tc − 25))·(1 − soiling)·(1 − 14% system losses), η = 21%.</p>
          <p>The soiling range mirrors the 0.29–12.7% modelled in the WELOS UAE concept study.</p>
        </ModelNote>
      </div>
    </div>
  );
}
