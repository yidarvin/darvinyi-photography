import { useId, useState } from "react";

// BlackAndWhiteConversionWidget: the signature widget for "Black-and-white conversion".
// One focused interaction: FINISH a grey print. The channel mix (which grey each color
// becomes) is the sister chapter's widget; this one owns the two moves that come after the
// conversion and that chapter 16 deferred here: TONING and GRAIN. The reader picks a toner
// for the shadows and a different toner for the highlights (that split is the whole idea of
// "split toning"), scales it, and adds grain, watching a flat grey landscape gain mood and
// tooth. React state only, no persistence.
//
// Split toning is modeled honestly. Each toner is a hue turned into a zero-luminance color
// PUSH (the hue's vivid RGB with its own luminance subtracted out), so it changes color
// without changing brightness. Every region of the scene carries a tone Y in 0..1; shadows
// (low Y) receive the shadow push, highlights (high Y) receive the highlight push, and the
// midtones near the pivot are left almost untouched. That is exactly what the Split Toning
// / Color Grading panel does: two hues at the two ends of the tonal scale.

type RGB = [number, number, number];

const LUMA: RGB = [0.2126, 0.7152, 0.0722]; // Rec. 709, to strip luminance out of a hue

// A toner: a hue (degrees) and a saturation. Neutral (sat 0) means no tint at that end.
interface Toner {
  key: string;
  label: string;
  hue: number;
  sat: number;
}

// Shadow toners: the darkroom's cool selenium and blue-iron end, plus warm sepia and green.
const SHADOW_TONERS: Toner[] = [
  { key: "neutral", label: "neutral", hue: 0, sat: 0 },
  { key: "blue", label: "cool blue", hue: 222, sat: 1 },
  { key: "teal", label: "teal", hue: 186, sat: 1 },
  { key: "selenium", label: "selenium", hue: 278, sat: 0.9 },
  { key: "sepia", label: "sepia", hue: 32, sat: 1 },
  { key: "green", label: "green", hue: 138, sat: 0.9 },
];

// Highlight toners: the warm end that pairs with cool shadows, plus a few others.
const HIGHLIGHT_TONERS: Toner[] = [
  { key: "neutral", label: "neutral", hue: 0, sat: 0 },
  { key: "warm", label: "warm amber", hue: 40, sat: 1 },
  { key: "gold", label: "gold", hue: 52, sat: 1 },
  { key: "rose", label: "rose", hue: 350, sat: 0.85 },
  { key: "blue", label: "cool", hue: 216, sat: 0.8 },
];

// hsl -> rgb (0..1), s and l in 0..1. Standard conversion.
function hslToRgb(h: number, s: number, l: number): RGB {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const hp = (((h % 360) + 360) % 360) / 60;
  const x = c * (1 - Math.abs((hp % 2) - 1));
  let r = 0, g = 0, b = 0;
  if (hp < 1) [r, g, b] = [c, x, 0];
  else if (hp < 2) [r, g, b] = [x, c, 0];
  else if (hp < 3) [r, g, b] = [0, c, x];
  else if (hp < 4) [r, g, b] = [0, x, c];
  else if (hp < 5) [r, g, b] = [x, 0, c];
  else [r, g, b] = [c, 0, x];
  const m = l - c / 2;
  return [r + m, g + m, b + m];
}

// A toner's zero-luminance color push: the vivid hue with its own luminance subtracted, so
// adding it shifts color but not brightness. Scaled by saturation.
function chromaPush(t: Toner): RGB {
  if (t.sat <= 0) return [0, 0, 0];
  const [r, g, b] = hslToRgb(t.hue, 1, 0.5);
  const y = LUMA[0] * r + LUMA[1] * g + LUMA[2] * b;
  return [(r - y) * t.sat, (g - y) * t.sat, (b - y) * t.sat];
}

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

// The split: shadows get the shadow push where Y is low, highlights get the highlight push
// where Y is high, midtones near the pivot stay neutral. amount scales the whole effect.
function tone(Y: number, shadow: Toner, highlight: Toner, amount: number): RGB {
  const pivot = 0.5;
  const sW = Math.pow(clamp01((pivot - Y) / pivot), 1.3); // 1 at black, 0 at mid
  const hW = Math.pow(clamp01((Y - pivot) / (1 - pivot)), 1.3); // 1 at white, 0 at mid
  const s = chromaPush(shadow);
  const h = chromaPush(highlight);
  const k = amount * 0.9;
  return [
    clamp01(Y + k * (sW * s[0] + hW * h[0])),
    clamp01(Y + k * (sW * s[1] + hW * h[1])),
    clamp01(Y + k * (sW * s[2] + hW * h[2])),
  ];
}

