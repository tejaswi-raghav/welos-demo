import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro } from "@/components/ui/PageIntro";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { REFERENCE_SITE } from "@/lib/energy/model";

export const metadata: Metadata = {
  title: "Technology",
  description: "How WELOS turns sun, wind and water into one coordinated energy system: components, operating principles and engineering assumptions.",
};

const STUDY = [
  { v: "2,285", u: "kWh/m²/yr", k: "Solar irradiation", d: "Annual reference used in the concept study." },
  { v: "1.1–4.5", u: "m/s", k: "Variable wind", d: "Onshore wind-speed range considered." },
  { v: "94.7–130", u: "mm/yr", k: "Limited rainfall", d: "Precipitation range used for sizing." },
  { v: "0.29–12.7", u: "%", k: "Solar soiling loss", d: "Modelled range motivating condition-based cleaning." },
];

const LAYERS = [
  {
    code: "L1", name: "Solar canopy",
    principle: "Photovoltaic cells convert photons to current. The canopy is designed to produce electricity and act as a rain-catchment surface on the same limited footprint.",
    params: [["Module efficiency (STC)", "21%"], ["Temperature coefficient", "−0.35 %/°C"], ["Tilt", "25°, equator-facing"], ["Primary risk", "Heat and dust soiling"]],
  },
  {
    code: "L2", name: "Wind modules",
    principle: "Rotors extract kinetic energy from moving air; power scales with the cube of wind speed, so siting decides everything. Added only where measured wind supports it.",
    params: [["Power coefficient", "0.38"], ["Cut-in / rated / cut-out", "3 / 12 / 25 m/s"], ["Rotor diameter (reference)", "8 m"], ["Primary risk", "Low mean wind speeds"]],
  },
  {
    code: "L3", name: "Water systems",
    principle: "Two roles: harvesting rain as a water resource, and recovering energy from continuous pressurised flows (P = ρgQHη) where pressure would otherwise be throttled away.",
    params: [["Turbine + generator η", "60%"], ["Reference head", `${REFERENCE_SITE.hydroHeadM} m (≈ 3 bar)`], ["Rain runoff coefficient", "0.8"], ["Primary risk", "Treating rain as an energy source"]],
  },
  {
    code: "L4", name: "Storage",
    principle: "Batteries move energy in time: absorbing midday surplus and releasing it into the evening peak, within protective state-of-charge limits.",
    params: [["Charge / discharge η", "96% / 96%"], ["Power limit", "0.5C"], ["SOC window", "10–95%"], ["Primary risk", "Heat-driven ageing"]],
  },
  {
    code: "L5", name: "Distribution",
    principle: "Inverters and protection connect DC generation and storage to AC loads and the grid, prioritising on-site use before import or export.",
    params: [["Dispatch order", "Load → battery → export"], ["Grid factor (assumed)", "0.40 kg CO₂/kWh"], ["Time step", "1 hour"], ["Primary risk", "Export limits"]],
  },
  {
    code: "L6", name: "Edge intelligence",
    principle: "A local controller compares expected and measured performance, protects battery reserves and coordinates energy, water and cleaning decisions — without depending on the cloud.",
    params: [["Loop", "Sense → Compare → Decide → Act"], ["Fault signal", "Expected vs measured deviation"], ["Cleaning", "Condition-based"], ["Primary risk", "Sensor drift"]],
  },
];

const LOOP = [
  { k: "Sense", d: "Irradiance, wind, temperature, battery state, water level, panel output." },
  { k: "Compare", d: "Measured output against the physics model for the same conditions." },
  { k: "Decide", d: "Dispatch, reserve and cleaning choices that respect constraints." },
  { k: "Act", d: "Charge, discharge, curtail, schedule cleaning, alert a technician." },
];

export default function TechnologyPage() {
  return (
    <>
      <PageIntro
        code="T—01"
        eyebrow="Technology"
        title={<>Engineering,<br /><span className="text-ink-400">not slogans.</span></>}
        lede="WELOS combines a shared physical footprint with an operating layer of software. Solar leads; wind and water complement it only where local evidence supports them. Here is how each part works — and the assumptions behind every number we show."
      />

      <section aria-labelledby="study-title" className="border-b border-white/10 py-20 md:py-28">
        <Container>
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <h2 id="study-title" className="display text-3xl md:text-5xl">The UAE concept study</h2>
            <p className="max-w-md text-sm text-ink-400">Reference ranges and model inputs from the WELOS concept study — not guaranteed performance at a particular address. Site design requires local measurement.</p>
          </div>
          <Reveal className="mt-12 grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {STUDY.map((s) => (
              <div key={s.k} data-reveal className="bg-carbon p-6 md:p-8">
                <p className="eyebrow text-[10px] text-ink-400">{s.k}</p>
                <p className="tabular display mt-6 text-4xl md:text-5xl">{s.v}</p>
                <p className="mt-1 text-sm text-ink-300">{s.u}</p>
                <p className="mt-6 text-[13px] leading-relaxed text-ink-400">{s.d}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="layers-title" className="border-b border-white/10 py-20 md:py-28">
        <Container>
          <h2 id="layers-title" className="display text-3xl md:text-5xl">Six layers, one system</h2>
          <div className="mt-12 divide-y divide-white/10 border-y border-white/10">
            {LAYERS.map((l) => (
              <Reveal key={l.code} className="grid gap-6 py-10 lg:grid-cols-12">
                <div data-reveal className="lg:col-span-4">
                  <p className="tabular text-xs text-solar">{l.code}</p>
                  <h3 className="display mt-3 text-2xl md:text-3xl">{l.name}</h3>
                </div>
                <p data-reveal className="text-[15px] leading-relaxed text-ink-300 lg:col-span-4">{l.principle}</p>
                <dl data-reveal className="grid grid-cols-1 gap-y-3 text-[13px] lg:col-span-4">
                  {l.params.map(([k, v]) => (
                    <div key={k} className="flex justify-between gap-6 border-b border-white/5 pb-2">
                      <dt className="text-ink-400">{k}</dt>
                      <dd className="tabular text-right text-paper">{v}</dd>
                    </div>
                  ))}
                </dl>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>

      <section aria-labelledby="loop-title" className="py-20 md:py-28">
        <Container>
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-4">
              <h2 id="loop-title" className="display text-3xl md:text-5xl">The control loop</h2>
              <p className="mt-6 text-[15px] leading-relaxed text-ink-300">
                Intelligence is what sits between the resources. Every cycle, the edge controller runs the same four steps.
              </p>
            </div>
            <ol className="grid gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:col-span-8 lg:grid-cols-4">
              {LOOP.map((s, i) => (
                <li key={s.k} className="relative bg-carbon p-6">
                  <span className="tabular text-xs text-ink-400">0{i + 1}</span>
                  <p className="display mt-8 text-2xl">{s.k}</p>
                  <p className="mt-3 text-[13px] leading-relaxed text-ink-400">{s.d}</p>
                  <span aria-hidden className="absolute right-5 top-6 text-solar">{i < 3 ? "→" : "↺"}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-16 flex flex-wrap gap-3">
            <Link href="/#installation" className="inline-flex h-12 items-center bg-solar px-6 text-sm font-semibold text-carbon hover:bg-[#fff07a]">Explore the 3D installation →</Link>
            <Link href="/#intelligence" className="inline-flex h-12 items-center border border-white/20 px-6 text-sm font-semibold hover:border-paper">Run a scenario</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
