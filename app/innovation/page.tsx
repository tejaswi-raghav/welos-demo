import type { Metadata } from "next";
import { PageIntro } from "@/components/ui/PageIntro";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { SoilingExplainer } from "@/components/innovation/SoilingExplainer";

export const metadata: Metadata = {
  title: "Innovation",
  description: "WELOS research directions and future technology concepts — clearly labelled by maturity.",
};

type Status = "Concept" | "Research direction" | "Exploratory";
const DIRECTIONS: { code: string; title: string; status: Status; body: string; question: string }[] = [
  { code: "R—01", status: "Concept", title: "Condition-based cleaning", body: "Use the gap between expected and measured output to detect soiling, and wash only when the energy recovered outweighs the water spent.", question: "How small a deviation can be detected reliably on a hot, hazy day?" },
  { code: "R—02", status: "Concept", title: "One surface, two resources", body: "A PV canopy shaped as a rain-catchment surface, so the same footprint produces electricity and collects water.", question: "What canopy geometry balances self-shading, cleaning and run-off?" },
  { code: "R—03", status: "Research direction", title: "Predictive dispatch", body: "Short-horizon forecasts of irradiance, sea-breeze wind and demand feeding the battery strategy hours ahead.", question: "When does a forecast improve on simple rules — and when does it add risk?" },
  { code: "R—04", status: "Research direction", title: "Network pressure recovery", body: "Replacing energy-wasting pressure-reducing valves in water networks with turbines that generate while regulating.", question: "How do we keep regulation precise under variable demand?" },
  { code: "R—05", status: "Exploratory", title: "Thermal-aware photovoltaics", body: "Cell temperature costs output in hot climates. Passive and water-assisted cooling are evaluated against their water cost.", question: "Is any water spent on cooling ever worth it in an arid city?" },
  { code: "R—06", status: "Exploratory", title: "Per-site digital twins", body: "A physics model of each installation, continuously calibrated by its own measurements, as the reference for every decision.", question: "How much measurement is enough to trust the twin?" },
];

const STATUS_STYLE: Record<Status, string> = {
  Concept: "border-solar/50 text-solar",
  "Research direction": "border-flare/50 text-flare",
  Exploratory: "border-white/25 text-ink-300",
};

export default function InnovationPage() {
  return (
    <>
      <PageIntro
        code="I—00"
        eyebrow="Innovation"
        title={<>The questions<br /><span className="text-ink-400">we&rsquo;re working on.</span></>}
        lede={<>Everything on this page is labelled by maturity. <strong className="font-semibold text-paper">Concepts and research directions are not commercially available products.</strong></>}
      >
        <ul className="mt-10 flex flex-wrap gap-3 text-[12px]" aria-label="Maturity legend">
          {(Object.keys(STATUS_STYLE) as Status[]).map((s) => (
            <li key={s} className={`border px-3 py-1.5 ${STATUS_STYLE[s]}`}>{s}</li>
          ))}
        </ul>
      </PageIntro>

      <section aria-labelledby="explainer-title" className="border-b border-white/10 py-20 md:py-28">
        <Container>
          <div className="mb-12 grid gap-6 lg:grid-cols-12 lg:items-end">
            <h2 id="explainer-title" className="display text-3xl md:text-5xl lg:col-span-7">Interactive explainer: when should a panel be washed?</h2>
            <p className="text-[15px] leading-relaxed text-ink-300 lg:col-span-5">Dust can cost a panel up to 12.7% of its output in the concept study&apos;s range. Washing fixes it — but water is scarce. Compare a calendar schedule with the controller-led approach.</p>
          </div>
          <SoilingExplainer />
        </Container>
      </section>

      <section aria-labelledby="dir-title" className="py-20 md:py-28">
        <Container>
          <h2 id="dir-title" className="display text-3xl md:text-5xl">Research directions</h2>
          <Reveal className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2 lg:grid-cols-3">
            {DIRECTIONS.map((d) => (
              <article key={d.code} data-reveal className="flex flex-col bg-carbon p-6 md:p-8">
                <div className="flex items-center justify-between gap-4">
                  <span className="tabular text-xs text-ink-400">{d.code}</span>
                  <span className={`border px-2 py-1 text-[10px] uppercase tracking-[0.12em] ${STATUS_STYLE[d.status]}`}>{d.status}</span>
                </div>
                <h3 className="display mt-10 text-2xl">{d.title}</h3>
                <p className="mt-4 text-[14px] leading-relaxed text-ink-300">{d.body}</p>
                <p className="mt-auto border-t border-white/10 pt-4 text-[13px] italic text-ink-400"><span className="not-italic text-ink-300">Open question — </span>{d.question}</p>
              </article>
            ))}
          </Reveal>
        </Container>
      </section>
    </>
  );
}
