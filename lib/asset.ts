/**
 * Prefixes a /public asset path with the deployment base path.
 * Needed for GitHub Pages project sites (served under /<repo>/); next/link
 * and _next assets are prefixed by Next automatically, raw paths are not.
 */
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
export const asset = (path: string) => `${BASE_PATH}${path}`;
