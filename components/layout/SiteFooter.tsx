import Link from "next/link";
import { Wordmark } from "@/components/brand/Logo";
import { site } from "@/lib/site";

export function SiteFooter() {
  return (
    <footer className="border-t border-white/10 bg-carbon">
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-16 md:grid-cols-12 md:px-10 md:py-20">
        <div className="md:col-span-5">
          <Wordmark className="h-8 w-auto text-paper" title="welos" />
          <p className="mt-6 max-w-sm text-sm leading-relaxed text-ink-400">{site.tagline}</p>
        </div>
        <nav aria-label="Footer" className="grid grid-cols-2 gap-8 text-sm md:col-span-7 md:grid-cols-3">
          <div>
            <p className="eyebrow text-ink-400">Company</p>
            <ul className="mt-4 space-y-3">
              {site.nav.map((n) => (
                <li key={n.href}>
                  <Link className="text-ink-200 hover:text-solar" href={n.href}>{n.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="eyebrow text-ink-400">Explore</p>
            <ul className="mt-4 space-y-3">
              <li><Link className="text-ink-200 hover:text-solar" href="/#energy">Energy simulations</Link></li>
              <li><Link className="text-ink-200 hover:text-solar" href="/#installation">3D installation</Link></li>
              <li><Link className="text-ink-200 hover:text-solar" href="/#intelligence">Energy intelligence</Link></li>
              <li><Link className="text-ink-200 hover:text-solar" href="/brand">Brand guidelines</Link></li>
            </ul>
          </div>
          <div className="col-span-2 md:col-span-1">
            <p className="eyebrow text-ink-400">Note on data</p>
            <p className="mt-4 text-xs leading-relaxed text-ink-400">
              Interactive figures on this site come from simplified, documented models and are illustrative — not
              measurements from operating installations.
            </p>
          </div>
        </nav>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-2 border-t border-white/10 px-5 py-6 text-xs text-ink-400 md:flex-row md:justify-between md:px-10">
        <p>© {new Date().getFullYear()} WELOS. All rights reserved.</p>
        <p>Engineered with intent — solar, wind, water.</p>
      </div>
    </footer>
  );
}
