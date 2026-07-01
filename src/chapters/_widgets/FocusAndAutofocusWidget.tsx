import { useEffect, useRef, useState } from "react";

// FocusAndAutofocusWidget: the signature widget for "Focus and autofocus".
// One focused interaction: a subject sits out of focus, and you press one button to let the camera
// find it. The move that makes the idea click is watching HOW each system gets there. Contrast
// detection can only read how much fine detail the lens is projecting, so it has to step, watch the
// number, and overshoot the peak before it knows it arrived. That is the hunt, and it gets worse in
// low light where the reading is noisy. Phase detection reads the direction and distance of the
// error in a single measurement, so it moves once and locks. Flip the method and the light and press
// focus: the image is the same, the path to it is not. React state only, no persistence.

const START = 15; // lens starts far from focus, on a 0..100 dial
const TARGET = 78; // the in-focus position

type Method = "contrast" | "phase";

// The path of lens positions each system visits to reach focus. Contrast climbs blind and overshoots
// (and wanders more in low light); phase moves essentially once. Curated so the comparison is honest
// and the build is deterministic.
function focusPath(method: Method, lowLight: boolean): number[] {
  if (method === "phase") {
    return lowLight ? [START, 74, TARGET] : [START, TARGET];
  }
  return lowLight
    ? [START, 7, 26, 45, 63, 82, 91, 72, TARGET] // wrong first probe, climb, overshoot, back, settle
    : [START, 35, 54, 73, 88, TARGET]; // climb, overshoot at 88, settle back to 78
}

const easeInOut = (t: number) => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

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

