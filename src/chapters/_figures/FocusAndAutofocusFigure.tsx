// FocusAndAutofocusFigure: the figure for "Focus and autofocus".
// Inline SVG, themed with the CSS variables so it matches the house style and stays crisp at any
// width. The structure it encodes is the chapter's thesis about HOW a camera finds focus, drawn as
// the difference between the two ways of measuring it.
//
// LEFT, contrast detection: the camera can only read one number, how much fine detail (contrast) the
// lens is projecting right now. That number rises toward a peak and falls past it, but the shape of
// the hill is hidden. So the lens must step, watch the number, and keep going until the number drops
// before it knows it has passed the top, then back up. That overshoot is the hunt.
//
// RIGHT, phase detection: the camera splits the light into two views from opposite sides of the lens.
// When the lens is not focused, the two views land apart on the sensor, and that gap encodes both the
// direction (which view is on which side) and the distance (how big the gap is). One measurement, one
// move. When focused, the two views merge and the gap is zero.

// --- Left panel: the blind climb up a contrast hill ---
const X_PEAK = 232; // lens position where contrast peaks (right of center, so the climb overshoots)
const SIGMA = 52;
const Y_BASE = 250; // plot floor (zero contrast)
const Y_TOP = 92; // plot ceiling (peak contrast)

function contrast(x: number): number {
  return Math.exp(-((x - X_PEAK) ** 2) / (2 * SIGMA ** 2));
}
function curveY(x: number): number {
  return Y_BASE - contrast(x) * (Y_BASE - Y_TOP);
}

// The lens positions the contrast system visits, in order: climb rightward, overshoot past the peak,
// then a corrective step back to settle. It cannot know 5 was too far until it measured a lower number.
const HUNT: { x: number; n: string }[] = [
  { x: 96, n: "1" },
  { x: 148, n: "2" },
  { x: 200, n: "3" },
  { x: 288, n: "4" },
  { x: 232, n: "5" },
];

function ContrastPanel() {
  // A smooth path traced along the hill for the backdrop curve.
  const pts: string[] = [];
  for (let x = 60; x <= 320; x += 4) pts.push(`${x},${curveY(x).toFixed(1)}`);
  const curve = "M " + pts.join(" L ");

  return (
    <g>
      <text x={40} y={44} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// contrast detection: climb blind, confirm by overshooting"}
      </text>

      {/* axes */}
      <line x1={56} y1={Y_BASE} x2={324} y2={Y_BASE} stroke="var(--border)" strokeWidth="1" />
      <line x1={56} y1={70} x2={56} y2={Y_BASE} stroke="var(--border)" strokeWidth="1" />
      <text x={56} y={Y_BASE + 20} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        lens position &#8594;
      </text>
      <text
        x={48}
        y={80}
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill="var(--comment)"
        textAnchor="end"
        transform="rotate(-90 48 80)"
      >
        measured contrast
      </text>

      {/* the hidden hill: the shape the camera cannot see, only sample */}
      <path d={curve} fill="none" stroke="var(--fg-muted)" strokeWidth="1.5" strokeDasharray="2 5" opacity="0.5" />

      {/* the peak the system is chasing */}
      <line x1={X_PEAK} y1={curveY(X_PEAK)} x2={X_PEAK} y2={Y_BASE} stroke="var(--accent)" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
      <circle cx={X_PEAK} cy={curveY(X_PEAK)} r="4" fill="var(--accent)" />
      <text x={X_PEAK + 8} y={curveY(X_PEAK) - 4} fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
        in focus
      </text>

      {/* the hunt: numbered samples with arrows between them */}
      {HUNT.slice(0, -1).map((p, i) => {
        const a = p;
        const b = HUNT[i + 1];
        return (
          <line
            key={`seg-${i}`}
            x1={a.x}
            y1={curveY(a.x)}
            x2={b.x}
            y2={curveY(b.x)}
            stroke="var(--fg-muted)"
            strokeWidth="1.2"
            markerEnd="url(#huntArrow)"
            opacity="0.8"
          />
        );
      })}
      {HUNT.map((p, i) => {
        const overshoot = i === 3; // sample 4 is past the peak, where contrast has dropped
        return (
          <g key={`dot-${p.n}`}>
            <circle
              cx={p.x}
              cy={curveY(p.x)}
              r="7"
              fill="var(--surface)"
              stroke={overshoot ? "var(--danger)" : "var(--fg-muted)"}
              strokeWidth="1.5"
            />
            <text
              x={p.x}
              y={curveY(p.x) + 3.5}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="10"
              fill={overshoot ? "var(--danger)" : "var(--fg)"}
            >
              {p.n}
            </text>
          </g>
        );
      })}
      <text x={288} y={curveY(288) - 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--danger)">
        overshot
      </text>
    </g>
  );
}

