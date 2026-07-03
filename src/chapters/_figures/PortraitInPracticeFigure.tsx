// PortraitInPracticeFigure: the signature figure for "Portrait, end to end".
// Inline SVG, themed with the CSS variables so the chrome matches the house style and
// stays crisp at any width. Laid out as two rows so the whole chain fits a phone.
//
// The structural claim of the chapter: a portrait is not one skill but a CHAIN of
// decisions run in order, split into two halves, the shoot and the develop, and every
// link is subordinate to one thing, the face. The figure runs the chain left to right
// across the top row (before the shutter), drops down at the shutter, then runs back
// right to left across the bottom row (after the shutter) into the one node everything
// serves: the face. Each stage is a small card tagged with the earlier chapter it came
// from.

interface Stage {
  i: string;
  a: string;
  b: string;
  tag: string;
}

// top row, left to right: the shoot
const SHOOT: Stage[] = [
  { i: "01", a: "lens &", b: "distance", tag: "perspective" },
  { i: "02", a: "light &", b: "ratio", tag: "reading light" },
  { i: "03", a: "leaf-shutter", b: "fill", tag: "leaf advantage" },
  { i: "04", a: "focus the", b: "near eye", tag: "focus & AF" },
];

// bottom row, right to left: the develop, ending at the face
const DEVELOP: Stage[] = [
  { i: "05", a: "skin tone", b: "WB · vibrance", tag: "color grading" },
  { i: "06", a: "tone &", b: "local finish", tag: "curve · masks" },
  { i: "07", a: "output", b: "for its place", tag: "output & print" },
];

const CARD_W = 132;
const CARD_H = 66;
const PITCH = 152;
const X0 = 16;
const ROW1_Y = 86;
const ROW2_Y = 250;
const CY1 = ROW1_Y + CARD_H / 2;
const CY2 = ROW2_Y + CARD_H / 2;

// column x for slot 0..3 (left to right)
const colX = (slot: number) => X0 + slot * PITCH;
// the drop happens at the rightmost column (slot 3)
const DROP_X = colX(3) + CARD_W / 2;

export function PortraitInPracticeFigure() {
  return (
    <svg
      viewBox="0 0 640 384"
      className="w-full min-w-[540px]"
      role="img"
      aria-label="A portrait drawn as a chain of decisions split into two halves. The top row, before the shutter, runs left to right through four stages at the camera: choosing the lens and working distance for perspective, placing the light and setting the fill ratio, adding leaf-shutter fill, and focusing the near eye. The chain then drops down at the shutter and the bottom row runs right to left through three develop stages in the raw file: landing skin tone with white balance and vibrance, shaping tone and local finish with the curve and masks, and output for its destination. It ends at a node drawn as a small head: the face. The point is that every link serves the face, and changing any link changes the face."
      fill="none"
    >
      <text x={16} y={22} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// a portrait is a chain of decisions: shot first, then developed"}
      </text>
      <text x={16} y={39} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// every link serves one thing, and changing any link changes it"}
      </text>

      {/* row eyebrows */}
      <text x={X0} y={72} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// before the shutter, at the camera"}
      </text>
      <text x={colX(3) + CARD_W} y={236} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// after the shutter, in the raw file"}
      </text>

      {/* top row: the shoot, left to right */}
      {SHOOT.map((s, slot) => (
        <StageCard key={s.i} x={colX(slot)} y={ROW1_Y} stage={s} />
      ))}
      {/* arrows between top-row cards, pointing right */}
      {[0, 1, 2].map((slot) => {
        const gx = colX(slot) + CARD_W + (PITCH - CARD_W) / 2;
        return (
          <path key={`t-${slot}`} d={`M ${gx - 2} ${CY1 - 4} L ${gx + 2} ${CY1} L ${gx - 2} ${CY1 + 4}`} stroke="var(--comment)" strokeWidth={1.3} />
        );
      })}

      {/* the drop at the shutter: down the rightmost column into the develop row */}
      <line x1={DROP_X} y1={ROW1_Y + CARD_H} x2={DROP_X} y2={ROW2_Y - 6} stroke="var(--comment)" strokeWidth={1.2} strokeDasharray="4 4" />
      <path d={`M ${DROP_X - 4} ${ROW2_Y - 10} L ${DROP_X} ${ROW2_Y - 4} L ${DROP_X + 4} ${ROW2_Y - 10}`} stroke="var(--comment)" strokeWidth={1.3} />
      <text x={DROP_X + 8} y={(ROW1_Y + CARD_H + ROW2_Y) / 2 + 3} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        the shutter
      </text>

      {/* bottom row: the develop, right to left (slot 3 = 05, slot 2 = 06, slot 1 = 07, slot 0 = face) */}
      {DEVELOP.map((s, idx) => (
        <StageCard key={s.i} x={colX(3 - idx)} y={ROW2_Y} stage={s} />
      ))}
      {/* arrows between bottom-row cards, pointing left */}
      {[0, 1].map((idx) => {
        const gx = colX(3 - idx) - (PITCH - CARD_W) / 2;
        return (
          <path key={`b-${idx}`} d={`M ${gx + 2} ${CY2 - 4} L ${gx - 2} ${CY2} L ${gx + 2} ${CY2 + 4}`} stroke="var(--comment)" strokeWidth={1.3} />
        );
      })}
      {/* arrow into the face node (slot 0) from card 07 (slot 1) */}
      <path d={`M ${colX(1) - (PITCH - CARD_W) / 2 + 2} ${CY2 - 4} L ${colX(1) - (PITCH - CARD_W) / 2 - 2} ${CY2} L ${colX(1) - (PITCH - CARD_W) / 2 + 2} ${CY2 + 4}`} stroke="var(--accent)" strokeWidth={1.4} />

      {/* the face: the one thing the whole chain serves */}
      <g>
        <rect x={colX(0)} y={ROW2_Y} width={CARD_W} height={CARD_H} rx={7} fill="var(--surface)" stroke="var(--accent)" strokeWidth={1.6} />
        <g transform={`translate(${colX(0) + 26} ${CY2})`} stroke="var(--accent)" strokeWidth={1.5} fill="none">
          <circle cx={0} cy={-8} r={10} />
          <path d="M -16 20 Q -16 3 0 3 Q 16 3 16 20" />
          <circle cx={-3.5} cy={-9} r={1.4} fill="var(--accent)" stroke="none" />
        </g>
        <text x={colX(0) + 48} y={CY2 - 2} fontFamily="var(--font-mono)" fontSize="13" fill="var(--accent)">
          the face
        </text>
        <text x={colX(0) + 48} y={CY2 + 14} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
          what it serves
        </text>
      </g>

      <text x={16} y={372} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// leaf-shutter Q3 and X2D here, but the chain is the same on any camera"}
      </text>
    </svg>
  );
}

function StageCard({ x, y, stage }: { x: number; y: number; stage: Stage }) {
  return (
    <g>
      <rect x={x} y={y} width={CARD_W} height={CARD_H} rx={6} fill="var(--surface)" stroke="var(--border)" />
      <text x={x + 12} y={y + 18} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-muted)">
        {stage.i}
      </text>
      <text x={x + 12} y={y + 35} fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg)">
        {stage.a}
      </text>
      <text x={x + 12} y={y + 48} fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg)">
        {stage.b}
      </text>
      <text x={x + 12} y={y + 60} fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--comment)">
        {stage.tag}
      </text>
    </g>
  );
}
