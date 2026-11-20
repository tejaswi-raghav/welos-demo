import type { ReactNode } from "react";
import { Container } from "./Section";

/** Shared header for inner pages: index code, editorial headline, lede. */
export function PageIntro({ code, eyebrow, title, lede, children }: { code: string; eyebrow: string; title: ReactNode; lede: ReactNode; children?: ReactNode }) {
  return (
    <section className="relative overflow-hidden border-b border-white/10 pt-36 pb-20 md:pt-44 md:pb-28">
      <div aria-hidden className="bg-grid pointer-events-none absolute inset-0 [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-[radial-gradient(circle,rgba(255,138,0,.22),rgba(255,138,0,0)_65%)]" />
      <Container className="relative">
        <p className="eyebrow flex items-center gap-3 text-ink-400">
          <span className="tabular text-solar">{code}</span>
          <span aria-hidden className="h-px w-8 bg-white/20" />
          {eyebrow}
        </p>
        <h1 className="display mt-8 max-w-[18ch] text-[clamp(2.75rem,7vw,6.5rem)]">{title}</h1>
        <div className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-300">{lede}</div>
        {children}
      </Container>
    </section>
  );
}

export function Placeholder({ children }: { children: ReactNode }) {
  return (
    <span className="rounded-sm border border-dashed border-flare/60 bg-flare/10 px-1.5 py-0.5 font-mono text-[0.85em] text-flare" title="Editable placeholder — replace with company-specific content">
      {children}
    </span>
  );
}
