import type { Metadata } from "next";
import { PageIntro, Placeholder } from "@/components/ui/PageIntro";
import { Container } from "@/components/ui/Section";
import { ContactForm } from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Talk to WELOS about a site, a partnership or research.",
};

export default function ContactPage() {
  return (
    <>
      <PageIntro
        code="C—00"
        eyebrow="Contact"
        title={<>Start with<br /><span className="text-ink-400">the site.</span></>}
        lede="Tell us where, what it needs and what it has to work with. Every WELOS conversation begins with measured conditions."
      />
      <section className="py-20 md:py-28">
        <Container className="grid gap-16 lg:grid-cols-12">
          <div className="lg:col-span-7"><ContactForm /></div>
          <aside className="space-y-10 lg:col-span-4 lg:col-start-9">
            <div>
              <p className="eyebrow text-ink-400">Useful to include</p>
              <ul className="mt-4 space-y-3 text-[14px] text-ink-300">
                {["Location and roof or land area", "Typical daily or monthly demand", "Existing generation or storage", "Water supply and pressure conditions", "Timeline and decision stage"].map((x) => (
                  <li key={x} className="flex gap-3"><span aria-hidden className="mt-2 h-1 w-1 shrink-0 bg-solar" />{x}</li>
                ))}
              </ul>
            </div>
            <div className="border-t border-white/10 pt-8 text-[14px] text-ink-300">
              <p className="eyebrow text-ink-400">Direct</p>
              <p className="mt-4">Email: <Placeholder>hello@[your-domain]</Placeholder></p>
              <p className="mt-2">Office: <Placeholder>[ADDRESS]</Placeholder></p>
            </div>
          </aside>
        </Container>
      </section>
    </>
  );
}
