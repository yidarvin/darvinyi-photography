import { useState } from "react";

// LocalAdjustmentsAndMaskingWidget: the signature widget for "Local adjustments and masking".
// One focused interaction: dodge (brighten) the subject and burn (darken) the surround with two
// local sliders, and watch where the eye lands. A reticle snaps to whichever region wins a simple
// attention score, and three bars show how attention is split. The lesson is the reason dodge and
// burn works at all: the eye is pulled to the brightest, highest-contrast region of the frame, so
// local tone is a way to point at the subject. React state only, no persistence.
//
// The scene is deliberately grayscale. Dodging and burning is a tonal operation, and stripping
// color isolates the one variable that drives attention here: luminance and its local contrast.
//
// Attention model (an honest heuristic, not a full saliency model): each region's score is its
// luminance times a term that grows with how much it contrasts against the rest of the frame,
//   score = L * (0.5 + 1.5 * |L - mean(other regions)|).
// Luminance leads, contrast amplifies. That matches the photographer's rule of thumb: the eye
// goes to the bright, high-contrast area. Dodge the subject and burn the surround and the subject
// wins; burn the subject and the eye leaves it for the bright sky.

type RegionKey = "subject" | "ground" | "sky";

interface Scored {
  key: RegionKey;
  label: string;
  score: number;
}

const clampL = (l: number) => Math.max(0.05, Math.min(0.98, l));
const gray = (l: number) => {
  const v = Math.round(clampL(l) * 255);
  return `rgb(${v}, ${v}, ${v})`;
};

const BASE = { subject: 0.42, ground: 0.44, sky: 0.6 };

const PRESETS = [
  { key: "flat", label: "flat (no local edits)", subject: 0, surround: 0 },
  { key: "dodgeburn", label: "dodge subject, burn surround", subject: 62, surround: -50 },
  { key: "burnsubject", label: "burn the subject", subject: -62, surround: 0 },
];

// Region centroids in the scene's viewBox (0 0 260 170), chosen so the reticle lands somewhere
// characteristic when each region wins: on the figure, off in the bright sky, or down in the ground.
const CENTROIDS: Record<RegionKey, { cx: number; cy: number }> = {
  subject: { cx: 130, cy: 104 },
  sky: { cx: 202, cy: 40 },
  ground: { cx: 52, cy: 142 },
};

function scoreRegions(subjectEV: number, surroundEV: number): Scored[] {
  const L: Record<RegionKey, number> = {
    subject: clampL(BASE.subject + (subjectEV / 100) * 0.5),
    ground: clampL(BASE.ground + (surroundEV / 100) * 0.5),
    sky: clampL(BASE.sky + (surroundEV / 100) * 0.5),
  };
  const keys: RegionKey[] = ["subject", "ground", "sky"];
  const labels: Record<RegionKey, string> = { subject: "subject", ground: "background", sky: "sky" };
  return keys.map((k) => {
    const others = keys.filter((o) => o !== k);
    const meanOthers = (L[others[0]] + L[others[1]]) / 2;
    const contrast = Math.abs(L[k] - meanOthers);
    // luminance leads, local contrast amplifies: the bright, high-contrast region wins the eye.
    const score = L[k] * (0.5 + 1.5 * contrast);
    return { key: k, label: labels[k], score };
  });
}

