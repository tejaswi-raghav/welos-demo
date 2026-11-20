import type { ReactNode } from "react";

export function SectionHeader({
  index, label, title, lede, id, align = "split",
}: { index: string; label: string; title: ReactNode; lede?: ReactNode; id?: string; align?: "split" | "stack" }) {
  return (
    <header className={align === "split" ? "grid gap-8 lg:grid-cols-12 lg:items-end" : "max-w-4xl"}>
      <div className={align === "split" ? "lg:col-span-8" : ""}>
        <p className="eyebrow flex items-center gap-3 text-ink-400">
          <span className="tabular text-solar">{index}</span>
          <span aria-hidden className="h-px w-8 bg-white/20" />
          {label}
        </p>
        <h2 id={id} className="display mt-6 text-[clamp(2.25rem,4.6vw,4.25rem)] text-paper">{title}</h2>
      </div>
      {lede && <div className={`text-base leading-relaxed text-ink-300 md:text-lg ${align === "split" ? "lg:col-span-4" : "mt-6 max-w-2xl"}`}>{lede}</div>}
    </header>
  );
}

export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto max-w-[1440px] px-5 md:px-10 ${className}`}>{children}</div>;
}
