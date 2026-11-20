import type { ReactNode } from "react";

/** Engineering readout: label, big tabular value, unit. */
export function Readout({ label, value, unit, tone = "default", hint }: { label: string; value: string; unit?: string; tone?: "default" | "solar" | "muted"; hint?: string }) {
  return (
    <div className="border-t border-white/10 pt-3">
      <dt className="eyebrow text-[10px] text-ink-400">{label}</dt>
      <dd className="mt-1.5">
        <span className="flex items-baseline gap-1.5">
          <span className={`tabular font-display text-2xl font-semibold tracking-tight ${tone === "solar" ? "text-solar" : tone === "muted" ? "text-ink-300" : "text-paper"}`}>{value}</span>
          {unit && <span className="text-xs text-ink-400">{unit}</span>}
        </span>
        {hint && <span className="mt-1 block text-[11px] text-ink-400">{hint}</span>}
      </dd>
    </div>
  );
}

/** Accessible labelled range input with live value. */
export function Control({
  id, label, value, min, max, step, unit, onChange, format,
}: {
  id: string; label: string; value: number; min: number; max: number; step: number; unit: string;
  onChange: (v: number) => void; format?: (v: number) => string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  const shown = format ? format(value) : String(value);
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-[13px] text-ink-200">{label}</label>
        <output htmlFor={id} className="tabular text-[13px] font-medium text-paper">
          {shown} <span className="text-ink-400">{unit}</span>
        </output>
      </div>
      <input
        id={id}
        type="range"
        className="range mt-1"
        min={min}
        max={max}
        step={step}
        value={value}
        aria-valuetext={`${shown} ${unit}`}
        style={{ ["--pct" as string]: `${pct}%` }}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}

export function SimTag({ children = "Illustrative simulation" }: { children?: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 border border-flare/40 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.14em] text-flare">
      <span aria-hidden className="h-1 w-1 bg-flare" />
      {children}
    </span>
  );
}

export function ModelNote({ title = "Model", children }: { title?: string; children: ReactNode }) {
  return (
    <details className="group border-t border-white/10 pt-3 text-[12px] leading-relaxed text-ink-400">
      <summary className="cursor-pointer list-none text-ink-300 transition-colors hover:text-paper [&::-webkit-details-marker]:hidden">
        <span className="mr-2 inline-block transition-transform group-open:rotate-45" aria-hidden>+</span>
        {title}
      </summary>
      <div className="mt-3 space-y-2">{children}</div>
    </details>
  );
}
