// BlackAndWhiteSeeingFigure: the signature figure for "Removing color to see".
// Inline SVG, themed with the CSS variables for all chrome. The one exception is the
// swatches: a figure about tone must show real color and the real grey it becomes, so
// the color patches are literal RGB and the grey patches are the luminance computed
// from them, the same way the color-science figure filled its ring with real hues.
//
// The figure encodes the chapter's structural claim: black and white keeps VALUE and
// throws away HUE. The grey a color becomes is a single weighted sum of its channels
// (Rec. 709 luminance, green dominant), and hue never enters it. So two colors that
// look vividly different can carry the same brightness and MERGE into one grey (a red
// apple and green leaves, tuned here to the identical 31% grey), while another vivid
// pair can differ in brightness and stay cleanly SEPARATE (yellow against blue). Color
// contrast is not tonal contrast. Seeing that collapse coming is the whole skill.

// Rec. 709 luminance on sRGB values: the weighting the eye applies and the formula a
// naive desaturate uses. Green carries most of it, blue almost none.
const luma = (r: number, g: number, b: number) => 0.2126 * r + 0.7152 * g + 0.0722 * b;
const rgbStr = ([r, g, b]: number[]) => `rgb(${r}, ${g}, ${b})`;

function grey([r, g, b]: number[]) {
  const y = Math.round(luma(r, g, b));
  return { css: `rgb(${y}, ${y}, ${y})`, pct: Math.round((y / 255) * 100) };
}

type Sample = { name: string; rgb: number[] };

// Two pairs. The first is tuned so both colors land at the same luminance: a genuine
// collapse, not a rigged demo. The second differs in brightness and stays separate.
const PAIRS: { verdict: string; merges: boolean; left: Sample; right: Sample }[] = [
  {
    merges: true,
    verdict: "same grey · they merge",
    left: { name: "red", rgb: [205, 45, 45] },
    right: { name: "green", rgb: [52, 90, 45] },
  },
  {
    merges: false,
    verdict: "far apart · they separate",
    left: { name: "yellow", rgb: [240, 205, 55] },
    right: { name: "blue", rgb: [45, 90, 180] },
  },
];

// One color-to-grey column: the name, the real color, an arrow, and the grey it becomes.
function Column({ x, sample }: { x: number; sample: Sample }) {
  const g = grey(sample.rgb);
  const cx = x + 30;
  return (
    <g>
      <text x={cx} y={84} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
        {sample.name}
      </text>
      <rect x={x} y={92} width={60} height={58} rx={6} fill={rgbStr(sample.rgb)} stroke="var(--border)" />
      {/* the discard: color goes down to a single grey */}
      <path d={`M ${cx} 156 L ${cx} 176`} stroke="var(--comment)" strokeWidth={1.2} />
      <path d={`M ${cx - 3.5} 171 L ${cx} 176 L ${cx + 3.5} 171`} fill="none" stroke="var(--comment)" strokeWidth={1.2} />
      <rect x={x} y={182} width={60} height={58} rx={6} fill={g.css} stroke="var(--border)" />
      <text x={cx} y={260} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--accent)">
        {g.pct}%
      </text>
    </g>
  );
}

export function BlackAndWhiteSeeingFigure() {
  // swatch left-edges: left pair at 70/150, right pair at 350/430
  const GROUPS = [
    { pair: PAIRS[0], lx: 70, rx: 150 },
    { pair: PAIRS[1], lx: 350, rx: 430 },
  ];

  return (
    <svg
      viewBox="0 0 560 336"
      className="w-full min-w-[480px]"
      role="img"
      aria-label="A diagram of how color becomes grey in black and white. A header gives the luminance formula: grey equals 0.21 times red plus 0.72 times green plus 0.07 times blue, so hue never appears. On the left, a vivid red swatch and a vivid green swatch each drop by an arrow to the grey they become, and both greys are the same 31 percent grey, bracketed as: same grey, they merge. On the right, a yellow swatch becomes a 79 percent light grey and a blue swatch becomes a 34 percent dark grey, bracketed as: far apart, they separate. The lesson is that color contrast is not tonal contrast."
      fill="none"
    >
      {/* the governing statement, in the code-comment motif */}
      <text x={28} y={26} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--comment)">
        {"// black and white keeps value and throws away hue"}
      </text>
      <text x={28} y={48} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        grey = 0.21·red + 0.72·green + 0.07·blue
      </text>
      <line x1={28} y1={62} x2={532} y2={62} stroke="var(--border)" />

      {GROUPS.map((grp, i) => (
        <g key={i}>
          <Column x={grp.lx} sample={grp.pair.left} />
          <Column x={grp.rx} sample={grp.pair.right} />
          {/* verdict bracket under the two greys */}
          <path
            d={`M ${grp.lx} 280 L ${grp.lx} 274 L ${grp.rx + 60} 274 L ${grp.rx + 60} 280`}
            stroke={grp.pair.merges ? "var(--fg)" : "var(--comment)"}
            strokeOpacity={grp.pair.merges ? 0.7 : 1}
            strokeWidth={1.2}
          />
          <text
            x={(grp.lx + grp.rx + 60) / 2}
            y={300}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fill={grp.pair.merges ? "var(--fg)" : "var(--fg-muted)"}
          >
            {grp.pair.verdict}
          </text>
        </g>
      ))}

      {/* the divider between the two lessons */}
      <line x1={280} y1={78} x2={280} y2={306} stroke="var(--border)" strokeDasharray="3 4" />
      <text x={294} y={324} fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--comment)">
        {"// color contrast is not tonal contrast"}
      </text>
    </svg>
  );
}
