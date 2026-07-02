import { useMemo, useRef, useState } from "react";

// ToneAndTheCurveWidget: the signature widget for "Tone and the curve".
// One focused interaction: shape the tone curve and watch a single high-contrast scene,
// its histogram, and its clipping respond in real time. The reader drags four control
// points (or nudges them with the arrow keys): the black point, a shadows handle, a
// highlights handle, and the white point. The curve is the ONE mapping every tonal
// control is a handle on, so bending it here is exposure, contrast, and recovery all at
// once. Lift the whole shape and the scene brightens and the sky blows against the right
// wall. Flatten the shoulder and the blown sky comes back down off the wall, detail and
// all: recovering the ends. Lift the toe and the black foreground opens up. The histogram
// shows the tones sliding, and the clipping readout counts what has been pushed past the
// walls, where the data is gone. React state only, no persistence.
//
// The scene is synthetic but honest: three bands of real luminance (a bright sky near the
// top of the range, a midtone subject, a near-black foreground) are each remapped through
// the exact curve you draw, so any tone you see is the curve applied to a fixed capture.

const XS = [0, 1 / 3, 2 / 3, 1]; // input positions of the four control points
const HSEG = 1 / 3; // spacing between them
const LUTN = 128; // tone lookup resolution

const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

// Build the input-to-output lookup table from the four control-point outputs, using a
// monotone cubic (Fritsch-Carlson) so the curve stays smooth and never overshoots the
// points it passes through. xs are fixed at 0, 1/3, 2/3, 1.
function buildLUT(ys: number[]): number[] {
  const delta = [0, 1, 2].map((i) => (ys[i + 1] - ys[i]) / HSEG);
  const m = [delta[0], (delta[0] + delta[1]) / 2, (delta[1] + delta[2]) / 2, delta[2]];
  // Fritsch-Carlson: keep the interpolant monotone within each segment.
  for (let i = 0; i < 3; i++) {
    if (delta[i] === 0) {
      m[i] = 0;
      m[i + 1] = 0;
      continue;
    }
    const a = m[i] / delta[i];
    const b = m[i + 1] / delta[i];
    const s = a * a + b * b;
    if (s > 9) {
      const t = 3 / Math.sqrt(s);
      m[i] = t * a * delta[i];
      m[i + 1] = t * b * delta[i];
    }
  }
  const lut: number[] = [];
  for (let k = 0; k <= LUTN; k++) {
    const t = k / LUTN;
    const seg = Math.min(2, Math.floor(t * 3));
    const u = (t - XS[seg]) / HSEG;
    const u2 = u * u;
    const u3 = u2 * u;
    const h00 = 2 * u3 - 3 * u2 + 1;
    const h10 = u3 - 2 * u2 + u;
    const h01 = -2 * u3 + 3 * u2;
    const h11 = u3 - u2;
    const val = h00 * ys[seg] + h10 * HSEG * m[seg] + h01 * ys[seg + 1] + h11 * HSEG * m[seg + 1];
    lut.push(clamp01(val));
  }
  return lut;
}

const applyLUT = (lut: number[], v: number) => {
  const f = clamp01(v) * LUTN;
  const i = Math.min(LUTN - 1, Math.floor(f));
  return lut[i] + (lut[i + 1] - lut[i]) * (f - i);
};

// The fixed capture: three bands of luminance covering the full range. The sky rides near
// the top (some columns near white), the foreground sits near black. High contrast on
// purpose, so the ends are always in play.
const NCOL = 48;
const BANDS = [
  { key: "sky", label: "sky", base: (x: number) => 0.93 + 0.06 * Math.sin(x * Math.PI * 3) },
  { key: "subject", label: "subject", base: (x: number) => 0.46 + 0.05 * Math.sin(x * Math.PI * 4) },
  { key: "ground", label: "foreground", base: (x: number) => 0.05 + 0.05 * x },
];
const SCENE = BANDS.map((b) => Array.from({ length: NCOL }, (_, i) => clamp01(b.base(i / (NCOL - 1)))));
const ALL_SAMPLES = SCENE.flat();

// Named presets: the three moves the chapter teaches, as one-tap curves.
const PRESETS: { key: string; label: string; ys: number[] }[] = [
  { key: "linear", label: "linear", ys: [0, 1 / 3, 2 / 3, 1] },
  { key: "contrast", label: "contrast S", ys: [0, 0.24, 0.76, 1] },
  { key: "recover", label: "recover the ends", ys: [0.03, 0.42, 0.62, 0.9] },
];
const INITIAL = [0, 1 / 3, 2 / 3, 1];