export function FocusAndAutofocusWidget() {
  const [method, setMethod] = useState<Method>("contrast");
  const [lowLight, setLowLight] = useState(false);
  const [pos, setPos] = useState(START);
  const [running, setRunning] = useState(false);
  const [settled, setSettled] = useState(false);
  const [stats, setStats] = useState<{ moves: number; method: Method } | null>(null);
  const pathRef = useRef<number[]>([START, TARGET]);
  const reduced = usePrefersReducedMotion();

  // Run the animation whenever `running` flips true: sweep the lens along the stored path, one
  // segment per ~fixed slice of time, easing each step so the motion reads as deliberate.
  useEffect(() => {
    if (!running) return;
    const p = pathRef.current;
    if (!p || p.length < 2) {
      setPos(TARGET);
      setRunning(false);
      setSettled(true);
      return;
    }
    const per = 260;
    const total = per * (p.length - 1);
    const t0 = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const u = Math.min((now - t0) / total, 1);
      const f = u * (p.length - 1);
      const idx = clamp(Math.floor(f), 0, p.length - 2);
      const val = p[idx] + (p[idx + 1] - p[idx]) * easeInOut(f - idx);
      setPos(Number.isFinite(val) ? val : TARGET);
      if (u < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPos(p[p.length - 1]);
        setRunning(false);
        setSettled(true);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  function runFocus() {
    if (running) return;
    const p = focusPath(method, lowLight);
    pathRef.current = p;
    setStats({ moves: p.length - 1, method });
    setSettled(false);
    if (reduced) {
      setPos(TARGET);
      setSettled(true);
      return;
    }
    setPos(START);
    setRunning(true);
  }

  function reset(next: Partial<{ method: Method; lowLight: boolean }>) {
    if (running) return;
    if (next.method !== undefined) setMethod(next.method);
    if (next.lowLight !== undefined) setLowLight(next.lowLight);
    setPos(START);
    setSettled(false);
    setStats(null);
  }

  // Gaussian blur grows with how far the plane sits from focus. Guard against any non-finite frame
  // so the SVG filter never receives a NaN stdDeviation.
  const defocus = Number.isFinite(pos) ? Math.abs(pos - TARGET) : 0;
  const blur = +(defocus * 0.14).toFixed(2);
  const status = running ? "hunting..." : settled ? "in focus" : "out of focus";
  const statusColor = settled && !running ? "text-accent" : running ? "text-fg" : "text-comment";

  return (
    <div className="font-sans">
      {/* the subject: fine vertical detail plus an eye, smeared by the current defocus */}
      <svg
        viewBox="0 0 300 150"
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={`A subject rendered with ${defocus < 1 ? "no" : "some"} defocus blur. The lens is at position ${pos.toFixed(
          0,
        )} of 100, and focus is at ${TARGET}. Status: ${status}.`}
      >
        <defs>
          <filter id="defocus-blur" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation={blur} />
          </filter>
        </defs>
        <rect x="0" y="0" width="300" height="150" fill="var(--surface-2)" />
        <g filter="url(#defocus-blur)">
          {/* a resolution chart: fine detail is the first thing defocus destroys */}
          {Array.from({ length: 22 }, (_, i) => (
            <rect key={i} x={14 + i * 6} y={22} width={2.6} height={44} fill="var(--comment)" opacity="0.9" />
          ))}
          {/* the subject and its eye, the thing you meant to focus on */}
          <circle cx={214} cy={92} r={34} fill="var(--surface)" stroke="var(--fg-muted)" strokeWidth="2" />
          <circle cx={214} cy={92} r={13} fill="none" stroke="var(--accent)" strokeWidth="3" />
          <circle cx={214} cy={92} r={4} fill="var(--accent)" />
          <text x={82} y={108} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
            fine detail
          </text>
        </g>
      </svg>

      {/* the focus dial: the lens position traveling, with the in-focus mark and the path it took */}
      <div className="mt-4">
        <div className="relative h-9">
          <div className="absolute left-0 right-0 top-1/2 h-px -translate-y-1/2 bg-border" />
          {/* the in-focus target */}
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2" style={{ left: `${TARGET}%` }}>
            <div className="h-4 w-px bg-accent/60" />
          </div>
          {/* the path samples, faint, once a run has happened */}
          {stats &&
            pathRef.current.map((x, i) => (
              <div
                key={i}
                className="absolute top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-muted/40"
                style={{ left: `${x}%` }}
              />
            ))}
          {/* the lens now */}
          <div
            className="absolute top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-accent bg-surface"
            style={{ left: `${clamp(pos, 0, 100)}%`, transition: reduced ? "left 200ms linear" : "none" }}
          />
        </div>
        <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-comment">
          <span>near</span>
          <span>lens position</span>
          <span>far</span>
        </div>
      </div>

      {/* readouts */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">status</dt>
        <dd className={"text-right " + statusColor}>{status}</dd>
        <dt className="text-comment">moves to lock</dt>
        <dd className="text-right text-fg">{stats ? stats.moves : "—"}</dd>
        <dt className="text-comment">what happened</dt>
        <dd className="text-right text-fg">
          {!stats
            ? "—"
            : stats.method === "phase"
              ? "one read, one move"
              : "sampled, overshot, backed up"}
        </dd>
      </dl>

      {/* method: the whole point is same subject, two ways of finding it */}
      <div className="mt-5">
        <span className="mb-2 block font-mono text-xs text-comment">how the camera measures focus</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "contrast", label: "contrast detect" },
              { key: "phase", label: "phase detect" },
            ] as { key: Method; label: string }[]
          ).map((m) => {
            const active = m.key === method;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => reset({ method: m.key })}
                disabled={running}
                aria-pressed={active}
                className={
                  "rounded border px-3 py-1.5 font-mono text-xs transition-colors disabled:opacity-40 " +
                  (active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface-2 text-fg hover:border-accent/60")
                }
              >
                {m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* light + the focus trigger */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => reset({ lowLight: !lowLight })}
          disabled={running}
          aria-pressed={lowLight}
          className={
            "rounded border px-3 py-1.5 font-mono text-xs transition-colors disabled:opacity-40 " +
            (lowLight
              ? "border-accent bg-accent/10 text-accent"
              : "border-border bg-surface-2 text-fg hover:border-accent/60")
          }
        >
          {lowLight ? "low light: on" : "low light: off"}
        </button>
        <button
          type="button"
          onClick={runFocus}
          disabled={running}
          className="rounded border border-accent bg-accent/15 px-4 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent/25 disabled:opacity-40"
        >
          {running ? "focusing..." : "press focus"}
        </button>
        <span className="hidden font-mono text-[0.7rem] text-comment sm:inline">
          {method === "contrast"
            ? lowLight
              ? "noisy reading, more hunting"
              : "climbs the contrast hill"
            : "reads the split directly"}
        </span>
      </div>
    </div>
  );
}
