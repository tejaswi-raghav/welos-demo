"use client";

import { useMemo, useState } from "react";
import { Control, ModelNote, Readout, SimTag } from "@/components/ui/Instrument";

/**
 * Fixed-schedule vs condition-based panel cleaning over 90 days.
 * Soiling accumulates linearly per day (dust events add step losses) up to a cap;
 * cleaning resets it. Condition-based cleaning triggers when the controller's
 * expected-vs-measured deviation exceeds a threshold.
 */
const DAYS = 90;
const DAILY_KWH_CLEAN = 400; // array yield on a clean day (kWh)
const LITRES_PER_CLEAN = 900; // water per full wash
const DUST_EVENTS = [17, 41, 63, 78]; // days with a dust storm (+3% step)

function run(rate: number, mode: "fixed" | "condition", interval: number, threshold: number) {
  let soil = 0, lost = 0, washes = 0;
  const series: number[] = [];
  for (let d = 0; d < DAYS; d++) {
    soil = Math.min(0.127, soil + rate / 100 + (DUST_EVENTS.includes(d) ? 0.03 : 0));
    const clean = mode === "fixed" ? d > 0 && d % interval === 0 : soil >= threshold / 100;
    if (clean) { soil = 0.003; washes++; }
    lost += DAILY_KWH_CLEAN * soil;
    series.push(soil);
  }
  return { lost, washes, water: washes * LITRES_PER_CLEAN, series };
}

function Spark({ data, color }: { data: number[]; color: string }) {
  const pts = data.map((v, i) => `${(i / (DAYS - 1)) * 100},${40 - (v / 0.13) * 38}`).join(" ");
  return (
    <svg viewBox="0 0 100 42" preserveAspectRatio="none" className="h-24 w-full" aria-hidden>
      <polyline points={pts} fill="none" stroke={color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
      {DUST_EVENTS.map((d) => <line key={d} x1={(d / (DAYS - 1)) * 100} x2={(d / (DAYS - 1)) * 100} y1="0" y2="42" stroke="rgba(245,245,245,.12)" vectorEffect="non-scaling-stroke" strokeDasharray="2 3" />)}
    </svg>
  );
}

export function SoilingExplainer() {
  const [rate, setRate] = useState(0.25);
  const [interval, setInterval] = useState(14);
  const [threshold, setThreshold] = useState(5);
  const fixed = useMemo(() => run(rate, "fixed", interval, threshold), [rate, interval, threshold]);
  const cond = useMemo(() => run(rate, "condition", interval, threshold), [rate, interval, threshold]);

  return (
    <div className="grid gap-px border border-white/10 bg-white/10 lg:grid-cols-12">
      <div className="space-y-6 bg-carbon p-6 md:p-8 lg:col-span-4">
        <div className="flex items-center justify-between"><h3 className="text-[15px] font-semibold">90-day cleaning model</h3><SimTag>Concept</SimTag></div>
        <Control id="s-rate" label="Daily dust accumulation" value={rate} min={0.05} max={0.6} step={0.05} unit="%/day" onChange={setRate} format={(v) => v.toFixed(2)} />
        <Control id="s-int" label="Fixed schedule: wash every" value={interval} min={3} max={30} step={1} unit="days" onChange={setInterval} />
        <Control id="s-thr" label="Condition-based: wash at loss of" value={threshold} min={1} max={12} step={0.5} unit="%" onChange={setThreshold} format={(v) => v.toFixed(1)} />
        <ModelNote>
          <p>Clean-day yield {DAILY_KWH_CLEAN} kWh; {LITRES_PER_CLEAN} L of water per wash; four dust events add a 3% step loss each. Loss is capped at 12.7%, the upper end of the concept study&apos;s modelled range.</p>
        </ModelNote>
      </div>
      <div className="grid gap-px bg-white/10 md:grid-cols-2 lg:col-span-8">
        {[
          { name: "Fixed schedule", r: fixed, color: "#8a8a8a" },
          { name: "Condition-based (WELOS concept)", r: cond, color: "#FFE135" },
        ].map(({ name, r, color }) => (
          <div key={name} className="bg-carbon p-6 md:p-8">
            <p className="text-[13px] font-medium text-paper">{name}</p>
            <p className="mt-1 text-[11px] text-ink-400">Soiling loss over 90 days · dashed lines = dust events</p>
            <Spark data={r.series} color={color} />
            <dl className="mt-4 grid grid-cols-3 gap-4">
              <Readout label="Energy lost" value={r.lost.toFixed(0)} unit="kWh" tone={color === "#FFE135" ? "solar" : "default"} />
              <Readout label="Washes" value={String(r.washes)} />
              <Readout label="Water" value={(r.water / 1000).toFixed(1)} unit="m³" />
            </dl>
          </div>
        ))}
      </div>
    </div>
  );
}
