"use client";

import { useMemo, useState } from "react";
import { Area, ComposedChart, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";
import { DEFAULT_SCENARIO, REFERENCE_SITE, simulateDay, fmt, type Scenario } from "@/lib/energy/model";
import { Container, SectionHeader } from "@/components/ui/Section";
import { Control, ModelNote, SimTag } from "@/components/ui/Instrument";
import { Reveal } from "@/components/ui/Reveal";

/** Validated categorical palette for charts on Carbon (OKLCH L 0.48–0.67, CVD ΔE ≥ 19). */
const SERIES = {
  solar: { label: "Solar", color: "#B3900F" },
  water: { label: "Water", color: "#3F8AD8" },
  wind: { label: "Wind", color: "#DC5F2A" },
} as const;
const SURFACE = "#0B0B0B";

const PRESETS: { name: string; sc: Scenario }[] = [
  { name: "Clear summer day", sc: { ...DEFAULT_SCENARIO } },
  { name: "Dust event, still air", sc: { solarPeak: 520, windMean: 2, waterFlow: 20, demandDaily: 560, batteryKWh: 200 } },
  { name: "Windy winter day", sc: { solarPeak: 720, windMean: 9, waterFlow: 20, demandDaily: 430, batteryKWh: 200 } },
  { name: "No storage", sc: { ...DEFAULT_SCENARIO, batteryKWh: 0 } },
];

function Gauge({ value, label, sub }: { value: number; label: string; sub: string }) {
  const v = Math.max(0, Math.min(1, value));
  const R = 44, C = 2 * Math.PI * R, arc = C * (240 / 360);
  return (
    <div className="flex items-center gap-4">
      <svg viewBox="0 0 100 100" className="h-24 w-24 shrink-0" role="img" aria-label={`${label}: ${(v * 100).toFixed(0)} percent`}>
        <g transform="rotate(150 50 50)">
          <circle cx="50" cy="50" r={R} fill="none" stroke="rgba(245,245,245,.1)" strokeWidth="6" strokeDasharray={`${arc} ${C}`} />
          <circle cx="50" cy="50" r={R} fill="none" stroke="#FFE135" strokeWidth="6" strokeDasharray={`${arc * v} ${C}`} style={{ transition: "stroke-dasharray .5s cubic-bezier(.2,0,0,1)" }} />
        </g>
        <text x="50" y="55" textAnchor="middle" className="tabular" fill="#F5F5F5" fontSize="20" fontWeight="600" fontFamily="var(--font-display)">{(v * 100).toFixed(0)}%</text>
      </svg>
      <div>
        <p className="text-[13px] font-medium text-paper">{label}</p>
        <p className="mt-1 text-[12px] leading-snug text-ink-400">{sub}</p>
      </div>
    </div>
  );
}

type TipProps = { active?: boolean; payload?: { dataKey: string; value: number; color: string }[]; label?: string };
function GenTooltip({ active, payload, label }: TipProps) {
  if (!active || !payload?.length) return null;
  const get = (k: string) => payload.find((p) => p.dataKey === k)?.value ?? 0;
  const gen = get("solar") + get("water") + get("wind");
  return (
    <div className="min-w-[180px] border border-white/15 bg-[#111]/95 p-3 text-[12px] shadow-xl backdrop-blur">
      <p className="tabular mb-2 text-ink-400">{label} – {String(Number(label?.slice(0, 2)) + 1).padStart(2, "0")}:00</p>
      {(["wind", "water", "solar"] as const).map((k) => (
        <p key={k} className="flex items-center justify-between gap-6">
          <span className="flex items-center gap-2 text-ink-300"><span className="h-2 w-2" style={{ background: SERIES[k].color }} />{SERIES[k].label}</span>
          <span className="tabular text-paper">{get(k).toFixed(1)} kW</span>
        </p>
      ))}
      <p className="mt-2 flex justify-between gap-6 border-t border-white/10 pt-2"><span className="text-ink-300">Generation</span><span className="tabular text-paper">{gen.toFixed(1)} kW</span></p>
      <p className="flex justify-between gap-6"><span className="text-ink-300">Demand</span><span className="tabular text-paper">{get("demand").toFixed(1)} kW</span></p>
    </div>
  );
}

export function Dashboard() {
  const [sc, setSc] = useState<Scenario>(DEFAULT_SCENARIO);
  const [table, setTable] = useState(false);
  const sim = useMemo(() => simulateDay(sc), [sc]);
  const set = (k: keyof Scenario) => (v: number) => setSc((s) => ({ ...s, [k]: v }));
  const t = sim.totals;
  const data = sim.rows.map((r) => ({ ...r, solar: +r.solar.toFixed(2), wind: +r.wind.toFixed(2), water: +r.water.toFixed(2), demand: +r.demand.toFixed(2), soc: +r.soc.toFixed(1) }));
  const preset = PRESETS.find((p) => JSON.stringify(p.sc) === JSON.stringify(sc))?.name;

  return (
    <section id="intelligence" aria-labelledby="intel-title" className="relative scroll-mt-16 border-t border-white/10 py-24 md:py-36">
      <Container>
        <Reveal>
          <div data-reveal>
            <SectionHeader
              index="03"
              label="Energy intelligence"
              id="intel-title"
              title={<>A day in the life<br /><span className="text-ink-400">of an intelligent system.</span></>}
              lede="Build a scenario. The controller re-runs a 24-hour, hour-by-hour dispatch: generation, storage, demand and the grid — computed in your browser."
            />
          </div>
        </Reveal>

        <div className="mt-14 grid gap-px border border-white/10 bg-white/10 xl:grid-cols-12">
          {/* Scenario builder */}
          <div className="bg-carbon p-6 md:p-8 xl:col-span-4">
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-[15px] font-semibold">Scenario builder</h3>
              <SimTag>Simulated</SimTag>
            </div>
            <div className="mt-5 flex flex-wrap gap-2" role="group" aria-label="Presets">
              {PRESETS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setSc(p.sc)}
                  aria-pressed={preset === p.name}
                  className={`border px-3 py-1.5 text-[12px] transition-colors ${preset === p.name ? "border-solar text-solar" : "border-white/15 text-ink-300 hover:border-white/40 hover:text-paper"}`}
                >
                  {p.name}
                </button>
              ))}
            </div>
            <div className="mt-8 space-y-6">
              <Control id="d-solar" label="Solar intensity (peak)" value={sc.solarPeak} min={0} max={1100} step={10} unit="W/m²" onChange={set("solarPeak")} />
              <Control id="d-wind" label="Mean wind speed" value={sc.windMean} min={0} max={14} step={0.5} unit="m/s" onChange={set("windMean")} format={(v) => v.toFixed(1)} />
              <Control id="d-water" label="Water flow" value={sc.waterFlow} min={0} max={80} step={1} unit="L/s" onChange={set("waterFlow")} />
              <Control id="d-demand" label="Energy demand" value={sc.demandDaily} min={100} max={1200} step={10} unit="kWh/day" onChange={set("demandDaily")} />
              <Control id="d-batt" label="Battery capacity" value={sc.batteryKWh} min={0} max={600} step={10} unit="kWh" onChange={set("batteryKWh")} />
            </div>
            <div className="mt-8">
              <ModelNote title="Assumptions">
                <p>Reference site: {REFERENCE_SITE.pvAreaM2} m² PV (21%, {REFERENCE_SITE.soilingLoss * 100}% soiling, {REFERENCE_SITE.ambientC} °C), {REFERENCE_SITE.turbines} × Ø{REFERENCE_SITE.rotorDiameter} m turbines, in-pipe hydro at {REFERENCE_SITE.hydroHeadM} m head.</p>
                <p>Clear-sky irradiance 06:00–18:00; afternoon sea-breeze wind profile; commercial demand shape. Battery: {REFERENCE_SITE.batteryCRate}C limit, 96%/96% charge/discharge, {REFERENCE_SITE.socMin * 100}–{REFERENCE_SITE.socMax * 100}% window. The second simulated day is reported.</p>
                <p>CO₂ avoided = (renewable energy used on site + surplus) × {REFERENCE_SITE.gridKgPerKWh} kg/kWh (assumed grid factor).</p>
              </ModelNote>
            </div>
          </div>

          {/* Results */}
          <div className="flex flex-col bg-carbon xl:col-span-8">
            <div className="grid gap-px bg-white/10 sm:grid-cols-2">
              <div className="bg-carbon p-6"><Gauge value={sim.selfSufficiency} label="Self-sufficiency" sub={`${fmt.kWh(t.demand - t.gridImport)} of ${fmt.kWh(t.demand)} met on site`} /></div>
              <div className="bg-carbon p-6"><Gauge value={sim.battery.endSoc / 100} label="Battery at midnight" sub={sc.batteryKWh > 0 ? `Range ${sim.battery.minSoc.toFixed(0)}–${sim.battery.maxSoc.toFixed(0)}% · ${fmt.kWh(sim.battery.throughput)} cycled` : "No storage installed"} /></div>
            </div>
            <dl className="grid grid-cols-2 gap-px border-y border-white/10 bg-white/10 md:grid-cols-4">
              {[
                ["Generation", fmt.kWh(t.generation)],
                ["Supply − demand", `${t.balance >= 0 ? "+" : "−"}${fmt.kWh(Math.abs(t.balance))}`],
                ["Grid import", fmt.kWh(t.gridImport)],
                ["CO₂ avoided", `${sim.co2AvoidedKg.toFixed(0)} kg`],
              ].map(([k, v]) => (
                <div key={k} className="bg-carbon px-5 py-4">
                  <dt className="eyebrow text-[10px] text-ink-400">{k}</dt>
                  <dd className="tabular mt-1 font-display text-xl font-semibold text-paper">{v}</dd>
                </div>
              ))}
            </dl>

            <div className="p-4 pt-6 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h3 className="text-[13px] font-medium text-paper">Generation vs demand · kW</h3>
                <ul className="flex flex-wrap items-center gap-4 text-[12px] text-ink-300" aria-label="Legend">
                  {(["solar", "water", "wind"] as const).map((k) => (
                    <li key={k} className="flex items-center gap-2"><span className="h-2.5 w-2.5" style={{ background: SERIES[k].color }} />{SERIES[k].label}</li>
                  ))}
                  <li className="flex items-center gap-2"><span className="h-[2px] w-4 bg-paper" />Demand</li>
                </ul>
              </div>
              {table ? (
                <div className="mt-4 max-h-[340px] overflow-auto border border-white/10">
                  <table className="w-full text-left text-[12px] tabular">
                    <caption className="sr-only">Hourly simulation results</caption>
                    <thead className="sticky top-0 bg-[#141414] text-ink-400">
                      <tr>{["Hour", "Solar kW", "Water kW", "Wind kW", "Demand kW", "Battery %", "Grid kW"].map((h) => <th key={h} scope="col" className="px-3 py-2 font-medium">{h}</th>)}</tr>
                    </thead>
                    <tbody>
                      {sim.rows.map((r) => (
                        <tr key={r.hour} className="border-t border-white/5">
                          <th scope="row" className="px-3 py-1.5 font-normal text-ink-300">{r.label}</th>
                          <td className="px-3 py-1.5">{r.solar.toFixed(1)}</td>
                          <td className="px-3 py-1.5">{r.water.toFixed(1)}</td>
                          <td className="px-3 py-1.5">{r.wind.toFixed(1)}</td>
                          <td className="px-3 py-1.5">{r.demand.toFixed(1)}</td>
                          <td className="px-3 py-1.5">{r.soc.toFixed(0)}</td>
                          <td className="px-3 py-1.5">{r.gridImport.toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  <div className="mt-4 h-[280px] md:h-[320px]" aria-hidden>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -12 }}>
                        <CartesianGrid vertical={false} stroke="rgba(245,245,245,.06)" />
                        <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "rgba(245,245,245,.15)" }} interval={3} />
                        <YAxis tickLine={false} axisLine={false} width={48} />
                        <Tooltip content={<GenTooltip />} cursor={{ stroke: "rgba(245,245,245,.3)", strokeWidth: 1 }} isAnimationActive={false} />
                        {(["solar", "water", "wind"] as const).map((k) => (
                          <Area key={k} type="monotone" dataKey={k} stackId="g" stroke={SURFACE} strokeWidth={2} fill={SERIES[k].color} fillOpacity={0.9} isAnimationActive animationDuration={500} />
                        ))}
                        <Line type="monotone" dataKey="demand" stroke="#F5F5F5" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: SURFACE, strokeWidth: 2 }} isAnimationActive={false} />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-8 flex items-center justify-between">
                    <h3 className="text-[13px] font-medium text-paper">Battery state of charge · %</h3>
                  </div>
                  <div className="mt-3 h-[140px]" aria-hidden>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data} margin={{ top: 6, right: 8, bottom: 0, left: -12 }}>
                        <CartesianGrid vertical={false} stroke="rgba(245,245,245,.06)" />
                        <XAxis dataKey="label" tickLine={false} axisLine={{ stroke: "rgba(245,245,245,.15)" }} interval={3} />
                        <YAxis domain={[0, 100]} ticks={[0, 50, 100]} tickLine={false} axisLine={false} width={48} />
                        <ReferenceLine y={REFERENCE_SITE.socMin * 100} stroke="rgba(255,93,79,.5)" strokeDasharray="3 4" />
                        <Tooltip
                          isAnimationActive={false}
                          cursor={{ stroke: "rgba(245,245,245,.3)" }}
                          content={({ active, payload, label }) => active && payload?.length ? (
                            <div className="border border-white/15 bg-[#111]/95 px-3 py-2 text-[12px]"><span className="text-ink-400">{label}</span> <span className="tabular ml-3 text-paper">{Number(payload[0].value).toFixed(0)}%</span></div>
                          ) : null}
                        />
                        <Line type="monotone" dataKey="soc" stroke="#FFE135" strokeWidth={2} dot={false} activeDot={{ r: 4, stroke: SURFACE, strokeWidth: 2 }} isAnimationActive={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </>
              )}
              <div className="mt-4 flex justify-end">
                <button type="button" onClick={() => setTable((x) => !x)} className="text-[12px] text-ink-300 underline decoration-white/20 underline-offset-4 hover:text-paper">
                  {table ? "Show charts" : "View as data table"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
