import type { NextConfig } from "next";

/**
 * STATIC_EXPORT=1 produces a fully static build in /out (used for the
 * hosted design preview). The normal build keeps the /api/contact route.
 */
const isStatic = process.env.STATIC_EXPORT === "1";
/** e.g. "/welos-site" for a GitHub Pages project site; empty for a root domain */
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || undefined;

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  ...(isStatic ? { output: "export", trailingSlash: true, images: { unoptimized: true }, basePath } : {}),
  experimental: { optimizePackageImports: ["recharts", "@react-three/drei"] },
};

export default nextConfig;
