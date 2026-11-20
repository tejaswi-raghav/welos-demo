"use client";

import { useMemo, useRef, useState } from "react";
import { useCanvasLoop } from "@/components/visual/useCanvasLoop";
import { Control, ModelNote, Readout } from "@/components/ui/Instrument";
import { windPower } from "@/lib/energy/model";

const D = 8; // rotor diameter, m
const SPEC = { rotorDiameter: D, cp: 0.38, cutIn: 3, rated: 12, cutOut: 25 };
const STATE_LABEL = { idle: "Idle — below cut-in", generating: "Generating", rated: "Rated output", shutdown: "Storm shutdown" } as const;

type P = { x: number; y: number; life: number; seed: number };

export function WindDemo() {
  const [v, setV] = useState(7);
  const live = useRef(v);
  live.current = v;
  const res = useMemo(() => windPower({ speed: v, ...SPEC }), [v]);
  const ratedKW = windPower({ speed: SPEC.rated, ...SPEC }).kW;
  const sim = useRef({ angle: 0, omega: 0, parts: [] as P[] });

  const canvas = useCanvasLoop((ctx, w, h, t, dt) => {
    const speed = live.current;
    const s = sim.current;
    const state = windPower({ speed, ...SPEC }).state;
    // rotor speed: tip-speed ratio ≈ 6 while generating, feathered at shutdown
    const tsr = state === "shutdown" || speed < 2 ? 0 : 6;
    const targetOmega = (tsr * Math.min(speed, SPEC.rated)) / (D / 2); // rad/s
    s.omega += (targetOmega - s.omega) * Math.min(1, dt * 0.8);
    s.angle += s.omega * dt * 0.35; // visual slow-down for legibility

    ctx.fillStyle = "rgba(10,10,10,0.35)";
    ctx.fillRect(0, 0, w, h);

    const hubX = w * 0.58, hubY = h * 0.38, R = Math.min(w, h) * 0.3;
    // flow particles (streamlines): velocity deficit behind the rotor disc (wake)
    const n = Math.round(w * 0.5);
    while (s.parts.length < n) s.parts.push({ x: Math.random() * w, y: Math.random() * h, life: Math.random(), seed: Math.random() });
    ctx.lineCap = "round";
    for (const p of s.parts) {
      const dy = (p.y - hubY) / R;
      const behind = p.x > hubX ? Math.exp(-((p.x - hubX) / (w * 0.5))) : 0;
      const inWake = Math.abs(dy) < 1 ? 1 - dy * dy : 0;
      const deficit = state === "generating" || state === "rated" ? 0.45 * inWake * behind : 0;
      const u = (speed * (1 - deficit) * w) / 60 + 4;
      const vy = Math.sin(t * 0.8 + p.seed * 12 + p.x * 0.01) * 4 + (p.x < hubX && Math.abs(dy) < 1.15 ? dy * 6 * Math.exp(-((hubX - p.x) / (w * 0.15))) : 0);
      const x0 = p.x, y0 = p.y;
      p.x += u * dt;
      p.y += vy * dt;
      p.life += dt * 0.25;
      if (p.x > w + 10 || p.life > 1) { p.x = -10 + Math.random() * w * 0.2; p.y = Math.random() * h; p.life = 0; }
      const a = Math.sin(p.life * Math.PI) * (0.25 + Math.min(0.5, speed / 30));
      ctx.strokeStyle = deficit > 0.1 ? `rgba(255,138,0,${a})` : `rgba(245,245,245,${a * 0.7})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x0 - u * 0.04, y0);
      ctx.lineTo(p.x, p.y);
      ctx.stroke();
    }

    // tower
    ctx.fillStyle = "#1c1c1c";
    ctx.beginPath();
    ctx.moveTo(hubX - 5, hubY + 6);
    ctx.lineTo(hubX + 5, hubY + 6);
    ctx.lineTo(hubX + 10, h);
    ctx.lineTo(hubX - 10, h);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = "rgba(245,245,245,0.18)";
    ctx.stroke();
    // swept disc
    ctx.strokeStyle = "rgba(255,225,53,0.12)";
    ctx.setLineDash([2, 6]);
    ctx.beginPath();
    ctx.arc(hubX, hubY, R, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
    // blades — tapered aerofoil silhouettes
    for (let i = 0; i < 3; i++) {
      const a = s.angle + (i * Math.PI * 2) / 3;
      ctx.save();
      ctx.translate(hubX, hubY);
      ctx.rotate(a);
      const g = ctx.createLinearGradient(0, 0, R, 0);
      g.addColorStop(0, "#f5f5f5");
      g.addColorStop(1, "#9a9a9a");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.moveTo(0, -5);
      ctx.quadraticCurveTo(R * 0.25, -9, R, -1.5);
      ctx.lineTo(R, 1);
      ctx.quadraticCurveTo(R * 0.3, 4, 0, 5);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = "#0b0b0b";
    ctx.strokeStyle = "#f5f5f5";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(hubX, hubY, 7, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#FFE135";
    ctx.fillRect(hubX - 2, hubY - 2, 4, 4);
  }, [v]);

  // power curve sparkline
  const curve = useMemo(() => {
    const pts: string[] = [];
    for (let s = 0; s <= 28; s += 0.5) {
      const p = windPower({ speed: s, ...SPEC }).kW / ratedKW;
      pts.push(`${(s / 28) * 100},${40 - p * 36}`);
    }
    return pts.join(" ");
  }, [ratedKW]);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <canvas ref={canvas} className="aspect-[16/11] w-full border border-white/10 bg-[#0a0a0a]" role="img" aria-label={`Wind at ${v} metres per second flowing through an 8 metre turbine rotor. Output ${res.kW.toFixed(1)} kilowatts.`} />
      </div>
      <div className="flex flex-col gap-6 lg:col-span-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Readout label="Turbine output" value={res.kW.toFixed(1)} unit="kW" tone="solar" />
          <Readout label="Wind power available" value={res.availableKW.toFixed(1)} unit="kW" hint="½ρAv³ through the rotor" />
          <Readout label="Operating state" value={STATE_LABEL[res.state]} tone="muted" />
          <Readout label="Swept area" value={res.sweptArea.toFixed(1)} unit="m² · Ø 8 m" tone="muted" />
        </dl>
        <figure aria-label="Power curve" className="border-t border-white/10 pt-3">
          <figcaption className="eyebrow text-[10px] text-ink-400">Power curve (0–28 m/s)</figcaption>
          <svg viewBox="0 0 100 44" className="mt-2 h-20 w-full" preserveAspectRatio="none" aria-hidden>
            <polyline points={curve} fill="none" stroke="rgba(245,245,245,.5)" strokeWidth="0.8" vectorEffect="non-scaling-stroke" />
            <line x1={(v / 28) * 100} x2={(v / 28) * 100} y1="0" y2="44" stroke="#FFE135" strokeWidth="1" vectorEffect="non-scaling-stroke" />
            {[3, 12, 25].map((m) => (
              <line key={m} x1={(m / 28) * 100} x2={(m / 28) * 100} y1="40" y2="44" stroke="rgba(245,245,245,.4)" vectorEffect="non-scaling-stroke" />
            ))}
          </svg>
          <div className="mt-1 flex justify-between text-[10px] text-ink-400 tabular"><span>0</span><span>cut-in 3</span><span>rated 12</span><span>cut-out 25</span></div>
        </figure>
        <Control id="wind-v" label="Wind speed at hub" value={v} min={0} max={28} step={0.5} unit="m/s" onChange={setV} format={(x) => x.toFixed(1)} />
        <ModelNote>
          <p>P = ½ · ρ · A · v³ · Cp with ρ = 1.225 kg/m³, Cp = 0.38 (Betz limit 0.593), rotor Ø 8 m. Constant output between rated (12 m/s) and cut-out (25 m/s); zero below cut-in (3 m/s).</p>
          <p>For context: the WELOS UAE concept study considered onshore wind of 1.1–4.5 m/s — which is why wind is added only where local measurements support it.</p>
        </ModelNote>
      </div>
    </div>
  );
}
