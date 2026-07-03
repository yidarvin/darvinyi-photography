// ToneAndTheCurveFigure: the signature figure for "Tone and the curve".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. It encodes the chapter's structural claim: every tonal control in
// a raw editor is a handle on ONE mapping, the tone curve, which takes an input
// brightness (x, shadows on the left, highlights on the right) and returns an output
// brightness (y). The dashed diagonal is the identity: output equals input, no change.
// The slope of the curve at any tone IS contrast there: steep means the tones spread
// apart, flat means they compress together.
//
// The figure draws the two moves the chapter separates, so the reader can see they are
// opposites. The SOLID teal curve is a contrast S: it steepens the midtones and, with the
// endpoints pinned at the corners, drives near-white inputs UP toward the wall and dark
// inputs DOWN toward black, which is more contrast bought from the ends. The DASHED curve
// is recovery: it rolls the shoulder DOWN off the white wall and lifts the toe UP off
// black, pulling both ends back into the range (the widget's "recover the ends" preset
// and LightroomCurve 20.8 draw the same shape). Contrast pushes tones at the walls;
// recovery pulls them off. The zones along the bottom name what the six Basic-panel
// sliders each reach: blacks and whites move the endpoints, shadows and highlights bend
// the two ends, exposure lifts the whole curve, contrast tilts it into the S.

const A = 2.2; // steepness of the illustrative contrast S

// The contrast S as a transfer function: input x in [0,1] to output in [0,1]. This form
// passes through (0,0), (0.5,0.5) and (1,1), steepening the midtones and pushing both
// ends toward the walls, which is what a contrast curve does.
const tone = (x: number) => {
  const a = Math.pow(x, A);
  const b = Math.pow(1 - x, A);
  return a / (a + b);
};

// The recovery curve: near-identity through the middle, but it rolls the shoulder down
// off the white wall and lifts the toe up off black, so near-white inputs map BELOW pure
// white and the darkest inputs map ABOVE pure black. It is the opposite of the contrast S
// at both ends. REC sets how far each end is pulled off its wall.
const REC = 0.13;
const clamp01 = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);
const recover = (x: number) => clamp01(x + REC * Math.cos(Math.PI * x));

// Plot geometry.
const PX0 = 96;
const PX1 = 456;
const PY0 = 52; // top (output = 1)
const PY1 = 412; // bottom (output = 0)
const SPAN = PX1 - PX0; // square: same for x and y

const mapX = (x: number) => PX0 + x * SPAN;
const mapY = (y: number) => PY1 - y * SPAN;

const CURVE = Array.from({ length: 49 }, (_, i) => i / 48);
const curvePath = CURVE.map((x, i) => `${i === 0 ? "M" : "L"} ${mapX(x).toFixed(1)} ${mapY(tone(x)).toFixed(1)}`).join(" ");
const recoverPath = CURVE.map((x, i) => `${i === 0 ? "M" : "L"} ${mapX(x).toFixed(1)} ${mapY(recover(x)).toFixed(1)}`).join(" ");

// Three chords through the contrast S show how steep it is at the toe, the middle, and the
// shoulder. Slope is contrast: steep spreads tones apart, flat compresses them.
const CHORDS = [0.18, 0.5, 0.82];

// The five tonal zones along the input axis, named for the sliders that reach them.
const ZONES = [
  { x: 0.03, label: "blacks", anchor: "start" as const },
  { x: 0.22, label: "shadows", anchor: "middle" as const },
  { x: 0.5, label: "mids", anchor: "middle" as const },
  { x: 0.78, label: "highlights", anchor: "middle" as const },
  { x: 0.97, label: "whites", anchor: "end" as const },
];

