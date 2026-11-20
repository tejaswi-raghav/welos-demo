"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { SolarDemo } from "./energy/SolarDemo";
import { WindDemo } from "./energy/WindDemo";
import { WaterDemo } from "./energy/WaterDemo";
import { Container, SectionHeader } from "@/components/ui/Section";
import { SimTag } from "@/components/ui/Instrument";
import { Reveal } from "@/components/ui/Reveal";

const TABS = [
  { key: "solar", label: "Solar", note: "Photovoltaic surfaces under moving sunlight", C: SolarDemo },
  { key: "wind", label: "Wind", note: "Flow through an 8 m horizontal-axis rotor", C: WindDemo },
  { key: "water", label: "Water", note: "Energy recovered from pressurised flow", C: WaterDemo },
] as const;

export function EnergyTransformation() {
  const [active, setActive] = useState(0);
  const base = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const Active = TABS[active].C;

  const onKey = (e: KeyboardEvent<HTMLButtonElement>) => {
    const dir = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
    if (e.key === "Home" || e.key === "End" || dir) {
      e.preventDefault();
      const next = e.key === "Home" ? 0 : e.key === "End" ? TABS.length - 1 : (active + dir + TABS.length) % TABS.length;
      setActive(next);
      tabRefs.current[next]?.focus();
    }
  };

  return (
    <section id="energy" aria-labelledby="energy-title" className="relative scroll-mt-16 overflow-hidden py-24 md:py-36">
      {/* light carried over from the hero */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 -top-40 h-80 bg-[radial-gradient(60%_100%_at_50%_0%,rgba(255,138,0,.18),transparent)]" />
      <Container>
        <Reveal>
          <div data-reveal>
            <SectionHeader
              index="01"
              label="Energy transformation"
              id="energy-title"
              title={<>Energy is everywhere.<br /><span className="text-ink-400">Intelligence makes it useful.</span></>}
              lede="Three natural forces, three physical models. Change the conditions and watch the numbers respond — each value is computed live from the equations shown."
            />
          </div>
        </Reveal>

        <div className="mt-16 md:mt-20">
          <div className="flex flex-col gap-4 border-b border-white/10 md:flex-row md:items-end md:justify-between">
            <div role="tablist" aria-label="Energy source" className="-mb-px flex">
              {TABS.map((t, i) => (
                <button
                  key={t.key}
                  ref={(el) => { tabRefs.current[i] = el; }}
                  role="tab"
                  id={`${base}-tab-${t.key}`}
                  aria-selected={active === i}
                  aria-controls={`${base}-panel`}
                  tabIndex={active === i ? 0 : -1}
                  onClick={() => setActive(i)}
                  onKeyDown={onKey}
                  className={`group relative px-1 pb-4 pr-8 text-left transition-colors md:pr-14 ${active === i ? "text-paper" : "text-ink-400 hover:text-ink-200"}`}
                >
                  <span className="tabular block text-[11px] text-ink-400">0{i + 1}</span>
                  <span className="display mt-1 block text-2xl font-semibold md:text-3xl">{t.label}</span>
                  <span aria-hidden className={`absolute bottom-0 left-0 h-[2px] bg-solar transition-all duration-300 ${active === i ? "w-[calc(100%-2rem)] md:w-[calc(100%-3.5rem)]" : "w-0"}`} />
                </button>
              ))}
            </div>
            <div className="pb-4"><SimTag /></div>
          </div>

          <div role="tabpanel" id={`${base}-panel`} aria-labelledby={`${base}-tab-${TABS[active].key}`} className="pt-10" tabIndex={0}>
            <p className="mb-6 text-sm text-ink-400">{TABS[active].note}</p>
            <Active key={TABS[active].key} />
          </div>
        </div>
      </Container>
    </section>
  );
}
