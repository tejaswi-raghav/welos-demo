"use client";

import { useEffect } from "react";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => { console.error(error); }, [error]);
  return (
    <section className="flex min-h-[80svh] flex-col justify-center px-5 pt-24 md:px-10">
      <div className="mx-auto w-full max-w-[1440px]">
        <p className="tabular text-sm text-error">FAULT DETECTED</p>
        <h1 className="display mt-4 text-5xl md:text-6xl">Something tripped a breaker.</h1>
        <p className="mt-6 max-w-xl text-ink-300">The page hit an unexpected error. You can retry — the rest of the site is unaffected.</p>
        <button onClick={reset} className="mt-10 inline-flex h-12 items-center bg-solar px-6 text-sm font-semibold text-carbon">Try again</button>
      </div>
    </section>
  );
}
