import Link from "next/link";
import { Emblem } from "@/components/brand/Logo";

export default function NotFound() {
  return (
    <section className="flex min-h-[80svh] flex-col items-start justify-center px-5 pt-24 md:px-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <Emblem className="h-10 w-auto text-paper" title="" />
        <p className="tabular mt-10 text-sm text-solar">404 — SIGNAL LOST</p>
        <h1 className="display mt-4 text-5xl md:text-7xl">This page isn&rsquo;t generating.</h1>
        <Link href="/" className="mt-10 inline-flex h-12 items-center bg-solar px-6 text-sm font-semibold text-carbon">Return home →</Link>
      </div>
    </section>
  );
}
