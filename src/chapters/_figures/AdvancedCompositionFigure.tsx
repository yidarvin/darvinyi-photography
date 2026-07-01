// AdvancedCompositionFigure: the signature figure for "Working the frame".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. It encodes the chapter's one advance over the fundamentals:
// a composed frame is a PATH, not a point. Chapter 13 handed the eye to a single
// subject; here three elements are set as a triangle (the geometry) and a smooth
// closed loop threads them (gestalt continuation, the eye's preference for an
// unbroken line). The eye enters at a corner, tours all three, and because the path
// closes it circulates rather than being walked out an edge. That is what it means to
// work the whole frame: give the eye a route, and make the route return.

// The three subjects, set as a stable base-down triangle with the accent at the apex.
const S1 = { x: 300, y: 120, r: 16 }; // apex: the primary subject
const S2 = { x: 150, y: 290, r: 11 }; // support
const S3 = { x: 455, y: 285, r: 11 }; // support
const ENTRY = { x: 58, y: 320 }; // where the eye comes in, at a corner

// A small arrowhead (chevron) at (x,y) pointing along (dx,dy).
function arrow(x: number, y: number, dx: number, dy: number, size = 9): string {
  const L = Math.hypot(dx, dy) || 1;
  const ux = dx / L;
  const uy = dy / L;
  const bx = x - ux * size;
  const by = y - uy * size;
  const px = -uy * size * 0.6;
  const py = ux * size * 0.6;
  return `M ${bx + px} ${by + py} L ${x} ${y} L ${bx - px} ${by - py}`;
}

export function AdvancedCompositionFigure() {
  return (
    <svg
      viewBox="0 0 560 372"
      className="w-full min-w-[500px]"
      role="img"
      aria-label="A photo frame holding three subjects arranged as a base-down triangle, a large accented one at the top apex and two smaller ones at the lower corners. A faint dotted triangle links them, marking the geometry. Over it, a bright continuous loop threads all three and closes on itself, with arrowheads showing the eye's direction of travel. A short line brings the eye in from the lower-left corner to the first subject. Because the path is a closed loop it circulates the eye among the three subjects and returns it rather than delivering it to an edge and out of the frame. The label reads: a composed frame is a path, not a point. Geometry gives the eye a route, gestalt continuation keeps it moving, and a closed loop keeps it inside the frame."
      fill="none"
    >
      {/* the governing statement, in the code-comment motif */}
      <text x={30} y={20} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// a composed frame is a path, not a point"}
      </text>
      <text x={30} y={38} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        route the eye, then make the route return
      </text>

      {/* legend: eye path vs geometry */}
      <g fontFamily="var(--font-mono)" fontSize="9">
        <line x1={30} y1={52} x2={52} y2={52} stroke="var(--accent)" strokeWidth="2" />
        <text x={57} y={55} fill="var(--comment)">eye path</text>
        <line x1={128} y1={52} x2={150} y2={52} stroke="var(--fg-muted)" strokeWidth="1" strokeDasharray="2 4" />
        <text x={155} y={55} fill="var(--comment)">geometry</text>
      </g>

      {/* THE FRAME */}
      <rect x={30} y={70} width={500} height={270} rx={3} fill="var(--surface-2)" stroke="var(--border)" />

      {/* the geometric skeleton: the triangle, drawn faint */}
      <path
        d={`M ${S1.x} ${S1.y} L ${S2.x} ${S2.y} L ${S3.x} ${S3.y} Z`}
        stroke="var(--fg-muted)"
        strokeOpacity={0.45}
        strokeWidth={1}
        strokeDasharray="2 5"
      />

      {/* the eye's entry, from the corner up to the first subject */}
      <line
        x1={ENTRY.x}
        y1={ENTRY.y}
        x2={S2.x - 14}
        y2={S2.y + 5}
        stroke="var(--accent)"
        strokeWidth={2}
        strokeDasharray="5 5"
        opacity={0.8}
      />
      <path d={arrow(S2.x - 14, S2.y + 5, S2.x - ENTRY.x, S2.y - ENTRY.y)} stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />
      <text x={ENTRY.x - 2} y={ENTRY.y + 16} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        the eye enters
      </text>

      {/* THE EYE PATH: a smooth closed loop through the three subjects */}
      <path
        d={`M ${S2.x} ${S2.y} Q 182 190 ${S1.x} ${S1.y} Q 419 186 ${S3.x} ${S3.y} Q 303 332 ${S2.x} ${S2.y} Z`}
        stroke="var(--accent)"
        strokeWidth={2.25}
        opacity={0.95}
      />
      {/* direction arrows along the loop: S2 -> S1 -> S3 -> S2 */}
      <path d={arrow(182, 190, 150, -170)} stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />
      <path d={arrow(419, 186, 155, 165)} stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />
      <path d={arrow(303, 332, -305, 5)} stroke="var(--accent)" strokeWidth={2} strokeLinecap="round" />

      {/* the three subjects. an opaque underlay disc first, so the loop passes
          behind each node rather than bleeding through the translucent fill */}
      <circle cx={S2.x} cy={S2.y} r={S2.r} fill="var(--surface-2)" />
      <circle cx={S3.x} cy={S3.y} r={S3.r} fill="var(--surface-2)" />
      <circle cx={S1.x} cy={S1.y} r={S1.r} fill="var(--accent)" />
      <circle cx={S2.x} cy={S2.y} r={S2.r} fill="var(--fg-muted)" fillOpacity={0.5} stroke="var(--fg-muted)" strokeOpacity={0.6} />
      <circle cx={S3.x} cy={S3.y} r={S3.r} fill="var(--fg-muted)" fillOpacity={0.5} stroke="var(--fg-muted)" strokeOpacity={0.6} />

      {/* labels */}
      <text x={S1.x} y={S1.y - S1.r - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--accent)">
        subject
      </text>
      <text x={S2.x - 4} y={S2.y + S2.r + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
        support
      </text>
      <text x={S3.x + 4} y={S3.y + S3.r + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
        support
      </text>

      {/* the payoff, in the comment motif, riding the closing arm of the loop */}
      <text x={300} y={352} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {"// the loop closes, so the eye circulates instead of leaving"}
      </text>
    </svg>
  );
}
