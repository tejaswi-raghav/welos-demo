// Small SVG charts in the same visual language as the UAE product page (.mchart).
import React, { useEffect, useState } from "react";
import { MONTHS, inr, units } from "./engine.js";

const H = 280, L = 12, R = 12, T = 30, B = 28;
/** A narrower drawing on phones, so labels stay readable and nothing scrolls out of sight. */
function useChartWidth() {
  const query = () => globalThis.matchMedia?.("(max-width: 620px)");
  const [narrow, setNarrow] = useState(() => !!query()?.matches);
  useEffect(() => { const m = query(); const on = () => setNarrow(m.matches); m?.addEventListener("change", on); return () => m?.removeEventListener("change", on); }, []);
  return narrow ? 420 : 960;
}
export const short = (v) => { const a = Math.abs(v), s = v < 0 ? "−" : ""; return a >= 1e7 ? `${s}₹${+(a / 1e7).toFixed(2)} Cr` : a >= 1e5 ? `${s}₹${+(a / 1e5).toFixed(2)} L` : a >= 1e3 ? `${s}₹${Math.round(a / 1e3)}k` : `${s}₹${Math.round(a)}`; };
function Figure({ W, keys, label, children, read, hint, onLeave }) {
  return <figure className="mchart">
    <div className="mkeys">{keys.map(([cls, text]) => <span key={text} className={`k ${cls}`}>{text}</span>)}</div>
    <svg viewBox={`0 0 ${W} ${H}`} role="group" aria-label={label} onPointerLeave={onLeave}>{children}</svg>
    <figcaption className="mread" aria-live="polite">{read || hint}</figcaption>
  </figure>;
}

/** Grouped monthly bars. series: [{ cls, label, values }] */
export function MonthBars({ series, label, unit, format = units }) {
  const [hi, setHi] = useState(null);
  const W = useChartWidth();
  const max = Math.max(1, ...series.flatMap((s) => s.values)) * 1.12;
  const bw = (W - L - R) / 12, y = (v) => H - B - (v / max) * (H - T - B), w = Math.min(34, (bw * 0.7) / series.length);
  const top = unit === "₹" ? `${format(max)} a month` : `${format(max)} ${unit}`;
  return <Figure W={W} label={label} keys={series.map((s) => [s.cls, s.label])} onLeave={() => setHi(null)} hint={`Monthly ${unit === "₹" ? "rupees" : unit}. Point at or focus a month to read it.`}
    read={hi != null && <><b>{MONTHS[hi]}</b> · {series.map((s) => `${s.label.toLowerCase()} ${format(s.values[hi])}${unit === "₹" ? "" : ` ${unit}`}`).join(" · ")}</>}>
    <line className="axis" x1={L} x2={W - R} y1={H - B} y2={H - B} />
    <text className="mx start" x={L} y={14}>{top}</text>
    {MONTHS.map((m, i) => { const x = L + bw * i, start = x + (bw - w * series.length - 3 * (series.length - 1)) / 2; return <g key={m} tabIndex="0" role="img" aria-label={`${m}: ${series.map((s) => `${s.label} ${format(s.values[i])}`).join(", ")}`} onPointerEnter={() => setHi(i)} onFocus={() => setHi(i)} className={hi === i ? "hi" : ""}>
      <rect className="hit" x={x} y={T - 8} width={bw} height={H - T - B + 8} />
      {series.map((s, k) => <rect key={s.label} className={`bar ${s.cls}`} x={start + k * (w + 3)} width={w} y={y(s.values[i])} height={Math.max(0, H - B - y(s.values[i]))} rx="3" style={{ animationDelay: `${i * 30 + k * 90}ms` }} />)}
      <text x={x + bw / 2} y={H - 9} className="mx">{m}</text>
    </g>; })}
  </Figure>;
}

