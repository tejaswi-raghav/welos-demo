"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Wordmark } from "@/components/brand/Logo";
import { site } from "@/lib/site";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const first = menuRef.current?.querySelector<HTMLElement>("a");
    first?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,backdrop-filter] duration-300 ${
        scrolled || open ? "border-b border-white/10 bg-carbon/80 backdrop-blur-md" : "border-b border-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-5 md:h-[72px] md:px-10">
        <Link href="/" className="-m-2 p-2 text-paper" aria-label="WELOS home">
          <Wordmark className="h-[22px] w-auto md:h-6" title="" />
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-1 lg:flex">
          {site.nav.map((item) => {
            const active = pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`relative px-3.5 py-2 text-[13px] font-medium tracking-[0.01em] transition-colors ${
                  active ? "text-paper" : "text-ink-300 hover:text-paper"
                }`}
              >
                {item.label}
                {active && <span className="absolute inset-x-3.5 -bottom-[1px] h-px bg-solar" aria-hidden />}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            href="/#installation"
            className="hidden h-9 items-center gap-2 border border-white/15 px-4 text-[13px] font-medium text-paper transition-colors hover:border-solar hover:text-solar sm:inline-flex"
          >
            Explore
            <span aria-hidden className="inline-block h-1.5 w-1.5 bg-solar" />
          </Link>
          <button
            ref={toggleRef}
            type="button"
            className="relative -mr-2 inline-flex h-10 w-10 items-center justify-center lg:hidden"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((o) => !o)}
          >
            <span className={`absolute h-px w-5 bg-paper transition-transform duration-300 ${open ? "rotate-45" : "-translate-y-[4px]"}`} />
            <span className={`absolute h-px w-5 bg-paper transition-transform duration-300 ${open ? "-rotate-45" : "translate-y-[4px]"}`} />
          </button>
        </div>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        hidden={!open}
        className="h-[calc(100dvh-64px)] overflow-y-auto border-t border-white/10 bg-carbon px-5 pb-10 pt-6 lg:hidden"
      >
        <nav aria-label="Mobile">
          <ul className="divide-y divide-white/10 border-y border-white/10">
            {site.nav.map((item, i) => (
              <li key={item.href}>
                <Link href={item.href} className="flex items-baseline justify-between py-5">
                  <span className="display text-3xl font-semibold">{item.label}</span>
                  <span className="tabular text-xs text-ink-400">0{i + 1}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <Link href="/#installation" className="mt-8 inline-flex h-12 w-full items-center justify-center bg-solar text-sm font-semibold text-carbon">
          Explore the technology
        </Link>
      </div>
    </header>
  );
}