const toCss = ([r, g, b]: RGB) =>
  `rgb(${Math.round(r * 255)}, ${Math.round(g * 255)}, ${Math.round(b * 255)})`;

// The scene, as flat regions each with a fixed tone Y, spanning the full scale from a deep
// shadow (the tree) to a near-white (the sun). paint() turns a Y into a fill.
function Scene({ paint }: { paint: (Y: number) => string }) {
  const SKY = [0.9, 0.84, 0.78, 0.72, 0.66];
  return (
    <g>
      {SKY.map((y, i) => (
        <rect key={i} x={0} y={i * 19} width={260} height={19.5} fill={paint(y)} />
      ))}
      <circle cx={206} cy={33} r={13} fill={paint(0.97)} />
      {/* mid: the far ridge */}
      <path d="M0,104 L42,74 L74,93 L112,66 L152,90 L198,71 L260,95 L260,128 L0,128 Z" fill={paint(0.44)} />
      {/* shadow: the near hill */}
      <path d="M0,116 Q78,102 140,114 T260,112 L260,175 L0,175 Z" fill={paint(0.15)} />
      {/* deep shadow: a lone tree on the hill */}
      <g fill={paint(0.06)}>
        <rect x={66} y={128} width={4.5} height={26} />
        <path d="M68,106 L55,140 L81,140 Z" />
        <path d="M68,116 L58,146 L78,146 Z" />
      </g>
    </g>
  );
}

const grey = (Y: number) => {
  const v = Math.round(clamp01(Y) * 255);
  return `rgb(${v}, ${v}, ${v})`;
};

function lookName(shadow: Toner, highlight: Toner): string {
  if (shadow.sat === 0 && highlight.sat === 0) return "a straight grey print, no toning at all";
  if (shadow.key === "selenium") return "selenium: cool, aubergine shadows over a plain highlight";
  if (shadow.key === "sepia" && (highlight.key === "warm" || highlight.key === "gold" || highlight.sat === 0))
    return "sepia: a warm print, end to end";
  if ((shadow.key === "blue" || shadow.key === "teal") && (highlight.key === "warm" || highlight.key === "gold" || highlight.key === "rose"))
    return "cool shadows, warm highlights: the cinematic split";
  if ((shadow.key === "blue" || shadow.key === "teal") && highlight.key === "blue")
    return "a cool, cyanotype-blue cast across the whole scale";
  return `shadows toned ${shadow.label}, highlights toned ${highlight.label}`;
}

