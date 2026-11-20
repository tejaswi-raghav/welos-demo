"use client";

import dynamic from "next/dynamic";
import { Component, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { COMPONENTS, runInstallation, type ComponentId, type Source } from "@/lib/installation";
import { REFERENCE_SITE, fmt } from "@/lib/energy/model";
import { Container, SectionHeader } from "@/components/ui/Section";
import { SimTag } from "@/components/ui/Instrument";
import { Reveal } from "@/components/ui/Reveal";

const Scene = dynamic(() => import("./installation/InstallationScene"), { ssr: false, loading: () => <SceneFallback label="Loading 3D installation…" /> });

class SceneBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() { return this.state.failed ? <SceneFallback label="3D view unavailable on this device — the inspector still works." /> : this.props.children; }
}

function SceneFallback({ label }: { label: string }) {
  return (
    <div className="bg-grid relative flex h-full w-full items-center justify-center">
      <svg viewBox="0 0 400 240" className="w-[70%] opacity-60" aria-hidden>
        <g fill="none" stroke="#6B6B6B" strokeWidth="1">
          <path d="M60 170 L200 230 L340 170 L200 110 Z" />
          {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M${130 + i * 14} ${150 + i * 6} l40 -18`} stroke="#FFE135" />)}
          <path d="M90 150 v-80 M80 70 l20 0 M90 70 l-8 -24 M90 70 l24 8" />
          <rect x="270" y="150" width="30" height="24" />
          <rect x="70" y="170" width="40" height="18" />
        </g>
      </svg>
      <p className="absolute bottom-4 left-4 text-xs text-ink-400">{label}</p>
    </div>
  );
}

const STATE_COLOR = { Operating: "bg-success", Standby: "bg-warning", Disabled: "bg-ink-500" } as const;

export function Installation() {
  const [selected, setSelected] = useState<ComponentId | null>("solar");
  const [hovered, setHovered] = useState<ComponentId | null>(null);
  const [enabled, setEnabled] = useState<Record<Source, boolean>>({ solar: true, wind: true, water: true });
  const [active, setActive] = useState(false);
  const [mounted, setMounted] = useState(false); // load three.js only when the section approaches
  const [webgl, setWebgl] = useState(true);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const c = document.createElement("canvas");
      setWebgl(!!(c.getContext("webgl2") || c.getContext("webgl")));
    } catch { setWebgl(false); }
    const io = new IntersectionObserver(([e]) => { setActive(e.isIntersecting); if (e.isIntersecting) setMounted(true); }, { rootMargin: "400px" });
    if (wrap.current) io.observe(wrap.current);
    return () => io.disconnect();
  }, []);

  const sim = useMemo(() => runInstallation(enabled), [enabled]);
  const info = COMPONENTS.find((c) => c.id === selected) ?? null;
  const t = sim.totals;

  const metrics = (id: ComponentId) => {
    const share = (v: number) => (t.generation > 0 ? v / t.generation : 0);
    const co2 = (v: number) => v * REFERENCE_SITE.gridKgPerKWh;
    switch (id) {
      case "solar": return { state: enabled.solar ? "Operating" : "Disabled", energy: t.solar, share: share(t.solar), co2: co2(t.solar) };
      case "wind": return { state: enabled.wind ? (t.wind > 1 ? "Operating" : "Standby") : "Disabled", energy: t.wind, share: share(t.wind), co2: co2(t.wind) };
      case "water": return { state: enabled.water ? "Operating" : "Disabled", energy: t.water, share: share(t.water), co2: co2(t.water) };
      case "storage": return { state: sim.battery.throughput > 0 ? "Operating" : "Standby", energy: sim.battery.throughput, share: null, co2: null };
      case "distribution": return { state: "Operating", energy: t.demand, share: null, co2: null };
      case "monitoring": return { state: "Operating", energy: null, share: null, co2: sim.co2AvoidedKg };
    }
  };
  const m = info ? metrics(info.id) : null;

  return (
    <section id="installation" aria-labelledby="installation-title" className="relative scroll-mt-16 border-t border-white/10 bg-[#090909] py-24 md:py-36">
      <Container>
        <Reveal>
          <div data-reveal>
            <SectionHeader
              index="02"
              label="The WELOS technology experience"
              id="installation-title"
              title={<>From natural force<br />to intelligent system.</>}
              lede="A reference hybrid installation. Orbit it, select any component, and switch sources off to see how the system rebalances over a simulated day."
            />
          </div>
        </Reveal>

        <div className="mt-14 grid gap-px border border-white/10 bg-white/10 lg:grid-cols-12">
          {/* Viewport */}
          <div ref={wrap} className="relative h-[58svh] min-h-[380px] bg-carbon lg:col-span-8 lg:h-auto lg:min-h-[680px]">
            {!mounted ? (
              <SceneFallback label="Preparing 3D installation…" />
            ) : webgl ? (
              <div className="absolute inset-0">
                <SceneBoundary>
                  <Scene selected={selected} hovered={hovered} enabled={enabled} onSelect={setSelected} onHover={setHovered} active={active} />
                </SceneBoundary>
              </div>
            ) : (
              <SceneFallback label="3D view unavailable on this device — the inspector still works." />
            )}
            <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-3">
              <SimTag>Simulated day · reference site</SimTag>
            </div>
            <p className="pointer-events-none absolute bottom-4 left-4 hidden text-[11px] text-ink-400 md:block">Drag to orbit · scroll to zoom · click a component</p>

            {/* Source toggles */}
            <fieldset className="absolute bottom-4 right-4 flex gap-1 border border-white/10 bg-carbon/80 p-1 backdrop-blur">
              <legend className="sr-only">Energy sources</legend>
              {(["solar", "wind", "water"] as Source[]).map((s) => (
                <label key={s} className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-medium capitalize transition-colors ${enabled[s] ? "bg-white/10 text-paper" : "text-ink-400 hover:text-ink-200"}`}>
                  <input
                    type="checkbox"
                    className="peer sr-only"
                    checked={enabled[s]}
                    onChange={(e) => setEnabled((x) => ({ ...x, [s]: e.target.checked }))}
                  />
                  <span aria-hidden className={`h-2 w-2 ${enabled[s] ? "bg-solar" : "border border-ink-400"}`} />
                  <span className="peer-focus-visible:underline">{s}</span>
                </label>
              ))}
            </fieldset>
          </div>

          {/* Inspector */}
          <aside aria-label="Component inspector" className="flex flex-col bg-carbon lg:col-span-4">
            <ul className="grid grid-cols-2 gap-px border-b border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-2">
              {COMPONENTS.map((c) => (
                <li key={c.id} className="bg-carbon">
                  <button
                    type="button"
                    onClick={() => setSelected(c.id)}
                    onMouseEnter={() => setHovered(c.id)}
                    onMouseLeave={() => setHovered(null)}
                    aria-pressed={selected === c.id}
                    className={`flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-[13px] transition-colors ${selected === c.id ? "bg-white/[0.06] text-paper" : "text-ink-300 hover:text-paper"}`}
                  >
                    <span>{c.name}</span>
                    <span className={`tabular hidden whitespace-nowrap text-[10px] sm:inline ${selected === c.id ? "text-solar" : "text-ink-400"}`}>{c.code}</span>
                  </button>
                </li>
              ))}
            </ul>

            {info && m && (
              <div className="flex flex-1 flex-col p-6" aria-live="polite">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="tabular text-[11px] tracking-[0.14em] text-ink-400">{info.code}</p>
                    <h3 className="display mt-2 text-3xl font-semibold">{info.name}</h3>
                  </div>
                  <span className="mt-1 inline-flex items-center gap-2 border border-white/10 px-2 py-1 text-[11px] text-ink-200">
                    <span aria-hidden className={`h-1.5 w-1.5 rounded-full ${STATE_COLOR[m.state as keyof typeof STATE_COLOR]}`} />
                    {m.state}
                  </span>
                </div>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-300">{info.role}</p>

                <dl className="mt-6 grid grid-cols-2 gap-px border border-white/10 bg-white/10 text-[12px]">
                  <div className="bg-carbon p-3">
                    <dt className="text-ink-400">{info.id === "storage" ? "Daily throughput" : info.id === "distribution" ? "Load served" : "Energy contribution"}</dt>
                    <dd className="tabular mt-1 text-lg font-semibold text-paper">{m.energy == null ? "—" : fmt.kWh(m.energy)}<span className="text-xs font-normal text-ink-400">{m.energy == null ? "" : "/day"}</span></dd>
                  </div>
                  <div className="bg-carbon p-3">
                    <dt className="text-ink-400">{m.share != null ? "Share of generation" : info.id === "monitoring" ? "CO₂ avoided" : "Self-sufficiency"}</dt>
                    <dd className="tabular mt-1 text-lg font-semibold text-paper">
                      {m.share != null ? fmt.pct(m.share) : info.id === "monitoring" ? `${m.co2!.toFixed(0)} kg/day` : fmt.pct(sim.selfSufficiency)}
                    </dd>
                  </div>
                  {m.co2 != null && info.id !== "monitoring" && (
                    <div className="col-span-2 bg-carbon p-3">
                      <dt className="text-ink-400">Emissions displaced</dt>
                      <dd className="tabular mt-1 text-lg font-semibold text-paper">{m.co2.toFixed(0)} <span className="text-xs font-normal text-ink-400">kg CO₂/day</span></dd>
                    </div>
                  )}
                </dl>

                <div className="mt-6">
                  <p className="eyebrow text-[10px] text-ink-400">Efficiency assumptions</p>
                  <ul className="mt-3 space-y-2 text-[13px] text-ink-200">
                    {info.efficiency.map((e) => (
                      <li key={e} className="flex gap-3"><span aria-hidden className="mt-[7px] h-1 w-1 shrink-0 bg-solar" />{e}</li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 border-t border-white/10 pt-4">
                  <p className="eyebrow text-[10px] text-ink-400">Sustainability contribution</p>
                  <p className="mt-2 text-[13px] leading-relaxed text-ink-300">{info.sustainability}</p>
                </div>
              </div>
            )}
          </aside>
        </div>

        {/* System strip */}
        <dl className="mt-px grid grid-cols-2 gap-px border border-t-0 border-white/10 bg-white/10 md:grid-cols-5">
          {[
            ["Generation", fmt.kWh(t.generation)],
            ["Demand", fmt.kWh(t.demand)],
            ["Grid import", fmt.kWh(t.gridImport)],
            ["Self-sufficiency", fmt.pct(sim.selfSufficiency)],
            ["CO₂ avoided", `${sim.co2AvoidedKg.toFixed(0)} kg`],
          ].map(([k, v]) => (
            <div key={k} className="bg-carbon px-5 py-4">
              <dt className="eyebrow text-[10px] text-ink-400">{k}</dt>
              <dd className="tabular mt-1 font-display text-xl font-semibold">{v}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
