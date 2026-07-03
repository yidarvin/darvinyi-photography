import { useEffect, useState } from "react";

// MeteringAndExposureDecisionsWidget: the signature widget for "Metering and the exposure decision".
// One focused interaction: the exposure-compensation dial, run against a scene the meter misjudges.
// A reflected meter always exposes so the scene's average renders as middle gray, which is drawn here
// as the 0 EV baseline. Pick a snowfield and at 0 EV the snow comes out a muddy gray; pick a black cat
// and it comes out washed. The one move that makes the idea click is turning the compensation dial
// until the subject sits at its true tone, watching both the rendered scene and its live histogram
// slide with you, and seeing the highlights clip when you push a bright scene too far. React state
// only, no persistence.

type Region = { name: string; x: number; y: number; w: number; h: number; trueTone: number; weight: number };
type Scene = { key: string; label: string; subject: string; regions: Region[] };

// Each scene is a few tonal regions with a TRUE tone (0..100) and an area weight. The meter's job is to
// make the weighted average render as middle gray (50). The exposure shift needed to instead render
// every region at its true tone is what the dial is hunting for.
const SCENES: Scene[] = [
  {
    key: "neutral",
    label: "gray street",
    subject: "the scene",
    regions: [
      { name: "sky", x: 0, y: 0, w: 300, h: 52, trueTone: 60, weight: 0.32 },
      { name: "wall", x: 0, y: 52, w: 300, h: 58, trueTone: 48, weight: 0.43 },
      { name: "road", x: 0, y: 110, w: 300, h: 40, trueTone: 38, weight: 0.25 },
    ],
  },
  {
    key: "snow",
    label: "snowfield",
    subject: "the snow",
    regions: [
      { name: "sky", x: 0, y: 0, w: 300, h: 50, trueTone: 74, weight: 0.28 },
      { name: "snow", x: 0, y: 50, w: 300, h: 100, trueTone: 88, weight: 0.6 },
      { name: "tree", x: 232, y: 40, w: 26, h: 74, trueTone: 30, weight: 0.12 },
    ],
  },
  {
    key: "backlit",
    label: "backlit portrait",
    subject: "the face",
    regions: [
      { name: "window", x: 0, y: 0, w: 300, h: 150, trueTone: 96, weight: 0.6 },
      { name: "body", x: 108, y: 62, w: 84, h: 88, trueTone: 28, weight: 0.28 },
      { name: "face", x: 124, y: 34, w: 52, h: 44, trueTone: 50, weight: 0.12 },
    ],
  },
  {
    key: "lowkey",
    label: "black cat",
    subject: "the cat",
    regions: [
      { name: "bg", x: 0, y: 0, w: 300, h: 150, trueTone: 12, weight: 0.45 },
      { name: "cat", x: 66, y: 30, w: 176, h: 120, trueTone: 20, weight: 0.5 },
      { name: "eye", x: 120, y: 62, w: 16, h: 12, trueTone: 68, weight: 0.05 },
    ],
  },
];

const STOP = 18; // tone units per stop of light, on the 0..100 rendering scale
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

function sceneAverage(s: Scene): number {
  const wsum = s.regions.reduce((a, r) => a + r.weight, 0);
  return s.regions.reduce((a, r) => a + r.weight * r.trueTone, 0) / wsum;
}

// grayscale fill from a 0..100 tone
function toneFill(tone: number): string {
  const v = Math.round(clamp(tone, 0, 100) * 2.55);
  const h = v.toString(16).padStart(2, "0");
  return `#${h}${h}${h}`;
}

function formatEV(ev: number): string {
  const r = Math.round(ev * 10) / 10;
  if (r === 0) return "0.0 EV";
  return `${r > 0 ? "+" : ""}${r.toFixed(1)} EV`;
}

function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

const NBINS = 48;

