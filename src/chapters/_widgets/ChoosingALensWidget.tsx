import { useState } from "react";

// ChoosingALensWidget: the signature widget for "Choosing a lens".
// One focused interaction: you drag a target framing along the full-frame-equivalent
// focal-length axis, from one fixed spot. The scene reframes to the slice that framing
// keeps, and two cards show what each camera charges to reach it. The Leica Q3 has one
// 28mm lens, so it reaches longer framings by cropping, and its megapixels drain from 60
// toward 6; below 28mm it simply cannot go. The Hasselblad X2D names the nearest XCD lens
// and keeps the full 100MP, but every step is a lens change and more weight. The move
// that makes the chapter click: you never walked, you chose a slice, and the two systems
// bill you differently, the Q3 in pixels and the X2D in glass. React state only.

const WIDE_F = 20; // the widest framing the scene is drawn to fill (the X2D 25V)
const MIN_F = 20;
const MAX_F = 120;

// The Q3 crop resolution: 60MP native at 28, falling as 60 x (28/f)^2 through the crop
// framelines (39/19/8/6 at 35/50/75/90). Rounded the way Leica quotes it.
const q3Megapixels = (f: number) => Math.round(60 * (28 / f) ** 2);

interface XcdLens {
  eq: number; // full-frame-equivalent framing, in mm
  name: string;
  aperture: string;
}

// The XCD glass the X2D would reach for at each framing: the V-series primes, the fast
// 80, the 65, the 120 macro, the 135. Full-frame equivalents at the 0.79 crop factor.
const XCD: XcdLens[] = [
  { eq: 20, name: "XCD 25V", aperture: "f/2.5" },
  { eq: 30, name: "XCD 38V", aperture: "f/2.5" },
  { eq: 43, name: "XCD 55V", aperture: "f/2.5" },
  { eq: 51, name: "XCD 65", aperture: "f/2.8" },
  { eq: 63, name: "XCD 80", aperture: "f/1.9" },
  { eq: 71, name: "XCD 90V", aperture: "f/2.5" },
  { eq: 95, name: "XCD 120 Macro", aperture: "f/3.5" },
  { eq: 107, name: "XCD 135", aperture: "f/2.8" },
];

const nearestXcd = (f: number): XcdLens =>
  XCD.reduce((best, lens) => (Math.abs(lens.eq - f) < Math.abs(best.eq - f) ? lens : best), XCD[0]);

function jobWord(f: number): string {
  if (f < 24) return "ultrawide · inside the scene";
  if (f < 40) return "wide · reportage, context";
  if (f < 60) return "normal · the honest slice";
  if (f < 110) return "short tele · portrait, isolation";
  return "tele · reach, compression";
}

// Frame geometry (SVG user units).
const FW = 340;
const FH = 210;
const INSET = 8;
const HORIZON = 128;

