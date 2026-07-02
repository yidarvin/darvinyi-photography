import { useState, type ReactNode } from "react";

// BlackAndWhiteSeeingWidget: the signature widget for "Removing color to see".
// One focused interaction that proves the chapter's thesis: a monochrome image is a
// CHOICE, not a fixed fact. The same little landscape is shown in color on the left and
// in black and white on the right. Drop a colored filter over it and the grey tones
// redistribute: a red filter drives the blue sky toward black and makes the red barn
// and white clouds leap out; a green filter lifts the foliage and darkens the barn.
// Nothing about the scene's colors changes. Only the recipe for turning them into grey
// does. React state only, no persistence.
//
// The filter is modeled the honest way, which is also exactly the digital channel mixer:
// under a filter with per-channel transmission t, the luminance weights (Rec. 709) are
// re-scaled by t and renormalized to sum to one. Renormalizing keeps a neutral grey
// fixed (the filter factor is the exposure you would add back) and lets only the colored
// regions move, which is the whole point.

const BASE = [0.2126, 0.7152, 0.0722]; // Rec. 709 luminance weights on sRGB values

type RGB = [number, number, number];

// The scene, as flat regions of real color. Chosen so each filter has something to act
// on: a saturated blue sky, a white cloud (a neutral, so it barely moves), a red barn,
// green foliage, a golden field.
const SKY: RGB = [60, 105, 190];
const CLOUD: RGB = [230, 234, 236];
const HILL: RGB = [92, 120, 72];
const FIELD: RGB = [190, 170, 84];
const BARN: RGB = [178, 58, 46];
const ROOF: RGB = [96, 86, 82];
const TRUNK: RGB = [104, 74, 48];
const CANOPY: RGB = [74, 112, 56];

type Filter = { key: string; label: string; t: RGB; tint: string; note: string };

// Transmissions are tuned for a clear, directionally-correct lesson: each filter passes
// its own color and blocks the opposite. Real contrast filters behave the same way.
const FILTERS: Filter[] = [
  { key: "none", label: "none", t: [1, 1, 1], tint: "transparent", note: "a straight desaturate. tones land wherever each color's brightness puts them, so colors of equal brightness merge." },
  { key: "yellow", label: "yellow", t: [1, 0.8, 0.12], tint: "#d9c022", note: "the gentle everyday filter. the sky darkens a little and clouds gain shape. costs about one stop." },
  { key: "orange", label: "orange", t: [1, 0.45, 0.09], tint: "#d07b22", note: "halfway to red. warm stone and skin lift, the blue sky falls further, haze is cut. about two stops." },
  { key: "red", label: "red", t: [1, 0.06, 0.03], tint: "#cc4033", note: "the dramatic one. the blue sky goes much darker, white clouds and red things leap out. about three stops." },
  { key: "green", label: "green", t: [0.28, 1, 0.28], tint: "#3f9a4d", note: "lifts foliage and darkens red. kind to leaves and landscapes, unkind to warm skin. two to three stops." },
  { key: "blue", label: "blue", t: [0.22, 0.4, 1], tint: "#3f6fd0", note: "the reverse: haze and sky lift, warm tones go dark. rarely used, except for a soft, misty mood." },
];

function greyUnder([r, g, b]: RGB, [tr, tg, tb]: RGB): number {
  const wr = BASE[0] * tr;
  const wg = BASE[1] * tg;
  const wb = BASE[2] * tb;
  const y = (wr * r + wg * g + wb * b) / (wr + wg + wb);
  return Math.max(0, Math.min(255, Math.round(y)));
}

const pct = (y: number) => Math.round((y / 255) * 100);
const rgbStr = ([r, g, b]: RGB) => `rgb(${r}, ${g}, ${b})`;

