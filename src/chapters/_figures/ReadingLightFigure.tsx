// ReadingLightFigure: the signature figure for "Reading light". Inline SVG, themed
// with the CSS variables so it matches the house style and stays crisp at any width.
// The structure it encodes is the one fact about light quality that reads as magic
// until you see the geometry: whether light is HARD or SOFT is set by the apparent
// (angular) size of the source, and nothing else. A shadow cast by an extended source
// has a fully dark core (the umbra) and a soft transition at its edge (the penumbra).
// The penumbra is bounded by rays from the two opposite edges of the source grazing the
// same edge of the occluder, so its width grows in direct proportion to the source's
// apparent size. Top row: a small, distant source (the bare sun) casts a razor-thin
// penumbra, a hard edge. Bottom row: a large, near source (a window, an overcast sky)
// casts a wide penumbra, a soft edge. Same card, same wall; only the source's size
// changed. A point source would cast only an umbra, the hardest possible edge.

const SX = 70; // source x
const OX = 290; // occluder (card) x
const WX = 500; // wall x, where the shadow lands

// Project a source point (SX, sy) through a card corner (OX, ey) onto the wall at WX.
// This is the exact ray geometry, so the drawn rays and the shaded edge are truthful.
const onWall = (sy: number, ey: number) => sy + (WX - SX) * ((ey - sy) / (OX - SX));

interface Row {
  cy: number; // optical axis of this row
  a: number; // card half-height
  s: number; // source half-height (its apparent size)
  label: string;
  sub: string;
  edge: string;
}

// One geometry solve per row. A wall point is fully lit if it can see the whole source,
// umbra if it can see none, penumbra if it sees part. The four boundary rays pass through
// the card's two corners; the lower penumbra runs from umbraBottom (source fully blocked)
// to litBottom (source just clears the corner).
function solve(r: Row) {
  const cardTop = r.cy - r.a;
  const cardBottom = r.cy + r.a;
  const litTop = onWall(r.cy + r.s, cardTop);
  const umbraTop = onWall(r.cy - r.s, cardTop);
  const umbraBottom = onWall(r.cy + r.s, cardBottom);
  const litBottom = onWall(r.cy - r.s, cardBottom);
  const span = litBottom - litTop;
  return {
    cardTop,
    cardBottom,
    litTop,
    umbraTop,
    umbraBottom,
    litBottom,
    // gradient stops (0..1 down the shadow strip): transparent, opaque, opaque, transparent
    p1: (umbraTop - litTop) / span,
    p2: (umbraBottom - litTop) / span,
    penumbra: litBottom - umbraBottom, // lower penumbra width, the thing that differs
  };
}

const ROWS: Row[] = [
  { cy: 90, a: 22, s: 6, label: "small source, far off", sub: "the bare sun, a bulb", edge: "hard edge" },
  { cy: 250, a: 22, s: 34, label: "large source, up close", sub: "a window, an overcast sky", edge: "soft edge" },
];

export function ReadingLightFigure() {
  return (
    <svg
      viewBox="0 0 600 380"
      className="w-full min-w-[520px]"
      role="img"
      aria-label="Two diagrams stacked. In both, light from a source on the left passes a small card in the middle and casts the card's shadow on a wall at the right. In the top diagram the source is small and far away, and rays from its top and bottom edges through the card's corner land almost on top of each other, so the shadow on the wall has a razor-thin soft edge (a narrow penumbra): hard light. In the bottom diagram the source is large and close, so the same two rays fan far apart and the shadow's edge is spread into a wide, gradual soft band (a wide penumbra): soft light. The card and the wall are identical in both; only the size of the source changed. The label reads: hard or soft is the apparent size of the source, and nothing else."
      fill="none"
    >
      {/* the governing statement, in the code-comment motif */}
      <text x={SX - 4} y={22} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// same card, same wall. only the source changes size"}
      </text>
      <text x={SX - 4} y={40} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        hard or soft is the apparent size of the source
      </text>

      {ROWS.map((r, i) => {
        const g = solve(r);
        const gradId = `rl-shadow-${i}`;
        return (
          <g key={i}>
            <defs>
              <linearGradient id={gradId} gradientUnits="userSpaceOnUse" x1={0} y1={g.litTop} x2={0} y2={g.litBottom}>
                <stop offset="0" stopColor="#05080a" stopOpacity="0" />
                <stop offset={g.p1.toFixed(3)} stopColor="#05080a" stopOpacity="0.92" />
                <stop offset={g.p2.toFixed(3)} stopColor="#05080a" stopOpacity="0.92" />
                <stop offset="1" stopColor="#05080a" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* the two boundary rays: source top and bottom edges grazing the card's lower corner */}
            <polyline
              points={`${SX},${r.cy - r.s} ${OX},${g.cardBottom} ${WX},${g.litBottom}`}
              stroke="var(--comment)"
              strokeWidth="1"
              strokeDasharray="3 3"
              strokeOpacity="0.8"
            />
            <polyline
              points={`${SX},${r.cy + r.s} ${OX},${g.cardBottom} ${WX},${g.umbraBottom}`}
              stroke="var(--comment)"
              strokeWidth="1"
              strokeDasharray="3 3"
              strokeOpacity="0.8"
            />

            {/* the source, its height standing in for its apparent size */}
            <rect x={SX - 7} y={r.cy - r.s} width={14} height={r.s * 2} rx="4" fill="var(--accent)" fillOpacity="0.9" />
            <text x={SX} y={r.cy - r.s - 9} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg)">
              source
            </text>

            {/* the occluding card */}
            <rect x={OX - 5} y={g.cardTop} width={10} height={r.a * 2} rx="1.5" fill="var(--surface-2)" stroke="var(--border)" />
            <text x={OX} y={g.cardTop - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
              card
            </text>

            {/* the wall and the shadow it receives */}
            <line x1={WX} y1={g.litTop - 8} x2={WX} y2={g.litBottom + 8} stroke="var(--border)" strokeWidth="1.5" />
            <rect x={WX} y={g.litTop} width={16} height={g.litBottom - g.litTop} fill={`url(#${gradId})`} />

            {/* brace + label on the lower penumbra, the width that separates hard from soft */}
            <path
              d={`M ${WX + 22} ${g.umbraBottom} h 6 M ${WX + 25} ${g.umbraBottom} V ${g.litBottom} M ${WX + 22} ${g.litBottom} h 6`}
              stroke="var(--fg-muted)"
              strokeWidth="1"
            />
            <text x={WX + 33} y={(g.umbraBottom + g.litBottom) / 2 - 4} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
              penumbra
            </text>
            <text x={WX + 33} y={(g.umbraBottom + g.litBottom) / 2 + 9} fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
              {g.penumbra < 20 ? "narrow" : "wide"}
            </text>

            {/* row caption */}
            <text x={SX - 4} y={r.cy + r.s + (i === 0 ? 30 : 46)} fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--fg)">
              {r.label}
            </text>
            <text x={SX - 4} y={r.cy + r.s + (i === 0 ? 44 : 60)} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
              {`// ${r.sub} → ${r.edge}`}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
