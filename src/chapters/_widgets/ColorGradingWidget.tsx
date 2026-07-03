import { useRef, useState } from "react";

// ColorGradingWidget: the signature widget for "Color grading".
// One focused interaction: drag a single point on the temperature / tint plane to white
// balance a synthetic scene. The plane's horizontal axis is temperature (blue on the
// left, amber on the right); the vertical axis is tint (magenta at the top, green at the
// bottom). These are the two axes of white balance in every raw editor.
//
// The scene was "shot" under a warm cast, so at the starting point every surface is too
// warm. There is exactly ONE point that neutralizes it: the point where the grey card
// reads as a true neutral grey. That is the whole lesson about correction. It has a right
// answer, and you can find it by watching the grey card (or by tapping the eyedropper,
// which snaps straight to it). Grading is the opposite: the "warm grade" preset parks the
// point deliberately off neutral, so the grey card is tinted on purpose for mood. Same
// control, two jobs. Correct to the neutral first, then choose to leave it. React state
// only, no persistence.
//
// Model: white balance is relative. Being at the correct point (X_STAR, Y_STAR) shows
// each surface's true color; being off by an error e = (x - X_STAR, y - Y_STAR) tints
// every surface by a gain derived from that error. Honest and simple: the grey card is
// neutral only at one point, and any departure tints the whole frame by the same amount.

const X_STAR = -0.5; // the temperature that neutralizes the cast (cooler than the start)
const Y_STAR = 0.06; // the tint that neutralizes it (a touch of magenta)

const kT = 0.55; // how strongly temperature error shifts red vs blue
const kM = 0.35; // how strongly tint error adds magenta (red + blue)
const kG = 0.5; // how strongly tint error shifts green

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const clampAxis = (v: number) => (v < -1 ? -1 : v > 1 ? 1 : v);

// The scene's true surface colors under neutral light (sRGB 0..1). The grey card is the
// reference the reader balances against.
const SURFACES = [
  { key: "grey", label: "grey card", rgb: [0.62, 0.62, 0.62], ref: true },
  { key: "skin", label: "skin", rgb: [0.8, 0.62, 0.5], ref: false },
  { key: "white", label: "white", rgb: [0.92, 0.92, 0.92], ref: false },
  { key: "foliage", label: "foliage", rgb: [0.34, 0.52, 0.3], ref: false },
  { key: "denim", label: "denim", rgb: [0.3, 0.42, 0.62], ref: false },
];

// The tint gain applied to every surface, given the white-balance error from neutral.
function tintGain(ex: number, ey: number): [number, number, number] {
  return [
    Math.max(0, 1 + kT * ex + kM * ey),
    Math.max(0, 1 - kG * ey),
    Math.max(0, 1 - kT * ex + kM * ey),
  ];
}

const toRgb = (rgb: number[], g: [number, number, number]) =>
  `rgb(${rgb.map((c, i) => Math.round(clamp01(c * g[i]) * 255)).join(", ")})`;

// Name the residual cast on the neutrals, so the readout can say which way it leans.
function castName(ex: number, ey: number): string {
  const mag = Math.hypot(ex, ey);
  if (mag < 0.05) return "neutral";
  const parts: string[] = [];
  if (Math.abs(ex) >= 0.08) parts.push(ex > 0 ? "warm" : "cool");
  if (Math.abs(ey) >= 0.08) parts.push(ey > 0 ? "magenta" : "green");
  return parts.length ? parts.join(" + ") : "near neutral";
}

// Plane geometry (viewBox 0 0 200 200). x,y in [-1,1]. Magenta is up, green is down.
const P0 = 18;
const P1 = 182;
const SPAN = P1 - P0;
const toPx = (x: number) => P0 + ((x + 1) / 2) * SPAN;
const toPy = (y: number) => P0 + ((1 - y) / 2) * SPAN;

