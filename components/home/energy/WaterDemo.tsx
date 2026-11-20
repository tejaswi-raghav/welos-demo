"use client";

import { useMemo, useRef, useState } from "react";
import { useCanvasLoop } from "@/components/visual/useCanvasLoop";
import { Control, ModelNote, Readout } from "@/components/ui/Instrument";
import { hydroPower, rainHarvest } from "@/lib/energy/model";

type Drop = { x: number; y: number; s: number };

export function WaterDemo() {
  const [flow, setFlow] = useState(40); // L/s
  const [head, setHead] = useState(30); // m
  const live = useRef({ flow, head });
  live.current = { flow, head };
  const res = useMemo(() => hydroPower({ flowLps: flow, headM: head, efficiency: 0.6 }), [flow, head]);
  const daily = res.kW * 24;
  const rainLo = rainHarvest(500, 94.7);
  const rainHi = rainHarvest(500, 130);
  const sim = useRef({ drops: [] as Drop[], angle: 0 });

  const canvas = useCanvasLoop((ctx, w, h, t, dt) => {
    const { flow: q, head: hd } = live.current;
    const s = sim.current;
    ctx.fillStyle = "#0a0a0a";
    ctx.fillRect(0, 0, w, h);

    const py = h * 0.55, pr = h * 0.16; // pipe centreline, radius
    const tx = w * 0.55; // turbine x
    // pressure gradient along the pipe: high upstream, recovered across turbine
    const grad = ctx.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, `rgba(255,138,0,${0.08 + (hd / 60) * 0.18})`);
    grad.addColorStop(0.53, `rgba(255,138,0,${0.08 + (hd / 60) * 0.18})`);
    grad.addColorStop(0.57, "rgba(245,245,245,0.03)");
    grad.addColorStop(1, "rgba(245,245,245,0.03)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, py - pr, w, pr * 2);
    ctx.strokeStyle = "rgba(245,245,245,0.3)";
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(0, py - pr); ctx.lineTo(w, py - pr); ctx.moveTo(0, py + pr); ctx.lineTo(w, py + pr); ctx.stroke();
    // flanges
    ctx.fillStyle = "#1c1c1c";
    for (const fx of [w * 0.18, tx - pr * 1.3, tx + pr * 1.3, w * 0.88]) {
      ctx.fillRect(fx - 3, py - pr - 8, 6, pr * 2 + 16);
    }

    // water particles — velocity ∝ Q; density ∝ Q
    const target = Math.round(30 + q * 2.5);
    while (s.drops.length < target) s.drops.push({ x: Math.random() * w, y: py + (Math.random() * 2 - 1) * pr * 0.85, s: Math.random() });
    if (s.drops.length > target) s.drops.length = target;
    const vel = 40 + q * 3.2;
    for (const d of s.drops) {
      const prof = 1 - ((d.y - py) / pr) ** 2; // laminar-ish profile for visual
      const near = Math.exp(-(((d.x - tx) / (pr * 1.2)) ** 2));
      d.x += vel * (0.55 + 0.45 * prof) * dt * (1 - 0.35 * near);
      d.y += Math.sin(t * 3 + d.s * 20) * near * 0.6;
      if (d.x > w + 4) { d.x = -4; d.y = py + (Math.random() * 2 - 1) * pr * 0.85; }
      ctx.fillStyle = `rgba(${d.x < tx ? "255,225,53" : "245,245,245"},${0.25 + 0.5 * prof})`;
      ctx.fillRect(d.x, d.y, 2 + vel * 0.012, 1.2);
    }

    // turbine runner
    s.angle += (q / 200) * 9 * dt * (hd / 30);
    ctx.save();
    ctx.translate(tx, py);
    ctx.strokeStyle = "rgba(245,245,245,0.85)";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(0, 0, pr * 0.9, 0, Math.PI * 2); ctx.stroke();
    for (let i = 0; i < 7; i++) {
      const a = s.angle + (i * Math.PI * 2) / 7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(a) * pr * 0.2, Math.sin(a) * pr * 0.2);
      ctx.quadraticCurveTo(Math.cos(a + 0.5) * pr * 0.6, Math.sin(a + 0.5) * pr * 0.6, Math.cos(a + 0.9) * pr * 0.88, Math.sin(a + 0.9) * pr * 0.88);
      ctx.stroke();
    }
    ctx.fillStyle = "#FFE135";
    ctx.fillRect(-3, -3, 6, 6);
    ctx.restore();

    // generator + power line
    ctx.strokeStyle = "rgba(255,225,53,0.6)";
    ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(tx, py - pr - 8); ctx.lineTo(tx, h * 0.14); ctx.lineTo(w * 0.9, h * 0.14); ctx.stroke();
    const pulses = 4;
    for (let i = 0; i < pulses; i++) {
      const f = ((t * (0.15 + q / 400) + i / pulses) % 1);
      const len = (py - pr - 8 - h * 0.14) + (w * 0.9 - tx);
      const dist = f * len;
      const vertical = py - pr - 8 - h * 0.14;
      const x = dist < vertical ? tx : tx + (dist - vertical);
      const y = dist < vertical ? py - pr - 8 - dist : h * 0.14;
      ctx.fillStyle = "#FFE135";
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }
    ctx.fillStyle = "rgba(245,245,245,0.55)";
    ctx.font = "500 10px Inter Variable, Inter, sans-serif";
    ctx.fillText(`HEAD ${hd} m  ·  Q ${q} L/s`, 12, h - 14);
    ctx.fillText("IN-PIPE RUNNER", tx - 36, py + pr + 26);
  }, [flow, head]);

  return (
    <div className="grid gap-8 lg:grid-cols-12">
      <div className="lg:col-span-7">
        <canvas ref={canvas} className="aspect-[16/11] w-full border border-white/10" role="img" aria-label={`Water flowing at ${flow} litres per second through an in-pipe turbine with ${head} metres of head. Output ${res.kW.toFixed(1)} kilowatts.`} />
      </div>
      <div className="flex flex-col gap-6 lg:col-span-5">
        <dl className="grid grid-cols-2 gap-x-6 gap-y-5">
          <Readout label="Electrical output" value={res.kW.toFixed(2)} unit="kW" tone="solar" />
          <Readout label="Hydraulic power" value={res.hydraulicKW.toFixed(2)} unit="kW" />
          <Readout label="Continuous yield" value={daily.toFixed(0)} unit="kWh/day" />
          <Readout label="Efficiency" value="60" unit="% turbine + gen." tone="muted" />
        </dl>
        <div className="space-y-4">
          <Control id="water-q" label="Flow rate" value={flow} min={0} max={200} step={1} unit="L/s" onChange={setFlow} />
          <Control id="water-h" label="Recoverable head" value={head} min={2} max={60} step={1} unit="m" onChange={setHead} />
        </div>
        <div className="border border-white/10 p-4 text-[13px] leading-relaxed text-ink-300">
          <p className="eyebrow mb-2 text-[10px] text-ink-400">Reality check — rain</p>
          A 500 m² roof receiving 94.7–130 mm/yr harvests about {rainLo.m3.toFixed(0)}–{rainHi.m3.toFixed(0)} m³ of water a year — but only
          {" "}~{rainLo.kWh.toFixed(1)}–{rainHi.kWh.toFixed(1)} kWh if dropped 12 m through a turbine. In arid cities, water is a resource to
          conserve; energy comes from continuous flows such as pressure recovery in supply networks.
        </div>
        <ModelNote>
          <p>P = ρ · g · Q · H · η with ρ = 1000 kg/m³, g = 9.81 m/s², η = 0.6. Head represents pressure otherwise dissipated by pressure-reducing valves (10 m ≈ 1 bar).</p>
          <p>Rainfall range from the WELOS UAE concept study; runoff coefficient 0.8.</p>
        </ModelNote>
      </div>
    </div>
  );
}
