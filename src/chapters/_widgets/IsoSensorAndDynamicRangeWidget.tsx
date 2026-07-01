import { useMemo, useState } from "react";

// IsoSensorAndDynamicRangeWidget: the signature widget for "ISO, the sensor, and dynamic range".
// One focused interaction: a dim shadow holds a fixed, small pile of photons. You need it
// brighter, and there are two ways to get there. Turn up the ISO (gain), which amplifies the
// signal the sensor already captured, or give the sensor more light (a slower shutter, a wider
// aperture, more lamps), which collects more photons. Both reach the SAME final brightness. Only
// one cleans the picture. Gain scales the grain up with the signal, so the shadow stays exactly
// as noisy and loses a stop of highlight range for every stop of push. Light collects more
// photons, and since photon noise grows only as the square root of the count, more light means a
// higher signal-to-noise ratio and a smoother shadow. React state only, no persistence.

// The captured shadow at base exposure: a small photon count, so the noise is visible once lifted.
// Photon (shot) noise = sqrt(N), so the signal-to-noise ratio is sqrt(N) and the relative grain is
// 1/sqrt(N). N0 = 64 gives SNR 8, a 12.5% grain that reads clearly when the shadow is raised.
const N0 = 64;
const SNR0 = Math.sqrt(N0); // 8
const L0 = 0.055; // displayed luminance of the un-lifted shadow: nearly black, grain hidden in it
const BASE_DR = 14; // usable dynamic range at base ISO, in stops (the Q3's 60 MP full frame)
const MAX_STOPS = 5;

// A fixed grain field, computed once. A tiny deterministic PRNG (mulberry32) so the noise pattern
// is stable across renders and only its amplitude changes, never its shape.
const COLS = 30;
const ROWS = 12;
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x));

type Method = "gain" | "light";

export function IsoSensorAndDynamicRangeWidget() {
  const [method, setMethod] = useState<Method>("gain");
  const [stops, setStops] = useState(3);

  // A stable per-cell noise offset in roughly [-1, 1], the same shape every render.
  const field = useMemo(() => {
    const rand = mulberry32(20240701);
    return Array.from({ length: COLS * ROWS }, () => rand() * 2 - 1);
  }, []);

  // Both methods reach the same display brightness: the shadow lifted by `stops` stops.
  const brightness = clamp(L0 * 2 ** stops, 0, 0.92);

  // Gain amplifies the fixed capture: photons unchanged, so the ratio holds and the grain rides
  // up with the signal. Light collects 2^stops more photons, so the ratio climbs with the square root.
  const photonMult = method === "light" ? 2 ** stops : 1;
  const snr = SNR0 * Math.sqrt(photonMult);
  const relNoise = 1 / snr; // relative grain, as a fraction of the signal

  // Gain buys its stops out of the highlight end: full-well saturates one stop lower per stop of
  // push, so usable range shrinks. Light holds the range (as far as the highlights allow).
  const usableDR = method === "light" ? BASE_DR : BASE_DR - stops;

  const grainPct = relNoise * 100;
  const verdict = grainPct <= 3 ? "clean" : grainPct <= 7 ? "some grain" : "noisy";
  const verdictColor =
    verdict === "clean" ? "text-accent" : verdict === "some grain" ? "text-fg" : "text-comment";

  const cellW = 300 / COLS;
  const cellH = 132 / ROWS;

  return (
    <div className="font-sans">
      {/* the lifted shadow patch: teal opacity is brightness, per-cell scatter is grain */}
      <svg
        viewBox="0 0 300 132"
        className="w-full rounded-md border border-border"
        role="img"
        aria-label={`A dim shadow lifted ${stops} stops by ${
          method === "gain" ? "ISO gain" : "more light"
        }. The signal-to-noise ratio is ${snr.toFixed(
          0,
        )}, so the grain is about ${grainPct.toFixed(1)} percent, which reads as ${verdict}.`}
      >
        <rect x="0" y="0" width="300" height="132" fill="var(--surface-2)" />
        {field.map((n, i) => {
          const col = i % COLS;
          const row = Math.floor(i / COLS);
          // Each cell's brightness is the lifted signal jittered by its fixed noise offset,
          // scaled by the relative grain. Gain keeps the grain large; light shrinks it.
          const o = clamp(brightness * (1 + relNoise * n * 2.6), 0, 1);
          return (
            <rect
              key={i}
              x={col * cellW}
              y={row * cellH}
              width={cellW + 0.5}
              height={cellH + 0.5}
              fill="var(--accent)"
              opacity={o}
              style={{ transition: "opacity 160ms linear" }}
            />
          );
        })}
      </svg>

      {/* the two readouts that matter: the grain, and the range you still have to work in */}
      <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">captured light</dt>
        <dd className="text-right text-fg">{`x${photonMult}`}</dd>
        <dt className="text-comment">signal-to-noise</dt>
        <dd className="text-right text-fg">{snr.toFixed(0)}</dd>
        <dt className="text-comment">shadow grain</dt>
        <dd className={"text-right " + verdictColor}>{`${grainPct.toFixed(1)}% - ${verdict}`}</dd>
        <dt className="text-comment">usable dynamic range</dt>
        <dd className={"text-right " + (usableDR < BASE_DR ? "text-comment" : "text-accent")}>
          {`${usableDR} stops`}
        </dd>
      </dl>

      {/* method: the whole point is that these two reach the same brightness by different means */}
      <div className="mt-5">
        <span className="mb-2 block font-mono text-xs text-comment">how you brighten it</span>
        <div className="flex flex-wrap gap-2">
          {(
            [
              { key: "gain", label: "ISO (gain)" },
              { key: "light", label: "light (exposure)" },
            ] as { key: Method; label: string }[]
          ).map((m) => {
            const active = m.key === method;
            return (
              <button
                key={m.key}
                type="button"
                onClick={() => setMethod(m.key)}
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

      {/* amount: how many stops of brightening the shadow needs */}
      <div className="mt-4 flex items-center gap-3">
        <span className="w-20 shrink-0 font-mono text-xs text-accent">brighten</span>
        <button
          type="button"
          onClick={() => setStops((v) => clamp(v - 1, 0, MAX_STOPS))}
          disabled={stops === 0}
          aria-label={`Less brightening (currently +${stops} stops)`}
          className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          &lt;
        </button>
        <span className="w-16 text-center font-mono text-sm text-fg">{`+${stops} stop${stops === 1 ? "" : "s"}`}</span>
        <button
          type="button"
          onClick={() => setStops((v) => clamp(v + 1, 0, MAX_STOPS))}
          disabled={stops === MAX_STOPS}
          aria-label={`More brightening (currently +${stops} stops)`}
          className="rounded border border-border bg-surface-2 px-2 py-1 font-mono text-xs text-fg transition-colors hover:border-accent/60 disabled:cursor-not-allowed disabled:opacity-30"
        >
          &gt;
        </button>
        <span className="hidden font-mono text-[0.7rem] text-comment sm:inline">
          {method === "gain" ? "amplify the capture" : "collect more photons"}
        </span>
      </div>
    </div>
  );
}
