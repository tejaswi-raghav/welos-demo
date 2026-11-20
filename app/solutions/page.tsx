import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";

export const metadata: Metadata = {
  title: "Solutions",
  description: "Deployment scenarios for WELOS hybrid energy systems: commercial, industrial, remote communities, smart cities and hybrid installations.",
};

type Mix = { solar: number; wind: number; water: number; storage: number };
const SCENARIOS: { code: string; name: string; challenge: string; config: string[]; optimise: string; mix: Mix }[] = [
  {
    code: "S—01", name: "Commercial facilities",
    challenge: "Daytime-heavy demand from cooling, lighting and IT, with roof space shared by plant equipment.",
    config: ["Solar canopy over roof and parking", "Battery sized for the evening tail", "Condition-based panel cleaning"],
    optimise: "Self-consumption and peak-demand charges.",
    mix: { solar: 0.8, wind: 0.05, water: 0.15, storage: 0.6 },
  },
  {
    code: "S—02", name: "Industrial infrastructure",
    challenge: "Continuous process loads, large pumping systems and a low tolerance for interruptions.",
    config: ["Ground-mount PV beside process areas", "In-pipe energy recovery on pressure-reduction points", "Storage reserved for ride-through"],
    optimise: "Continuity of supply, then cost per kWh.",
    mix: { solar: 0.6, wind: 0.15, water: 0.45, storage: 0.7 },
  },
  {
    code: "S—03", name: "Remote communities",
    challenge: "Diesel dependence, fragile logistics and limited technical staff on site.",
    config: ["Solar + wind where measured winds allow", "Generously sized storage", "Rain harvesting for water security"],
    optimise: "Fuel displacement and autonomy days.",
    mix: { solar: 0.7, wind: 0.5, water: 0.2, storage: 0.9 },
  },
  {
    code: "S—04", name: "Smart cities",
    challenge: "Thousands of small rooftops and network assets that are individually modest and collectively significant.",
    config: ["Standardised rooftop kits", "Water-network pressure recovery", "Fleet-level monitoring of expected vs measured output"],
    optimise: "Aggregate flexibility and maintenance at scale.",
    mix: { solar: 0.75, wind: 0.1, water: 0.4, storage: 0.5 },
  },
  {
    code: "S—05", name: "Hybrid renewable installations",
    challenge: "Sites where no single resource is reliable alone, but complementary profiles smooth each other out.",
    config: ["Solar for daytime, wind for evening and night", "Hydro as baseload where flow exists", "Shared inverter and storage platform"],
    optimise: "Firm renewable supply with less storage.",
    mix: { solar: 0.6, wind: 0.6, water: 0.4, storage: 0.55 },
  },
];

function MixBars({ mix }: { mix: Mix }) {
  return (
    <dl className="grid grid-cols-4 gap-3" aria-label="Indicative emphasis by subsystem">
      {(Object.keys(mix) as (keyof Mix)[]).map((k) => (
        <div key={k}>
          <dt className="text-[11px] capitalize text-ink-400">{k}</dt>
          <dd className="mt-2 h-1 bg-white/10">
            <span className="block h-full bg-solar" style={{ width: `${mix[k] * 100}%` }} />
            <span className="sr-only">{Math.round(mix[k] * 100)}% emphasis</span>
          </dd>
        </div>
      ))}
    </dl>
  );
}

export default function SolutionsPage() {
  return (
    <>
      <PageIntro
        code="S—00"
        eyebrow="Solutions"
        title={<>Every site is<br /><span className="text-ink-400">a different equation.</span></>}
        lede={<>A sunny roof should not be forced into the same design as a windy coast. These are <strong className="font-semibold text-paper">deployment scenarios</strong> showing how WELOS would be configured — not case studies or completed projects.</>}
      />
      <section className="py-20 md:py-28">
        <Container>
          <div className="divide-y divide-white/10 border-y border-white/10">
            {SCENARIOS.map((s) => (
              <Reveal key={s.code} className="grid gap-8 py-12 lg:grid-cols-12">
                <div data-reveal className="lg:col-span-4">
                  <p className="tabular text-xs text-solar">{s.code}</p>
                  <h2 className="display mt-3 text-3xl md:text-4xl">{s.name}</h2>
                  <p className="mt-4 text-[15px] leading-relaxed text-ink-300">{s.challenge}</p>
                </div>
                <div data-reveal className="lg:col-span-4">
                  <p className="eyebrow text-[10px] text-ink-400">Configuration</p>
                  <ul className="mt-4 space-y-3 text-[14px] text-ink-200">
                    {s.config.map((c) => <li key={c} className="flex gap-3"><span aria-hidden className="mt-2 h-1 w-1 shrink-0 bg-solar" />{c}</li>)}
                  </ul>
                </div>
                <div data-reveal className="lg:col-span-4">
                  <p className="eyebrow text-[10px] text-ink-400">Controller optimises for</p>
                  <p className="mt-4 text-[14px] text-paper">{s.optimise}</p>
                  <div className="mt-8"><MixBars mix={s.mix} /></div>
                </div>
              </Reveal>
            ))}
          </div>
          <div className="mt-16 grid gap-6 border border-white/10 p-8 md:grid-cols-2 md:items-center md:p-10">
            <p className="text-[15px] leading-relaxed text-ink-300">
              Every real configuration starts with measured site data: irradiance, wind, water flows, demand profile and roof structure.
            </p>
            <div className="flex flex-wrap gap-3 md:justify-end">
              <Link href="/#intelligence" className="inline-flex h-12 items-center border border-white/20 px-6 text-sm font-semibold hover:border-paper">Try the scenario builder</Link>
              <Link href="/contact" className="inline-flex h-12 items-center bg-solar px-6 text-sm font-semibold text-carbon hover:bg-[#fff07a]">Discuss a site →</Link>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
