// CompositionFundamentalsFigure: the signature figure for "Where the eye lands".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. The structure it encodes is the one principle every named
// device (thirds, lines, framing, negative space) quietly serves: a frame reads as
// resolved when its visual weights balance around the center. Every element has a
// visual weight set by size, contrast, saturation, and isolation. Weight acts like a
// mass on a lever: its pull on the balance is the weight times its distance from the
// center. So a large, quiet mass sitting near the middle is balanced by a small, loud
// accent placed far out toward the edge. That is why a subject on a third, with open
// space on the other side, feels both dynamic and settled: the empty space carries the
// far arm of the lever. Top: the two elements inside the frame. Bottom: the same two
// as masses on a beam that hangs level, because weight x arm matches on both sides.

const CX = 300; // frame center, and the balance axis

// Two elements. weight ~ area (r^2); the lever arm is |cx - CX|. The values are chosen
// so weight x arm matches on the two sides, which is why the beam below hangs level:
// 30^2 x 40 = 36000 and 17^2 x 125 = 36125, equal to within a fraction of a percent.
const BIG = { cx: 260, cy: 196, r: 30, label: "big · quiet · near center" };
const SMALL = { cx: 425, cy: 118, r: 17, label: "small · loud · far out" };

const arm = (cx: number) => Math.abs(cx - CX);
const BEAM_Y = 312;

export function CompositionFundamentalsFigure() {
  return (
    <svg
      viewBox="0 0 600 372"
      className="w-full min-w-[520px]"
      role="img"
      aria-label="Top: a photo frame holding two shapes, a large dim disc sitting just left of center and a small bright disc placed far out toward the top-right corner. Bottom: the same two shapes hung as weights on a balance beam pivoting on a fulcrum at the frame's center. The large dim weight sits close to the fulcrum and the small bright weight sits far from it, and the beam hangs perfectly level, because a visual weight's pull equals its size times its distance from the center. The label reads: a frame reads as resolved when its weights balance around the center. A large quiet mass near the middle balances a small loud accent out at the edge, which is why a subject on a third with open space opposite feels both alive and settled."
      fill="none"
    >
      {/* the governing statement, in the code-comment motif */}
      <text x={38} y={22} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// visual weight = size + contrast + isolation"}
      </text>
      <text x={38} y={40} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        a frame balances when its weights balance
      </text>

      {/* THE FRAME, holding the two elements */}
      <rect x={150} y={56} width={300} height={200} rx={3} fill="var(--surface-2)" stroke="var(--border)" />
      {/* the balance axis: the frame's vertical center */}
      <line x1={CX} y1={56} x2={CX} y2={256} stroke="var(--border)" strokeWidth="1" strokeDasharray="2 5" />
      <text x={CX} y={70} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        center
      </text>

      {/* large, quiet mass near the center */}
      <circle cx={BIG.cx} cy={BIG.cy} r={BIG.r} fill="var(--fg-muted)" fillOpacity="0.32" stroke="var(--fg-muted)" strokeOpacity="0.5" />
      {/* small, loud accent far out toward the corner */}
      <circle cx={SMALL.cx} cy={SMALL.cy} r={SMALL.r} fill="var(--accent)" />

      {/* label the two elements */}
      <text x={BIG.cx} y={BIG.cy + BIG.r + 14} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
        {BIG.label}
      </text>
      <text x={SMALL.cx} y={SMALL.cy - SMALL.r - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
        {SMALL.label}
      </text>

      {/* drop-lines from each element down onto the beam, mapping frame -> lever */}
      <line x1={BIG.cx} y1={BIG.cy + BIG.r} x2={BIG.cx} y2={BEAM_Y - 6} stroke="var(--border)" strokeDasharray="3 4" />
      <line x1={SMALL.cx} y1={SMALL.cy + SMALL.r} x2={SMALL.cx} y2={BEAM_Y - 6} stroke="var(--border)" strokeDasharray="3 4" />

      {/* THE BEAM, hanging level because weight x arm matches on both sides */}
      <line x1={BIG.cx - 22} y1={BEAM_Y} x2={SMALL.cx + 22} y2={BEAM_Y} stroke="var(--fg-muted)" strokeWidth="2" />
      {/* fulcrum at the center */}
      <path d={`M ${CX} ${BEAM_Y + 2} L ${CX - 10} ${BEAM_Y + 20} L ${CX + 10} ${BEAM_Y + 20} Z`} fill="var(--surface-2)" stroke="var(--fg-muted)" />

      {/* the two masses sitting on the beam, sizes matching the frame above */}
      <circle cx={BIG.cx} cy={BEAM_Y - BIG.r * 0.5 - 2} r={BIG.r * 0.5} fill="var(--fg-muted)" fillOpacity="0.4" stroke="var(--fg-muted)" strokeOpacity="0.5" />
      <circle cx={SMALL.cx} cy={BEAM_Y - SMALL.r * 0.7 - 2} r={SMALL.r * 0.7} fill="var(--accent)" />

      {/* the lever arms, drawn as measured spans from the center to each mass */}
      <g fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        <line x1={CX} y1={BEAM_Y + 26} x2={BIG.cx} y2={BEAM_Y + 26} stroke="var(--comment)" strokeWidth="1" />
        <line x1={CX} y1={BEAM_Y + 26} x2={SMALL.cx} y2={BEAM_Y + 26} stroke="var(--comment)" strokeWidth="1" />
        <line x1={CX} y1={BEAM_Y + 22} x2={CX} y2={BEAM_Y + 30} stroke="var(--comment)" strokeWidth="1" />
        <text x={(CX + BIG.cx) / 2} y={BEAM_Y + 40} textAnchor="middle">short arm</text>
        <text x={(CX + SMALL.cx) / 2} y={BEAM_Y + 40} textAnchor="middle">long arm</text>
      </g>

      {/* the payoff line */}
      <text x={38} y={BEAM_Y + 2} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {`// ${BIG.r * BIG.r} × ${arm(BIG.cx)}  ≈  ${SMALL.r * SMALL.r} × ${arm(SMALL.cx)}`}
      </text>
      <text x={38} y={BEAM_Y + 15} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {"// weight × arm, both sides"}
      </text>
    </svg>
  );
}
