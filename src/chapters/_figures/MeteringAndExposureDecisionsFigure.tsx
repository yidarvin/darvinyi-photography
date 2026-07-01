// MeteringAndExposureDecisionsFigure: the figure for "Metering and the exposure decision".
// Inline SVG, themed with the CSS variables so it matches the house style and stays crisp at any
// width. The structure it encodes is the chapter's thesis about WHAT a reflected meter actually does.
//
// Read left to right as a pipeline. Column 1 is the subject at its true tone: a bright snowfield, a
// middle-gray card, a black cat. Column 2 is what the meter renders: because a reflected meter assumes
// the whole scene averages to one middle gray, it drives every subject to that same gray, so the snow
// comes out too dark and the cat too bright while only the gray card lands right. Column 3 is the
// correction: exposure compensation pushes each subject back to where it belongs, up for the snow,
// nothing for the gray, down for the cat. One diagram, the whole chapter: the meter guesses gray, you
// place the tone.

// grayscale swatch tones, 0..255, so the diagram reads as real tone rather than color
const SNOW = 232;
const GRAY = 128; // the meter's target: middle gray
const COAL = 38;

type Row = {
  y: number;
  name: string; // the subject
  trueTone: number; // its actual tone
  verdict: string; // what the meter's gray does to it
  verdictBad: boolean;
  comp: string; // the exposure compensation that restores it
};

const ROWS: Row[] = [
  { y: 112, name: "snowfield", trueTone: SNOW, verdict: "too dark", verdictBad: true, comp: "+1.7 EV" },
  { y: 182, name: "gray card", trueTone: GRAY, verdict: "correct", verdictBad: false, comp: "0 EV" },
  { y: 252, name: "black cat", trueTone: COAL, verdict: "too bright", verdictBad: true, comp: "−1.7 EV" },
];

const SW = 96; // swatch width
const SH = 46; // swatch height
const COL_A = 130; // the subject
const COL_B = 380; // the meter's guess
const COL_C = 630; // your exposure

function hex(v: number): string {
  const h = Math.round(v).toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}

function Swatch({ cx, cy, tone }: { cx: number; cy: number; tone: number }) {
  // A near-black swatch on the near-black surface would vanish, so dark tones get a lighter hairline
  // to keep the shape legible. The point is to show that the swatch IS dark, not to hide it.
  const dark = tone < 70;
  return (
    <rect
      x={cx - SW / 2}
      y={cy - SH / 2}
      width={SW}
      height={SH}
      rx={4}
      fill={hex(tone)}
      stroke={dark ? "var(--fg-muted)" : "var(--border)"}
      strokeWidth={dark ? 1.25 : 1}
    />
  );
}

export function MeteringAndExposureDecisionsFigure() {
  return (
    <svg
      viewBox="0 0 760 296"
      className="w-full min-w-[700px]"
      role="img"
      aria-label="A left-to-right diagram of how a reflected light meter exposes three scenes. Column one, the subject at its true tone: a bright snowfield, a middle-gray card, and a black cat. Column two, what the meter renders: because the meter assumes the scene averages to middle gray, it renders all three as the same middle gray, so the snow comes out too dark and the black cat too bright, while only the gray card is correct. Column three, the corrected exposure: adding about plus 1.7 EV of exposure compensation restores the snow to white, zero compensation leaves the gray card, and about minus 1.7 EV restores the black cat to black."
      fill="none"
    >
      <defs>
        <marker id="meterArrow" markerWidth="7" markerHeight="7" refX="5.5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill="var(--fg-muted)" />
        </marker>
      </defs>

      {/* eyebrow: the assumption the whole chapter turns on */}
      <text x={40} y={26} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// a reflected meter aims every scene at one middle gray"}
      </text>

      {/* column captions */}
      <text x={COL_A} y={62} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg-muted)">
        the subject
      </text>
      <text x={COL_B} y={62} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg-muted)">
        what the meter renders
      </text>
      <text x={COL_C} y={62} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg-muted)">
        what you meant
      </text>

      {ROWS.map((r) => (
        <g key={r.name}>
          {/* the subject at its true tone */}
          <Swatch cx={COL_A} cy={r.y} tone={r.trueTone} />
          <text x={COL_A} y={r.y + SH / 2 + 18} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
            {r.name}
          </text>

          {/* meter arrow: subject -> the one gray */}
          <line
            x1={COL_A + SW / 2 + 6}
            y1={r.y}
            x2={COL_B - SW / 2 - 8}
            y2={r.y}
            stroke="var(--fg-muted)"
            strokeWidth={1.3}
            markerEnd="url(#meterArrow)"
          />

          {/* what the meter renders: the same middle gray every time */}
          <Swatch cx={COL_B} cy={r.y} tone={GRAY} />
          <text
            x={COL_B}
            y={r.y + SH / 2 + 18}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="10"
            fill={r.verdictBad ? "var(--danger)" : "var(--comment)"}
          >
            {r.verdict}
          </text>

          {/* compensation arrow: the gray -> back to true, labeled with the EV shift */}
          <line
            x1={COL_B + SW / 2 + 6}
            y1={r.y}
            x2={COL_C - SW / 2 - 8}
            y2={r.y}
            stroke="var(--fg-muted)"
            strokeWidth={1.3}
            markerEnd="url(#meterArrow)"
          />
          <text
            x={(COL_B + COL_C) / 2}
            y={r.y - 12}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="11"
            fill={r.comp === "0 EV" ? "var(--comment)" : "var(--accent)"}
          >
            {r.comp}
          </text>

          {/* the exposure you actually want: the subject restored to its true tone */}
          <Swatch cx={COL_C} cy={r.y} tone={r.trueTone} />
        </g>
      ))}
    </svg>
  );
}
