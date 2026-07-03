import {
  useId,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";

interface BeforeAfterProps {
  /** The original / unedited frame. Sizes the box and shows on the left. Required. */
  before: string;
  /** The edited frame, shown on the right. Omit to derive the after from `before`. */
  after?: string;
  /** CSS filter applied to a copy of `before` as the after side when `after` is absent. */
  afterFilter?: string;
  /** Inline SVG <filter> children (a real curve / channel-mixer edit) for the after side. */
  svgFilter?: ReactNode;
  /**
   * CSS clip-path (e.g. a `polygon(...)`) that limits the after side to a region, so a
   * filtered or graded edit reads as a genuinely local (masked) change rather than a
   * global one. It composes with the wipe: the after image shows only inside the
   * intersection of this region and the revealed portion.
   */
  afterClip?: string;
  /** Screen-reader description of the frame. Required. */
  alt: string;
  beforeLabel?: string;
  afterLabel?: string;
  /** Initial divider position, 0-100. Default 50. */
  start?: number;
  id?: string;
  caption?: ReactNode;
  meta?: string;
  credit?: string;
  href?: string;
}

const chipStyle: CSSProperties = { backgroundColor: "rgba(10,14,15,0.72)" };

/**
 * A before/after comparison slider. Drag the divider, or focus it and use the arrow
 * keys, to wipe between the original frame and the edited one. Pass two images via
 * `before`/`after`, or a single `before` plus an `afterFilter` (or `svgFilter`) to
 * apply a real, live edit to the after side. before and after should share an aspect
 * ratio. Where <Photo> shows one frame, this shows the change a decision makes.
 */
export function BeforeAfter({
  before,
  after,
  afterFilter,
  svgFilter,
  afterClip,
  alt,
  beforeLabel = "before",
  afterLabel = "after",
  start = 50,
  id,
  caption,
  meta,
  credit,
  href,
}: BeforeAfterProps) {
  const rawId = useId();
  const filterId = `ba${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;
  const containerRef = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(() => Math.min(100, Math.max(0, start)));
  const [dragging, setDragging] = useState(false);
  const hasCaption = Boolean(caption || meta || credit);

  const setFromClientX = (clientX: number) => {
    const el = containerRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const p = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(100, Math.max(0, p)));
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(true);
    e.currentTarget.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  };
  const onPointerMove = (e: ReactPointerEvent<HTMLDivElement>) => {
    if (dragging) setFromClientX(e.clientX);
  };
  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    setDragging(false);
    if (e.currentTarget.hasPointerCapture(e.pointerId))
      e.currentTarget.releasePointerCapture(e.pointerId);
  };

  const onKeyDown = (e: ReactKeyboardEvent<HTMLButtonElement>) => {
    const step = e.shiftKey ? 10 : 2;
    if (e.key === "ArrowLeft") {
      setPos((p) => Math.max(0, p - step));
      e.preventDefault();
    } else if (e.key === "ArrowRight") {
      setPos((p) => Math.min(100, p + step));
      e.preventDefault();
    } else if (e.key === "Home") {
      setPos(0);
      e.preventDefault();
    } else if (e.key === "End") {
      setPos(100);
      e.preventDefault();
    }
  };

  const afterStyle: CSSProperties =
    after != null
      ? {}
      : svgFilter != null
        ? { filter: `url(#${filterId})` }
        : afterFilter != null
          ? { filter: afterFilter }
          : {};

  return (
    <figure className="my-8 rounded-lg border border-border bg-surface p-2">
      <div
        ref={containerRef}
        className="relative cursor-ew-resize touch-none select-none overflow-hidden rounded-md"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
      >
        {svgFilter != null && after == null && (
          <svg aria-hidden className="pointer-events-none absolute h-0 w-0">
            <defs>
              <filter id={filterId} colorInterpolationFilters="sRGB">
                {svgFilter}
              </filter>
            </defs>
          </svg>
        )}
        <img src={before} alt={alt} draggable={false} className="block w-full select-none" />
        {afterClip ? (
          <div
            className="pointer-events-none absolute inset-0"
            style={{ clipPath: afterClip, WebkitClipPath: afterClip }}
          >
            <img
              src={after ?? before}
              alt=""
              aria-hidden
              draggable={false}
              style={{ ...afterStyle, clipPath: `inset(0 0 0 ${pos}%)` }}
              className="h-full w-full select-none object-cover"
            />
          </div>
        ) : (
          <img
            src={after ?? before}
            alt=""
            aria-hidden
            draggable={false}
            style={{ ...afterStyle, clipPath: `inset(0 0 0 ${pos}%)` }}
            className="absolute inset-0 h-full w-full select-none object-cover"
          />
        )}
        <span
          className="pointer-events-none absolute bottom-2 left-2 rounded px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-fg"
          style={chipStyle}
        >
          {beforeLabel}
        </span>
        <span
          className="pointer-events-none absolute bottom-2 right-2 rounded px-2 py-0.5 font-mono text-[0.7rem] uppercase tracking-wider text-accent"
          style={chipStyle}
        >
          {afterLabel}
        </span>
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
        >
          <div className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-accent" />
          <button
            type="button"
            role="slider"
            aria-label="Reveal the edited version"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(pos)}
            onKeyDown={onKeyDown}
            style={chipStyle}
            className="pointer-events-auto absolute left-1/2 top-1/2 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-accent text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              aria-hidden
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
            >
              <path d="M6 4 2 8l4 4M10 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
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
