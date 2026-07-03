import { useId, useState } from "react";

// PortraitInPracticeWidget: the signature widget for "Portrait, end to end".
// One focused interaction: drag a single slider through the chain of decisions that
// makes a portrait, and watch one face assemble from a flat snapshot into a finished
// frame. Each step applies exactly one earlier chapter's idea, cumulatively:
//   0 the snapshot       -- deep depth, flat light, a cast: a record, not a portrait
//   1 open the aperture  (aperture & depth of field) -- background dissolves, subject lifts off
//   2 focus the near eye (focus & autofocus)         -- the thin plane lands on the near eye
//   3 place the key light (reading light)            -- the face gains a lit and a shadow side
//   4 set the fill       (the leaf advantage)        -- the shadow lifts to a ratio, a catchlight lands
//   5 land the skin tone (color grading)             -- white balance clears the cast; skin reads true
//   6 dodge and burn     (local adjustments)         -- brighten the eyes, darken the edges; the eye lands
// React state only, no persistence. A synthesis chapter made physical: a portrait is not
// one skill but a chain, and each link is a decision made on purpose.

type Step = { decision: string; chapter: string; gain: string };

const STEPS: Step[] = [
  { decision: "the snapshot", chapter: "before any decision", gain: "deep depth, flat light, a cast. a record, not a portrait" },
  { decision: "open the aperture", chapter: "aperture & depth of field", gain: "the background dissolves and the subject lifts off it" },
  { decision: "focus the near eye", chapter: "focus & autofocus", gain: "eye detection lands the thin plane on the near eye; the far eye softens" },
  { decision: "place the key light", chapter: "reading light", gain: "the face gains a lit side and a shadow side. shape" },
  { decision: "set the fill", chapter: "the leaf advantage", gain: "fill lifts the shadow to a chosen ratio and drops a catchlight in the eye" },
  { decision: "land the skin tone", chapter: "color grading", gain: "white balance clears the green cast; skin reads believable" },
  { decision: "dodge and burn", chapter: "local adjustments", gain: "brighten the eyes, darken the edges; the eye goes to the face" },
];

const LAST = STEPS.length - 1;

type RGB = [number, number, number];
const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const mul = ([r, g, b]: RGB, m: number): string =>
  `rgb(${Math.round(clamp(r * m, 0, 255))}, ${Math.round(clamp(g * m, 0, 255))}, ${Math.round(clamp(b * m, 0, 255))})`;

const SKIN_COOL: RGB = [166, 176, 152]; // wrong white balance: greenish, sallow
const SKIN_WARM: RGB = [216, 170, 138]; // corrected: believable skin

// background foliage, sharp and busy at f/8, bokeh once the aperture opens
const FOLIAGE = [
  { cx: 42, cy: 58, r: 17, c: "#39433a" },
  { cx: 252, cy: 46, r: 21, c: "#2f3b3e" },
  { cx: 268, cy: 152, r: 25, c: "#3b4239" },
  { cx: 26, cy: 168, r: 19, c: "#333d3f" },
  { cx: 214, cy: 100, r: 14, c: "#434c40" },
  { cx: 96, cy: 30, r: 12, c: "#2c3639" },
];

