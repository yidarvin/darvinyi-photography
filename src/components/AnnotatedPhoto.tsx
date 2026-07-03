import { useState, type CSSProperties, type ReactNode } from "react";

interface OverlayLabel {
  /** 0-100 across the frame. */
  x: number;
  /** 0-100 down the frame. */
  y: number;
  text: string;
}

interface AnnotatedPhotoProps {
  src: string;
  alt: string;
  /**
   * SVG overlay drawn in a 0-100 x 0-100 coordinate space over the image. Use the
   * preset grids (<ThirdsGrid/>, <PhiGrid/>, <DiagonalGrid/>) or raw SVG elements
   * (line, polyline, path, circle, polygon). Give strokes vectorEffect="non-scaling-stroke"
   * so they stay crisp under the frame's aspect ratio.
   */
  children?: ReactNode;
  /** Text chips positioned over the frame. Kept out of the stretched SVG so they read cleanly. */
  labels?: OverlayLabel[];
  /** Label shown on the toggle, e.g. "rule of thirds". */
  overlayName?: string;
  /** Start with the overlay shown. Default true. */
  defaultOn?: boolean;
  /** Show the on/off toggle. Default true. */
  toggle?: boolean;
  caption?: ReactNode;
  id?: string;
  meta?: string;
  credit?: string;
  href?: string;
}

const chipStyle: CSSProperties = { backgroundColor: "rgba(10,14,15,0.72)" };

/**
 * A teaching photograph with a switchable geometric overlay. Where <Photo> shows the
 * frame, this draws the structure on top of it: the thirds grid on a landscape, the
 * line the eye follows, the box a frame-within-a-frame makes. The reader toggles the
 * guide to see the photo both ways. Overlay coordinates run 0-100 across and down.
 */
export function AnnotatedPhoto({
  src,
  alt,
  children,
  labels,
  overlayName = "guides",
  defaultOn = true,
  toggle = true,
  caption,
  id,
  meta,
  credit,
  href,
}: AnnotatedPhotoProps) {
  const [on, setOn] = useState(defaultOn);
  const hasCaption = Boolean(caption || meta || credit);

  return (
    <figure className="my-8 rounded-lg border border-border bg-surface p-2">
      <div className="relative overflow-hidden rounded-md">
        <img src={src} alt={alt} loading="lazy" className="block w-full" />
        {on && (
          <>
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden
            >
              {children}
            </svg>
            {labels?.map((l, i) => (
              <span
                key={i}
                className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded px-1.5 py-0.5 font-mono text-[0.65rem] leading-none text-accent"
                style={{ ...chipStyle, left: `${l.x}%`, top: `${l.y}%` }}
              >
                {l.text}
              </span>
            ))}
          </>
        )}
        {toggle && (
          <button
            type="button"
            onClick={() => setOn((v) => !v)}
            aria-pressed={on}
            style={chipStyle}
            className="absolute right-2 top-2 rounded px-2 py-1 font-mono text-[0.7rem] text-comment focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <span className="text-comment">{"// "}</span>
            <span className={on ? "text-accent" : "text-muted"}>{overlayName}</span>
            <span className="text-comment">{on ? " ·on" : " ·off"}</span>
          </button>
        )}
      </div>
      {hasCaption && (
        <figcaption className="mt-3 px-3 pb-1 font-mono text-xs leading-relaxed text-muted">
          {id && <span className="text-comment">{`/* photo ${id} */ `}</span>}
          {caption}
          {meta && <span className="mt-1 block text-comment">{meta}</span>}
          {credit && (
            <span className="mt-1 block text-comment">
              {"photo: "}
              {href ? (
                <a href={href} target="_blank" rel="noreferrer noopener" className="text-accent">
                  {credit}
                </a>
              ) : (
                credit
              )}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}

const stroke = { vectorEffect: "non-scaling-stroke" as const, strokeWidth: 1 };

/** Rule-of-thirds grid: the two-by-two lines and the four power points where they cross. */
export function ThirdsGrid({ points = true }: { points?: boolean }) {
  const a = 100 / 3;
  const b = 200 / 3;
  return (
    <g stroke="var(--accent)" fill="none" opacity={0.85}>
      <line x1={a} y1={0} x2={a} y2={100} {...stroke} />
      <line x1={b} y1={0} x2={b} y2={100} {...stroke} />
      <line x1={0} y1={a} x2={100} y2={a} {...stroke} />
      <line x1={0} y1={b} x2={100} y2={b} {...stroke} />
      {points &&
        [
          [a, a],
          [b, a],
          [a, b],
          [b, b],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.3} fill="var(--accent)" stroke="none" />
        ))}
    </g>
  );
}

/** Golden-ratio (phi) grid: lines set nearer the center than the thirds, at 38.2 / 61.8. */
export function PhiGrid({ points = true }: { points?: boolean }) {
  const a = 38.2;
  const b = 61.8;
  return (
    <g stroke="var(--accent)" fill="none" opacity={0.85}>
      <line x1={a} y1={0} x2={a} y2={100} {...stroke} />
      <line x1={b} y1={0} x2={b} y2={100} {...stroke} />
      <line x1={0} y1={a} x2={100} y2={a} {...stroke} />
      <line x1={0} y1={b} x2={100} y2={b} {...stroke} />
      {points &&
        [
          [a, a],
          [b, a],
          [a, b],
          [b, b],
        ].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={1.3} fill="var(--accent)" stroke="none" />
        ))}
    </g>
  );
}

/** Diagonals corner to corner: the armature for reading dynamic tension and depth. */
export function DiagonalGrid() {
  return (
    <g stroke="var(--accent)" fill="none" opacity={0.7}>
      <line x1={0} y1={0} x2={100} y2={100} {...stroke} />
      <line x1={100} y1={0} x2={0} y2={100} {...stroke} />
    </g>
  );
}