export function ChoosingALensWidget() {
  const [f, setF] = useState(50);

  // the slice a focal length keeps, relative to the widest framing drawn.
  const ratio = Math.min(1, WIDE_F / f);
  const sliceW = (FW - 2 * INSET) * ratio;
  const sliceH = (FH - 2 * INSET) * ratio;
  const cx = FW / 2;
  const cy = FH / 2;
  const sx = cx - sliceW / 2;
  const sy = cy - sliceH / 2;

  const mp = q3Megapixels(f);
  const q3TooWide = f < 27;
  const q3PastCrop = f > 90;
  const q3Native = f >= 27 && f <= 29;
  const lens = nearestXcd(f);

  return (
    <div className="font-sans">
      {/* the scene, with the slice this framing keeps held bright and the rest dimmed */}
      <svg
        viewBox={`0 0 ${FW} ${FH}`}
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={`The same scene from one fixed spot, framed at ${f} millimeters equivalent (${jobWord(f)}). The bright rectangle is the slice this framing keeps; a longer focal length keeps a smaller slice.`}
      >
        <clipPath id="cl-frame">
          <rect x={INSET} y={INSET} width={FW - 2 * INSET} height={FH - 2 * INSET} rx="8" />
        </clipPath>
        <g clipPath="url(#cl-frame)">
          {/* sky and ground */}
          <rect x={INSET} y={INSET} width={FW - 2 * INSET} height={HORIZON - INSET} fill="#0f1a20" />
          <rect x={INSET} y={HORIZON} width={FW - 2 * INSET} height={FH - HORIZON - INSET} fill="#0b1315" />
          {/* a low sun and its reach, so the wide frame has content at the edges */}
          <circle cx={FW * 0.5} cy={HORIZON - 30} r={22} fill="#c3ccd0" fillOpacity="0.85" />
          {/* a ridgeline across the whole width */}
          <path
            d={`M ${INSET} ${HORIZON} L ${FW * 0.2} ${HORIZON - 26} L ${FW * 0.36} ${HORIZON - 8} L ${FW * 0.5} ${HORIZON - 34} L ${FW * 0.66} ${HORIZON - 12} L ${FW * 0.82} ${HORIZON - 30} L ${FW - INSET} ${HORIZON - 6} L ${FW - INSET} ${HORIZON} Z`}
            fill="#18242b"
            stroke="#223038"
            strokeWidth="1"
          />
          {/* framing trees near the edges: only the wide slice keeps them */}
          <circle cx={INSET + 26} cy={HORIZON + 34} r={16} fill="#16212680" />
          <circle cx={FW - INSET - 26} cy={HORIZON + 40} r={20} fill="#16212680" />
          {/* a foreground subject near the centre, kept at every framing */}
          <rect x={cx - 6} y={HORIZON + 4} width={12} height={FH - HORIZON - INSET - 4} fill="#1b272d" />
          <circle cx={cx} cy={HORIZON + 4} r={9} fill="#1b272d" />

          {/* dim everything outside the kept slice (an overlay with a rectangular hole) */}
          <path
            d={`M ${INSET} ${INSET} H ${FW - INSET} V ${FH - INSET} H ${INSET} Z M ${sx} ${sy} H ${sx + sliceW} V ${sy + sliceH} H ${sx} Z`}
            fill="#0a0e0f"
            fillOpacity="0.62"
            fillRule="evenodd"
            className="transition-all duration-200 ease-out motion-reduce:transition-none"
          />
        </g>
        {/* the kept slice, outlined in teal */}
        <rect
          x={sx}
          y={sy}
          width={sliceW}
          height={sliceH}
          rx="3"
          fill="none"
          stroke="var(--accent)"
          strokeWidth="1.6"
          className="transition-all duration-200 ease-out motion-reduce:transition-none"
        />
        <rect x={INSET} y={INSET} width={FW - 2 * INSET} height={FH - 2 * INSET} rx="8" fill="none" stroke="var(--border)" />
        <text x={INSET + 8} y={INSET + 16} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          one spot &middot; the slice this framing keeps
        </text>
        <text x={FW - INSET - 8} y={INSET + 16} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
          {f}mm eq
        </text>
      </svg>

      {/* readouts */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">framing</dt>
        <dd className="text-right text-fg">{f} mm (full-frame eq.)</dd>
        <dt className="text-comment">the job</dt>
        <dd className="text-right text-accent">{jobWord(f)}</dd>
      </dl>

      {/* the two prices: the Q3 in pixels, the X2D in glass */}
      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {/* Leica Q3 */}
        <div className="rounded-md border border-border bg-surface-2 p-3">
          <div className="font-mono text-[0.7rem] uppercase tracking-wide text-comment">Leica Q3</div>
          <div className="mt-1 font-mono text-xs text-fg">
            {q3TooWide
              ? "wider than the 28mm lens"
              : q3Native
                ? "native 28mm lens"
                : q3PastCrop
                  ? "past the 90mm frameline"
                  : `28mm + crop to ${f}mm`}
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div
              className="h-full rounded-full bg-accent transition-all duration-200 ease-out motion-reduce:transition-none"
              style={{ width: q3TooWide ? "0%" : `${Math.min(100, mp)}%`, opacity: q3PastCrop ? 0.4 : 1 }}
            />
          </div>
          <div className="mt-1 font-mono text-[0.7rem] text-comment">
            {q3TooWide ? "can't reach it, step back" : `${q3PastCrop ? "~6" : mp} MP kept`}
          </div>
        </div>

        {/* Hasselblad X2D */}
        <div className="rounded-md border border-border bg-surface-2 p-3">
          <div className="font-mono text-[0.7rem] uppercase tracking-wide text-comment">Hasselblad X2D</div>
          <div className="mt-1 font-mono text-xs text-fg">
            {lens.name} <span className="text-comment">{lens.aperture}</span>
          </div>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-border">
            <div className="h-full w-full rounded-full bg-accent" />
          </div>
          <div className="mt-1 font-mono text-[0.7rem] text-comment">100 MP kept &middot; swap glass</div>
        </div>
      </div>

      {/* the one move: the framing you want */}
      <div className="mt-5">
        <label htmlFor="cl-focal" className="mb-2 block font-mono text-xs text-comment">
          the framing you want (full-frame equivalent)
        </label>
        <input
          id="cl-focal"
          type="range"
          min={MIN_F}
          max={MAX_F}
          step={1}
          value={f}
          onChange={(e) => setF(Number(e.target.value))}
          aria-label={`Target framing, currently ${f} millimeters equivalent`}
          className="w-full"
          style={{ accentColor: "var(--accent)" }}
        />
        <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-comment">
          <span>← 20mm wide</span>
          <span>120mm long →</span>
        </div>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
        {"// you never moved your feet. a longer framing is a smaller slice of the same scene. "}
        {"the Q3 buys reach with pixels, the X2D with glass, and only the X2D goes wider than 28."}
      </p>
    </div>
  );
}
