import { useEffect, useId, useState } from "react";

// StreetAndDocumentaryWidget: the signature widget for "Street and documentary".
// One focused interaction: scrub a single figure across a framed gap and hunt for the
// one instant the picture snaps together, the walker centred between two pillars on an
// open stride. Everything else about the shot is pre-decided and shown locked (the
// exposure, the zone focus, the 28mm frame); the ONLY live variable is the moment. The
// score strip under the slider reveals how narrow the window is: a spike, not a plateau.
// That narrowness is the whole point of the decisive moment, and why you anticipate it
// rather than react to it. React state only, no persistence. Motion is opt-in (a play
// button), and it is hidden when the reader prefers reduced motion.

// the shape of the moment: position centred in the gap, times an open stride.
const posScore = (t: number) => Math.exp(-Math.pow((t - 0.5) / 0.1, 2));
const legSpread = (t: number) => Math.abs(Math.sin(t * 4 * Math.PI + Math.PI / 2));
const frameScore = (t: number) => posScore(t) * (0.45 + 0.55 * legSpread(t));

function verdict(t: number, score: number): { label: string; tone: "good" | "near" | "off" } {
  if (score >= 0.85) return { label: "the decisive frame", tone: "good" };
  if (score >= 0.55) return { label: "almost, keep watching", tone: "near" };
  if (t < 0.5) return { label: "too early", tone: "off" };
  return { label: "the moment is gone", tone: "off" };
}

// walker head travels from x=34 to x=286; the gap is centred on x=160.
const walkX = (t: number) => 34 + t * 252;
const GROUND_Y = 188;

function Walker({ t }: { t: number }) {
  const x = walkX(t);
  const spread = 3 + 10 * legSpread(t);
  return (
    <g stroke="#090c0d" strokeWidth={2.4} strokeLinecap="round" fill="none">
      <circle cx={x} cy={150} r={6.5} fill="#090c0d" stroke="none" />
      <line x1={x} y1={156} x2={x} y2={173} />
      <line x1={x} y1={161} x2={x - 7} y2={168} />
      <line x1={x} y1={161} x2={x + 7} y2={166} />
      <line x1={x} y1={173} x2={x - spread} y2={GROUND_Y} />
      <line x1={x} y1={173} x2={x + spread} y2={GROUND_Y} />
    </g>
  );
}

