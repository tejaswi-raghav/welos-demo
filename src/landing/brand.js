/**
 * WELOS identity — the Ring.
 *
 * Emblem: a tilted band (one loop) that shades from water blue through cloud
 * silver to solar orange — sun, wind and water as a single closed system —
 * sliced by a blade of light (the intelligence that cuts across all three).
 * The blade leaves a true gap in the band, so the mark works on any background.
 *
 * Wordmark: lowercase, machined geometry on a 60-unit x-height grid.
 * Everything here is plain data so both the site and scripts/brand.mjs can use it.
 */

/* ── Emblem (viewBox 0 0 128 128) ── */
const C = { x: 64, y: 64, rot: -33 };
const ellipse = (cx, cy, rx, ry) =>
  `M${cx - rx} ${cy} A${rx} ${ry} 0 1 0 ${cx + rx} ${cy} A${rx} ${ry} 0 1 0 ${cx - rx} ${cy} Z`;

export const emblem = {
  viewBox: "0 0 128 128",
  rotate: `rotate(${C.rot} ${C.x} ${C.y})`,
  // outer edge, and an inner edge shifted toward the water end → band is thick at the sun, thin at the water
  band: `${ellipse(C.x, C.y, 57, 31)} ${ellipse(C.x - 6, C.y + 1.5, 47.5, 19)}`,
  // band gradient runs along the long axis (in the rotated frame)
  gradient: [
    [0, "#1F6FD1"], [0.2, "#4F9BE0"], [0.36, "#C9D6E0"], [0.5, "#EDE6DA"],
    [0.64, "#FF8A00"], [0.84, "#FFC233"], [1, "#FFE88A"],
  ],
  gradientLine: { x1: 7, y1: 64, x2: 121, y2: 64 },
  // blade of light: a long tapered sliver, lower-left → upper-right (unrotated frame)
  blade: "M3 101 L66 73.2 L126 45 L66 75.8 Z",
  // the cut the blade makes through the band (masked out of the band)
  cut: "M0 103.5 L128 43.5 L128 48.5 L0 108.5 Z",
  bladeGradient: [[0, "rgba(255,138,0,0)"], [0.35, "#FFB238"], [0.6, "#FFF6D2"], [1, "#FFD23F"]],
};

/* ── Wordmark (viewBox -6 -40 396 112) ── */
export const STROKE = 12;
export const wordmark = [
  // w: closed, flat machined feet, mid apex at 60% height
  { kind: "fill", d: "M0 -6 L13 -6 L28.5 50 L49 14 L59 14 L79.5 50 L95 -6 L108 -6 L86.4 66 L72.6 66 L54 32.5 L35.4 66 L21.6 66 Z" },
  // e: crossbar stops short of the stem
  { kind: "stroke", d: "M142 30 L182 30 L182 12 A12 12 0 0 0 170 0 L140 0 A12 12 0 0 0 128 12 L128 48 A12 12 0 0 0 140 60 L182 60" },
  { kind: "stroke", d: "M208 -30 L208 46 A14 14 0 0 0 222 60 L230 60" },
  { kind: "stroke", d: "M260 0 L292 0 A12 12 0 0 1 304 12 L304 48 A12 12 0 0 1 292 60 L260 60 A12 12 0 0 1 248 48 L248 12 A12 12 0 0 1 260 0 Z" },
  { kind: "stroke", d: "M384 0 L342 0 A12 12 0 0 0 330 12 L330 18 A12 12 0 0 0 342 30 L372 30 A12 12 0 0 1 384 42 L384 48 A12 12 0 0 1 372 60 L330 60" },
];
export const wordmarkViewBox = "-6 -40 396 112";

/* ── SVG string builders (used by scripts/brand.mjs) ── */
const stops = (list) => list.map(([o, c]) => `<stop offset="${o}" stop-color="${c}"/>`).join("");

export function emblemSVG({ id = "w", mono = null, size = null } = {}) {
  const g = emblem.gradientLine;
  const fill = mono ?? `url(#${id}-band)`;
  const blade = mono ?? `url(#${id}-blade)`;
  const dims = size ? ` width="${size}" height="${size}"` : "";
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${emblem.viewBox}"${dims} role="img" aria-label="welos"><title>welos</title><defs>` +
    `<linearGradient id="${id}-band" gradientUnits="userSpaceOnUse" x1="${g.x1}" y1="${g.y1}" x2="${g.x2}" y2="${g.y2}" gradientTransform="${emblem.rotate}">${stops(emblem.gradient)}</linearGradient>` +
    `<linearGradient id="${id}-blade" gradientUnits="userSpaceOnUse" x1="3" y1="101" x2="126" y2="45">${stops(emblem.bladeGradient)}</linearGradient>` +
    `<mask id="${id}-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="128" height="128"><rect width="128" height="128" fill="#fff"/><path d="${emblem.cut}" fill="#000"/></mask>` +
    `</defs><g mask="url(#${id}-cut)"><path d="${emblem.band}" fill="${fill}" fill-rule="evenodd" transform="${emblem.rotate}"/></g>` +
    `<path d="${emblem.blade}" fill="${blade}"/></svg>`;
}

const wordmarkPaths = (ink) =>
  wordmark.map((s) => s.kind === "fill"
    ? `<path d="${s.d}" fill="${ink}"/>`
    : `<path d="${s.d}" fill="none" stroke="${ink}" stroke-width="${STROKE}" stroke-linejoin="miter"/>`).join("");

export function wordmarkSVG(ink = "#F5F5F5") {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${wordmarkViewBox}" role="img" aria-label="welos"><title>welos</title>${wordmarkPaths(ink)}</svg>`;
}

/** Horizontal lockup: emblem (≈1.75× x-height) + wordmark. */
export function lockupSVG({ ink = "#F5F5F5", id = "lk", mono = null } = {}) {
  const e = emblemSVG({ id, mono }).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/<title>welos<\/title>/, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-166 -44 562 124" role="img" aria-label="welos"><title>welos</title>` +
    `<g transform="translate(-158 -37) scale(1.05)">${e}</g>${wordmarkPaths(ink)}</svg>`;
}

/** Stacked lockup: emblem above wordmark. */
export function stackedSVG({ ink = "#F5F5F5", id = "st" } = {}) {
  const e = emblemSVG({ id }).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/<title>welos<\/title>/, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-20 -230 430 320" role="img" aria-label="welos"><title>welos</title>` +
    `<g transform="translate(99 -226) scale(1.5)">${e}</g>${wordmarkPaths(ink)}</svg>`;
}

/** App / favicon tile. */
export function tileSVG({ bg = "#0B0B0B", id = "tl" } = {}) {
  const e = emblemSVG({ id }).replace(/^<svg[^>]*>/, "").replace(/<\/svg>$/, "").replace(/<title>welos<\/title>/, "");
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="welos"><title>welos</title><rect width="128" height="128" rx="28" fill="${bg}"/><g transform="translate(6 6) scale(0.906)">${e}</g></svg>`;
}
