import type { Metadata } from "next";
import Link from "next/link";
import { PageIntro, Placeholder } from "@/components/ui/PageIntro";
import { Container } from "@/components/ui/Section";
import { Reveal } from "@/components/ui/Reveal";
import { Emblem } from "@/components/brand/Logo";

export const metadata: Metadata = {
  title: "About",
  description: "The WELOS mission, engineering philosophy and brand vision.",
};

const PRINCIPLES = [
  { k: "Measure before you claim", d: "Every figure we publish states where it came from. Models are labelled as models; study inputs as study inputs." },
  { k: "Fit the site, not the brochure", d: "Use each resource only where local evidence supports it. A sunny roof should not be forced into the same design as a windy one." },
  { k: "Intelligence between resources", d: "The value is in coordination: the controller that decides when to store, when to clean and when to draw from the grid." },
  { k: "Respect scarcity", d: "In arid places water is precious. Every decision that spends it must earn it back." },
];

export default function AboutPage() {
  return (
    <>
      <PageIntro
        code="A—00"
        eyebrow="About WELOS"
        title={<>Engineer<br /><span className="text-gradient-solar">the sun.</span></>}
        lede="WELOS exists to make renewable energy systems that think: capturing more from sun, wind and water, wasting less, and proving every claim with physics."
      />

      <section aria-labelledby="mission-title" className="border-b border-white/10 py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <p className="eyebrow text-ink-400">Mission</p>
            <h2 id="mission-title" className="display mt-6 text-3xl md:text-5xl">Turn natural force into dependable, intelligent power.</h2>
          </div>
          <div className="space-y-6 text-[16px] leading-relaxed text-ink-300 lg:col-span-6 lg:col-start-7">
            <p>
              WELOS began as a concept study on a hard, specific problem: urban rooftops in arid cities with abundant sun,
              uneven wind, scarce but intense rain, and solar panels that lose output as dust builds up.
            </p>
            <p>
              Standalone systems compete for space and miss opportunities. Our answer is one coordinated platform: a shared
              physical footprint with an operating layer that decides, continuously, how to use what each site offers.
            </p>
            <dl className="grid grid-cols-2 gap-px border border-white/10 bg-white/10 text-[13px]">
              <div className="bg-carbon p-4"><dt className="text-ink-400">Founded</dt><dd className="mt-1"><Placeholder>[YEAR]</Placeholder></dd></div>
              <div className="bg-carbon p-4"><dt className="text-ink-400">Headquarters</dt><dd className="mt-1"><Placeholder>[CITY, COUNTRY]</Placeholder></dd></div>
              <div className="bg-carbon p-4"><dt className="text-ink-400">Team</dt><dd className="mt-1"><Placeholder>[TEAM SIZE / DISCIPLINES]</Placeholder></dd></div>
              <div className="bg-carbon p-4"><dt className="text-ink-400">Stage</dt><dd className="mt-1"><Placeholder>[CONCEPT / PILOT / COMMERCIAL]</Placeholder></dd></div>
            </dl>
          </div>
        </Container>
      </section>

      <section aria-labelledby="philosophy-title" className="border-b border-white/10 py-20 md:py-28">
        <Container>
          <h2 id="philosophy-title" className="display text-3xl md:text-5xl">Engineering philosophy</h2>
          <Reveal className="mt-12 grid gap-px border border-white/10 bg-white/10 md:grid-cols-2">
            {PRINCIPLES.map((p, i) => (
              <div key={p.k} data-reveal className="bg-carbon p-8 md:p-10">
                <span className="tabular text-xs text-solar">0{i + 1}</span>
                <h3 className="display mt-8 text-2xl md:text-3xl">{p.k}</h3>
                <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink-300">{p.d}</p>
              </div>
            ))}
          </Reveal>
        </Container>
      </section>

      <section aria-labelledby="vision-title" className="py-20 md:py-28">
        <Container className="grid gap-12 lg:grid-cols-12 lg:items-center">
          <div className="lg:col-span-5">
            <Emblem className="h-28 w-auto text-paper" title="" />
          </div>
          <div className="lg:col-span-7">
            <p className="eyebrow text-ink-400">Brand vision</p>
            <h2 id="vision-title" className="display mt-6 text-3xl md:text-5xl">The logo is the company. The character is the ambition.</h2>
            <p className="mt-6 text-[16px] leading-relaxed text-ink-300">
              The WELOS mark is built from engineering geometry: a w whose centre is left open — the transfer gap — with its
              energy lifted out as a single square quantum. The Solar Figure is our campaign character: a human silhouette
              standing unafraid before the sun. He is a symbol, not a spokesperson.
            </p>
            <Link href="/brand" className="mt-8 inline-flex h-12 items-center border border-white/20 px-6 text-sm font-semibold hover:border-paper">Brand guidelines →</Link>
          </div>
        </Container>
      </section>
    </>
  );
}
