import { useState } from "react";

// LensesOpticsAndPerspectiveWidget: the signature widget for "Lenses, optics, and
// perspective". One focused interaction: you drag your distance to the subject, and the
// widget holds the subject the same size in the frame by choosing the focal length for
// you (wide up close, long far away, exactly the "zoom with your feet" a photographer
// does in the field). The only thing that changes is the background. Up close the
// subject is far nearer than the background, so the background sits small and the scene
// feels deep; step back and subject and background approach the same distance, so the
// background swells and stacks up, flattened. The move that makes the chapter click:
// there is no compression control, only distance. React state only, no persistence.

interface Stop {
  d: number; // your distance to the subject, in meters
  f: number; // focal length that holds the subject the same size in the frame, in mm
}

// Distance stops paired with the focal length that keeps a head-and-shoulders subject the
// same size. Focal length rises with distance (roughly f proportional to d), which is why
// a wide lens is a close-up tool and a long lens a far-off one.
const STOPS: Stop[] = [
  { d: 0.7, f: 24 },
  { d: 1.2, f: 35 },
  { d: 2, f: 50 },
  { d: 3.5, f: 85 },
  { d: 6, f: 135 },
  { d: 12, f: 300 },
];

// The background sits a fixed world distance behind the subject. Its apparent size,
// relative to the held subject, scales with d / (d + GAP): tiny when you are close,
// approaching the subject's own scale as you back away.
const GAP = 4;
const ratioOf = (d: number) => d / (d + GAP);

function perspectiveWord(r: number): string {
  if (r < 0.2) return "steep · expanded";
  if (r < 0.3) return "expanded";
  if (r < 0.42) return "natural";
  if (r < 0.62) return "flattening";
  return "compressed · flat";
}

// Frame geometry (SVG user units).
const FW = 340;
const FH = 210;
const INSET = 8;
const HORIZON = 150;
const SUBX = 116; // the subject stays here, at this size, in every frame
const SUN_CX = 230;
const SUN_CY = 116;

// A ridge line across the frame, peaking H above the horizon.
const ridgePath = (h: number) =>
  `M ${INSET} ${HORIZON} L ${INSET} ${HORIZON - h * 0.45} ` +
  `Q ${FW * 0.28} ${HORIZON - h} ${FW * 0.5} ${HORIZON - h * 0.55} ` +
  `Q ${FW * 0.74} ${HORIZON - h * 1.05} ${FW - INSET} ${HORIZON - h * 0.5} ` +
  `L ${FW - INSET} ${HORIZON} Z`;

export function LensesOpticsAndPerspectiveWidget() {
  const [idx, setIdx] = useState(1); // start slightly wide, so stepping back reads as compression

  const stop = STOPS[idx];
  const r = ratioOf(stop.d);
  const sunR = 8 + r * 78; // background disc grows as you back away
  const hillH = 6 + r * 52; // hills rise and loom as you back away
  const farRatio = 1 + GAP / stop.d; // subject-to-background distance ratio, approaches 1 far off
  const word = perspectiveWord(r);

  return (
    <div className="font-sans">
      {/* the frame: a held subject against a background that grows with distance */}
      <svg
        viewBox={`0 0 ${FW} ${FH}`}
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={
          `The same subject, held the same size, photographed from ${stop.d} meters with a ${stop.f} millimeter lens. ` +
          `The background reads as ${word}: ${r < 0.4 ? "small and set back, so the scene feels deep" : "large and stacked up behind the subject, so the scene feels flat"}.`
        }
      >
        <clipPath id="zf-frame">
          <rect x={INSET} y={INSET} width={FW - 2 * INSET} height={FH - 2 * INSET} rx="8" />
        </clipPath>
        <g clipPath="url(#zf-frame)">
          {/* sky and ground */}
          <rect x={INSET} y={INSET} width={FW - 2 * INSET} height={HORIZON - INSET} fill="#0f1a20" />
          <rect x={INSET} y={HORIZON} width={FW - 2 * INSET} height={FH - HORIZON - INSET} fill="#0b1315" />

          {/* the background disc (sun or moon), growing as you step back */}
          <circle
            cx={SUN_CX}
            cy={SUN_CY}
            r={sunR}
            fill="#c3ccd0"
            fillOpacity="0.85"
            className="transition-all duration-300 ease-out motion-reduce:transition-none"
          />

          {/* the ridge, rising and looming as you step back; drawn over the disc so it reads as distance */}
          <path
            d={ridgePath(hillH)}
            fill="#18242b"
            stroke="#223038"
            strokeWidth="1"
            className="transition-all duration-300 ease-out motion-reduce:transition-none"
          />

          {/* the subject: identical in every frame, held by the focal length that follows your feet */}
          <g>
            <path
              d={`M ${SUBX - 42} ${FH - INSET} Q ${SUBX - 40} 118 ${SUBX} 118 Q ${SUBX + 40} 118 ${SUBX + 42} ${FH - INSET} Z`}
              fill="#1b272d"
            />
            <circle cx={SUBX} cy={96} r="16" fill="#1b272d" />
            {/* faint teal rim: this is the thing being held constant */}
            <circle cx={SUBX} cy={96} r="16" fill="none" stroke="var(--accent)" strokeOpacity="0.55" strokeWidth="1.3" />
            <path
              d={`M ${SUBX - 42} ${FH - INSET} Q ${SUBX - 40} 118 ${SUBX} 118 Q ${SUBX + 40} 118 ${SUBX + 42} ${FH - INSET} Z`}
              fill="none"
              stroke="var(--accent)"
              strokeOpacity="0.35"
              strokeWidth="1.2"
            />
          </g>
        </g>
        <rect x={INSET} y={INSET} width={FW - 2 * INSET} height={FH - 2 * INSET} rx="8" fill="none" stroke="var(--border)" />
        <text x={INSET + 8} y={INSET + 16} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          subject held the same size
        </text>
        <text x={FW - INSET - 8} y={INSET + 16} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          {stop.f}mm
        </text>
      </svg>

      {/* readouts */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">you stand</dt>
        <dd className="text-right text-fg">{stop.d} m away</dd>
        <dt className="text-comment">focal length</dt>
        <dd className="text-right text-fg">
          {stop.f} mm <span className="text-comment">(to hold the frame)</span>
        </dd>
        <dt className="text-comment">subject : background</dt>
        <dd className="text-right text-fg">
          1 : {farRatio.toFixed(1)} <span className="text-comment">{farRatio < 1.6 ? "(near 1, flat)" : "(far apart, deep)"}</span>
        </dd>
        <dt className="text-comment">perspective</dt>
        <dd className="text-right text-accent">{word}</dd>
      </dl>

      {/* the one move: your distance */}
      <div className="mt-5">
        <label htmlFor="zf-distance" className="mb-2 block font-mono text-xs text-comment">
          your distance to the subject
        </label>
        <input
          id="zf-distance"
          type="range"
          min={0}
          max={STOPS.length - 1}
          step={1}
          value={idx}
          onChange={(e) => setIdx(Number(e.target.value))}
          aria-label={`Distance to subject, currently ${stop.d} meters, using a ${stop.f} millimeter lens`}
          className="w-full"
          style={{ accentColor: "var(--accent)" }}
        />
        <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-comment">
          <span>← closer · wide · deep</span>
          <span>farther · long · flat →</span>
        </div>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
        {"// the subject never changed size and you never touched a compression setting. "}
        {"stepping back flattened the scene; the focal length only grew to keep the frame."}
      </p>
    </div>
  );
}
