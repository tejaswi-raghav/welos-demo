import Link from "next/link";
import { Hero } from "@/components/home/Hero";
import { EnergyTransformation } from "@/components/home/EnergyTransformation";
import { Installation } from "@/components/home/Installation";
import { Campaign } from "@/components/home/Campaign";
import { Dashboard } from "@/components/home/Dashboard";
import { Emblem } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Section";

export default function Home() {
  return (
    <>
      <Hero />
      <EnergyTransformation />
      <Installation />
      <Campaign />
      <Dashboard />

      <section aria-labelledby="cta-title" className="theme-light">
        <Container className="grid gap-12 py-24 md:py-32 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-8">
            <Emblem className="h-12 w-auto text-carbon" quantumColor="#FF8A00" title="" />
            <h2 id="cta-title" className="display mt-10 text-[clamp(2.5rem,6vw,5.5rem)]">
              We don&rsquo;t just capture energy.
              <br />
              <span className="text-[#555]">We engineer what comes next.</span>
            </h2>
          </div>
          <div className="flex flex-col gap-3 lg:col-span-4">
            <Link href="/solutions" className="group flex h-14 items-center justify-between bg-carbon px-6 text-sm font-semibold text-paper transition-colors hover:bg-[#262626]">
              See deployment scenarios <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
            <Link href="/contact" className="group flex h-14 items-center justify-between border border-carbon/25 px-6 text-sm font-semibold transition-colors hover:border-carbon">
              Start a conversation <span aria-hidden className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
