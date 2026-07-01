import { useState } from "react";

// FlashSyncAndTheLeafAdvantageWidget: the signature widget for "Flash sync and the leaf
// advantage". One focused interaction: the aperture and the flash are fixed (the subject
// is correctly lit), and you drive the shutter speed to control the ambient sky, then flip
// between a focal-plane and a leaf shutter. The move that makes the chapter click: on a
// leaf shutter you can raise the shutter to darken the sky while the flash keeps the
// subject, all the way to the leaf's mechanical ceiling. On a focal-plane shutter you hit a
// wall at the sync speed, about 1/250, where a single burst stops lighting the whole frame
// and lights only a band. React state only, no persistence.

type Kind = "focal" | "leaf";

interface Mode {
  key: Kind;
  label: string;
  sync: number; // fastest shutter (1/sync) that fires an ordinary flash across the whole frame
  ceilingNote: string;
}

const MODES: Mode[] = [
  { key: "focal", label: "focal-plane", sync: 250, ceilingNote: "above the 1/250 sync speed the frame is never fully open, so one burst lights only a band. High-speed sync fakes it by pulsing the flash, at a cost of two to three stops of power." },
  { key: "leaf", label: "leaf", sync: 2000, ceilingNote: "past the leaf's 1/2000 mechanical ceiling you are on the electronic shutter, which reads the frame row by row and cannot sync a single flash at all." },
];

// f/8, ISO 100, full sun. Sunny-16 puts a correct ambient exposure at 1/500, so that is
// the speed where the sky reads normally; faster darkens it, slower blows it out.
const SHUTTERS = [60, 125, 250, 500, 1000, 2000, 4000, 8000];
const CORRECT_DENOM = 500;
const LAST = SHUTTERS.length - 1;

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));
const lerp = (a: number, b: number, t: number) => Math.round(a + (b - a) * t);

// Ambient sky color: dark when underexposed, near-white when blown, a steel daylight gray
// in the middle. A faint blue bias so it reads as sky, never a second bold color.
function skyFill(ev: number): string {
  const t = clamp((ev + 3) / 6, 0, 1);
  return `rgb(${lerp(17, 223, t)}, ${lerp(25, 231, t)}, ${lerp(31, 238, t)})`;
}

function skyWord(ev: number): string {
  if (ev >= 2) return "blown out";
  if (ev === 1) return "bright";
  if (ev === 0) return "balanced";
  if (ev === -1) return "dim";
  return "dark";
}

// Frame geometry (SVG user units).
const FW = 320;
const FH = 200;
const INSET = 8;
const SKY_B = 126; // sky meets ground here
const CX = 160;
const HEAD_CY = 104;
const HEAD_R = 26;
const BAND_T = 80; // the strip a single flash lights when the shutter is above sync
const BAND_B = 126;

const FLASH = "#cdd6da"; // the flash-lit subject
const UNLIT = "#28323a"; // subject in ambient only, when the flash misses it

export function FlashSyncAndTheLeafAdvantageWidget() {
  const [kind, setKind] = useState<Kind>("leaf");
  const [shIndex, setShIndex] = useState(5); // 1/2000: the dark-sky, subject-held look

  const mode = MODES.find((m) => m.key === kind) as Mode;
  const denom = SHUTTERS[shIndex];
  const ev = Math.round(Math.log2(CORRECT_DENOM / denom));
  const synced = denom <= mode.sync;
  const sky = skyFill(ev);

  const head = (
    <>
      <circle cx={CX} cy={HEAD_CY} r={HEAD_R} fill={synced ? FLASH : UNLIT} />
      <path
        d={`M ${CX - 46} ${FH - INSET} Q ${CX - 42} ${SKY_B - 6} ${CX} ${SKY_B - 6} Q ${CX + 42} ${SKY_B - 6} ${CX + 46} ${FH - INSET} Z`}
        fill={synced ? FLASH : UNLIT}
      />
      {synced && (
        <circle cx={CX} cy={HEAD_CY} r={HEAD_R} fill="none" stroke="var(--accent)" strokeOpacity="0.65" strokeWidth="1.5" />
      )}
    </>
  );

  return (
    <div className="font-sans">
      {/* the frame: a portrait against the sky */}
      <svg
        viewBox={`0 0 ${FW} ${FH}`}
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={
          `A portrait against the sky at 1/${denom} second on a ${mode.label} shutter. ` +
          (synced
            ? `The flash lights the subject and the sky reads ${skyWord(ev)}.`
            : `The shutter is above the sync speed, so a single burst lights only a horizontal band and the rest of the subject falls dark.`)
        }
      >
        <clipPath id="fs-frame">
          <rect x={INSET} y={INSET} width={FW - 2 * INSET} height={FH - 2 * INSET} rx="8" />
        </clipPath>
        <g clipPath="url(#fs-frame)">
          {/* ambient: sky and ground. The shutter sets how bright the sky is. */}
          <rect x={INSET} y={INSET} width={FW - 2 * INSET} height={SKY_B - INSET} fill={sky} />
          <rect x={INSET} y={SKY_B} width={FW - 2 * INSET} height={FH - SKY_B - INSET} fill="#141d21" />

          {head}

          {/* above sync: the flash caught only the band the open slit was crossing */}
          {!synced && (
            <>
              <rect x={INSET} y={BAND_T} width={FW - 2 * INSET} height={BAND_B - BAND_T} fill={FLASH} fillOpacity="0.9" />
              <line x1={INSET} y1={BAND_T} x2={FW - INSET} y2={BAND_T} stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="4 3" />
              <line x1={INSET} y1={BAND_B} x2={FW - INSET} y2={BAND_B} stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="4 3" />
              <text x={FW - INSET - 6} y={BAND_T - 6} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--danger)">
                flash reached only this band
              </text>
            </>
          )}
        </g>
        <rect x={INSET} y={INSET} width={FW - 2 * INSET} height={FH - 2 * INSET} rx="8" fill="none" stroke="var(--border)" />
        <text x={INSET + 8} y={INSET + 16} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          f/8 &middot; ISO 100 &middot; full sun
        </text>
      </svg>

      {/* readouts */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">shutter speed</dt>
        <dd className="text-right text-fg">{`1/${denom} s`}</dd>
        <dt className="text-comment">ambient sky</dt>
        <dd className="text-right text-fg">
          {skyWord(ev)} <span className="text-comment">{`(${ev >= 0 ? "+" : ""}${ev} EV)`}</span>
        </dd>
        <dt className="text-comment">flash syncs?</dt>
        <dd className={"text-right " + (synced ? "text-accent" : "text-danger")}>{synced ? "yes" : "no"}</dd>
        <dt className="text-comment">the frame</dt>
        <dd className={"text-right " + (synced ? "text-fg" : "text-danger")}>
          {synced ? (ev <= -1 ? "subject lit, sky held down" : ev >= 1 ? "subject lit, sky bright" : "subject lit, sky balanced") : "flash lights only a band"}
        </dd>
      </dl>

      {!synced && (
        <p className="mt-3 font-mono text-[0.7rem] leading-relaxed text-danger">
          {`// ${mode.ceilingNote}`}
        </p>
      )}

      {/* shutter type */}
      <div className="mt-5">
        <span className="mb-2 block font-mono text-xs text-comment">shutter type</span>
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
                  (active ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface-2 text-fg hover:border-accent/60")
                }
              >
                {m.label} <span className="text-comment">{`· 1/${m.sync}`}</span>
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
        <span className="hidden font-mono text-[0.7rem] text-comment sm:inline">darken the sky →</span>
      </div>
    </div>
  );
}