const PRESETS = [
  { key: "asshot", label: "as shot", x: 0, y: 0 },
  { key: "neutral", label: "auto neutral", x: X_STAR, y: Y_STAR },
  { key: "grade", label: "warm grade", x: X_STAR + 0.42, y: Y_STAR - 0.04 },
];

export function ColorGradingWidget() {
  const [pt, setPt] = useState({ x: 0, y: 0 }); // start "as shot": too warm
  const [focused, setFocused] = useState(false);
  const dragRef = useRef(false);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const ex = pt.x - X_STAR;
  const ey = pt.y - Y_STAR;
  const gain = tintGain(ex, ey);
  const mag = Math.hypot(ex, ey);
  const isNeutral = mag < 0.05;
  const cast = castName(ex, ey);

  const activePreset = PRESETS.find((p) => Math.abs(p.x - pt.x) < 0.005 && Math.abs(p.y - pt.y) < 0.005);

  const pointFromClient = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    const sx = rect.width / 200;
    const sy = rect.height / 200;
    const vx = (clientX - rect.left) / sx;
    const vy = (clientY - rect.top) / sy;
    return {
      x: clampAxis(((vx - P0) / SPAN) * 2 - 1),
      y: clampAxis(1 - ((vy - P0) / SPAN) * 2),
    };
  };

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = true;
    setFocused(true);
    svgRef.current?.setPointerCapture(e.pointerId);
    const p = pointFromClient(e.clientX, e.clientY);
    if (p) setPt(p);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragRef.current) return;
    const p = pointFromClient(e.clientX, e.clientY);
    if (p) setPt(p);
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = false;
    svgRef.current?.releasePointerCapture(e.pointerId);
  };

  const onKey = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.1 : 0.03;
    let handled = true;
    if (e.key === "ArrowLeft") setPt((p) => ({ ...p, x: clampAxis(p.x - step) }));
    else if (e.key === "ArrowRight") setPt((p) => ({ ...p, x: clampAxis(p.x + step) }));
    else if (e.key === "ArrowUp") setPt((p) => ({ ...p, y: clampAxis(p.y + step) }));
    else if (e.key === "ArrowDown") setPt((p) => ({ ...p, y: clampAxis(p.y - step) }));
    else handled = false;
    if (handled) e.preventDefault();
  };

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* the one move: place the white balance on the temp / tint plane */}
        <div className="lg:w-[46%]">
          <p className="mb-2 font-mono text-xs text-comment">{"// drag the point, or focus it and use arrow keys"}</p>
          <svg
            ref={svgRef}
            viewBox="0 0 200 200"
            className="w-full touch-none select-none rounded-md border border-border bg-surface-2"
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onKeyDown={onKey}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            tabIndex={0}
            role="slider"
            aria-label="White balance on the temperature and tint plane"
            aria-valuetext={`temperature ${pt.x > 0.05 ? "warm" : pt.x < -0.05 ? "cool" : "neutral"}, tint ${pt.y > 0.05 ? "magenta" : pt.y < -0.05 ? "green" : "neutral"}. Grey card currently ${cast}.`}
          >
            <defs>
              <linearGradient id="cgw-temp" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="hsl(215, 75%, 55%)" />
                <stop offset="0.5" stopColor="hsl(0, 0%, 50%)" />
                <stop offset="1" stopColor="hsl(35, 85%, 55%)" />
              </linearGradient>
              <linearGradient id="cgw-tint" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="hsl(300, 60%, 58%)" />
                <stop offset="0.5" stopColor="hsl(0, 0%, 50%)" />
                <stop offset="1" stopColor="hsl(120, 50%, 48%)" />
              </linearGradient>
            </defs>
            {/* the two axes, kept quiet so the near-black ground holds */}
            <rect x={P0} y={P0} width={SPAN} height={SPAN} rx={4} fill="url(#cgw-temp)" opacity={0.28} />
            <rect x={P0} y={P0} width={SPAN} height={SPAN} rx={4} fill="url(#cgw-tint)" opacity={0.22} />
            <rect x={P0} y={P0} width={SPAN} height={SPAN} rx={4} fill="none" stroke="var(--border)" />
            {/* crosshair through the plane centre */}
            <line x1={toPx(0)} y1={P0} x2={toPx(0)} y2={P1} stroke="var(--border)" strokeWidth={0.6} />
            <line x1={P0} y1={toPy(0)} x2={P1} y2={toPy(0)} stroke="var(--border)" strokeWidth={0.6} />

            {/* axis labels */}
            <text x={P0 + 2} y={toPy(0) - 4} fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
              blue
            </text>
            <text x={P1 - 2} y={toPy(0) - 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
              amber
            </text>
            <text x={toPx(0) + 3} y={P0 + 9} fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
              magenta
            </text>
            <text x={toPx(0) + 3} y={P1 - 3} fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
              green
            </text>

            {/* when the grey is neutral, mark that the target has been hit */}
            {isNeutral && (
              <circle cx={toPx(pt.x)} cy={toPy(pt.y)} r={12} fill="none" stroke="var(--accent)" strokeWidth={1.2} strokeOpacity={0.5} />
            )}
            {/* the draggable white-balance point */}
            <circle
              cx={toPx(pt.x)}
              cy={toPy(pt.y)}
              r={7}
              fill="var(--surface)"
              stroke={focused ? "var(--accent)" : "var(--fg)"}
              strokeWidth={2}
            />
            <circle cx={toPx(pt.x)} cy={toPy(pt.y)} r={2} fill={isNeutral ? "var(--accent)" : "var(--fg)"} />
          </svg>

          {/* presets: the two jobs the one control does */}
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const active = activePreset?.key === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setPt({ x: p.x, y: p.y })}
                  aria-pressed={active}
                  className={
                    "rounded border px-2.5 py-1 font-mono text-[0.7rem] transition-colors " +
                    (active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-surface-2 text-muted hover:border-accent/60 hover:text-accent")
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>
          <p className="mt-2 font-mono text-[0.7rem] text-comment">{"// auto neutral is the eyedropper: it snaps to the one balancing point"}</p>
        </div>

        {/* the feedback: the scene, its neutrals, and how far off balance it is */}
        <div className="lg:flex-1">
          <svg
            viewBox="0 0 240 96"
            className="w-full rounded-md border border-border bg-surface-2"
            role="img"
            aria-label={`Five surfaces developed at the current white balance. The grey card and white read as ${cast}.`}
          >
            {SURFACES.map((s, i) => {
              const w = 240 / SURFACES.length;
              return (
                <g key={s.key}>
                  <rect x={i * w + 2} y={8} width={w - 4} height={58} rx={3} fill={toRgb(s.rgb, gain)} stroke={s.ref ? "var(--accent)" : "var(--border)"} strokeWidth={s.ref ? 1.4 : 0.6} />
                  <text x={i * w + w / 2} y={82} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill={s.ref ? "var(--accent)" : "var(--comment)"}>
                    {s.label}
                  </text>
                </g>
              );
            })}
          </svg>

          <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
            <dt className="text-comment">grey card</dt>
            <dd className={isNeutral ? "text-accent" : "text-fg"}>{isNeutral ? "neutral — grey is grey" : `${cast} cast`}</dd>
            <dt className="text-comment">off neutral</dt>
            <dd className={isNeutral ? "text-accent" : "text-fg"}>{Math.round(Math.min(1, mag / 0.9) * 100)}%</dd>
            <dt className="text-comment">this is</dt>
            <dd className="text-muted">{isNeutral ? "correction: the one right answer" : mag > 0.28 && ex > 0 ? "a warm cast, or a warm grade if you meant it" : "on the way to neutral"}</dd>
          </dl>

          <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
            {isNeutral
              ? "// grey is grey and skin looks right. from here, any push is a choice, not a fix."
              : "// watch the grey card, not the whole frame. it goes neutral at exactly one point."}
          </p>
        </div>
      </div>
    </div>
  );
}
