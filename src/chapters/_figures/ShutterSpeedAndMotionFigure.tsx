// ShutterSpeedAndMotionFigure: the figure for "Shutter speed and motion".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. The structure it encodes is the chapter's thesis: what the
// shutter freezes or streaks is the smear a moving subject's IMAGE draws across the
// sensor, and that smear equals the image's speed across the frame times the shutter's
// open time. One subject at one image speed, three shutter durations. Each streak's
// length is exactly proportional to the open time (length = C / denominator), so
// 1/1000 s leaves a near-point that stays inside the sharpness limit (frozen), 1/125 s
// smears just past it (soft), and 1/15 s draws a streak clean off the frame.

const X0 = 210; // where every streak begins: the sharp head, shared by all three rows
const THRESH = 15; // the sharpness limit past the head, one circle of confusion wide
const RIGHT = 632; // frame edge the longest streak runs into
const MAX_LEN = RIGHT - X0; // clip the longest streak here
const C = 6600; // scale: length = C / denominator, so streak length stays ∝ open time

interface Row {
  cy: number;
  shutter: string;
  denom: number;
  verdict: string;
  frozen: boolean;
}

const ROWS: Row[] = [
  { cy: 100, shutter: "1/1000 s", denom: 1000, verdict: "frozen", frozen: true },
  { cy: 172, shutter: "1/125 s", denom: 125, verdict: "soft", frozen: false },
  { cy: 244, shutter: "1/15 s", denom: 15, verdict: "streaked", frozen: false },
];

function StreakRow({ row }: { row: Row }) {
  const { cy } = row;
  const raw = C / row.denom; // proportional to the open time
  const len = Math.min(raw, MAX_LEN);
  const clipped = raw > MAX_LEN;
  return (
    <g>
      {/* left column: the shutter time and the verdict it earns */}
      <text x={16} y={cy - 2} fontFamily="var(--font-mono)" fontSize="13" fill="var(--fg)">
        {row.shutter}
      </text>
      <text
        x={16}
        y={cy + 15}
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill={row.frozen ? "var(--accent)" : "var(--comment)"}
      >
        {row.verdict}
      </text>

      {/* the sensor track this streak is drawn on */}
      <line x1={X0} y1={cy} x2={RIGHT} y2={cy} stroke="var(--border)" strokeWidth="1" opacity="0.5" />

      {/* the streak: a comet whose length is proportional to the shutter's open time */}
      <rect x={X0} y={cy - 5} width={len} height="10" rx="5" fill="url(#streak)" />
      {/* the sharp head, always the same point of origin */}
      <circle cx={X0} cy={cy} r="4.5" fill="var(--accent)" />
      {clipped && (
        <text x={RIGHT} y={cy - 11} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          off the frame
        </text>
      )}
    </g>
  );
}

export function ShutterSpeedAndMotionFigure() {
  return (
    <svg
      viewBox="0 0 660 300"
      className="w-full min-w-[600px]"
      role="img"
      aria-label="One moving subject photographed at three shutter speeds. At 1/1000 second the subject's image barely moves on the sensor and stays a sharp point, inside the sharpness limit, frozen. At 1/125 second it smears into a short streak that crosses the limit, soft. At 1/15 second it draws a streak clean off the frame, streaked. Each streak's length is proportional to how long the shutter stayed open."
      fill="none"
    >
      <defs>
        {/* comet fade: bright at the sharp head, gone at the tail, across each streak's own length */}
        <linearGradient id="streak" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="var(--accent)" stopOpacity="0.9" />
          <stop offset="1" stopColor="var(--accent)" stopOpacity="0.04" />
        </linearGradient>
      </defs>

      {/* the structural takeaway, stated in the figure */}
      <text x={16} y={34} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// streak on sensor = image speed × open time"}
      </text>

      {/* the sharpness limit: streaks that stay left of it read as a point */}
      <line
        x1={X0 + THRESH}
        y1={62}
        x2={X0 + THRESH}
        y2={266}
        stroke="var(--fg-muted)"
        strokeWidth="1"
        strokeDasharray="3 4"
      />
      <text x={X0 + THRESH + 6} y={70} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
        sharp limit
      </text>

      {ROWS.map((row) => (
        <StreakRow key={row.shutter} row={row} />
      ))}
    </svg>
  );
}
