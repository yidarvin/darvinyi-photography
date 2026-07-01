import { useState } from "react";
import type { ReactNode } from "react";

// HowAShutterUncoversTheFrameWidget: the signature widget for "How a shutter uncovers
// the frame". One focused interaction: pick a shutter mechanism and a shutter speed, and
// watch the open (light-collecting) region morph on a space-time plot, sensor rows down
// the side and time across the bottom. The move that makes the chapter click: leaf and
// global keep a vertical band at every speed (every row open together, so one flash burst
// lights the whole frame), while a focal-plane shutter past its sync speed and the rolling
// electronic shutter pinch into a diagonal slit that travels down the frame (no instant is
// fully open, so one burst lights only a band). React state only, no persistence.

type Kind = "leaf" | "focal" | "electronic" | "global";

interface Mode {
  key: Kind;
  label: string;
  // Traverse time in ms: how long the opening takes to cross the frame, top row to bottom.
  // Zero for the "whole frame at once" mechanisms; a few ms for a focal-plane curtain;
  // tens of ms for a conventional sensor's rolling readout.
  traverse: number;
  syncLabel: string;
}

const MODES: Mode[] = [
  { key: "leaf", label: "leaf", traverse: 0, syncLabel: "any speed" },
  { key: "focal", label: "focal-plane", traverse: 4, syncLabel: "≈ 1/250 s" },
  { key: "electronic", label: "rolling electronic", traverse: 30, syncLabel: "single burst won't sync" },
  { key: "global", label: "global electronic", traverse: 0, syncLabel: "any speed" },
];

// Standard full-stop shutter series, slow (left) to fast (right).
const SHUTTERS = [30, 60, 125, 250, 500, 1000, 2000, 4000, 8000];
const LAST = SHUTTERS.length - 1;

const WINDOW = 72; // ms shown across the plot; sized to fit the slowest rolling case
const T_START = 4; // ms before the shutter begins, so the shape is not glued to the axis
const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

// Plot geometry (SVG user units).
const PL = 46;
const PR = 326;
const PT = 14;
const PB = 140;
const PW = PR - PL;
const PH = PB - PT;
const X = (tMs: number) => PL + clamp(tMs / WINDOW, 0, 1) * PW;
const Y = (frac: number) => PT + clamp(frac, 0, 1) * PH;

