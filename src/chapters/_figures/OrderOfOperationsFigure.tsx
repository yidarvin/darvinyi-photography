// OrderOfOperationsFigure: the signature figure for "Order of operations".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. It encodes the chapter's structural claim: a raw develop is not a
// bag of independent sliders, it is a STACK. Each step assumes the one above it is
// settled, so the steps have a natural order, and the order is a dependency chain rather
// than a preference. The four phase brackets on the left group the eight steps into the
// moves you actually make: set the base, shape the whole frame, work locally, finish for
// output. The curved arrow on the right is the cost of going backwards: reach back to a
// settled step (here, exposure) after you have moved on, and every step that stood on it
// (the shaded band: contrast, color, local) no longer fits and has to be redone. That is
// what "a develop that fights itself" means, drawn once.

const ROW_H = 46;
const GAP = 12;
const TOP = 70;
const X = 150;
const W = 410;

// The eight steps, top to bottom, in the order the work wants to happen. Each carries the
// one thing it assumes is already settled, which is why it sits where it sits.
const STEPS = [
  { n: "1", name: "geometry & lens", note: "distortion, straighten, crop: fix the frame first" },
  { n: "2", name: "white balance", note: "assumes: a neutral reference" },
  { n: "3", name: "exposure", note: "assumes: brightness of the whole frame" },
  { n: "4", name: "contrast & curve", note: "assumes: exposure is settled" },
  { n: "5", name: "color & grade", note: "assumes: white balance is neutral" },
  { n: "6", name: "local adjustments", note: "assumes: the global look is settled" },
  { n: "7", name: "noise reduction", note: "assumes: the final crop and size" },
  { n: "8", name: "sharpen & export", note: "assumes: noise reduced; sized to output" },
];

// Left-gutter phase brackets: which contiguous rungs each phase spans.
const PHASES = [
  { label: "set the base", from: 0, to: 2 },
  { label: "shape the frame", from: 3, to: 4 },
  { label: "work local", from: 5, to: 5 },
  { label: "finish", from: 6, to: 7 },
];

const rowY = (i: number) => TOP + i * (ROW_H + GAP);
const rowMid = (i: number) => rowY(i) + ROW_H / 2;

export function OrderOfOperationsFigure() {
  // The rework example: you moved on to step 6 (local) and then reach back to step 3
  // (exposure). Steps 4, 5, 6 all stood on the old exposure, so all three must be redone.
  const backFrom = 5; // local adjustments (index)
  const backTo = 2; // exposure (index)
  const redoTop = rowY(3); // first step that has to be redone
  const redoBottom = rowY(5) + ROW_H; // last step that has to be redone

  return (
    <svg
      viewBox="0 0 764 566"
      className="w-full min-w-[680px]"
      role="img"
      aria-label="A vertical ladder of the eight steps of a raw develop, top to bottom in working order: geometry and lens, white balance, exposure, contrast and curve, color and grade, local adjustments, noise reduction, and sharpen and export. Each step is labelled with what it assumes is already settled, for example the tone curve assumes exposure is settled and color assumes white balance is neutral. Brackets on the left group the steps into four phases: set the base, shape the frame, work local, and finish. A curved arrow on the right reaches from the local-adjustments step back up to the exposure step, and a shaded band marks contrast, color, and local as the steps that must be redone if you change a settled step after moving past it. The figure shows that the develop is a dependency stack, not a set of independent sliders."
      fill="none"
    >
      <text x={16} y={30} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// the develop is a stack: each step stands on the one above it"}
      </text>
      <text x={16} y={48} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// work down. reach back up and everything under the change has to be redone."}
      </text>

      {/* the redo band: the steps that stood on the step you reach back to change */}
      <rect x={X} y={redoTop} width={W} height={redoBottom - redoTop} rx={7} fill="var(--accent)" fillOpacity={0.06} />

      {/* left phase brackets, one per phase, grouping the rungs it spans */}
      {PHASES.map((p) => {
        const top = rowY(p.from) + 2;
        const bottom = rowY(p.to) + ROW_H - 2;
        const mid = (top + bottom) / 2;
        return (
          <g key={p.label}>
            <path d={`M 140 ${top} L 134 ${top} L 134 ${bottom} L 140 ${bottom}`} stroke="var(--border)" strokeWidth={1.2} />
            <text x={122} y={mid + 3} textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill="var(--accent)">
              {p.label}
            </text>
          </g>
        );
      })}

      {/* the eight rungs */}
      {STEPS.map((s, i) => (
        <g key={s.name}>
          <rect x={X} y={rowY(i)} width={W} height={ROW_H} rx={7} fill="var(--surface-2)" stroke="var(--border)" />
          <text x={X + 16} y={rowMid(i) + 5} fontFamily="var(--font-mono)" fontSize="14" fill="var(--accent)">
            {s.n}
          </text>
          <text x={X + 42} y={rowY(i) + 20} fontFamily="var(--font-mono)" fontSize="13" fill="var(--fg)">
            {s.name}
          </text>
          <text x={X + 42} y={rowY(i) + 37} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
            {s.note}
          </text>
        </g>
      ))}

      {/* the rework arc: reach back from local up to exposure; the band above is the cost */}
      <path
        d={`M ${X + W} ${rowMid(backFrom)} C ${X + W + 96} ${rowMid(backFrom)}, ${X + W + 96} ${rowMid(backTo)}, ${X + W} ${rowMid(backTo)}`}
        stroke="var(--danger)"
        strokeWidth={1.5}
        strokeDasharray="5 3"
      />
      <path
        d={`M ${X + W + 8} ${rowMid(backTo) - 6} L ${X + W} ${rowMid(backTo)} L ${X + W + 8} ${rowMid(backTo) + 6}`}
        stroke="var(--danger)"
        strokeWidth={1.5}
      />
      <text x={X + W + 30} y={rowMid(backTo) - 4} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--danger)">
        reach back
      </text>
      <text x={X + W + 30} y={rowMid(backTo) + 9} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        to a settled step
      </text>
      <text x={X + W + 30} y={(rowMid(backFrom) + rowMid(backTo)) / 2 + 20} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        redo the
      </text>
      <text x={X + W + 30} y={(rowMid(backFrom) + rowMid(backTo)) / 2 + 33} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        band above ↑
      </text>

      <text x={382} y={552} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// in order, each step is decided once. out of order, the later steps get decided again."}
      </text>
    </svg>
  );
}