/** Cost waterfall: gross → incentives → net. Unconfirmed incentives are drawn hollow and not subtracted. */
export function Waterfall({ result }) {
  const W = useChartWidth();
  const { gross, netCost, incentives: a } = result;
  const confirmed = a.status === "estimated";
  const steps = [{ label: W < 600 ? "Installed" : "Installed cost", from: 0, to: gross, cls: "use" }];
  let at = gross, ghost = gross;
  for (const [label, value] of [["Central", a.central], ["Delhi state", a.state]]) {
    if (!value) continue;
    steps.push({ label: confirmed || W < 600 ? label : `${label}, if eligible`, from: ghost - value, to: ghost, cls: confirmed ? "off" : "maybe", value });
    ghost -= value;
    if (confirmed) at -= value;
  }
  steps.push({ label: confirmed ? (W < 600 ? "Net" : "Estimated net") : "Cost today", from: 0, to: netCost, cls: "pv" });
  const bw = (W - L - R) / steps.length, y = (v) => H - B - (v / (gross * 1.15)) * (H - T - B);
  return <Figure W={W} label={`Cost waterfall from ${inr(gross)} to ${inr(netCost)}`} keys={[["use", "Before incentives"], ...(steps.length > 2 ? [[confirmed ? "off" : "maybe", confirmed ? "Estimated incentive" : "Possible incentive, not deducted"]] : []), ["pv", "Net"]]} hint="One-time cost in rupees. welOS hardware and fees are not yet priced, so they are not in these bars.">
    <line className="axis" x1={L} x2={W - R} y1={H - B} y2={H - B} />
    {steps.map((s, i) => { const x = L + bw * i + bw * 0.22; return <g key={s.label}>
      <rect className={`bar ${s.cls}`} x={x} width={bw * 0.56} y={y(s.to)} height={Math.max(1, y(s.from) - y(s.to))} rx="4" style={{ animationDelay: `${i * 90}ms` }} />
      <text className="mv" x={x + bw * 0.28} y={y(s.to) - 7}>{s.value ? `${confirmed ? "− " : ""}${inr(s.value)}` : inr(s.to)}</text>
      <text className="mx" x={x + bw * 0.28} y={H - 9}>{s.label}</text>
    </g>; })}
  </Figure>;
}

export function Payback({ result }) {
  const [hi, setHi] = useState(null);
  const W = useChartWidth();
  const e = result.economics;
  const pts = [-result.netCost, ...e.years.map((y) => y.cumulative)];
  const min = Math.min(0, ...pts), max = Math.max(0, ...pts), span = max - min || 1;
  const x = (i) => L + 30 + (i / 25) * (W - L - R - 60), y = (v) => T + (1 - (v - min) / span) * (H - T - B);
  const point = hi != null ? e.years[hi] : null;
  const inverter = Number(result.input.inverterInr) > 0;
  return <Figure W={W} label={`Cumulative cash position over 25 years, ${e.payback ? `payback in ${e.payback.toFixed(1)} years` : "no payback"}`} keys={[["ba", "Cumulative net position"], ["bb", "Break-even"]]} onLeave={() => setHi(null)}
    hint={`Starts at −${inr(result.netCost)}. ${e.payback ? `Crosses break-even after about ${e.payback.toFixed(1)} years.` : "Does not break even within 25 years."} Maintenance and replacement appear only if you enter them.`}
    read={point && <><b>Year {point.year}</b> · saving {inr(point.saving)}{point.gbi ? ` · generation incentive ${inr(point.gbi)}` : ""}{point.cost ? ` · maintenance/replacement ${inr(point.cost)}` : ""} · position <b>{inr(point.cumulative)}</b></>}>
    <line className="zero" x1={x(0)} x2={x(25)} y1={y(0)} y2={y(0)} />
    <path className="l-ba" pathLength="1" d={pts.map((v, i) => `${i ? "L" : "M"}${x(i)} ${y(v)}`).join("")} />
    <text className="mx start" x={L} y={14}>{short(max)}</text>
    {e.years.map((p, i) => <g key={p.year} tabIndex="0" role="img" aria-label={`Year ${p.year}: ${inr(p.cumulative)}`} onPointerEnter={() => setHi(i)} onFocus={() => setHi(i)} className={hi === i ? "hi" : ""}>
      <rect className="hit" x={x(i + 0.5)} y={T} width={(W - L - R - 60) / 25} height={H - T - B} />
      {(p.year % 5 === 0 || p.year === 1) && <text className="mx" x={x(p.year)} y={H - 9}>Y{p.year}</text>}
    </g>)}
    {e.payback && <g pointerEvents="none"><circle className="mark" cx={x(e.payback)} cy={y(0)} r="6" /><text className="mv" x={x(e.payback)} y={y(0) - 14}>{e.payback.toFixed(1)} yrs</text></g>}
    {inverter && <text className="mv" pointerEvents="none" x={x(12)} y={y(pts[12]) + 22}>Inverter, year 12</text>}
  </Figure>;
}