export function PortraitInPracticeWidget() {
  const [step, setStep] = useState(0);
  const uid = useId().replace(/:/g, "");

  const shallow = step >= 1;
  const focused = step >= 2;
  const keyed = step >= 3;
  const filled = step >= 4;
  const skinOk = step >= 5;
  const finished = step >= 6;

  const skin = skinOk ? SKIN_WARM : SKIN_COOL;
  // shadow-side multiplier: flat with no key, deep when keyed without fill, moderate with fill
  const shadowMul = !keyed ? 1.0 : filled ? 0.72 : 0.46;
  const litCol = mul(skin, 1.05);
  const shadowCol = mul(skin, shadowMul);
  const bgBlur = shallow ? 7 : 0;

  const s = STEPS[step];

  // eye geometry
  const NEAR_X = 132;
  const FAR_X = 169;
  const EYE_Y = 95;

  const eye = (cx: number, near: boolean) => (
    <g filter={focused && !near ? `url(#bp-soft-${uid})` : undefined}>
      <ellipse cx={cx} cy={EYE_Y} rx={9} ry={5.3} fill="#e7ecec" />
      <circle cx={cx} cy={EYE_Y} r={4.4} fill="#3a4a52" />
      <circle cx={cx} cy={EYE_Y} r={2} fill="#0d1416" />
      {filled && <circle cx={cx - 1.5} cy={EYE_Y - 1.6} r={1.5} fill="#ffffff" />}
    </g>
  );

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* the portrait, assembling */}
        <figure className="sm:w-[56%]">
          <svg
            viewBox="0 0 300 240"
            className="w-full rounded-md border border-border"
            role="img"
            aria-label={`Step ${step} of ${LAST}, ${s.decision}: ${s.gain}.`}
          >
            <defs>
              <clipPath id={`bp-frame-${uid}`}>
                <rect x={0} y={0} width={300} height={240} rx={7} />
              </clipPath>
              <filter id={`bp-bg-${uid}`} x="-20%" y="-20%" width="140%" height="140%">
                <feGaussianBlur stdDeviation={bgBlur} />
              </filter>
              <filter id={`bp-soft-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
                <feGaussianBlur stdDeviation={1} />
              </filter>
              <linearGradient id={`bp-face-${uid}`} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor={litCol} />
                <stop offset="1" stopColor={shadowCol} />
              </linearGradient>
              <radialGradient id={`bp-vig-${uid}`} cx="0.5" cy="0.42" r="0.75">
                <stop offset="55%" stopColor="#000000" stopOpacity={0} />
                <stop offset="100%" stopColor="#000000" stopOpacity={0.5} />
              </radialGradient>
              <radialGradient id={`bp-dodge-${uid}`} cx="0.5" cy="0.5" r="0.5">
                <stop offset="0%" stopColor="#ffffff" stopOpacity={0.14} />
                <stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
              </radialGradient>
            </defs>

            <g clipPath={`url(#bp-frame-${uid})`}>
              {/* background: a wall of foliage that goes to bokeh when the aperture opens */}
              <rect x={0} y={0} width={300} height={240} fill="#232c2e" />
              <g filter={`url(#bp-bg-${uid})`}>
                {FOLIAGE.map((f) => (
                  <circle key={`${f.cx}-${f.cy}`} cx={f.cx} cy={f.cy} r={f.r} fill={f.c} />
                ))}
              </g>

              {/* subject: shoulders, neck, head */}
              <path
                d="M56 240 C60 190 96 172 150 172 C204 172 240 190 244 240 Z"
                fill="#2b353b"
              />
              <path d="M132 150 L132 176 Q150 186 168 176 L168 150 Z" fill={mul(skin, 0.82)} />
              {/* hair behind the head */}
              <path d="M92 96 Q92 34 150 34 Q208 34 208 96 Q208 70 150 66 Q92 70 92 96 Z" fill="#20282b" />
              {/* face */}
              <ellipse cx={150} cy={102} rx={52} ry={62} fill={`url(#bp-face-${uid})`} />
              {/* the shadow-side cheek deepens when a key is placed without fill */}
              {keyed && (
                <path
                  d="M150 62 Q196 74 198 118 Q192 150 168 160 Q182 120 172 84 Q164 68 150 62 Z"
                  fill={shadowCol}
                  fillOpacity={filled ? 0.28 : 0.55}
                />
              )}
              {/* brows */}
              <path d="M123 86 Q132 82 141 86" stroke="#6a5a4c" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
              <path d="M159 86 Q168 82 177 86" stroke="#6a5a4c" strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.7} />
              {/* nose + mouth, quiet */}
              <path d="M150 100 L146 120 Q150 123 154 120" stroke={mul(skin, keyed ? 0.7 : 0.9)} strokeWidth={1.6} fill="none" strokeLinecap="round" />
              <path d="M139 138 Q150 144 161 138" stroke={mul(skin, 0.62)} strokeWidth={2.2} fill="none" strokeLinecap="round" />
              {/* eyes */}
              {eye(NEAR_X, true)}
              {eye(FAR_X, false)}
              {/* eye-detect focus box on the near eye, at capture */}
              {focused && !finished && (
                <g stroke="var(--accent)" strokeWidth={1.3} fill="none">
                  <rect x={NEAR_X - 13} y={EYE_Y - 9} width={26} height={18} rx={2} strokeOpacity={0.85} />
                  <line x1={NEAR_X - 13} y1={EYE_Y} x2={NEAR_X - 9} y2={EYE_Y} />
                  <line x1={NEAR_X + 9} y1={EYE_Y} x2={NEAR_X + 13} y2={EYE_Y} />
                </g>
              )}

              {/* finish: dodge the eyes, burn the edges */}
              {finished && (
                <>
                  <rect x={90} y={72} width={120} height={54} fill={`url(#bp-dodge-${uid})`} />
                  <rect x={0} y={0} width={300} height={240} fill={`url(#bp-vig-${uid})`} />
                </>
              )}
            </g>

            <rect x={0.5} y={0.5} width={299} height={239} rx={7} fill="none" stroke="var(--border)" />
            <text x={12} y={20} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
              {`// step ${step}: ${s.decision}`}
            </text>
          </svg>
        </figure>

        {/* the readout and the one control */}
        <div className="sm:flex-1">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-xs">
            <dt className="text-comment">step</dt>
            <dd className="text-fg">
              {step} <span className="text-comment">/ {LAST}</span>
            </dd>
            <dt className="text-comment">decision</dt>
            <dd className="text-accent">{s.decision}</dd>
            <dt className="text-comment">from</dt>
            <dd className="text-muted">{s.chapter}</dd>
            <dt className="text-comment">it earns</dt>
            <dd className="text-muted">{s.gain}</dd>
          </dl>

          <div className="mt-5">
            <label htmlFor={`bp-step-${uid}`} className="mb-2 block font-mono text-xs text-comment">
              build the portrait, one decision at a time
            </label>
            <input
              id={`bp-step-${uid}`}
              type="range"
              min={0}
              max={LAST}
              step={1}
              value={step}
              onChange={(e) => setStep(Number(e.target.value))}
              aria-label={`Portrait build step, ${step} of ${LAST}: ${s.decision}`}
              className="w-full"
              style={{ accentColor: "var(--accent)" }}
            />
            <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-comment">
              <span>&larr; snapshot</span>
              <span>finished &rarr;</span>
            </div>
          </div>

          <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
            {"// nothing here is a filter. each notch is one earlier chapter, applied on purpose."}
          </p>
        </div>
      </div>
    </div>
  );
}
