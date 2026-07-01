import { useEffect, useRef, useState } from "react";

// RollingShutterAndReadoutWidget: the signature widget for "Rolling shutter and readout
// speed". One focused interaction: pick a sensor's readout time and watch a spinning fan
// pass through an electronic rolling shutter. The move that makes the chapter click is
// that ONE number, the readout time, decides everything. Each sensor row shows the fan as
// it was at that row's capture instant, and since the bottom rows are read later than the
// top, a blade is caught at a different angle in every row. Straight blades bow, thicken
// on one side, and tear away from the hub. Set the readout to zero (a leaf or global
// shutter) and the blades snap straight; raise it toward the 100 to 165 ms of the two
// cameras in this book and the fan dissolves into curves. React state only, no persistence.

interface Preset {
  key: string;
  label: string;
  readoutMs: number;
}

// Readout times are the measured (or, for the Q3, closely estimated) full-sensor
// electronic-shutter scan times from the chapter. The two slowest are the cameras
// this book is about, which is the point.
const PRESETS: Preset[] = [
  { key: "leafglobal", label: "leaf · global", readoutMs: 0 },
  { key: "stacked", label: "stacked", readoutMs: 4 },
  { key: "fullframe", label: "full-frame", readoutMs: 62 },
  { key: "q3", label: "Leica Q3", readoutMs: 100 },
  { key: "x2d", label: "X2D II", readoutMs: 165 },
];

// Fan geometry, in SVG user units. The sensor is the whole plot; rows are read from
// y = 0 (first, earliest) to y = FRAME_H (last, latest).
const FRAME_W = 320;
const FRAME_H = 192;
const CX = 160;
const CY = 94;
const R_IN = 12;
const R_OUT = 80;
const BLADES = 3;
const SUBRAYS = [-0.1, -0.034, 0.034, 0.1]; // angular offsets give each blade thickness
const ROW_STEP = 1.6; // vertical sampling step for the readout map
const JUMP = 30; // x jump that breaks a blade curve into a new segment
const TAU = Math.PI * 2;

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

// The rolling-shutter forward map for one radial ray. For each sensor row we ask where
// the ray is at that row's capture time, and keep the point where the ray crosses that
// row. The locus of those points is the distorted blade. Straight ray in, curved out.
function raySegments(angle: number, t0: number, readoutS: number, revPerSec: number): string[][] {
  const segs: string[][] = [];
  let cur: string[] = [];
  let prevX = NaN;
  const flush = () => {
    if (cur.length) {
      segs.push(cur);
      cur = [];
    }
    prevX = NaN;
  };
  for (let y = CY - R_OUT; y <= CY + R_OUT; y += ROW_STEP) {
    const t = t0 + (y / FRAME_H) * readoutS; // lower rows are read later
    const phi = angle + revPerSec * TAU * t;
    const sinp = Math.sin(phi);
    if (Math.abs(sinp) < 0.004) {
      flush();
      continue;
    }
    const s = (y - CY) / sinp; // radius at which this ray crosses row y
    if (s < R_IN || s > R_OUT) {
      flush();
      continue;
    }
    const x = CX + s * Math.cos(phi);
    if (Number.isFinite(prevX) && Math.abs(x - prevX) > JUMP) flush();
    cur.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    prevX = x;
  }
  flush();
  return segs.filter((seg) => seg.length >= 2);
}

