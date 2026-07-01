import { useState } from "react";

// ShutterSpeedAndMotionWidget: the signature widget for "Shutter speed and motion".
// One focused interaction: pick a moving subject and a shutter speed, and watch the
// streak the subject's image draws on the sensor grow or collapse. The move that makes
// the chapter click: the smear is not set by the shutter alone. It is the image speed
// (the subject's real speed scaled by magnification f/u) times the open time. So a slow
// portrait freezes at 1/30 while a passing car needs 1/2000, at the SAME framing on the
// SAME lens. The readout names the on-sensor smear in pixels and the slowest shutter
// that still freezes this subject. React state only, no persistence.

// Fixed geometry: the Leica Q3's 28 mm lens on its 60 MP full-frame sensor. That pins
// the two conversions the smear depends on, so the reader changes only shutter and
// subject and sees the law, not a wall of dials.
const FOCAL = 28; // mm, the Q3's fixed lens
const PITCH = 36 / 9520; // mm per pixel: full-frame 36 mm wide over 9520 px ≈ 0.00378 mm

// Verdicts, in on-sensor pixels. Tuned to a sharp-at-normal-viewing threshold, which is
// roughly where the published freeze-speed tables sit for this framing.
const FROZEN = 12;
const SOFT = 40;

interface Subject {
  key: string;
  label: string;
  v: number; // real speed across the frame, m/s
  u: number; // distance, m (also sets how big it sits in a 28 mm frame)
}

const SUBJECTS: Subject[] = [
  { key: "still", label: "still portrait", v: 0.05, u: 1.5 },
  { key: "walk", label: "walking", v: 1.4, u: 4 },
  { key: "child", label: "running child", v: 4, u: 5 },
  { key: "cyclist", label: "cyclist", v: 8, u: 6 },
  { key: "car", label: "passing car", v: 14, u: 8 },
];

// Standard full-stop shutter series, slow (left) to fast (right).
const SHUTTERS = [15, 30, 60, 125, 250, 500, 1000, 2000, 4000];
const LAST = SHUTTERS.length - 1;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// The core law: smear on the sensor = magnification (f/u) × real motion (v·t), in pixels.
function smearPx(s: Subject, denom: number): number {
  const t = 1 / denom; // s
  const m = FOCAL / (s.u * 1000); // f/u, both in mm
  const dispMm = m * (s.v * 1000) * t; // image displacement on the sensor, mm
  return dispMm / PITCH;
}

// The slowest shutter in the series that still freezes this subject (smear <= FROZEN).
function freezeLabel(s: Subject): string {
  for (const denom of SHUTTERS) {
    if (smearPx(s, denom) <= FROZEN) return `1/${denom}`;
  }
  return "faster than 1/4000";
}