export function HowAShutterUncoversTheFrameWidget() {
  const [kind, setKind] = useState<Kind>("focal");
  const [shIndex, setShIndex] = useState(3); // 1/250

  const mode = MODES.find((m) => m.key === kind) as Mode;
  const denom = SHUTTERS[shIndex];
  const d = 1000 / denom; // open duration per row, ms
  const T = mode.traverse;

  const wholeFrameOpen = d >= T; // is there an instant when every row is open together?
  const band = T === 0;

  // The open region and the flash instant.
  let shape: ReactNode;
  let flashX: number;
  let litFracTop: number;
  let litFracBottom: number;

  if (band || wholeFrameOpen) {
    flashX = X(T_START + (T + d) / 2);
    litFracTop = 0;
    litFracBottom = 1;
  } else {
    // Slit at mid-travel: the flash catches only the rows the slit covers at that instant.
    const tFlash = T_START + T / 2;
    flashX = X(tFlash);
    litFracTop = clamp((T / 2 - d) / T, 0, 1);
    litFracBottom = clamp(T / 2 / T, 0, 1);
  }

  if (band) {
    // Whole frame open together: a vertical band spanning every row.
    const x0 = X(T_START);
    const x1 = Math.max(X(T_START + d), x0 + 3); // keep a fast shutter's sliver visible
    shape = <rect x={x0} y={Y(0)} width={x1 - x0} height={PH} fill="var(--accent)" fillOpacity="0.24" />;
  } else {
    // A slit that travels down the frame: a parallelogram leaning right as time passes.
    const wTop = Math.max(X(T_START + d) - X(T_START), 3);
    const topL = X(T_START);
    const botL = X(T_START + T);
    shape = (
      <polygon
        points={`${topL},${Y(0)} ${topL + wTop},${Y(0)} ${botL + wTop},${Y(1)} ${botL},${Y(1)}`}
        fill="var(--accent)"
        fillOpacity="0.24"
      />
    );
  }

  const aboveSync = kind === "focal" && !wholeFrameOpen;
  const uncoverLabel = band
    ? "one instant, all rows"
    : `≈ ${T} ms, top row to bottom`;

  return (
    <div className="font-sans">
      {/* space-time plot: sensor rows down the side, time across the bottom */}
      <svg
        viewBox="0 0 340 168"
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={`${mode.label} shutter at 1/${denom} second. ${
          band || wholeFrameOpen
            ? "Every row of the sensor is open at the same instant, so a single flash burst lights the whole frame."
            : "The open slit travels down the frame, so no instant has every row open and a single flash burst lights only a band of rows."
        }`}
      >
        <rect x="0" y="0" width="340" height="168" fill="var(--surface-2)" />

        {/* axes */}
        <line x1={PL} y1={PT} x2={PL} y2={PB} stroke="var(--border)" strokeWidth="1" />
        <line x1={PL} y1={PB} x2={PR} y2={PB} stroke="var(--border)" strokeWidth="1" />
        <text
          x="18"
          y={PT + PH / 2}
          fontFamily="var(--font-mono)"
          fontSize="9"
          fill="var(--fg-muted)"
          textAnchor="middle"
          transform={`rotate(-90 18 ${PT + PH / 2})`}
        >
          sensor rows
        </text>
        <text x={PR} y={PB + 15} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
          time →
        </text>

        {shape}

        {/* the single flash burst, and the rows it manages to light */}
        <line x1={flashX} y1={PT} x2={flashX} y2={PB} stroke="var(--fg-muted)" strokeWidth="1" strokeDasharray="2 3" />
        <line x1={flashX} y1={Y(litFracTop)} x2={flashX} y2={Y(litFracBottom)} stroke="var(--accent)" strokeWidth="3" />

        <text x={PL} y={PB + 15} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          {mode.label}
        </text>
      </svg>

      {/* readouts */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">shutter speed</dt>
        <dd className="text-right text-fg">{`1/${denom} s`}</dd>
        <dt className="text-comment">whole frame open at once?</dt>
        <dd className={"text-right " + (wholeFrameOpen || band ? "text-accent" : "text-danger")}>
          {wholeFrameOpen || band ? "yes" : "no"}
        </dd>
        <dt className="text-comment">one flash burst lights</dt>
        <dd className={"text-right " + (wholeFrameOpen || band ? "text-accent" : "text-danger")}>
          {wholeFrameOpen || band ? "the whole frame" : "one band of rows"}
        </dd>
        <dt className="text-comment">frame uncovered over</dt>
        <dd className="text-right text-fg">{uncoverLabel}</dd>
        <dt className="text-comment">fast motion is</dt>
        <dd className="text-right text-fg">{band ? "caught together" : "read row by row"}</dd>
        <dt className="text-comment">flash sync</dt>
        <dd className="text-right text-fg">{mode.syncLabel}</dd>
      </dl>

      {aboveSync && (
        <p className="mt-3 font-mono text-[0.7rem] text-danger">
          {"// above the sync speed: the second curtain starts before the first is done, so only a slit is ever open"}
        </p>
      )}

      {/* shutter mechanism */}
      <div className="mt-5">
        <span className="mb-2 block font-mono text-xs text-comment">shutter mechanism</span>
        <div className="flex flex-wrap gap-2">
          {MODES.map((m) => {
            const active = m.key === kind;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setKind(m.key)}
                aria-pressed={active}
                className={
                  "rounded border px-3 py-1.5 font-mono text-xs transition-colors " +
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

      {/* shutter speed */}
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