export function ToneAndTheCurveFigure() {
  const dx = 0.07; // half-width of each slope chord

  return (
    <svg
      viewBox="0 0 600 500"
      className="w-full min-w-[560px]"
      role="img"
      aria-label="A square plot of the tone curve as a transfer function. The horizontal axis is input brightness from black on the left to white on the right; the vertical axis is output brightness. A dashed diagonal marks the identity line where output equals input and nothing changes. Two curves are drawn over it. The solid teal curve is a contrast S: it is steep through the middle so midtone contrast increases, and with the endpoints pinned at the corners it bends above the diagonal near the top-right, driving near-white inputs up toward the white wall, and below the diagonal near the bottom-left, pushing dark inputs down toward black. The second, dashed curve is recovery, the opposite move: it rolls the shoulder down below the diagonal so near-white inputs map below pure white and come off the wall, and lifts the toe up above the diagonal so the darkest inputs lift off pure black. The bottom-left corner is labelled the black point and the top-right corner the white point, the pinned ends that recovery pulls away from. Along the bottom, the input axis is divided into five zones named for the sliders that reach them: blacks, shadows, mids, highlights, whites. The figure shows that contrast pushes tones toward the walls while recovery pulls them off, and that exposure, contrast, and the highlight and shadow controls are all handles on this one input-to-output mapping."
      fill="none"
    >
      <text x={16} y={24} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// one curve: input brightness in, output brightness out"}
      </text>
      <text x={16} y={40} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// slope = contrast. contrast pushes tones at the walls; recovery pulls them off."}
      </text>

      {/* plot frame */}
      <rect x={PX0} y={PY0} width={SPAN} height={SPAN} rx={4} fill="var(--surface-2)" stroke="var(--border)" />

      {/* faint interior grid at the quarters */}
      {[0.25, 0.5, 0.75].map((g) => (
        <g key={g}>
          <line x1={mapX(g)} y1={PY0} x2={mapX(g)} y2={PY1} stroke="var(--border)" strokeWidth={0.6} strokeOpacity={0.6} />
          <line x1={PX0} y1={mapY(g)} x2={PX1} y2={mapY(g)} stroke="var(--border)" strokeWidth={0.6} strokeOpacity={0.6} />
        </g>
      ))}

      {/* identity diagonal: output = input, no change */}
      <line x1={mapX(0)} y1={mapY(0)} x2={mapX(1)} y2={mapY(1)} stroke="var(--comment)" strokeWidth={1.2} strokeDasharray="5 4" />
      <text
        x={mapX(0.34) + 10}
        y={mapY(0.34) + 16}
        fontFamily="var(--font-mono)"
        fontSize="10"
        fill="var(--comment)"
      >
        identity: no change
      </text>

      {/* the recovery curve: rolls the shoulder down and lifts the toe, the opposite of the S */}
      <path d={recoverPath} stroke="var(--accent-dim)" strokeWidth={2} strokeDasharray="6 4" strokeLinecap="round" />
      <text
        x={mapX(0.6) + 6}
        y={mapY(recover(0.6)) + 15}
        fontFamily="var(--font-mono)"
        fontSize="9.5"
        fill="var(--accent-dim)"
      >
        recovery
      </text>

      {/* the contrast S (the tone curve in its usual shape) */}
      <path d={curvePath} stroke="var(--accent)" strokeWidth={2.6} strokeLinecap="round" />

      {/* three chords show the slope (contrast) at the toe, middle, and shoulder of the S */}
      {CHORDS.map((x) => {
        const x1 = Math.max(0, x - dx);
        const x2 = Math.min(1, x + dx);
        return (
          <g key={x}>
            <line
              x1={mapX(x1)}
              y1={mapY(tone(x1))}
              x2={mapX(x2)}
              y2={mapY(tone(x2))}
              stroke="var(--fg)"
              strokeWidth={2}
              strokeOpacity={0.85}
            />
            <circle cx={mapX(x)} cy={mapY(tone(x))} r={3.2} fill="var(--accent)" />
          </g>
        );
      })}

      {/* annotate the two opposite moves: steepen the middle (contrast), roll the shoulder (recovery) */}
      {/* recovery shoulder -> right margin */}
      <line x1={466} y1={mapY(recover(0.85))} x2={mapX(0.85) + 3} y2={mapY(recover(0.85)) + 2} stroke="var(--border)" strokeWidth={1} />
      <text x={470} y={mapY(recover(0.85)) - 3} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg)">
        roll the shoulder off the wall
      </text>
      <text x={470} y={mapY(recover(0.85)) + 10} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        → highlights recover
      </text>
      {/* contrast S middle -> lower-right empty area */}
      <line x1={312} y1={344} x2={mapX(0.5) + 2} y2={mapY(0.5) + 2} stroke="var(--border)" strokeWidth={1} />
      <text x={314} y={352} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg)">
        steepen the middle
      </text>
      <text x={314} y={365} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        → more contrast
      </text>

      {/* endpoints: the black point and the white point, the pinned ends recovery pulls off */}
      <circle cx={mapX(0)} cy={mapY(0)} r={4} fill="var(--fg)" stroke="var(--surface-2)" strokeWidth={1.5} />
      <text x={mapX(0) + 8} y={mapY(0) - 8} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        black point
      </text>
      <circle cx={mapX(1)} cy={mapY(1)} r={4} fill="var(--fg)" stroke="var(--surface-2)" strokeWidth={1.5} />
      <text x={mapX(1) - 8} y={mapY(1) + 16} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        white point
      </text>

      {/* axis labels */}
      <text
        x={22}
        y={(PY0 + PY1) / 2}
        fontFamily="var(--font-mono)"
        fontSize="11"
        fill="var(--fg-muted)"
        textAnchor="middle"
        transform={`rotate(-90 22 ${(PY0 + PY1) / 2})`}
      >
        output brightness
      </text>

      {/* input-axis zones, named for the sliders that reach them */}
      <text x={(PX0 + PX1) / 2} y={PY1 + 30} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg-muted)">
        input brightness
      </text>
      {ZONES.map((z) => (
        <g key={z.label}>
          <line x1={mapX(z.x)} y1={PY1} x2={mapX(z.x)} y2={PY1 + 6} stroke="var(--border)" strokeWidth={1} />
          <text x={mapX(z.x)} y={PY1 + 48} textAnchor={z.anchor} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
            {z.label}
          </text>
        </g>
      ))}

      <text x={300} y={492} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// exposure lifts the whole curve · contrast tilts it into an S · recovery rolls the ends off the walls"}
      </text>
    </svg>
  );
}