export function RollingShutterAndReadoutWidget() {
  const [presetKey, setPresetKey] = useState("fullframe");
  const [rpm, setRpm] = useState(600);
  const [playing, setPlaying] = useState(true);
  const [t0, setT0] = useState(0);
  const reduced = usePrefersReducedMotion();
  const rafRef = useRef(0);
  const lastRef = useRef(0);

  const preset = PRESETS.find((p) => p.key === presetKey) as Preset;
  const readoutS = preset.readoutMs / 1000;
  const revPerSec = rpm / 60;
  const turns = revPerSec * readoutS; // rotations during one readout: the distortion knob

  // Advance the base time so the fan spins and the captured distortion morphs with it.
  const running = playing && !reduced;
  useEffect(() => {
    if (!running) return;
    lastRef.current = 0;
    const tick = (now: number) => {
      if (!lastRef.current) lastRef.current = now;
      const dt = Math.min((now - lastRef.current) / 1000, 0.05);
      lastRef.current = now;
      setT0((v) => (v + dt) % 1000);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [running]);

  // Blades of the captured (distorted) fan, plus a faint reference fan showing where the
  // blades really sit at the middle instant of the readout.
  const tRef = t0 + 0.5 * readoutS;
  const blades = Array.from({ length: BLADES }, (_, b) => {
    const base = (b * TAU) / BLADES;
    const segs: string[][] = [];
    for (const off of SUBRAYS) segs.push(...raySegments(base + off, t0, readoutS, revPerSec));
    const refAngle = base + revPerSec * TAU * tRef;
    return { segs, refAngle };
  });

  let verdict: string;
  let verdictColor: string;
  if (turns < 0.03) {
    verdict = "blades stay straight";
    verdictColor = "text-accent";
  } else if (turns < 0.25) {
    verdict = "blades bow";
    verdictColor = "text-fg";
  } else if (turns < 0.7) {
    verdict = "blades curl";
    verdictColor = "text-fg";
  } else {
    verdict = "blades tear off the hub";
    verdictColor = "text-danger";
  }

  return (
    <div className="font-sans">
      <svg
        viewBox={`0 0 ${FRAME_W} ${FRAME_H + 18}`}
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={`A three-blade fan spinning at ${rpm} rpm, captured through an electronic shutter with a ${preset.readoutMs} millisecond readout. During one readout the fan turns ${turns.toFixed(
          2,
        )} of a rotation, so ${verdict}. A leaf or global shutter with zero readout would record the blades straight.`}
      >
        <rect x="0" y="0" width={FRAME_W} height={FRAME_H} fill="var(--surface-2)" />

        {/* faint reference fan: the blades at the middle instant of the readout */}
        {blades.map((bl, i) => (
          <line
            key={`ref-${i}`}
            x1={CX + R_IN * Math.cos(bl.refAngle)}
            y1={CY + R_IN * Math.sin(bl.refAngle)}
            x2={CX + R_OUT * Math.cos(bl.refAngle)}
            y2={CY + R_OUT * Math.sin(bl.refAngle)}
            stroke="var(--comment)"
            strokeWidth="1.5"
            strokeOpacity="0.55"
            strokeDasharray="2 3"
          />
        ))}

        {/* the captured, rolling-shutter-distorted blades */}
        {blades.map((bl, i) =>
          bl.segs.map((seg, j) => (
            <polyline
              key={`b-${i}-${j}`}
              points={seg.join(" ")}
              fill="none"
              stroke="var(--accent)"
              strokeWidth="3.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity="0.9"
            />
          )),
        )}

        {/* the hub */}
        <circle cx={CX} cy={CY} r={R_IN} fill="var(--surface)" stroke="var(--fg-muted)" strokeWidth="1.5" />

        <text x="10" y={FRAME_H + 12} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          {"/* dashed = true blades · solid = what the sensor recorded */"}
        </text>
      </svg>

      {/* readouts */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">readout time</dt>
        <dd className="text-right text-fg">
          {preset.readoutMs === 0 ? "0 ms (whole frame at once)" : `${preset.readoutMs} ms`}
        </dd>
        <dt className="text-comment">fan speed</dt>
        <dd className="text-right text-fg">{rpm} rpm</dd>
        <dt className="text-comment">turn during one readout</dt>
        <dd className={"text-right " + (turns < 0.03 ? "text-accent" : "text-fg")}>{turns.toFixed(2)} rev</dd>
        <dt className="text-comment">the blades</dt>
        <dd className={"text-right " + verdictColor}>{verdict}</dd>
      </dl>

      {/* sensor readout preset: the star control */}
      <div className="mt-5">
        <span className="mb-2 block font-mono text-xs text-comment">sensor readout</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => {
            const active = p.key === presetKey;
            return (
              <button
                key={p.key}
                type="button"
                onClick={() => setPresetKey(p.key)}
                aria-pressed={active}
                className={
                  "rounded border px-3 py-1.5 font-mono text-xs transition-colors " +
                  (active
                    ? "border-accent bg-accent/10 text-accent"
                    : "border-border bg-surface-2 text-fg hover:border-accent/60")
                }
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* fan speed + play control */}
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label htmlFor="rs-rpm" className="w-20 shrink-0 font-mono text-xs text-accent">
          fan speed
        </label>
        <input
          id="rs-rpm"
          type="range"
          min={120}
          max={1200}
          step={60}
          value={rpm}
          onChange={(e) => setRpm(clamp(Number(e.target.value), 120, 1200))}
          className="h-1 w-40 max-w-[50%] accent-[var(--accent)]"
        />
        <span className="w-16 font-mono text-xs text-fg">{rpm} rpm</span>
        {!reduced && (
          <button
            type="button"
            onClick={() => setPlaying((v) => !v)}
            aria-pressed={playing}
            className="rounded border border-border bg-surface-2 px-3 py-1.5 font-mono text-xs text-fg transition-colors hover:border-accent/60"
          >
            {playing ? "pause" : "spin"}
          </button>
        )}
      </div>
    </div>
  );
}