function SwatchRow({
  label,
  toners,
  value,
  onChange,
  end,
}: {
  label: string;
  toners: Toner[];
  value: string;
  onChange: (key: string) => void;
  end: "shadow" | "highlight";
}) {
  return (
    <div>
      <span className="mb-1.5 block font-mono text-xs text-comment">{label}</span>
      <div className="flex flex-wrap gap-2" role="group" aria-label={label}>
        {toners.map((t) => {
          const active = t.key === value;
          // preview chip: the toner pushed onto a representative tone for this end
          const chip = t.sat === 0
            ? grey(end === "shadow" ? 0.28 : 0.82)
            : toCss(tone(end === "shadow" ? 0.18 : 0.86, end === "shadow" ? t : { ...t, sat: 0 }, end === "highlight" ? t : { ...t, sat: 0 }, 1));
          return (
            <button
              key={t.key}
              type="button"
              onClick={() => onChange(t.key)}
              aria-pressed={active}
              className={`flex items-center gap-2 rounded border px-2.5 py-1 font-mono text-[0.7rem] transition-colors motion-reduce:transition-none ${
                active ? "border-accent bg-accent/15 text-accent" : "border-border text-muted hover:bg-surface-2"
              }`}
            >
              <span className="inline-block h-3.5 w-3.5 rounded-sm border border-border" style={{ backgroundColor: chip }} />
              {t.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function BlackAndWhiteConversionWidget() {
  const [shadowKey, setShadowKey] = useState("blue");
  const [highlightKey, setHighlightKey] = useState("warm");
  const [amount, setAmount] = useState(55);
  const [grain, setGrain] = useState(28);
  const gid = useId().replace(/:/g, "");

  const shadow = SHADOW_TONERS.find((t) => t.key === shadowKey) ?? SHADOW_TONERS[0];
  const highlight = HIGHLIGHT_TONERS.find((t) => t.key === highlightKey) ?? HIGHLIGHT_TONERS[0];
  const amt = amount / 100;

  const paintToned = (Y: number) => toCss(tone(Y, shadow, highlight, amt));
  const grainOpacity = (grain / 100) * 0.85;

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* the print */}
        <div className="lg:w-[52%]">
          <p className="mb-2 font-mono text-xs text-comment">{"// a converted grey print, waiting to be finished"}</p>
          <svg viewBox="0 0 260 175" className="w-full rounded-md border border-border" role="img" aria-label={`A black-and-white landscape print. ${lookName(shadow, highlight)}. Grain at ${grain} percent.`}>
            <defs>
              <clipPath id={`bwc-frame-${gid}`}>
                <rect x={0} y={0} width={260} height={175} rx={6} />
              </clipPath>
              <filter id={`bwc-grain-${gid}`} x="0" y="0" width="100%" height="100%">
                <feTurbulence type="fractalNoise" baseFrequency="0.7" numOctaves={2} seed={7} stitchTiles="stitch" result="n" />
                <feColorMatrix
                  in="n"
                  type="matrix"
                  values="0.34 0.34 0.34 0 0  0.34 0.34 0.34 0 0  0.34 0.34 0.34 0 0  0 0 0 0 1"
                  result="mono"
                />
                <feComponentTransfer in="mono">
                  <feFuncR type="linear" slope="1.7" intercept="-0.35" />
                  <feFuncG type="linear" slope="1.7" intercept="-0.35" />
                  <feFuncB type="linear" slope="1.7" intercept="-0.35" />
                </feComponentTransfer>
              </filter>
            </defs>
            <g clipPath={`url(#bwc-frame-${gid})`}>
              <Scene paint={paintToned} />
              {grain > 0 && (
                <rect
                  x={0}
                  y={0}
                  width={260}
                  height={175}
                  filter={`url(#bwc-grain-${gid})`}
                  opacity={grainOpacity}
                  style={{ mixBlendMode: "soft-light" }}
                />
              )}
            </g>
            <rect x={0.5} y={0.5} width={259} height={174} rx={6} fill="none" stroke="var(--border)" />
          </svg>
          <p className="mt-2 font-mono text-[0.7rem] leading-relaxed text-fg/90">{lookName(shadow, highlight)}.</p>
        </div>

        {/* the finishing controls */}
        <div className="lg:flex-1">
          <div className="space-y-3">
            <SwatchRow label="shadow toner" toners={SHADOW_TONERS} value={shadowKey} onChange={setShadowKey} end="shadow" />
            <SwatchRow label="highlight toner" toners={HIGHLIGHT_TONERS} value={highlightKey} onChange={setHighlightKey} end="highlight" />
          </div>

          <div className="mt-4 space-y-4">
            <label className="block">
              <span className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-comment">split strength</span>
                <span className={amount > 0 ? "text-accent" : "text-muted"}>{amount}</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                aria-label="Split-tone strength"
                className="mt-1 w-full accent-accent"
              />
            </label>
            <label className="block">
              <span className="flex items-baseline justify-between font-mono text-xs">
                <span className="text-comment">grain</span>
                <span className={grain > 0 ? "text-accent" : "text-muted"}>{grain}</span>
              </span>
              <input
                type="range"
                min={0}
                max={100}
                value={grain}
                onChange={(e) => setGrain(Number(e.target.value))}
                aria-label="Grain amount"
                className="mt-1 w-full accent-accent"
              />
            </label>
          </div>

          {/* quick starts: the darkroom's named looks */}
          <div className="mt-4">
            <span className="mb-2 block font-mono text-[0.7rem] text-comment">{"// quick starts"}</span>
            <div className="flex flex-wrap gap-2">
              {[
                { label: "straight grey", s: "neutral", h: "neutral", a: 0, g: 0 },
                { label: "split (cool/warm)", s: "blue", h: "warm", a: 55, g: 28 },
                { label: "selenium", s: "selenium", h: "neutral", a: 48, g: 20 },
                { label: "sepia", s: "sepia", h: "gold", a: 60, g: 34 },
              ].map((p) => {
                const active = shadowKey === p.s && highlightKey === p.h && amount === p.a && grain === p.g;
                return (
                  <button
                    key={p.label}
                    type="button"
                    onClick={() => {
                      setShadowKey(p.s);
                      setHighlightKey(p.h);
                      setAmount(p.a);
                      setGrain(p.g);
                    }}
                    aria-pressed={active}
                    className={`rounded border px-2.5 py-1 font-mono text-[0.7rem] transition-colors ${
                      active ? "border-accent bg-accent/10 text-accent" : "border-border bg-surface-2 text-muted hover:border-accent/60 hover:text-accent"
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>

          <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
            {"// two hues at the two ends of the scale is the whole of split toning. grain is the surface the tones sit on."}
          </p>
        </div>
      </div>
    </div>
  );
}
