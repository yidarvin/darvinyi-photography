// RollingShutterAndReadoutFigure: the figure for "Rolling shutter and readout speed".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. The structure it encodes is the chapter's thesis: skew is a
// pure shear, and the amount of shear is set by the readout time alone. The same
// upright railing, moving at the same speed and shot at the same shutter speed, is
// captured under three readout regimes. Each sensor row is read a little later than
// the one above it, so the object's horizontal position has drifted further by the
// time the bottom row is read: a vertical bar tilts into a straight slanted bar, and
// the tilt from top to bottom equals subject-speed times readout time. Zero readout
// (a leaf or global shutter) draws the bars upright; a stacked sensor leans them a
// little; a slow non-stacked sensor (both cameras in this book) leans them a lot.

interface Regime {
  x: number;
  title: string;
  readout: string;
  shear: number; // horizontal drift, top row to bottom row, in user units
  leanLabel: string;
  leanColor: string;
}

const PW = 200; // panel width
const PH = 196; // panel height
const PY = 70; // panel top
const GAP = 18;

// Not to scale across regimes: a true 0 : 4 : 130 ms ratio would make the stacked
// lean invisible and the slow lean run off the panel. The point the figure encodes is
// ordinal and linear-in-row, and the readout times are labeled so the widget can carry
// the exact proportions.
const REGIMES: Regime[] = [
  {
    x: 28,
    title: "leaf · global",
    readout: "readout 0 ms",
    shear: 0,
    leanLabel: "no lean",
    leanColor: "var(--accent)",
  },
  {
    x: 28 + PW + GAP,
    title: "stacked sensor",
    readout: "readout ≈ 4 ms",
    shear: 12,
    leanLabel: "slight lean",
    leanColor: "var(--fg)",
  },
  {
    x: 28 + (PW + GAP) * 2,
    title: "non-stacked (Q3, X2D II)",
    readout: "readout ≈ 100 to 165 ms",
    shear: 58,
    leanLabel: "heavy lean",
    leanColor: "var(--danger)",
  },
];

// Interior plot geometry, shared by every panel.
const PAD_L = 20;
const PAD_T = 42;
const PAD_B = 30;
const PAD_R = 20;
const BARS = [0.24, 0.52, 0.8]; // three railing posts, as fractions across the plot

function Panel({ r }: { r: Regime }) {
  const ix = r.x + PAD_L;
  const iy = PY + PAD_T;
  const iw = PW - PAD_L - PAD_R;
  const ih = PH - PAD_T - PAD_B;
  const top = iy;
  const bottom = iy + ih;
  const barW = 9;

  return (
    <g>
      {/* panel frame */}
      <rect x={r.x} y={PY} width={PW} height={PH} rx="8" fill="var(--surface-2)" stroke="var(--border)" />

      {/* titles */}
      <text x={r.x + 12} y={PY + 18} fontFamily="var(--font-mono)" fontSize="11.5" fill="var(--fg)">
        {r.title}
      </text>
      <text x={r.x + 12} y={PY + 32} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {r.readout}
      </text>

      {/* the sensor frame: rows read top to bottom, so lower rows are captured later */}
      <line x1={ix} y1={top} x2={ix} y2={bottom} stroke="var(--border)" strokeWidth="1" />
      {r.shear > 0 && (
        <>
          <text
            x={r.x + 12}
            y={top + ih / 2}
            fontFamily="var(--font-mono)"
            fontSize="7.5"
            fill="var(--fg-muted)"
            textAnchor="middle"
            transform={`rotate(-90 ${r.x + 12} ${top + ih / 2})`}
          >
            read later ↓
          </text>
        </>
      )}

      {BARS.map((frac, i) => {
        const xTop = ix + frac * iw;
        const xBot = xTop + r.shear;
        // The upright "true" object, faint, only where the capture actually leans.
        return (
          <g key={i}>
            {r.shear > 0 && i === 1 && (
              <line
                x1={xTop}
                y1={top}
                x2={xTop}
                y2={bottom}
                stroke="var(--fg-muted)"
                strokeWidth="1"
                strokeDasharray="2 3"
              />
            )}
            {/* the captured post: a parallelogram leaning right, since the bottom row
                is read later and the post has moved on by then */}
            <polygon
              points={`${xTop},${top} ${xTop + barW},${top} ${xBot + barW},${bottom} ${xBot},${bottom}`}
              fill="var(--accent)"
              fillOpacity="0.24"
              stroke="var(--accent)"
              strokeOpacity="0.5"
              strokeWidth="1"
            />
          </g>
        );
      })}

      {/* motion arrow: the whole railing is sliding right at one speed */}
      <line
        x1={ix + iw * 0.2}
        y1={bottom + 14}
        x2={ix + iw * 0.8}
        y2={bottom + 14}
        stroke="var(--fg-muted)"
        strokeWidth="1"
        markerEnd="url(#rs-arrow)"
      />
      <text x={ix} y={bottom + 26} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        subject →
      </text>

      {/* the verdict for this readout regime */}
      <text x={r.x + PW - 12} y={PY + PH - 8} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill={r.leanColor}>
        {r.leanLabel}
      </text>
    </g>
  );
}

export function RollingShutterAndReadoutFigure() {
  return (
    <svg
      viewBox="0 0 682 300"
      className="w-full min-w-[660px]"
      role="img"
      aria-label="The same upright railing, moving at the same speed and shot at the same shutter speed, captured under three sensor readout regimes. With a leaf or global shutter the whole frame is read at once, so the posts stay vertical. With a stacked sensor the readout takes a few milliseconds and the posts lean a little. With a slow non-stacked sensor, the kind in both cameras in this book, the readout takes 100 to 165 milliseconds and the posts lean heavily, because the bottom of the frame is recorded long after the top and the railing has slid on by then. The lean is a straight shear whose size equals the subject's speed times the readout time."
      fill="none"
    >
      <defs>
        <marker id="rs-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--fg-muted)" />
        </marker>
      </defs>

      {/* the governing statement, in the code-comment motif */}
      <text x={28} y={26} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// same speed, same shutter speed, only the readout time changes"}
      </text>
      <text x={28} y={48} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        skew = subject speed × readout time
      </text>

      {REGIMES.map((r) => (
        <Panel key={r.title} r={r} />
      ))}
    </svg>
  );
}