export function LocalAdjustmentsAndMaskingWidget() {
  const [subjectEV, setSubjectEV] = useState(0);
  const [surroundEV, setSurroundEV] = useState(0);
  const [showMask, setShowMask] = useState(false);

  const subjectL = clampL(BASE.subject + (subjectEV / 100) * 0.5);
  const skyL = clampL(BASE.sky + (surroundEV / 100) * 0.5);
  const groundL = clampL(BASE.ground + (surroundEV / 100) * 0.5);

  const scored = scoreRegions(subjectEV, surroundEV);
  const total = scored.reduce((s, r) => s + r.score, 0) || 1;
  const shares = scored.map((r) => ({ key: r.key, label: r.label, share: r.score / total }));
  const winner = shares.reduce((a, b) => (b.share > a.share ? b : a));
  const subjectShare = shares.find((s) => s.key === "subject")!.share;
  const reticle = CENTROIDS[winner.key];

  const activePreset = PRESETS.find((p) => p.subject === subjectEV && p.surround === surroundEV);

  let verdict: string;
  if (winner.key === "subject" && subjectShare > 0.5) {
    verdict = "The eye locks on the subject.";
  } else if (winner.key === "subject") {
    verdict = "The subject leads, but the frame is still competing for it.";
  } else if (subjectEV <= -20) {
    verdict = `You burned the subject. The eye leaves it for the ${winner.label}.`;
  } else {
    verdict = `Attention drifts to the ${winner.label}, not the subject.`;
  }

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* the scene: a grayscale frame you dodge and burn */}
        <div className="lg:w-[52%]">
          <p className="mb-2 font-mono text-xs text-comment">{"// grayscale on purpose: tone is the only variable here"}</p>
          <svg
            viewBox="0 0 260 170"
            className="w-full rounded-md border border-border bg-surface-2"
            role="img"
            aria-label={`A grayscale scene of a person under a sky. Subject brightness ${subjectEV > 0 ? "raised" : subjectEV < 0 ? "lowered" : "at base"}, surround ${surroundEV > 0 ? "raised" : surroundEV < 0 ? "lowered" : "at base"}. Attention currently on the ${winner.label}.`}
          >
            <clipPath id="lasw-frame">
              <rect x={1} y={1} width={258} height={168} rx={6} />
            </clipPath>
            <g clipPath="url(#lasw-frame)">
              <rect x={0} y={0} width={260} height={95} fill={gray(skyL)} />
              <rect x={0} y={95} width={260} height={75} fill={gray(groundL)} />
              {/* the person */}
              <circle cx={130} cy={72} r={15} fill={gray(subjectL)} />
              <path d="M108 170 L116 96 Q130 82 144 96 L152 170 Z" fill={gray(subjectL)} />

              {showMask && (
                <>
                  <rect x={0} y={0} width={260} height={170} fill="var(--bg)" opacity={0.55} />
                  <g>
                    <circle cx={130} cy={72} r={15} fill="var(--accent)" opacity={0.38} />
                    <path d="M108 170 L116 96 Q130 82 144 96 L152 170 Z" fill="var(--accent)" opacity={0.38} />
                    <circle cx={130} cy={72} r={15} fill="none" stroke="var(--accent)" strokeWidth={1.4} strokeDasharray="4 3" />
                    <path d="M108 170 L116 96 Q130 82 144 96 L152 170 Z" fill="none" stroke="var(--accent)" strokeWidth={1.4} strokeDasharray="4 3" />
                  </g>
                </>
              )}
            </g>
            <rect x={1} y={1} width={258} height={168} rx={6} fill="none" stroke="var(--border)" />

            {/* the reticle: where the eye lands */}
            {!showMask && (
              <g>
                <circle cx={reticle.cx} cy={reticle.cy} r={16} fill="none" stroke="var(--accent)" strokeWidth={1.6} />
                <line x1={reticle.cx} y1={reticle.cy - 22} x2={reticle.cx} y2={reticle.cy - 10} stroke="var(--accent)" strokeWidth={1.6} />
                <line x1={reticle.cx} y1={reticle.cy + 10} x2={reticle.cx} y2={reticle.cy + 22} stroke="var(--accent)" strokeWidth={1.6} />
                <line x1={reticle.cx - 22} y1={reticle.cy} x2={reticle.cx - 10} y2={reticle.cy} stroke="var(--accent)" strokeWidth={1.6} />
                <line x1={reticle.cx + 10} y1={reticle.cy} x2={reticle.cx + 22} y2={reticle.cy} stroke="var(--accent)" strokeWidth={1.6} />
              </g>
            )}
            {showMask && (
              <text x={130} y={162} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
                subject mask · the where
              </text>
            )}
          </svg>

          <button
            type="button"
            onClick={() => setShowMask((v) => !v)}
            aria-pressed={showMask}
            className={
              "mt-3 rounded border px-2.5 py-1 font-mono text-[0.7rem] transition-colors " +
              (showMask
                ? "border-accent bg-accent/10 text-accent"
                : "border-border bg-surface-2 text-muted hover:border-accent/60 hover:text-accent")
            }
          >
            {showMask ? "hide mask" : "show mask"}
          </button>
        </div>

        {/* the controls and the readout */}
        <div className="lg:flex-1">
          <div className="space-y-4">
            <label className="block">
              <span className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-comment">subject · dodge / burn</span>
                <span className={subjectEV > 0 ? "text-accent" : "text-muted"}>{subjectEV > 0 ? `+${subjectEV}` : subjectEV}</span>
              </span>
              <input
                type="range"
                min={-100}
                max={100}
                value={subjectEV}
                onChange={(e) => setSubjectEV(Number(e.target.value))}
                aria-label="Subject local exposure, dodge to the right, burn to the left"
                className="mt-1 w-full accent-accent"
              />
            </label>
            <label className="block">
              <span className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-comment">surround · sky + background</span>
                <span className={surroundEV < 0 ? "text-accent" : "text-muted"}>{surroundEV > 0 ? `+${surroundEV}` : surroundEV}</span>
              </span>
              <input
                type="range"
                min={-100}
                max={100}
                value={surroundEV}
                onChange={(e) => setSurroundEV(Number(e.target.value))}
                aria-label="Surround local exposure, dodge to the right, burn to the left"
                className="mt-1 w-full accent-accent"
              />
            </label>
          </div>

          {/* where the eye goes, as three bars */}
          <div className="mt-5 space-y-1.5">
            <p className="font-mono text-[0.7rem] text-comment">{"// attention, split across the frame"}</p>
            {shares.map((s) => (
              <div key={s.key} className="flex items-center gap-2 font-mono text-[0.7rem]">
                <span className={"w-20 shrink-0 " + (s.key === winner.key ? "text-accent" : "text-muted")}>{s.label}</span>
                <span className="h-2 flex-1 overflow-hidden rounded-full bg-surface-2">
                  <span
                    className={"block h-full rounded-full " + (s.key === winner.key ? "bg-accent" : "bg-accent-dim")}
                    style={{ width: `${Math.round(s.share * 100)}%` }}
                  />
                </span>
                <span className={"w-8 shrink-0 text-right " + (s.key === winner.key ? "text-accent" : "text-muted")}>{Math.round(s.share * 100)}%</span>
              </div>
            ))}
          </div>

          <p className="mt-4 font-mono text-xs leading-relaxed text-fg/90">{verdict}</p>

          {/* presets: the classic move and its inverse */}
          <div className="mt-4 flex flex-wrap gap-2">
            {PRESETS.map((p) => {
              const active = activePreset?.key === p.key;
              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => {
                    setSubjectEV(p.subject);
                    setSurroundEV(p.surround);
                  }}
                  aria-pressed={active}
                  className={
                    "rounded border px-2.5 py-1 font-mono text-[0.7rem] transition-colors " +
                    (active
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-surface-2 text-muted hover:border-accent/60 hover:text-accent")
                  }
                >
                  {p.label}
                </button>
              );
            })}
          </div>

          <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
            {"// the eye favors the bright, high-contrast area. dodge the subject, burn the surround, and it points itself."}
          </p>
        </div>
      </div>
    </div>
  );
}
