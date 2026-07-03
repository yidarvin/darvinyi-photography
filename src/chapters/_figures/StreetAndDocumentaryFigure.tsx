// StreetAndDocumentaryFigure: the signature figure for "Street and documentary".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. Laid out as a side-elevation of the street so the whole zone
// fits a phone (it scrolls rather than shrinks).
//
// The structural claim of the chapter: on the street you cannot refocus in the tenth
// of a second a moment lasts, so you refocus ONCE, in advance. Prefocus a 28mm lens
// at f/8 to the hyperfocal distance (about 3.3 m) and a single band of sharpness opens
// from roughly 1.6 m to infinity. Anyone who steps into that band is already in focus.
// The figure draws that band along a receding street: a soft figure too close in
// front of the near limit, two sharp figures standing anywhere inside it, and the one
// variable the zone does not decide for you, the moment, left blinking at the top.

// distance markers along the receding ground line (schematic, not to scale)
const GROUND_Y = 236;
const CAM_X = 42;
const NEAR_X = 196; // near limit of the sharp band, ~1.6 m
const FOCUS_X = 320; // hyperfocal distance the lens is set to, ~3.3 m
const FAR_X = 626; // toward infinity

interface Tick {
  x: number;
  label: string;
}
const TICKS: Tick[] = [
  { x: 132, label: "1 m" },
  { x: NEAR_X, label: "1.6 m" },
  { x: FOCUS_X, label: "3.3 m" },
  { x: 496, label: "10 m" },
  { x: FAR_X, label: "∞" },
];

// a small standing figure on the ground line at x, drawn sharp or soft
function Person({ x, soft }: { x: number; soft?: boolean }) {
  const col = soft ? "var(--fg-muted)" : "var(--accent)";
  const head = GROUND_Y - 34;
  return (
    <g
      stroke={col}
      strokeWidth={soft ? 3.2 : 2}
      strokeLinecap="round"
      fill="none"
      opacity={soft ? 0.5 : 1}
      filter={soft ? "url(#sd-soft)" : undefined}
    >
      <circle cx={x} cy={head} r={5} fill={col} stroke="none" />
      <line x1={x} y1={head + 6} x2={x} y2={GROUND_Y - 12} />
      <line x1={x} y1={GROUND_Y - 22} x2={x - 7} y2={GROUND_Y - 15} />
      <line x1={x} y1={GROUND_Y - 22} x2={x + 7} y2={GROUND_Y - 15} />
      <line x1={x} y1={GROUND_Y - 12} x2={x - 6} y2={GROUND_Y} />
      <line x1={x} y1={GROUND_Y - 12} x2={x + 6} y2={GROUND_Y} />
    </g>
  );
}