// The landscape, painted by a supplied function so the same shapes render in color and
// in grey. Thin dark hairlines keep the regions readable even when two of them merge to
// the same tone, which is exactly the failure the reader is meant to notice.
function Scene({ paint }: { paint: (c: RGB) => string }) {
  const edge = { stroke: "rgba(0,0,0,0.28)", strokeWidth: 0.75 };
  return (
    <g>
      <rect x={0} y={0} width={200} height={95} fill={paint(SKY)} {...edge} />
      <ellipse cx={52} cy={30} rx={30} ry={11} fill={paint(CLOUD)} {...edge} />
      <ellipse cx={78} cy={34} rx={20} ry={9} fill={paint(CLOUD)} {...edge} />
      <path d="M0,95 Q46,70 96,86 T200,88 L200,95 Z" fill={paint(HILL)} {...edge} />
      <rect x={0} y={95} width={200} height={55} fill={paint(FIELD)} {...edge} />
      {/* tree */}
      <rect x={53} y={82} width={7} height={22} fill={paint(TRUNK)} {...edge} />
      <circle cx={56.5} cy={76} r={16} fill={paint(CANOPY)} {...edge} />
      {/* barn */}
      <rect x={122} y={80} width={42} height={26} fill={paint(BARN)} {...edge} />
      <path d="M120,80 L143,61 L166,80 Z" fill={paint(ROOF)} {...edge} />
    </g>
  );
}

function Panel({ label, children }: { label: string; children: ReactNode }) {
  return (
    <figure className="flex-1">
      <svg
        viewBox="0 0 200 150"
        className="w-full rounded-md border border-border bg-surface-2"
        role="img"
        aria-label={label}
      >
        <text x={8} y={14} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
          {`// ${label}`}
        </text>
        {children}
      </svg>
    </figure>
  );
}

// One line of the readout: a named region, its grey under the current filter, and which
// way it moved from the plain desaturate.
function Reading({ name, rgb, filter }: { name: string; rgb: RGB; filter: Filter }) {
  const now = greyUnder(rgb, filter.t);
  const base = greyUnder(rgb, [1, 1, 1]);
  const delta = now - base;
  const dir = Math.abs(delta) < 3 ? "held" : delta > 0 ? "↑ lighter" : "↓ darker";
  return (
    <>
      <dt className="text-comment">{name}</dt>
      <dd className="flex items-center gap-3 text-fg">
        <span
          className="inline-block h-3.5 w-3.5 rounded-sm border border-border"
          style={{ backgroundColor: `rgb(${now}, ${now}, ${now})` }}
        />
        <span className="tabular-nums">{pct(now)}%</span>
        <span className={delta > 2 ? "text-accent" : delta < -2 ? "text-muted" : "text-comment"}>{dir}</span>
      </dd>
    </>
  );
}

export function BlackAndWhiteSeeingWidget() {
  const [key, setKey] = useState("red"); // open on the dramatic case
  const filter = FILTERS.find((f) => f.key === key) ?? FILTERS[0];

  const paintMono = (c: RGB) => {
    const y = greyUnder(c, filter.t);
    return `rgb(${y}, ${y}, ${y})`;
  };

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Panel label="the scene, in color">
          <Scene paint={rgbStr} />
        </Panel>
        <Panel label={key === "none" ? "in black and white" : `through a ${filter.label} filter`}>
          <Scene paint={paintMono} />
        </Panel>
      </div>

      {/* readout: how the key regions translate under this filter */}
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-xs">
        <Reading name="blue sky" rgb={SKY} filter={filter} />
        <Reading name="red barn" rgb={BARN} filter={filter} />
        <Reading name="foliage" rgb={CANOPY} filter={filter} />
        <dt className="text-comment">this filter</dt>
        <dd className="text-muted">{filter.note}</dd>
      </dl>

      {/* the one move: choose a filter */}
      <div className="mt-5">
        <span className="mb-2 block font-mono text-xs text-comment">drop a colored filter over the scene</span>
        <div className="flex flex-wrap gap-2" role="group" aria-label="Contrast filter">
          {FILTERS.map((f) => {
            const active = f.key === key;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => setKey(f.key)}
                aria-pressed={active}
                className={`flex items-center gap-2 rounded border px-3 py-1.5 font-mono text-xs transition-colors motion-reduce:transition-none ${
                  active ? "border-accent bg-accent/15 text-accent" : "border-border text-muted hover:bg-surface-2"
                }`}
              >
                <span
                  className="inline-block h-3 w-3 rounded-full border border-border"
                  style={{
                    backgroundColor: f.tint === "transparent" ? "var(--surface-2)" : f.tint,
                    backgroundImage:
                      f.tint === "transparent"
                        ? "linear-gradient(135deg, transparent 45%, var(--comment) 45%, var(--comment) 55%, transparent 55%)"
                        : undefined,
                  }}
                />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
        {"// the colors on the left never change. the filter only changes how they become "}
        {"grey, which means the black-and-white photograph was a decision all along."}
      </p>
    </div>
  );
}
