/**
 * WELOS identity geometry — single source of truth for every logo variant.
 *
 * Construction (units on a 60-unit x-height grid, centrelines at y = 0 and 60):
 *  - Monoline, 12-unit stroke (1/5 x-height). Visual x-height = 72 (−6 … 66).
 *  - The e's crossbar is detached from its stem by the same gap logic.
 *  - All bowls use a 12-unit corner radius (= stroke) → machined, not soft.
 *  - The w is two load-bearing chevrons with horizontal (machined) cuts,
 *    leaning 3:10. Its centre apex is deliberately left open — the TRANSFER GAP,
 *    two-thirds of a stroke wide — and the energy that would close it is lifted out
 *    as a solid 12×12 square: the QUANTUM. The quantum is the only element that
 *    may carry colour (Solar Yellow / Energy Orange). Everything else is one ink.
 */

export const STROKE = 12;

export type Shape = { kind: "fill" | "stroke"; d: string };

/** w — filled polygons (horizontal cuts need true outlines, not strokes). */
const W_LEFT = "M0 -6 L13 -6 L31.5 55.7 L38 34 L51 34 L41.4 66 L21.6 66 Z";
const W_RIGHT = "M108 -6 L95 -6 L76.5 55.7 L70 34 L57 34 L66.6 66 L86.4 66 Z";

export const glyphs: Record<"w" | "e" | "l" | "o" | "s", Shape[]> = {
  w: [
    { kind: "fill", d: W_LEFT },
    { kind: "fill", d: W_RIGHT },
  ],
  // e: the crossbar stops short of the stem — the same transfer gap as the w
  e: [
    { kind: "stroke", d: "M142 30 L182 30 L182 12 A12 12 0 0 0 170 0 L140 0 A12 12 0 0 0 128 12 L128 48 A12 12 0 0 0 140 60 L182 60" },
  ],
  l: [{ kind: "stroke", d: "M208 -30 L208 46 A14 14 0 0 0 222 60 L230 60" }],
  o: [{ kind: "stroke", d: "M260 0 L292 0 A12 12 0 0 1 304 12 L304 48 A12 12 0 0 1 292 60 L260 60 A12 12 0 0 1 248 48 L248 12 A12 12 0 0 1 260 0 Z" }],
  s: [{ kind: "stroke", d: "M384 0 L342 0 A12 12 0 0 0 330 12 L330 18 A12 12 0 0 0 342 30 L372 30 A12 12 0 0 1 384 42 L384 48 A12 12 0 0 1 372 60 L330 60" }],
};

/** The quantum, centred over the transfer gap (x = 54), seated in the open apex, 10 units above the arms. */
export const quantum = { x: 48, y: 12, size: 12 } as const;

export const wordmarkBox = { x: 0, y: -36, w: 390, h: 102 } as const;
export const emblemBox = { x: 0, y: -6, w: 108, h: 72 } as const;

export const wordmarkShapes: Shape[] = [...glyphs.w, ...glyphs.e, ...glyphs.l, ...glyphs.o, ...glyphs.s];
export const emblemShapes: Shape[] = glyphs.w;

export const palette = {
  solarYellow: "#FFE135",
  energyOrange: "#FF8A00",
  carbonBlack: "#0B0B0B",
  solarWhite: "#F5F5F5",
  industrialGray: "#6B6B6B",
  deepAmber: "#B85C00",
} as const;

type Ink = { ink: string; quantum: string; bg?: string };

export const shapeEl = (s: Shape, ink: string) =>
  s.kind === "fill"
    ? `<path d="${s.d}" fill="${ink}"/>`
    : `<path d="${s.d}" fill="none" stroke="${ink}" stroke-width="${STROKE}" stroke-linecap="butt" stroke-linejoin="miter"/>`;

const shapes = (list: Shape[], ink: string) => list.map((s) => shapeEl(s, ink)).join("");
const quantumEl = (fill: string) =>
  `<rect x="${quantum.x}" y="${quantum.y}" width="${quantum.size}" height="${quantum.size}" fill="${fill}"/>`;

const svgOpen = (vb: string) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="welos"><title>welos</title>`;
const bgRect = (x: number, y: number, w: number, h: number, bg?: string) =>
  bg ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${bg}"/>` : "";

export function wordmarkSVG({ ink, quantum: q, bg }: Ink, pad = 28): string {
  const { x, y, w, h } = wordmarkBox;
  return (
    svgOpen(`${x - pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`) +
    bgRect(x - pad, y - pad, w + pad * 2, h + pad * 2, bg) +
    shapes(wordmarkShapes, ink) +
    quantumEl(q) +
    "</svg>"
  );
}

export function emblemSVG({ ink, quantum: q, bg }: Ink, tile = false): string {
  if (tile) {
    const s = 0.8;
    const tx = (128 - emblemBox.w * s) / 2;
    const ty = (128 - emblemBox.h * s) / 2 + 6 * s + 1;
    return (
      svgOpen("0 0 128 128") +
      `<rect width="128" height="128" rx="28" fill="${bg ?? palette.carbonBlack}"/>` +
      `<g transform="translate(${tx} ${ty}) scale(${s})">${shapes(emblemShapes, ink)}${quantumEl(q)}</g></svg>`
    );
  }
  const pad = 10;
  const { w, h, y } = emblemBox;
  return svgOpen(`${-pad} ${y - pad} ${w + pad * 2} ${h + pad * 2}`) + bgRect(-pad, y - pad, w + pad * 2, h + pad * 2, bg) + shapes(emblemShapes, ink) + quantumEl(q) + "</svg>";
}

export function stackedSVG({ ink, quantum: q, bg }: Ink): string {
  const W = wordmarkBox.w;
  const s = 1.35;
  const ex = (W - emblemBox.w * s) / 2;
  const top = emblemBox.y * s;
  const emblemH = emblemBox.h * s;
  const gap = 52;
  const wmY = top + emblemH + gap - wordmarkBox.y;
  const pad = 36;
  const totalH = emblemH + gap + wordmarkBox.h;
  return (
    svgOpen(`${-pad} ${top - pad} ${W + pad * 2} ${totalH + pad * 2}`) +
    bgRect(-pad, top - pad, W + pad * 2, totalH + pad * 2, bg) +
    `<g transform="translate(${ex} 0) scale(${s})">${shapes(emblemShapes, ink)}${quantumEl(q)}</g>` +
    `<g transform="translate(0 ${wmY})">${shapes(wordmarkShapes, ink)}${quantumEl(q)}</g></svg>`
  );
}