export function StreetAndDocumentaryWidget() {
  const uid = useId().replace(/:/g, "");
  const [pct, setPct] = useState(28); // slider 0..100
  const [shot, setShot] = useState<number | null>(null);
  const [playing, setPlaying] = useState(false);
  const [reduced, setReduced] = useState(false);

  const t = pct / 100;
  const score = frameScore(t);
  const v = verdict(t, score);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const set = () => setReduced(mq.matches);
    set();
    mq.addEventListener("change", set);
    return () => mq.removeEventListener("change", set);
  }, []);

  // opt-in playback: advance the moment automatically, then stop at the end.
  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => {
      setPct((p) => {
        if (p >= 100) return 100;
        return p + 2;
      });
    }, 55);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (playing && pct >= 100) setPlaying(false);
  }, [playing, pct]);

  const startPlay = () => {
    setShot(null);
    setPct(0);
    setPlaying(true);
  };

  const toneClass = v.tone === "good" ? "text-accent" : v.tone === "near" ? "text-fg" : "text-muted";

  // the gap frame warms toward the accent as the picture aligns.
  const alignStroke = score >= 0.85 ? "var(--accent)" : score >= 0.55 ? "var(--accent-dim)" : "var(--border)";

  // score curve for the strip under the slider (samples across the whole timeline).
  const samples = Array.from({ length: 51 }, (_, i) => i / 50);
  const curve = samples.map((s) => `${s * 100},${22 - frameScore(s) * 20}`).join(" ");

  const shotScore = shot === null ? null : frameScore(shot / 100);
  const shotV = shot === null ? null : verdict(shot / 100, shotScore as number);

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* the framed street, with the walker crossing the gap */}
        <figure className="sm:w-[56%]">
          <svg
            viewBox="0 0 320 210"
            className="w-full rounded-md border border-border"
            role="img"
            aria-label={`Scrubbing the moment, ${Math.round(t * 100)} percent across: ${v.label}.`}
          >
            <defs>
              <clipPath id={`sd-frame-${uid}`}>
                <rect x={0} y={0} width={320} height={210} rx={7} />
              </clipPath>
              <linearGradient id={`sd-door-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#3a4c50" />
                <stop offset="1" stopColor="#27353a" />
              </linearGradient>
            </defs>

            <g clipPath={`url(#sd-frame-${uid})`}>
              {/* wall and ground */}
              <rect x={0} y={0} width={320} height={210} fill="#182124" />
              <rect x={0} y={GROUND_Y} width={320} height={210 - GROUND_Y} fill="#0e1417" />

              {/* the lit doorway between the pillars: the stage the moment plays on */}
              <rect x={112} y={40} width={96} height={GROUND_Y - 40} fill={`url(#sd-door-${uid})`} />
              {score >= 0.85 && (
                <rect x={112} y={40} width={96} height={GROUND_Y - 40} fill="var(--accent)" fillOpacity={0.1} />
              )}

              {/* the walker's soft shadow, longest and centred at the decisive instant */}
              <ellipse cx={walkX(t)} cy={GROUND_Y + 3} rx={16} ry={4} fill="#000000" fillOpacity={0.35} />

              {/* the two foreground pillars that frame the gap */}
              <rect x={92} y={28} width={20} height={GROUND_Y - 28} fill="#0c1114" stroke="var(--border)" />
              <rect x={208} y={28} width={20} height={GROUND_Y - 28} fill="#0c1114" stroke="var(--border)" />

              {/* the moment, crossing */}
              <Walker t={t} />

              {/* the gap frame, warming toward the accent as the picture aligns */}
              <rect x={112} y={40} width={96} height={GROUND_Y - 40} fill="none" stroke={alignStroke} strokeWidth={score >= 0.55 ? 1.6 : 1} />
              {score >= 0.85 && (
                <path d={`M 160 46 l 6 7 l -6 7 l -6 -7 z`} fill="var(--accent)" />
              )}
            </g>

            <rect x={0.5} y={0.5} width={319} height={209} rx={7} fill="none" stroke="var(--border)" />
            <text x={12} y={20} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
              {`// ${v.label}`}
            </text>
          </svg>
        </figure>

        {/* the readiness panel and the one live control */}
        <div className="sm:flex-1">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-xs">
            <dt className="text-comment">exposure</dt>
            <dd className="text-muted">f/8 · 1/500 · ISO 400 <span className="text-comment">locked</span></dd>
            <dt className="text-comment">focus</dt>
            <dd className="text-muted">zone 1.6 m–∞ <span className="text-comment">locked</span></dd>
            <dt className="text-comment">frame</dt>
            <dd className="text-muted">28 mm · f/8 <span className="text-comment">locked</span></dd>
            <dt className="text-comment">the moment</dt>
            <dd className={toneClass}>{v.label}</dd>
            <dt className="text-comment">alignment</dt>
            <dd className="text-muted">{Math.round(score * 100)}%</dd>
          </dl>

          <div className="mt-5">
            <label htmlFor={`sd-t-${uid}`} className="mb-2 block font-mono text-xs text-comment">
              scrub time to find the frame
            </label>
            <input
              id={`sd-t-${uid}`}
              type="range"
              min={0}
              max={100}
              step={1}
              value={pct}
              onChange={(e) => {
                setPlaying(false);
                setPct(Number(e.target.value));
              }}
              aria-label={`Scrub the moment, ${pct} percent across the walk: ${v.label}`}
              className="w-full"
              style={{ accentColor: "var(--accent)" }}
            />

            {/* the score strip: the window is a spike, not a plateau */}
            <svg viewBox="0 0 100 24" preserveAspectRatio="none" className="mt-1 h-6 w-full" aria-hidden="true">
              <rect x={0} y={0} width={100} height={24} fill="var(--surface-2)" />
              {samples.map((s) =>
                frameScore(s) >= 0.85 ? (
                  <rect key={s} x={s * 100 - 1} y={0} width={2} height={24} fill="var(--accent)" fillOpacity={0.22} />
                ) : null
              )}
              <polyline points={curve} fill="none" stroke="var(--accent)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
              <line x1={pct} y1={0} x2={pct} y2={24} stroke="var(--fg)" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            </svg>
            <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-comment">
              <span>the window is narrow</span>
              <span>{pct}%</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setShot(pct)}
              className="rounded border border-accent/50 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent/20"
            >
              press the shutter
            </button>
            {!reduced && (
              <button
                onClick={startPlay}
                disabled={playing}
                className="rounded border border-border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-surface-2 disabled:opacity-50"
              >
                {playing ? "the scene runs…" : "let it run"}
              </button>
            )}
          </div>

          {shotV && (
            <p className="mt-3 font-mono text-xs">
              <span className="text-comment">{"// your frame: "}</span>
              <span className={shotV.tone === "good" ? "text-accent" : shotV.tone === "near" ? "text-fg" : "text-muted"}>
                {shotV.label}
              </span>
              <span className="text-comment">{` · ${Math.round((shotScore as number) * 100)}% aligned`}</span>
            </p>
          )}

          <p className="mt-3 font-mono text-[0.7rem] leading-relaxed text-comment">
            {"// everything but the moment is locked. the moment is the one thing you cannot pre-decide."}
          </p>
        </div>
      </div>
    </div>
  );
}
