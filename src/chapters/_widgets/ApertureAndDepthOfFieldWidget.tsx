import { useState } from "react";

// ApertureAndDepthOfFieldWidget: the signature widget for "Aperture and depth of field".
// One focused interaction: hold the framing fixed, then change the f-number and the
// format. The scene shows the background dissolve as the physical hole (entrance pupil =
// focal length / f-number) grows, and a depth bar shows the in-focus zone thin out.
// The move that makes the chapter click: set an f-number on full frame, then flip to
// medium format WITHOUT touching the f-number and watch the depth of field shrink and
// the blur grow, because the larger format needs a longer lens and so opens a wider
// hole at the same f-number. The readout names the full-frame f-number it now matches.
// React state only, no persistence.

const APERTURES = [1.7, 2.5, 4, 5.6, 8, 11, 16];
const LAST = APERTURES.length - 1;

// Matched framing: a head-and-shoulders portrait at 1.5 m. Full frame uses a 50mm
// lens; medium format needs a proportionally longer lens (50 / 0.79) to hold the same
// view. Circle of confusion scales with the format (the Zeiss d/1500 rule), so the
// larger sensor tolerates a looser blur. These are the two numbers that make the
// formats differ. CROP is the full-frame-relative crop factor of the 44x33 sensor.
const CROP = 0.79;
const U = 1500; // subject distance, mm
const FORMATS = {
  ff: { key: "ff", label: "full frame", focal: 50, coc: 0.03 },
  mf: { key: "mf", label: "medium format", focal: 50 / CROP, coc: 0.03 / CROP },
} as const;
type FormatKey = keyof typeof FORMATS;

// The widest physical hole on offer (medium format, wide open): used to normalise the
// background blur so the scene tops out at a believable amount of dissolve.
const MAX_PUPIL = FORMATS.mf.focal / APERTURES[0];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

// A few fixed background highlights. Bokeh is these points smeared into discs.
const HIGHLIGHTS = [
  { x: 44, y: 40 },
  { x: 104, y: 30 },
  { x: 150, y: 52 },
  { x: 210, y: 34 },
  { x: 262, y: 48 },
  { x: 292, y: 30 },
];

export function ApertureAndDepthOfFieldWidget() {
  const [apIndex, setApIndex] = useState(1); // f/2.5
  const [format, setFormat] = useState<FormatKey>("ff");

  const N = APERTURES[apIndex];
  const fmt = FORMATS[format];

  const pupil = fmt.focal / N; // physical hole diameter, mm
  const dofMm = (2 * U * U * N * fmt.coc) / (fmt.focal * fmt.focal); // approx total DoF
  const dofCm = dofMm / 10;
  const equivFf = N * CROP; // full-frame f-number this DoF matches

  const blurStrength = clamp(pupil / MAX_PUPIL, 0, 1); // 0..1, proportional to the hole
  const blurPx = blurStrength * 9;
  const discR = 3 + blurStrength * 11;
  const depthPct = clamp((dofCm / 90) * 100, 2, 100); // depth bar fill, near..far

  const fLabel = (n: number) => `f/${n}`;

  return (
    <div className="font-sans">
      {/* the scene: subject held sharp, background dissolving as the hole grows */}
      <svg
        viewBox="0 0 320 180"
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={`Preview on ${fmt.label} at ${fLabel(N)}: physical hole ${pupil.toFixed(
          1,
        )} millimetres, depth of field about ${dofCm.toFixed(1)} centimetres.${
          format === "mf" ? ` Same depth of field as f/${equivFf.toFixed(1)} on full frame.` : ""
        }`}
      >
        <rect x="0" y="0" width="320" height="180" fill="var(--surface-2)" />

        {/* background highlights, smeared into blur discs by the physical hole */}
        <g style={{ filter: `blur(${blurPx}px)`, transition: "filter 150ms linear" }}>
          {HIGHLIGHTS.map((h, i) => (
            <circle key={i} cx={h.x} cy={h.y} r={discR} fill="var(--accent)" opacity={0.22 + blurStrength * 0.3} />
          ))}
        </g>

        {/* the subject: always sharp, sitting on the plane of focus */}
        <g>
          <ellipse cx="160" cy="150" rx="52" ry="34" fill="var(--fg)" opacity="0.9" />
          <circle cx="160" cy="104" r="24" fill="var(--fg)" opacity="0.9" />
        </g>
      </svg>

      {/* the in-focus zone as a slab of distance: near on the left, far on the right */}
      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between font-mono text-xs">
          <span className="text-comment">near</span>
          <span className="text-accent">{`depth of field ~ ${dofCm.toFixed(1)} cm`}</span>
          <span className="text-comment">far</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="absolute top-0 h-2 -translate-x-1/2 rounded-full bg-accent"
            style={{ left: "50%", width: `${depthPct}%`, transition: "width 150ms linear" }}
          />
        </div>
      </div>

      {/* readouts: the physical hole, and the full-frame f-number this DoF matches */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">physical hole</dt>
        <dd className="text-right text-fg">{`${pupil.toFixed(1)} mm`}</dd>
        <dt className="text-comment">this f-number</dt>
        <dd className="text-right text-fg">{fLabel(N)}</dd>
        <dt className="text-comment">same depth of field as</dt>
        <dd className="text-right text-accent">
          {format === "mf" ? `f/${equivFf.toFixed(1)} on full frame` : "f/" + N.toString() + " (this is full frame)"}
        </dd>
      </dl>

      {/* format: the payoff move. Flip it without touching the f-number. */}
      <div className="mt-5">
        <span className="mb-2 block font-mono text-xs text-comment">format</span>
        <div className="flex gap-2">
          {(Object.keys(FORMATS) as FormatKey[]).map((k) => {
            const active = k === format;
            return (
              <button
                key={k}
                type="button"
                onClick={() => setFormat(k)}
                aria-pressed={active}
                className={
                  "rounded border px-3 py-1.5 font-mono text-xs transition-colors " +
                  (active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface-2 text-fg hover:border-accent/60")
                }
              >
                {FORMATS[k].label}
              </button>
            );
          })}
        </div>
      </div>

      {/* aperture: step in the usual f-stops from wide open to stopped down */}
      <div className="mt-4 flex items-center gap-3">
        <span className="w-20 shrink-0 font-mono text-xs text-accent">aperture</span>
        <button
          type="button"
          onClick={() => setApIndex((v) => clamp(v - 1, 0, LAST))}
          disabled={apIndex === 0}
          aria-label={`Wider aperture (currently ${fLabel(N)})`}
          className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          &lt;
        </button>
        <span className="w-16 text-center font-mono text-sm text-fg">{fLabel(N)}</span>
        <button
          type="button"
          onClick={() => setApIndex((v) => clamp(v + 1, 0, LAST))}
          disabled={apIndex === LAST}
          aria-label={`Narrower aperture (currently ${fLabel(N)})`}
          className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          &gt;
        </button>
        <span className="hidden font-mono text-[0.7rem] text-comment sm:inline">wide .. narrow</span>
      </div>
    </div>
  );
}