export function MeteringAndExposureDecisionsWidget() {
  const [sceneKey, setSceneKey] = useState<string>("snow");
  const [evThirds, setEvThirds] = useState(0); // exposure compensation in thirds of a stop
  const reduced = usePrefersReducedMotion();

  const scene = SCENES.find((s) => s.key === sceneKey) ?? SCENES[0];
  const ev = evThirds / 3;
  const avg = sceneAverage(scene);
  const target = (avg - 50) / STOP; // the compensation that renders every region true

  // The exposure shift applied to every region's true tone. At ev=0 the average lands on 50 (the meter
  // makes it gray); at ev=target the shift is zero and every region renders true.
  const shift = 50 - avg + ev * STOP;
  const rendered = scene.regions.map((r) => ({ ...r, tone: r.trueTone + shift }));

  const highClip = rendered.some((r) => r.tone >= 100);
  const lowClip = rendered.some((r) => r.tone <= 0);

  // Live histogram: each region spreads its area weight as a small gaussian around its rendered tone,
  // and anything driven past an edge piles into the edge bin, which is what clipping looks like.
  const sigma = 4.2;
  const bins = new Array(NBINS).fill(0);
  for (const r of rendered) {
    const center = clamp(r.tone, 0, 100);
    for (let i = 0; i < NBINS; i++) {
      const t = (i / (NBINS - 1)) * 100;
      bins[i] += r.weight * Math.exp(-((t - center) ** 2) / (2 * sigma * sigma));
    }
  }
  const binMax = Math.max(...bins, 1e-6);

  const diff = ev - target;
  const placed = Math.abs(diff) <= 0.34;
  let verdict: string;
  let verdictClass: string;
  if (placed) {
    verdict = `tone placed: ${scene.subject} reads true`;
    verdictClass = "text-accent";
  } else if (diff > 0.34) {
    verdict = highClip ? "highlights clipping" : `${scene.subject} washes out`;
    verdictClass = "text-danger";
  } else {
    verdict = lowClip ? "shadows crushed" : `${scene.subject} goes muddy gray`;
    verdictClass = "text-danger";
  }

  const fillTransition = reduced ? undefined : "fill 140ms linear";

  function pickScene(key: string) {
    setSceneKey(key);
    setEvThirds(0); // land on the meter's guess so the reader starts from the mistake
  }

  return (
    <div className="font-sans">
      {/* the rendered scene: every region tinted by the current exposure */}
      <svg
        viewBox="0 0 300 150"
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={`The ${scene.label} scene rendered at ${formatEV(
          ev,
        )} of exposure compensation. At zero the meter renders the scene average as middle gray. ${
          placed ? `${scene.subject} now reads at its true tone.` : verdict + "."
        }`}
      >
        {rendered.map((r) => (
          <rect
            key={r.name}
            x={r.x}
            y={r.y}
            width={r.w}
            height={r.h}
            style={{ fill: toneFill(r.tone), transition: fillTransition }}
          />
        ))}
        {/* name the subject region so the lesson has a target */}
        <text x={10} y={140} fontFamily="var(--font-mono)" fontSize="9" fill={avg > 55 ? "#111" : "var(--fg-muted)"}>
          {scene.label}
        </text>
      </svg>

      {/* live histogram: shadows on the left, highlights on the right */}
      <div className="mt-3">
        <svg
          viewBox="0 0 300 70"
          className="w-full rounded-md border border-border bg-surface-2"
          role="img"
          aria-label={`Histogram of the rendered scene. ${
            highClip ? "Highlights are clipping against the right edge. " : ""
          }${lowClip ? "Shadows are clipping against the left edge. " : ""}`}
        >
          {/* middle-gray reference */}
          <line x1={150} y1={6} x2={150} y2={60} stroke="var(--border)" strokeWidth={1} strokeDasharray="2 3" />
          {bins.map((b, i) => {
            const bw = 300 / NBINS;
            const h = (b / binMax) * 52;
            const atRight = i === NBINS - 1 && highClip;
            const atLeft = i === 0 && lowClip;
            const clipped = atRight || atLeft;
            return (
              <rect
                key={i}
                x={i * bw + 0.5}
                y={60 - h}
                width={bw - 1}
                height={h}
                style={{ fill: clipped ? "var(--danger)" : "var(--accent)", transition: reduced ? undefined : "height 140ms linear, y 140ms linear" }}
                opacity={clipped ? 0.9 : 0.7}
              />
            );
          })}
          <line x1={0} y1={60} x2={300} y2={60} stroke="var(--border)" strokeWidth={1} />
          <text x={4} y={12} fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
            shadows
          </text>
          <text x={296} y={12} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
            highlights
          </text>
        </svg>
      </div>

      {/* the one dial: exposure compensation */}
      <div className="mt-5">
        <div className="mb-1 flex items-baseline justify-between font-mono text-xs">
          <span className="text-comment">exposure compensation</span>
          <span className={placed ? "text-accent" : "text-fg"}>{formatEV(ev)}</span>
        </div>
        <input
          type="range"
          min={-9}
          max={9}
          step={1}
          value={evThirds}
          onChange={(e) => setEvThirds(Number(e.target.value))}
          aria-label="Exposure compensation in thirds of a stop"
          className="w-full accent-accent"
        />
        <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-comment">
          <span>-3</span>
          <span>0 = meter&apos;s guess</span>
          <span>+3</span>
        </div>
      </div>

      {/* readouts */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">meter suggests</dt>
        <dd className="text-right text-fg">0.0 EV</dd>
        <dt className="text-comment">you set</dt>
        <dd className="text-right text-fg">{formatEV(ev)}</dd>
        <dt className="text-comment">this scene wants</dt>
        <dd className="text-right text-fg">{`about ${formatEV(target)}`}</dd>
        <dt className="text-comment">verdict</dt>
        <dd className={"text-right " + verdictClass}>{verdict}</dd>
      </dl>

      {/* scene selector */}
      <div className="mt-5">
        <span className="mb-2 block font-mono text-xs text-comment">pick a scene to test (gray street is the control the meter gets right)</span>
        <div className="flex flex-wrap gap-2">
          {SCENES.map((s) => {
            const active = s.key === sceneKey;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => pickScene(s.key)}
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
    </div>
  );
}