// Control-point names, tied to the figure's zone labels.
const POINT_LABELS = ["black point", "shadows", "highlights", "white point"];

const grey = (v: number) => {
  const n = Math.round(clamp01(v) * 255);
  return `rgb(${n}, ${n}, ${n})`;
};

// Curve-editor plot geometry (viewBox 0 0 240 240).
const PX0 = 30;
const PX1 = 224;
const PY0 = 16;
const PY1 = 210;
const cSpanX = PX1 - PX0;
const cSpanY = PY1 - PY0;
const cx = (x: number) => PX0 + x * cSpanX;
const cy = (y: number) => PY1 - y * cSpanY;

const NBIN = 32;

export function ToneAndTheCurveWidget() {
  const [ys, setYs] = useState<number[]>(INITIAL);
  const [focus, setFocus] = useState<number | null>(null);
  const dragRef = useRef<number | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const lut = useMemo(() => buildLUT(ys), [ys]);

  // Remap the fixed scene, build the output histogram, and count what got pushed past the
  // walls, all from the current curve.
  const { hist, blownPct, crushedPct } = useMemo(() => {
    const bins = new Array(NBIN).fill(0);
    let blown = 0;
    let crushed = 0;
    for (const v of ALL_SAMPLES) {
      const out = applyLUT(lut, v);
      const b = Math.min(NBIN - 1, Math.floor(out * NBIN));
      bins[b] += 1;
      if (out >= 0.996) blown += 1;
      else if (out <= 0.004) crushed += 1;
    }
    const total = ALL_SAMPLES.length;
    return {
      hist: bins,
      blownPct: Math.round((blown / total) * 100),
      crushedPct: Math.round((crushed / total) * 100),
    };
  }, [lut]);

  const maxBin = Math.max(1, ...hist);
  const curvePath = useMemo(() => {
    const pts = Array.from({ length: 49 }, (_, i) => i / 48);
    return pts.map((x, i) => `${i === 0 ? "M" : "L"} ${cx(x).toFixed(1)} ${cy(applyLUT(lut, x)).toFixed(1)}`).join(" ");
  }, [lut]);

  const setPoint = (i: number, out: number) =>
    setYs((prev) => {
      const next = prev.slice();
      next[i] = clamp01(out);
      return next;
    });

  const outputFromClientY = (clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return 0;
    const rect = svg.getBoundingClientRect();
    const scaleY = rect.height / 240;
    const yView = (clientY - rect.top) / scaleY;
    const frac = (yView - PY0) / cSpanY;
    return clamp01(1 - frac);
  };

  const onPointerDown = (i: number) => (e: React.PointerEvent) => {
    e.preventDefault();
    dragRef.current = i;
    setFocus(i);
    svgRef.current?.setPointerCapture(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (dragRef.current === null) return;
    setPoint(dragRef.current, outputFromClientY(e.clientY));
  };
  const onPointerUp = (e: React.PointerEvent) => {
    dragRef.current = null;
    svgRef.current?.releasePointerCapture(e.pointerId);
  };

  const onKey = (i: number) => (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 0.08 : 0.02;
    if (e.key === "ArrowUp" || e.key === "ArrowRight") {
      e.preventDefault();
      setPoint(i, ys[i] + step);
    } else if (e.key === "ArrowDown" || e.key === "ArrowLeft") {
      e.preventDefault();
      setPoint(i, ys[i] - step);
    }
  };

  const activePreset = PRESETS.find((p) => p.ys.every((v, i) => Math.abs(v - ys[i]) < 0.001));
  const clean = blownPct === 0 && crushedPct === 0;
  const cw = 240 / NCOL + 0.6;

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* the one move: shape the curve */}
        <div className="lg:w-[46%]">
          <p className="mb-2 font-mono text-xs text-comment">{"// drag the points, or focus one and use arrow keys"}</p>
          <svg
            ref={svgRef}
            viewBox="0 0 240 240"
            className="w-full touch-none select-none rounded-md border border-border bg-surface-2"
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            role="group"
            aria-label="Tone curve editor"
          >
            {/* quarter grid */}
            {[0.25, 0.5, 0.75].map((g) => (
              <g key={g}>
                <line x1={cx(g)} y1={PY0} x2={cx(g)} y2={PY1} stroke="var(--border)" strokeWidth={0.6} />
                <line x1={PX0} y1={cy(g)} x2={PX1} y2={cy(g)} stroke="var(--border)" strokeWidth={0.6} />
              </g>
            ))}
            <rect x={PX0} y={PY0} width={cSpanX} height={cSpanY} fill="none" stroke="var(--border)" />
            {/* identity */}
            <line x1={cx(0)} y1={cy(0)} x2={cx(1)} y2={cy(1)} stroke="var(--comment)" strokeWidth={1} strokeDasharray="4 4" />
            {/* current curve */}
            <path d={curvePath} stroke="var(--accent)" strokeWidth={2.4} fill="none" strokeLinecap="round" />
            {/* control points */}
            {XS.map((x, i) => {
              const px = cx(x);
              const py = cy(ys[i]);
              const isFocus = focus === i;
              return (
                <g key={i}>
                  {isFocus && <circle cx={px} cy={py} r={9} fill="none" stroke="var(--accent)" strokeWidth={1.5} strokeOpacity={0.6} />}
                  <circle
                    cx={px}
                    cy={py}
                    r={6}
                    fill="var(--accent)"
                    stroke="var(--bg)"
                    strokeWidth={1.5}
                    style={{ cursor: "ns-resize" }}
                    tabIndex={0}
                    role="slider"
                    aria-label={`${POINT_LABELS[i]} output`}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={Math.round(ys[i] * 100)}
                    aria-valuetext={`${POINT_LABELS[i]}: ${Math.round(ys[i] * 100)} percent output`}
                    onPointerDown={onPointerDown(i)}
                    onKeyDown={onKey(i)}
                    onFocus={() => setFocus(i)}
                    onBlur={() => setFocus((f) => (f === i ? null : f))}
                  />
                </g>
              );
            })}
            <text x={PX0} y={PY1 + 20} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
              in: black
            </text>
            <text x={PX1} y={PY1 + 20} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
              white
            </text>
          </svg>

          {/* presets: the three named moves, one tap each */}
          <div className="mt-3 flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const active = activePreset?.key === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setYs(p.ys.slice())}
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
            <button
              type="button"
              onClick={() => setYs(INITIAL.slice())}
              className="ml-auto font-mono text-[0.7rem] text-comment underline-offset-2 hover:text-accent hover:underline"
            >
              reset
            </button>
          </div>
        </div>

        {/* the feedback: the scene, its histogram, and the clipping it produces */}
        <div className="lg:flex-1">
          <svg
            viewBox="0 0 240 150"
            className="w-full rounded-md border border-border bg-surface-2"
            role="img"
            aria-label={`The scene developed through the current curve. Blown highlights ${blownPct} percent, crushed shadows ${crushedPct} percent.`}
          >
            {SCENE.map((band, bi) =>
              band.map((v, i) => (
                <rect
                  key={`${bi}-${i}`}
                  x={(i / NCOL) * 240}
                  y={12 + bi * 46}
                  width={cw}
                  height={44}
                  fill={grey(applyLUT(lut, v))}
                />
              )),
            )}
            {BANDS.map((b, bi) => (
              <text key={b.key} x={6} y={26 + bi * 46} fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
                {`// ${b.label}`}
              </text>
            ))}
          </svg>

          {/* output histogram */}
          <svg
            viewBox="0 0 240 68"
            className="mt-3 w-full rounded-md border border-border bg-surface-2"
            role="img"
            aria-label="Histogram of the scene after the curve, shadows on the left, highlights on the right."
          >
            {hist.map((c, i) => {
              const bw = 240 / NBIN;
              const h = (c / maxBin) * 52;
              const atWall = (i === 0 && crushedPct > 0) || (i === NBIN - 1 && blownPct > 0);
              return (
                <rect
                  key={i}
                  x={i * bw + 0.5}
                  y={60 - h}
                  width={bw - 1}
                  height={h}
                  fill={atWall ? "var(--danger)" : "var(--accent)"}
                  fillOpacity={atWall ? 0.9 : 0.55}
                />
              );
            })}
            <line x1={0} y1={60} x2={240} y2={60} stroke="var(--border)" strokeWidth={1} />
          </svg>

          {/* clipping readout */}
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
            <dt className="text-comment">blown highlights</dt>
            <dd className={"text-right " + (blownPct > 0 ? "text-danger" : "text-fg")}>{blownPct}%</dd>
            <dt className="text-comment">crushed shadows</dt>
            <dd className={"text-right " + (crushedPct > 0 ? "text-danger" : "text-fg")}>{crushedPct}%</dd>
          </dl>
          <p className="mt-3 font-mono text-[0.7rem] leading-relaxed text-comment">
            {clean
              ? "// nothing is against the walls. every tone still has somewhere to move."
              : "// tones piled on a wall are gone: no bend of the curve brings them back. only a better exposure would."}
          </p>
        </div>
      </div>
    </div>
  );
}
