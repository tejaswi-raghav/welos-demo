/**
 * The Solar Figure — WELOS brand character (not the logo).
 * Vector silhouette derived from the campaign key art: voluminous curly hair,
 * round amber-glowing glasses, a long neck rising from a faceted high collar
 * with shard-like wings, and blade ribbons trailing in the solar wind.
 * The face is never drawn — it is lost in the light.
 */
type Props = { className?: string; rim?: number; glow?: number; id?: string };

/* Deterministic pseudo-random so SSR and client paths match exactly */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Curly hair outline: rounded curl lobes, some finishing in a small hooked tip. */
function hairPath() {
  const r = rng(11);
  const cx = 300, cy = 268, rx = 138, ry = 140;
  const start = (205 * Math.PI) / 180; // lower-left, over the top, to lower-right
  const end = (-25 * Math.PI) / 180;
  const n = 34;
  const pt = (a: number, k: number) => [cx + Math.cos(a) * rx * k, cy - Math.sin(a) * ry * k];
  const f = (v: number) => v.toFixed(1);
  const step = (end - start) / n;
  let a0 = start;
  let v0 = pt(a0, 0.95);
  let d = `M${f(v0[0])} ${f(v0[1])} `;
  for (let i = 0; i < n; i++) {
    const a1 = start + step * (i + 1);
    const v1 = pt(a1, 0.93 + r() * 0.06);
    const out = 1.13 + r() * 0.12; // lobe height
    const twist = step * (r() - 0.5) * 0.9; // curl direction
    const c1 = pt(a0 - step * 0.25 + twist, out);
    const c2 = pt(a1 + step * 0.25 + twist, out);
    if (r() > 0.68) {
      // hooked tip: lobe rises to a point that curls back over itself
      const tip = pt((a0 + a1) / 2 + twist * 2.2, out + 0.1);
      const back = pt((a0 + a1) / 2 + twist * 0.6, out - 0.02);
      d += `C${f(c1[0])} ${f(c1[1])} ${f(tip[0])} ${f(tip[1])} ${f(tip[0])} ${f(tip[1])} Q${f(back[0])} ${f(back[1])} ${f(c2[0])} ${f(c2[1])} L${f(v1[0])} ${f(v1[1])} `;
    } else {
      d += `C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(v1[0])} ${f(v1[1])} `;
    }
    a0 = a1;
    v0 = v1;
  }
  // locks falling past the temples, then a slim jaw to the chin
  d += "C398 338 384 372 370 396 C354 426 330 446 300 448 C270 446 246 426 230 396 C216 372 202 338 206 318 Z";
  return d;
}

const HAIR = hairPath();

// Long neck rising out of a faceted high collar; broad angular shoulder plates.
const BODY =
  "M262 420 L338 420 L346 478 L428 400 L452 424 L424 516 L486 540 L548 580 L578 650 L596 800 L4 800 L22 650 " +
  "L58 588 L150 548 L176 534 L112 464 L146 432 L254 478 Z";

// Blade-like ribbons trailing in the solar wind, as in the key art.
const RIBBONS = [
  "M176 548 L24 470 L150 572 Z",
  "M150 580 L40 540 L128 598 Z",
  "M490 552 L584 600 L476 570 Z",
];

// Facet edges and gold piping.
const FACETS = [
  "M146 432 L254 478 L262 420",
  "M452 424 L346 478 L338 420",
  "M112 464 L176 534 L300 586 L424 516 L452 424",
  "M176 534 L150 548 M424 516 L486 540",
  "M300 586 L268 700 M300 586 L346 690",
  "M58 588 L140 640 L232 610 M548 580 L470 640 L380 612",
];

export function SolarFigure({ className, rim = 1, glow = 1, id = "sf" }: Props) {
  return (
    <svg viewBox="0 0 600 800" className={className} role="img" aria-label="The WELOS Solar Figure: a silhouetted young man backlit by the sun, only his amber glasses glowing">
      <defs>
        <linearGradient id={`${id}-rim`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#FFE135" />
          <stop offset="0.5" stopColor="#FF8A00" />
          <stop offset="1" stopColor="#B85C00" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id={`${id}-body`} x1="0.5" y1="0" x2="0.5" y2="1">
          <stop offset="0" stopColor="#120d08" />
          <stop offset="1" stopColor="#060504" />
        </linearGradient>
        <radialGradient id={`${id}-face`} cx="0.5" cy="0.3" r="0.7">
          <stop offset="0" stopColor="#1a120a" />
          <stop offset="1" stopColor="#070605" />
        </radialGradient>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
        <filter id={`${id}-glow`} x="-60%" y="-300%" width="220%" height="700%">
          <feGaussianBlur stdDeviation="4" result="b1" />
          <feGaussianBlur in="SourceGraphic" stdDeviation="14" result="b2" />
          <feMerge>
            <feMergeNode in="b2" />
            <feMergeNode in="b1" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Rim light from the sun behind */}
      <g opacity={0.9 * rim} filter={`url(#${id}-blur)`}>
        <path d={HAIR} fill={`url(#${id}-rim)`} transform="translate(300 290) scale(1.035) translate(-300 -290)" />
        <path d={BODY} fill={`url(#${id}-rim)`} transform="translate(300 600) scale(1.02 1.01) translate(-300 -600)" opacity="0.7" />
        {RIBBONS.map((d, i) => <path key={i} d={d} fill="#FF8A00" opacity="0.8" />)}
      </g>

      {/* Silhouette */}
      {RIBBONS.map((d, i) => <path key={i} d={d} fill="#0a0806" />)}
      <path d={BODY} fill={`url(#${id}-body)`} />
      <path d={HAIR} fill={`url(#${id}-face)`} />

      {/* Ribbon edge light */}
      <g fill="none" stroke="#FFB347" strokeWidth="1.2" opacity="0.7">
        <path d="M176 548 L24 470" />
        <path d="M150 580 L40 540" />
        <path d="M490 552 L584 600" />
      </g>
      {/* Facets & gold piping */}
      <g fill="none" stroke="#B85C00" strokeWidth="1.4" opacity="0.8">
        {FACETS.map((d, i) => <path key={i} d={d} />)}
      </g>
      <g fill="none" stroke="#FFE135" strokeWidth="1" opacity="0.5">
        <path d="M146 432 L254 478" />
        <path d="M452 424 L346 478" />
      </g>

      {/* Round glasses — the only legible feature */}
      <g data-g filter={`url(#${id}-glow)`} opacity={0.35 + 0.65 * glow}>
        <ellipse cx="262" cy="300" rx="31" ry="19" fill="none" stroke="#FF8A00" strokeWidth="2.4" />
        <ellipse cx="338" cy="300" rx="31" ry="19" fill="none" stroke="#FF8A00" strokeWidth="2.4" />
        <ellipse cx="262" cy="301" rx="25" ry="5" fill="#FF8A00" />
        <ellipse cx="338" cy="301" rx="25" ry="5" fill="#FF8A00" />
        <ellipse cx="262" cy="301" rx="20" ry="2.4" fill="#FFF3B0" />
        <ellipse cx="338" cy="301" rx="20" ry="2.4" fill="#FFF3B0" />
        <path d="M293 298 Q300 293 307 298" fill="none" stroke="#FFB347" strokeWidth="2" />
        <path d="M231 297 L214 292 M369 297 L386 292" stroke="#B85C00" strokeWidth="2" />
      </g>
    </svg>
  );
}
