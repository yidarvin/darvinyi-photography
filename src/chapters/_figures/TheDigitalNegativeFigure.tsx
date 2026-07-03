// TheDigitalNegativeFigure: the signature figure for "The digital negative".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. It encodes the chapter's structural claim: one exposure runs
// through one pipeline, and the two file types tap it at opposite ends. The RAW file
// saves the INPUT to the develop, the sensor's own linear mosaic at full bit depth,
// with demosaic, white balance, tone, color, and sharpening all still to be decided and
// all reversible. The JPEG saves the OUTPUT: the same stages, but run once by the camera
// and baked into an 8-bit print, with everything else discarded. The negative is the
// thing before the decisions; the print is the thing after them.

// The interpretive develop stages, in order. On the raw these are yours to run and
// re-run; in the JPEG the camera ran them once and froze the result.
const STAGES = ["demosaic", "white balance", "tone curve", "color", "sharpen + nr"];

export function TheDigitalNegativeFigure() {
  const railY = 120;
  const chipY = 96;
  const chipH = 54;
  const chipW = 62;
  const chipX = (i: number) => 186 + i * 80; // 5 chips across the develop container
  const tapX = 168; // where the raw branch leaves the pipeline: before the develop

  return (
    <svg
      viewBox="0 0 760 312"
      className="w-full min-w-[680px]"
      role="img"
      aria-label="A diagram of the image pipeline from one exposure. A sensor produces a linear mosaic at 14 to 16 bits. The signal flows through the develop stages in order: demosaic, white balance, tone curve, color, and sharpening with noise reduction, ending as an 8-bit JPEG. The raw file taps in at the input, before any stage, saving the negative with every decision still open and full bit depth. The JPEG taps in at the output, after every stage is baked to 8 bits, saving a single finished print."
      fill="none"
    >
      <text x={24} y={28} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// one exposure, one pipeline: the raw saves the input, the jpeg saves the output"}
      </text>

      {/* the sensor: the linear mosaic every file starts from */}
      <rect x={24} y={85} width={118} height={70} rx={7} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={83} y={111} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--fg)">
        sensor
      </text>
      <text x={83} y={127} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
        linear mosaic
      </text>
      <text x={83} y={141} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        14 to 16 bit
      </text>

      {/* sensor -> develop */}
      <path d={`M 142 ${railY} L 176 ${railY}`} stroke="var(--border)" strokeWidth={1.4} />
      <path d={`M 171 ${railY - 4} L 176 ${railY} L 171 ${railY + 4}`} stroke="var(--border)" strokeWidth={1.4} />

      {/* the develop: the interpretive stages, run by you on the raw or once by the camera */}
      <rect x={176} y={68} width={402} height={104} rx={8} fill="var(--surface)" stroke="var(--border)" />
      <text x={186} y={84} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// the develop"}
      </text>
      {STAGES.map((label, i) => (
        <g key={label}>
          <rect
            x={chipX(i)}
            y={chipY}
            width={chipW}
            height={chipH}
            rx={5}
            fill="var(--surface-2)"
            stroke="var(--border)"
          />
          {label.split(" ").map((word, j, arr) => (
            <text
              key={word + j}
              x={chipX(i) + chipW / 2}
              y={chipY + chipH / 2 + 3 - (arr.length - 1) * 6 + j * 12}
              textAnchor="middle"
              fontFamily="var(--font-mono)"
              fontSize="9"
              fill="var(--fg)"
            >
              {word}
            </text>
          ))}
          {i < STAGES.length - 1 && (
            <path
              d={`M ${chipX(i) + chipW + 4} ${chipY + chipH / 2} l 8 0 m -3 -3 l 3 3 l -3 3`}
              stroke="var(--comment)"
              strokeWidth={1.2}
            />
          )}
        </g>
      ))}

      {/* develop -> jpeg */}
      <path d={`M 578 ${railY} L 612 ${railY}`} stroke="var(--border)" strokeWidth={1.4} />
      <path d={`M 607 ${railY - 4} L 612 ${railY} L 607 ${railY + 4}`} stroke="var(--border)" strokeWidth={1.4} />

      {/* the jpeg: the develop's output, baked to 8 bits */}
      <rect x={612} y={85} width={124} height={70} rx={7} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={674} y={110} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--accent)">
        jpeg
      </text>
      <text x={674} y={126} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
        8-bit · baked
      </text>
      <text x={674} y={140} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        one print kept
      </text>

      {/* the raw branch: tap the pipeline before any decision is made */}
      <circle cx={tapX} cy={railY} r={3} fill="var(--accent)" />
      <path d={`M ${tapX} ${railY} L ${tapX} 214`} stroke="var(--accent)" strokeWidth={1.4} strokeDasharray="4 3" />
      <path d={`M ${tapX - 4} 209 L ${tapX} 214 L ${tapX + 4} 209`} stroke="var(--accent)" strokeWidth={1.4} />
      <rect x={93} y={214} width={150} height={70} rx={7} fill="var(--surface-2)" stroke="var(--accent)" strokeOpacity={0.5} />
      <text x={168} y={238} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--accent)">
        raw · .DNG / .3FR
      </text>
      <text x={168} y={254} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
        the negative
      </text>
      <text x={168} y={268} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        full bit depth · reversible
      </text>

      {/* the two verdicts, side by side under the pipeline */}
      <text x={168} y={300} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// saved before the develop"}
      </text>
      <text x={674} y={300} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// saved after it"}
      </text>
    </svg>
  );
}