export function StreetAndDocumentaryFigure() {
  return (
    <svg
      viewBox="0 0 660 320"
      className="w-full min-w-[560px]"
      role="img"
      aria-label="A side view of a street receding from a camera on the left toward infinity on the right, marked at one, 1.6, 3.3, ten metres and infinity. A shaded teal band of sharpness runs from a near limit at about 1.6 metres all the way to infinity. The lens is set once to the hyperfocal distance of about 3.3 metres, marked by a bright vertical line. Two figures standing inside the band, at roughly two and eight metres, are drawn crisp and labelled sharp; a third figure standing too close, in front of the near limit at about one metre, is drawn blurred and labelled soft. Above the scene a small marker labelled the moment blinks, the one thing the zone does not decide for you. The caption reads: 28 millimetres at f/8, focus set to 3.3 metres, sharp from 1.6 metres to infinity. Prefocus once, then only the moment is left to catch."
      fill="none"
    >
      <defs>
        <filter id="sd-soft" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <linearGradient id="sd-band" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.05" />
          <stop offset="0.12" stopColor="var(--accent)" stopOpacity="0.16" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.16" />
        </linearGradient>
      </defs>

      {/* the governing statement, in the code-comment motif */}
      <text x={20} y={22} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// you cannot refocus in the tenth of a second a moment lasts"}
      </text>
      <text x={20} y={40} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        so refocus once, in advance, and let the zone hold the street
      </text>

      {/* the sharp band: near limit to infinity */}
      <rect x={NEAR_X} y={150} width={FAR_X - NEAR_X} height={GROUND_Y - 150} fill="url(#sd-band)" />
      <text
        x={(NEAR_X + FAR_X) / 2 + 20}
        y={168}
        textAnchor="middle"
        fontFamily="var(--font-mono)"
        fontSize="10.5"
        fill="var(--accent)"
      >
        acceptably sharp: no need to refocus
      </text>

      {/* too-close zone, in front of the near limit */}
      <text x={(CAM_X + NEAR_X) / 2 + 8} y={168} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        too close
      </text>

      {/* the ground line and its distance ticks */}
      <line x1={CAM_X} y1={GROUND_Y} x2={FAR_X + 6} y2={GROUND_Y} stroke="var(--border)" strokeWidth={1.25} />
      {TICKS.map((t) => (
        <g key={t.label}>
          <line x1={t.x} y1={GROUND_Y - 4} x2={t.x} y2={GROUND_Y + 4} stroke="var(--fg-muted)" strokeWidth={1} />
          <text x={t.x} y={GROUND_Y + 18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
            {t.label}
          </text>
        </g>
      ))}

      {/* the camera at the left */}
      <g>
        <rect x={CAM_X - 20} y={GROUND_Y - 30} width={30} height={20} rx={3} fill="var(--surface-2)" stroke="var(--fg-muted)" />
        <circle cx={CAM_X - 5} cy={GROUND_Y - 20} r={6} fill="none" stroke="var(--fg-muted)" strokeWidth={1.4} />
        <text x={CAM_X - 5} y={GROUND_Y + 18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          you
        </text>
      </g>

      {/* near-limit boundary */}
      <line x1={NEAR_X} y1={132} x2={NEAR_X} y2={GROUND_Y} stroke="var(--accent)" strokeWidth={1.3} strokeDasharray="4 4" />
      <text x={NEAR_X} y={126} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--accent)">
        near limit
      </text>

      {/* the hyperfocal focus plane the lens is set to */}
      <line x1={FOCUS_X} y1={118} x2={FOCUS_X} y2={GROUND_Y} stroke="var(--accent)" strokeWidth={2} />
      <text x={FOCUS_X} y={112} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--accent)">
        focus set here
      </text>
      <text x={FOCUS_X} y={100} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        hyperfocal
      </text>

      {/* infinity arrow at the far right */}
      <path d={`M ${FAR_X - 12} ${GROUND_Y - 40} L ${FAR_X + 4} ${GROUND_Y - 40}`} stroke="var(--fg-muted)" strokeWidth={1.2} />
      <path d={`M ${FAR_X - 2} ${GROUND_Y - 44} L ${FAR_X + 4} ${GROUND_Y - 40} L ${FAR_X - 2} ${GROUND_Y - 36}`} stroke="var(--fg-muted)" strokeWidth={1.2} />

      {/* the people: one too close and soft, two inside the band and sharp */}
      <Person x={116} soft />
      <Person x={252} />
      <Person x={452} />
      <text x={116} y={GROUND_Y - 44} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
        soft
      </text>
      <text x={252} y={GROUND_Y - 46} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
        sharp
      </text>
      <text x={452} y={GROUND_Y - 46} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
        sharp
      </text>

      {/* the one thing the zone does not decide: the moment */}
      <g>
        <circle cx={352} cy={62} r={4} fill="var(--danger)" />
        <text x={364} y={58} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg)">
          the moment
        </text>
        <text x={364} y={72} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
          the zone will not decide this for you
        </text>
      </g>

      {/* the payoff line, in the comment motif */}
      <text x={20} y={290} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// 28 mm · f/8 · focus 3.3 m  →  sharp ≈ 1.6 m to ∞"}
      </text>
      <text x={20} y={306} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// stop down further for a nearer limit: f/11 → ≈ 1.2 m, f/5.6 → ≈ 2.35 m (both to ∞)"}
      </text>
    </svg>
  );
}
