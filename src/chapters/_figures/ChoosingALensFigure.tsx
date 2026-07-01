// ChoosingALensFigure: the figure for "Choosing a lens".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. The structure it encodes is the whole chapter: the two cameras
// reach the SAME set of framings by opposite means. One full-frame-equivalent focal
// axis runs along the bottom. The Q3 sits at a single point, 28mm, and reaches the
// longer framings by cropping its one lens, so its resolution bars drain from 60MP at
// 28 down to 6MP at the 90mm frameline. The X2D covers the axis with separate pieces of
// glass, each a full 100MP, and it reaches wider than the Q3 can (the 25V at 20mm-eq).
// Crop to spend pixels, or swap glass to spend weight: same framings, two prices.

// Full-frame-equivalent focal length -> x, linear in mm across the plotted range.
const F0 = 18;
const F1 = 100;
const X0 = 70;
const X1 = 566;
const xOf = (f: number) => X0 + ((f - F0) / (F1 - F0)) * (X1 - X0);

// resolution bar height for a given megapixel count (100MP = the full X2D height).
const barH = (mp: number) => 2 + (mp / 100) * 34;

interface Stop {
  f: number; // full-frame-equivalent framing, in mm
  mp: number; // resolution delivered at that framing
  label: string; // what delivers it
}

// The Q3: one 28mm lens (native 60MP) plus its in-camera crop framelines. The crop MP
// follow 60 x (28/f)^2, which reproduces Leica's published 39/19/8/6 for 35/50/75/90.
const Q3: Stop[] = [
  { f: 28, mp: 60, label: "28mm" },
  { f: 35, mp: 39, label: "35" },
  { f: 50, mp: 19, label: "50" },
  { f: 75, mp: 8, label: "75" },
  { f: 90, mp: 6, label: "90" },
];

// The X2D: separate XCD glass, each keeping the full 100MP. The V-series primes plus the
// 120 macro span from wider than the Q3 reaches (25V, 20mm-eq) out to 95mm-eq.
const X2D: Stop[] = [
  { f: 20, mp: 100, label: "25V" },
  { f: 30, mp: 100, label: "38V" },
  { f: 43, mp: 100, label: "55V" },
  { f: 71, mp: 100, label: "90V" },
  { f: 95, mp: 100, label: "120" },
];

const AXIS_TICKS = [20, 28, 35, 50, 71, 90];

const YQ = 128; // Q3 baseline
const YX = 222; // X2D baseline

export function ChoosingALensFigure() {
  return (
    <svg
      viewBox="0 0 660 300"
      className="w-full min-w-[600px]"
      role="img"
      aria-label="One horizontal axis of full-frame-equivalent focal length, from about 20mm on the left to 95mm on the right, longer and tighter to the right. The Leica Q3 row sits at a single point, 28mm, with dashed markers reaching right to its crop framelines at 35, 50, 75 and 90mm; a small resolution bar above each marker shrinks from 60 megapixels at 28mm down to 6 megapixels at 90mm, showing that the Q3 reaches longer framings by cropping away pixels. A note marks that the Q3 cannot go wider than 28mm. The Hasselblad X2D row shows separate lens markers spread along the axis, the XCD 25V at 20mm-equivalent, the 38V at 30, the 55V at 43, the 90V at 71 and the 120 macro at 95, each with a full-height 100-megapixel bar, showing that it covers the same range by swapping glass while keeping full resolution and reaching wider than the Q3."
      fill="none"
    >
      {/* the governing statement, in the code-comment motif */}
      <text x={X0} y={20} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// same framings, reached two ways"}
      </text>
      <text x={X0} y={40} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        the Q3 crops one lens; the X2D swaps glass
      </text>

      {/* ---- Leica Q3 row: one lens, cropped for reach ---- */}
      <text x={X0} y={64} fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg-muted)">
        Leica Q3 &middot; one 28mm lens, cropped for reach
      </text>

      {/* the crop path: a dashed line from the native 28 out to the 90mm frameline */}
      <line x1={xOf(28)} y1={YQ} x2={xOf(90)} y2={YQ} stroke="var(--border)" strokeWidth="1.3" strokeDasharray="4 4" />

      {/* the wall at 28: the Q3 cannot see wider than its lens */}
      <line x1={xOf(28)} y1={YQ - 30} x2={xOf(28)} y2={YQ + 10} stroke="var(--comment)" strokeWidth="1" strokeDasharray="2 3" strokeOpacity="0.7" />
      <text x={xOf(28) - 8} y={YQ + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        no wider &rarr;
      </text>

      {Q3.map((s) => {
        const x = xOf(s.f);
        const native = s.f === 28;
        return (
          <g key={`q-${s.f}`}>
            {/* resolution bar: full at 28, draining as the crop tightens */}
            <rect
              x={x - 3.5}
              y={YQ - barH(s.mp)}
              width={7}
              height={barH(s.mp)}
              fill={native ? "var(--accent)" : "var(--fg-muted)"}
              fillOpacity={native ? 0.9 : 0.55}
            />
            <text x={x} y={YQ - barH(s.mp) - 4} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill={native ? "var(--accent)" : "var(--fg-muted)"}>
              {s.mp}
            </text>
            {/* marker on the baseline */}
            <circle cx={x} cy={YQ} r={native ? 4.5 : 3} fill={native ? "var(--accent)" : "var(--bg)"} stroke="var(--accent)" strokeWidth="1.4" strokeOpacity={native ? 1 : 0.7} />
          </g>
        );
      })}
      <text x={xOf(90) + 8} y={YQ + 3} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        MP
      </text>

      {/* ---- Hasselblad X2D row: swap glass, keep 100MP ---- */}
      <text x={X0} y={158} fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg-muted)">
        Hasselblad X2D &middot; pick a lens, keep 100 MP
      </text>

      {X2D.map((s) => {
        const x = xOf(s.f);
        return (
          <g key={`x-${s.f}`}>
            <rect x={x - 3.5} y={YX - barH(s.mp)} width={7} height={barH(s.mp)} fill="var(--accent)" fillOpacity={0.9} />
            {/* lens glyph: a filled node, each a separate piece of glass */}
            <rect x={x - 4.5} y={YX - 4.5} width={9} height={9} rx={2} fill="var(--accent)" />
            <text x={x} y={YX + 18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg)">
              {s.label}
            </text>
          </g>
        );
      })}
      <text x={xOf(95) + 8} y={YX - barH(100) + 8} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        100
      </text>

      {/* ---- shared focal-length axis ---- */}
      <line x1={xOf(F0)} y1={262} x2={xOf(F1) + 4} y2={262} stroke="var(--border)" />
      {AXIS_TICKS.map((f) => (
        <g key={`t-${f}`}>
          <line x1={xOf(f)} y1={259} x2={xOf(f)} y2={265} stroke="var(--fg-muted)" strokeOpacity="0.6" />
          <text x={xOf(f)} y={278} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg)">
            {f}
          </text>
        </g>
      ))}
      <text x={X0} y={296} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {"// full-frame-equivalent framing  →  longer, tighter slice"}
      </text>
    </svg>
  );
}
