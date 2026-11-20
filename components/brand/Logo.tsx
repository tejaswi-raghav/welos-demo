import { wordmarkShapes, emblemShapes, quantum, wordmarkBox, emblemBox, STROKE, type Shape } from "@/lib/brand/geometry";

type Props = {
  className?: string;
  /** colour of the quantum square; defaults to Solar Yellow */
  quantumColor?: string;
  /** visible label for screen readers; pass "" when decorative */
  title?: string;
};

function Shapes({ list }: { list: Shape[] }) {
  return (
    <>
      {list.map((s, i) =>
        s.kind === "fill" ? (
          <path key={i} d={s.d} fill="currentColor" />
        ) : (
          <path key={i} d={s.d} fill="none" stroke="currentColor" strokeWidth={STROKE} strokeLinecap="butt" strokeLinejoin="miter" />
        ),
      )}
    </>
  );
}

const Quantum = ({ color }: { color: string }) => (
  <rect data-quantum x={quantum.x} y={quantum.y} width={quantum.size} height={quantum.size} fill={color} />
);

export function Wordmark({ className, quantumColor = "var(--color-solar)", title = "welos" }: Props) {
  const p = 4;
  const { x, y, w, h } = wordmarkBox;
  return (
    <svg viewBox={`${x - p} ${y - p} ${w + p * 2} ${h + p * 2}`} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title || undefined}>
      <Shapes list={wordmarkShapes} />
      <Quantum color={quantumColor} />
    </svg>
  );
}

export function Emblem({ className, quantumColor = "var(--color-solar)", title = "welos" }: Props) {
  const p = 2;
  const { y, w, h } = emblemBox;
  return (
    <svg viewBox={`${-p} ${y - p} ${w + p * 2} ${h + p * 2}`} className={className} role={title ? "img" : undefined} aria-hidden={title ? undefined : true} aria-label={title || undefined}>
      <Shapes list={emblemShapes} />
      <Quantum color={quantumColor} />
    </svg>
  );
}
