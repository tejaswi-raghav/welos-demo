import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/contact-schema";

/**
 * Contact delivery. Configure ONE of:
 *  - RESEND_API_KEY + CONTACT_TO_EMAIL (+ CONTACT_FROM_EMAIL)
 *  - CONTACT_WEBHOOK_URL (receives the validated JSON payload)
 * Without configuration the endpoint answers 503 — the UI never claims success
 * unless delivery succeeded.
 */
export async function POST(req: Request) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid request." }, { status: 400 });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, error: "Validation failed.", fields: parsed.error.flatten().fieldErrors }, { status: 422 });
  }
  const data = parsed.data;
  if (data.website) return NextResponse.json({ ok: true }); // honeypot: silently accept bots

  const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL, CONTACT_WEBHOOK_URL } = process.env;

  try {
    if (RESEND_API_KEY && CONTACT_TO_EMAIL) {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          from: CONTACT_FROM_EMAIL || "WELOS Website <onboarding@resend.dev>",
          to: [CONTACT_TO_EMAIL],
          reply_to: data.email,
          subject: `[WELOS] ${data.topic} — ${data.name}`,
          text: [
            `Name: ${data.name}`,
            `Email: ${data.email}`,
            `Organisation: ${data.organisation || "—"}`,
            `Topic: ${data.topic}`,
            "",
            data.message,
          ].join("\n"),
        }),
      });
      if (!res.ok) throw new Error(`Resend responded ${res.status}`);
      return NextResponse.json({ ok: true });
    }

    if (CONTACT_WEBHOOK_URL) {
      const res = await fetch(CONTACT_WEBHOOK_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, website: undefined, receivedAt: new Date().toISOString() }),
      });
      if (!res.ok) throw new Error(`Webhook responded ${res.status}`);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json(
      { ok: false, error: "Message delivery is not configured on this deployment yet." },
      { status: 503 },
    );
  } catch (err) {
    console.error("[contact] delivery failed", err);
    return NextResponse.json({ ok: false, error: "We couldn't deliver your message. Please try again shortly." }, { status: 502 });
  }
}
