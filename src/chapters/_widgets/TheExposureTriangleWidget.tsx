import { useMemo, useState } from "react";

// TheExposureTriangleWidget: the signature widget for "The exposure triangle".
// One focused interaction: three dials, each stepping in whole stops. A meter reads
// the net exposure against a fixed target. The scene preview shows the three side
// effects at once - background blur from the aperture, a motion streak from the
// shutter, grain from the ISO - and its overall brightness from the meter. The idea
// lands when you open the aperture for more blur, watch the meter drift over, then
// pull a stop back on the shutter or ISO to recentre it: same brightness, different
// picture. React state only, no persistence.

// Whole-stop scales. Index 0 is one end of each dial, the last index the other.
const APERTURES = ["f/2", "f/2.8", "f/4", "f/5.6", "f/8", "f/11"]; // wide -> narrow
const SHUTTERS = ["1/30", "1/60", "1/125", "1/250", "1/500", "1/1000"]; // slow -> fast
const ISOS = ["100", "200", "400", "800", "1600", "3200"]; // low -> high

const LAST = APERTURES.length - 1; // every dial has the same number of stops
const TARGET = 7; // the "correct" total, in stops of light above the darkest setting

// Light each setting contributes, in stops. Higher means a brighter picture:
// a wider aperture and a slower shutter let in more light; a higher ISO amplifies it.
const apertureLight = (i: number) => LAST - i;
const shutterLight = (i: number) => LAST - i;
const isoLight = (i: number) => i;

// A tiny deterministic generator so the grain sits in fixed places instead of
// dancing on every render.
function grainField(n: number) {
  let s = 20240607;
  const rnd = () => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
  return Array.from({ length: n }, () => ({ x: rnd() * 320, y: rnd() * 170, r: 0.4 + rnd() * 0.6 }));
}

function Dial({
  label,
  value,
  index,
  onStep,
  low,
  high,
}: {
  label: string;
  value: string;
  index: number;
  onStep: (delta: number) => void;
  low: string;
  high: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="w-20 shrink-0 font-mono text-xs text-accent">{label}</span>
      <button
        type="button"
        onClick={() => onStep(-1)}
        disabled={index === 0}
        aria-label={`${label}: ${low}`}
        className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-30"
      >
        &lt;
      </button>
      <span className="w-16 text-center font-mono text-sm text-fg">{value}</span>
      <button
        type="button"
        onClick={() => onStep(1)}
        disabled={index === LAST}
        aria-label={`${label}: ${high}`}
        className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-30"
      >
        &gt;
      </button>
      <span className="hidden font-mono text-[0.7rem] text-comment sm:inline">
        {low} .. {high}
      </span>
    </div>
  );
}

export function TheExposureTriangleWidget() {
  // A balanced starting point: f/4, 1/125, ISO 200 sums to the target.
  const [ap, setAp] = useState(2);
  const [sh, setSh] = useState(2);
  const [iso, setIso] = useState(1);

  const grain = useMemo(() => grainField(150), []);

  const net = apertureLight(ap) + shutterLight(sh) + isoLight(iso);
  const dev = net - TARGET; // + is too bright, - is too dark

  // Side effects, each 0..1.
  const blur = apertureLight(ap) / LAST; // wider aperture, more background blur
  const streak = shutterLight(sh) / LAST; // slower shutter, longer motion streak
  const grainAmt = isoLight(iso) / LAST; // higher ISO, more grain

  const clip = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
  const overlayOpacity = clip(Math.abs(dev) * 0.16, 0, 0.72);
  const overlayFill = dev > 0 ? "#ffffff" : "#000000";

  const status =
    dev === 0
      ? "balanced: correct exposure"
      : `${dev > 0 ? "+" : ""}${dev} ${Math.abs(dev) === 1 ? "stop" : "stops"} ${dev > 0 ? "over" : "under"}`;

  // Meter track runs from -5 to +5 stops; the fill grows from the centre.
  const meterPct = clip((dev / 5) * 50, -50, 50);

  return (
    <div className="font-sans">
      {/* scene preview: one frame carrying all three side effects at once */}
      <svg
        viewBox="0 0 320 180"
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={`Preview: ${status}. Background blur ${Math.round(blur * 100)} percent, motion streak ${Math.round(
          streak * 100,
        )} percent, grain ${Math.round(grainAmt * 100)} percent.`}
      >
        <rect x="0" y="0" width="320" height="180" fill="var(--surface-2)" />

        {/* background lights, blurred more as the aperture opens */}
        <g style={{ filter: `blur(${blur * 6}px)` }}>
          {[40, 96, 152, 208, 264].map((cx, i) => (
            <circle
              key={cx}
              cx={cx}
              cy={44 + (i % 2) * 22}
              r={9 + blur * 9}
              fill="var(--accent)"
              opacity={0.25 + blur * 0.3}
            />
          ))}
        </g>

        {/* the subject and its motion streak (longer as the shutter slows) */}
        <g>
          <rect
            x={150 - streak * 96}
            y="104"
            width={40 + streak * 96}
            height="52"
            rx="20"
            fill="var(--accent-dim)"
            opacity={streak > 0 ? 0.35 : 0}
          />
          <circle cx="170" cy="96" r="16" fill="var(--fg)" opacity="0.92" />
          <rect x="150" y="108" width="40" height="52" rx="12" fill="var(--fg)" opacity="0.92" />
        </g>

        {/* grain, denser as ISO climbs */}
        {grainAmt > 0 &&
          grain.map((g, i) => (
            <circle key={i} cx={g.x} cy={g.y} r={g.r} fill="var(--fg)" opacity={grainAmt * 0.5} />
          ))}

        {/* brightness overlay: how far the meter sits off target */}
        <rect x="0" y="0" width="320" height="180" fill={overlayFill} opacity={overlayOpacity} />
      </svg>

      {/* the exposure meter */}
      <div className="mt-4">
        <div className="relative h-2 rounded-full bg-surface-2">
          <div className="absolute left-1/2 top-[-3px] h-[14px] w-px -translate-x-1/2 bg-comment" />
          <div
            className="absolute top-0 h-2 rounded-full"
            style={{
              left: meterPct >= 0 ? "50%" : `${50 + meterPct}%`,
              width: `${Math.abs(meterPct)}%`,
              background: dev === 0 ? "var(--accent)" : "var(--danger)",
            }}
          />
        </div>
        <p
          className="mt-2 font-mono text-xs"
          style={{ color: dev === 0 ? "var(--accent)" : "var(--fg-muted)" }}
        >
          {status}
        </p>
      </div>

      {/* the three dials */}
      <div className="mt-5 space-y-3">
        <Dial
          label="aperture"
          value={APERTURES[ap]}
          index={ap}
          onStep={(d) => setAp((v) => clip(v + d, 0, LAST))}
          low="wide"
          high="narrow"
        />
        <Dial
          label="shutter"
          value={SHUTTERS[sh]}
          index={sh}
          onStep={(d) => setSh((v) => clip(v + d, 0, LAST))}
          low="slow"
          high="fast"
        />
        <Dial
          label="iso"
          value={ISOS[iso]}
          index={iso}
          onStep={(d) => setIso((v) => clip(v + d, 0, LAST))}
          low="clean"
          high="bright"
        />
      </div>
    </div>
  );
}