export function ShutterSpeedAndMotionWidget() {
  const [subjectKey, setSubjectKey] = useState("cyclist");
  const [shIndex, setShIndex] = useState(4); // 1/250

  const subject = SUBJECTS.find((s) => s.key === subjectKey) as Subject;
  const denom = SHUTTERS[shIndex];
  const smear = smearPx(subject, denom);

  const verdict = smear <= FROZEN ? "frozen" : smear <= SOFT ? "soft" : "streaked";
  const verdictColor =
    verdict === "frozen" ? "text-accent" : verdict === "soft" ? "text-fg" : "text-comment";

  // Scene streak length, scaled from the real pixel smear so it stays on screen.
  const sceneLen = clamp(smear * 1.7, 0, 208);

  return (
    <div className="font-sans">
      {/* the scene: the subject's image and the trail it smears while the shutter is open */}
      <svg
        viewBox="0 0 320 150"
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={`${subject.label} at 1/${denom} second on a 28 mm lens: the image smears about ${smear.toFixed(
          0,
        )} pixels on the 60-megapixel sensor, which reads as ${verdict}.`}
      >
        <rect x="0" y="0" width="320" height="150" fill="var(--surface-2)" />

        {/* a still reference line so the streak reads as motion against something fixed */}
        <line x1="0" y1="118" x2="320" y2="118" stroke="var(--border)" strokeWidth="1" />

        {/* the trail: a comet whose length tracks the on-sensor smear */}
        <rect
          x="92"
          y="67"
          width={sceneLen}
          height="26"
          rx="13"
          fill="url(#trail)"
          style={{ transition: "width 150ms linear" }}
        />
        {/* the subject's image itself, the sharp head of the streak */}
        <circle cx="92" cy="80" r="15" fill="var(--fg)" />
        <circle cx="92" cy="80" r="15" fill="none" stroke="var(--accent)" strokeWidth="1.5" />

        <defs>
          <linearGradient id="trail" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="var(--accent)" stopOpacity="0.75" />
            <stop offset="1" stopColor="var(--accent)" stopOpacity="0.03" />
          </linearGradient>
        </defs>

        <text x="12" y="24" fontFamily="var(--font-mono)" fontSize="11" fill="var(--comment)">
          {subject.label}
        </text>
        <text x="308" y="24" textAnchor="end" fontFamily="var(--font-mono)" fontSize="11" fill="var(--accent)">
          {`1/${denom} s`}
        </text>
      </svg>

      {/* the smear as a length against the sharpness limit: left of the tick reads sharp */}
      <div className="mt-4">
        <div className="mb-1 flex items-baseline justify-between font-mono text-xs">
          <span className="text-comment">on-sensor smear</span>
          <span className={verdictColor}>{`${smear.toFixed(0)} px · ${verdict}`}</span>
        </div>
        <div className="relative h-2 overflow-hidden rounded-full bg-surface-2">
          <div
            className="absolute left-0 top-0 h-2 rounded-full bg-accent"
            style={{ width: `${clamp((smear / SOFT) * 100, 1, 100)}%`, transition: "width 150ms linear" }}
          />
          {/* the sharpness limit: fill that stops left of this tick is frozen */}
          <div
            className="absolute top-0 h-2 w-px bg-muted"
            style={{ left: `${(FROZEN / SOFT) * 100}%` }}
            aria-hidden="true"
          />
        </div>
        <div className="mt-1 font-mono text-[0.7rem] text-comment">
          {`| sharp limit at ${FROZEN} px`}
        </div>
      </div>

      {/* readouts: the smear, the verdict, and the slowest shutter that freezes this subject */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">this shutter</dt>
        <dd className="text-right text-fg">{`1/${denom} s`}</dd>
        <dt className="text-comment">image smear</dt>
        <dd className="text-right text-fg">{`${smear.toFixed(0)} px`}</dd>
        <dt className="text-comment">to freeze this subject</dt>
        <dd className="text-right text-accent">{`${freezeLabel(subject)} s`}</dd>
      </dl>

      {/* subject: each choice carries a real speed and a framing distance */}
      <div className="mt-5">
        <span className="mb-2 block font-mono text-xs text-comment">subject</span>
        <div className="flex flex-wrap gap-2">
          {SUBJECTS.map((s) => {
            const active = s.key === subjectKey;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setSubjectKey(s.key)}
                aria-pressed={active}
                className={
                  "rounded border px-3 py-1.5 font-mono text-xs transition-colors " +
                  (active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface-2 text-fg hover:border-accent/60")
                }
              >
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* shutter: step along the standard series from slow to fast */}
      <div className="mt-4 flex items-center gap-3">
        <span className="w-20 shrink-0 font-mono text-xs text-accent">shutter</span>
        <button
          type="button"
          onClick={() => setShIndex((v) => clamp(v - 1, 0, LAST))}
          disabled={shIndex === 0}
          aria-label={`Slower shutter (currently 1/${denom} second)`}
          className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          &lt;
        </button>
        <span className="w-16 text-center font-mono text-sm text-fg">{`1/${denom}`}</span>
        <button
          type="button"
          onClick={() => setShIndex((v) => clamp(v + 1, 0, LAST))}
          disabled={shIndex === LAST}
          aria-label={`Faster shutter (currently 1/${denom} second)`}
          className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          &gt;
        </button>
        <span className="hidden font-mono text-[0.7rem] text-comment sm:inline">slow .. fast</span>
      </div>
    </div>
  );
}
