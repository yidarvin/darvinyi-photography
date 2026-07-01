// BookMap --- the preface figure. Inline SVG so it themes with the CSS variables
// and stays crisp at any width. It draws the arc of the book: four parts, read in
// order, from the camera through the frame and the file to working on location.
// Structure, not decoration: the order is the reading order, and the whole book is
// visible at a glance.
const PARTS = [
  { tag: "PART I", title: "The camera", sub: "exposure . shutters" },
  { tag: "PART II", title: "The frame", sub: "light . composition" },
  { tag: "PART III", title: "The file", sub: "raw . tone . color" },
  { tag: "PART IV", title: "In practice", sub: "portrait . street" },
];

export function BookMap() {
  const w = 150;
  const xs = [16, 196, 376, 556];
  const y = 56;
  const h = 104;
  const cy = y + h / 2;
  return (
    <svg
      viewBox="0 0 720 200"
      className="w-full"
      role="img"
      aria-label="The arc of the book in four parts: the camera, the frame, the file, and working in practice."
      fill="none"
    >
      <defs>
        <marker
          id="bookmap-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="var(--comment)" />
        </marker>
      </defs>

      {PARTS.map((p, i) => {
        const x = xs[i];
        const cx = x + w / 2;
        return (
          <g key={p.tag}>
            <rect x={x} y={y} width={w} height={h} rx="8" fill="var(--surface-2)" stroke="var(--border)" />
            <text x={cx} y={y + 26} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent-dim)" letterSpacing="1">
              {p.tag}
            </text>
            <text x={cx} y={y + 54} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="14" fill="var(--fg)">
              {p.title}
            </text>
            <text x={cx} y={y + 76} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
              {p.sub}
            </text>
            {i < PARTS.length - 1 && (
              <line
                x1={x + w + 2}
                y1={cy}
                x2={xs[i + 1] - 2}
                y2={cy}
                stroke="var(--comment)"
                strokeWidth="1.5"
                markerEnd="url(#bookmap-arrow)"
              />
            )}
          </g>
        );
      })}
    </svg>
  );
}