// --- Right panel: the phase split reads direction and distance at once ---
const X_LENS = 430;
const CY = 168;
const X_SENSOR = 648;
const X_CROSS = 690; // rays meet behind the sensor: the lens is back-focused

function raySensorY(fromY: number): number {
  const t = (X_SENSOR - X_LENS) / (X_CROSS - X_LENS);
  return fromY + t * (CY - fromY);
}

function PhasePanel() {
  const topY = 112;
  const botY = 224;
  const sTop = raySensorY(topY);
  const sBot = raySensorY(botY);

  return (
    <g>
      <text x={392} y={44} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// phase detection: read the split, move once"}
      </text>

      {/* the lens */}
      <ellipse cx={X_LENS} cy={CY} rx={13} ry={58} fill="var(--accent)" opacity="0.14" stroke="var(--accent)" strokeWidth="1.5" />
      <text x={X_LENS} y={CY + 78} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        lens
      </text>

      {/* two views from opposite edges of the lens, meeting behind the sensor */}
      <line x1={X_LENS} y1={topY} x2={X_CROSS} y2={CY} stroke="var(--fg-muted)" strokeWidth="1.3" />
      <line x1={X_LENS} y1={botY} x2={X_CROSS} y2={CY} stroke="var(--fg-muted)" strokeWidth="1.3" />
      <circle cx={X_CROSS} cy={CY} r="2.5" fill="var(--fg-muted)" opacity="0.6" />
      <text x={X_CROSS - 2} y={CY - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
        would meet here
      </text>

      {/* the sensor plane */}
      <line x1={X_SENSOR} y1={98} x2={X_SENSOR} y2={238} stroke="var(--fg)" strokeWidth="2" />
      <text x={X_SENSOR} y={252} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        sensor
      </text>

      {/* where each view actually lands: two separated dots */}
      <circle cx={X_SENSOR} cy={sTop} r="4.5" fill="var(--accent)" />
      <circle cx={X_SENSOR} cy={sBot} r="4.5" fill="var(--accent)" />

      {/* the gap: its size is the distance, which dot is on top is the direction */}
      <line x1={X_SENSOR + 16} y1={sTop} x2={X_SENSOR + 16} y2={sBot} stroke="var(--accent)" strokeWidth="1" />
      <line x1={X_SENSOR + 12} y1={sTop} x2={X_SENSOR + 20} y2={sTop} stroke="var(--accent)" strokeWidth="1" />
      <line x1={X_SENSOR + 12} y1={sBot} x2={X_SENSOR + 20} y2={sBot} stroke="var(--accent)" strokeWidth="1" />
      <text x={X_SENSOR + 26} y={(sTop + sBot) / 2 + 3.5} fontFamily="var(--font-mono)" fontSize="11" fontWeight="bold" fill="var(--accent)">
        split
      </text>

      <text x={392} y={274} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        gap size = how far off &#183; which dot leads = which way
      </text>
    </g>
  );
}

export function FocusAndAutofocusFigure() {
  return (
    <svg
      viewBox="0 0 760 300"
      className="w-full min-w-[700px]"
      role="img"
      aria-label="Two panels comparing how autofocus finds focus. Left, contrast detection: the camera samples how much fine detail the lens projects, drawn as a hidden hill of contrast versus lens position. It steps rightward up the hill, position 1 through 3 rising, position 4 overshooting past the peak where contrast has dropped, then steps back to position 5 at the peak. It cannot know it passed the top until the reading falls, which is the hunt. Right, phase detection: light is split into two views from opposite edges of the lens. When the lens is back-focused the two views would meet behind the sensor, so they land as two separated dots on the sensor. The size of that split gives how far off focus is and which dot leads gives the direction, so the camera moves the lens once, correctly."
      fill="none"
    >
      <defs>
        <marker id="huntArrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--fg-muted)" />
        </marker>
      </defs>

      {/* divider between the two methods */}
      <line x1={360} y1={60} x2={360} y2={264} stroke="var(--border)" strokeWidth="1" />

      <ContrastPanel />
      <PhasePanel />
    </svg>
  );
}
