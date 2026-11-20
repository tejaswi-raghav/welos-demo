"use client";

import { useRef, useState, type FormEvent } from "react";
import { contactSchema, TOPICS } from "@/lib/contact-schema";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "sent" } | { kind: "error"; message: string };
type Errors = Partial<Record<string, string>>;

const ENDPOINT =
  process.env.NEXT_PUBLIC_CONTACT_ENDPOINT || (process.env.NEXT_PUBLIC_STATIC_EXPORT === "1" ? "" : "/api/contact");

const field =
  "mt-2 block w-full border-0 border-b border-white/20 bg-transparent px-0 py-3 text-[15px] text-paper placeholder:text-ink-500 focus:border-solar focus:outline-none focus:ring-0 aria-[invalid=true]:border-error";

export function ContactForm() {
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [errors, setErrors] = useState<Errors>({});
  const formRef = useRef<HTMLFormElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const raw = {
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      organisation: String(fd.get("organisation") ?? ""),
      topic: String(fd.get("topic") ?? ""),
      message: String(fd.get("message") ?? ""),
      consent: fd.get("consent") === "on",
      website: String(fd.get("website") ?? ""),
    };
    const parsed = contactSchema.safeParse(raw);
    if (!parsed.success) {
      const fe = parsed.error.flatten().fieldErrors;
      const next: Errors = {};
      for (const [k, v] of Object.entries(fe)) if (v?.[0]) next[k] = v[0];
      setErrors(next);
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});

    if (!ENDPOINT) {
      setStatus({ kind: "error", message: "This preview has no message delivery configured, so nothing was sent. On the deployed site, set a delivery service in the environment (see README)." });
      statusRef.current?.focus();
      return;
    }

    setStatus({ kind: "sending" });
    try {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(parsed.data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || json.ok === false) throw new Error(json.error || `Delivery failed (${res.status}).`);
      setStatus({ kind: "sent" });
      formRef.current?.reset();
    } catch (err) {
      setStatus({ kind: "error", message: err instanceof Error ? err.message : "Something went wrong." });
    }
    statusRef.current?.focus();
  }

  const err = (k: string) =>
    errors[k] ? <p id={`${k}-error`} className="mt-2 text-[12px] text-error">{errors[k]}</p> : null;
  const a11y = (k: string) => ({ "aria-invalid": !!errors[k], "aria-describedby": errors[k] ? `${k}-error` : undefined });

  if (status.kind === "sent") {
    return (
      <div ref={statusRef} tabIndex={-1} role="status" className="border border-success/40 p-8">
        <p className="eyebrow text-success">Message delivered</p>
        <p className="display mt-4 text-3xl">Thank you. We&rsquo;ll be in touch.</p>
        <button type="button" onClick={() => setStatus({ kind: "idle" })} className="mt-8 text-sm text-ink-300 underline underline-offset-4 hover:text-paper">Send another message</button>
      </div>
    );
  }

  return (
    <form ref={formRef} onSubmit={onSubmit} noValidate className="grid gap-8 sm:grid-cols-2" aria-describedby="form-note">
      <div>
        <label htmlFor="name" className="text-[13px] text-ink-300">Name <span aria-hidden className="text-solar">*</span></label>
        <input id="name" name="name" autoComplete="name" required className={field} {...a11y("name")} />
        {err("name")}
      </div>
      <div>
        <label htmlFor="email" className="text-[13px] text-ink-300">Email <span aria-hidden className="text-solar">*</span></label>
        <input id="email" name="email" type="email" autoComplete="email" required className={field} {...a11y("email")} />
        {err("email")}
      </div>
      <div>
        <label htmlFor="organisation" className="text-[13px] text-ink-300">Organisation</label>
        <input id="organisation" name="organisation" autoComplete="organization" className={field} />
      </div>
      <div>
        <label htmlFor="topic" className="text-[13px] text-ink-300">Topic <span aria-hidden className="text-solar">*</span></label>
        <select id="topic" name="topic" required defaultValue="" className={`${field} [&>option]:bg-carbon`} {...a11y("topic")}>
          <option value="" disabled>Select a topic</option>
          {TOPICS.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        {err("topic")}
      </div>
      <div className="sm:col-span-2">
        <label htmlFor="message" className="text-[13px] text-ink-300">Message <span aria-hidden className="text-solar">*</span></label>
        <textarea id="message" name="message" rows={5} required className={`${field} resize-y`} placeholder="Tell us about the site, its demand and what you'd like to achieve." {...a11y("message")} />
        {err("message")}
      </div>
      <div className="hidden" aria-hidden>
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <div className="sm:col-span-2">
        <label className="flex items-start gap-3 text-[13px] text-ink-300">
          <input type="checkbox" name="consent" className="mt-0.5 h-4 w-4 accent-[#FFE135]" {...a11y("consent")} />
          I agree that WELOS may use these details to respond to my enquiry.
        </label>
        {err("consent")}
      </div>
      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p id="form-note" className="text-[12px] text-ink-400">Fields marked * are required.</p>
        <button
          type="submit"
          disabled={status.kind === "sending"}
          className="inline-flex h-12 items-center justify-center gap-3 bg-solar px-8 text-sm font-semibold text-carbon transition-colors hover:bg-[#fff07a] disabled:cursor-wait disabled:opacity-60"
        >
          {status.kind === "sending" ? "Sending…" : "Send message"}
        </button>
      </div>
      <div ref={statusRef} tabIndex={-1} aria-live="assertive" className="sm:col-span-2 focus:outline-none">
        {status.kind === "error" && (
          <p role="alert" className="border border-error/40 p-4 text-[14px] text-ink-200"><span className="font-semibold text-error">Not sent. </span>{status.message}</p>
        )}
      </div>
    </form>
  );
}
