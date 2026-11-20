export const site = {
  name: "WELOS",
  tagline: "We don't just capture energy. We engineer what comes next.",
  description:
    "WELOS engineers intelligent solar, wind and water energy systems that capture more, waste less, and power what comes next.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://welos-app.vercel.app",
  nav: [
    { href: "/technology", label: "Technology" },
    { href: "/solutions", label: "Solutions" },
    { href: "/innovation", label: "Innovation" },
    { href: "/about", label: "About" },
    { href: "/contact", label: "Contact" },
  ],
} as const;
