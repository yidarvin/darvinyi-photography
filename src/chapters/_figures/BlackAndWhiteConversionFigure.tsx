// BlackAndWhiteConversionFigure: the signature figure for "Black-and-white conversion".
// Inline SVG, themed with the CSS variables so it matches the house style and stays crisp
// at any width. The structural claim of the chapter: the CONVERSION is not a button, it is
// a choice about where each color lands on the scale from black to white, and different
// choices REORDER the tones. The figure draws that reordering directly.
//
// Three tonal ladders stand side by side, white at the top and black at the bottom. The
// same four things (a blue sky, a red barn, a yellow field, a white cloud) are plotted on
// each ladder at the grey they become under a different conversion: the default luminance
// mix, a warm/red-filter mix, and a cool/blue-filter mix. A line tinted with each thing's
// real color connects its three tones, and the dot at every stop is filled with the grey it
// actually becomes. Follow the blue line and the red line: at the default they sit close
// together, under the red mix they fly apart and swap (the sky sinks, the barn leaps), and
// under the blue mix they swap back. The near-neutral cloud barely moves. That crossing is
// the whole idea: a mix is a dial that decides the tonal order, and it can even invert it.
//
// The greys are computed, not hand-placed, with the same honest model the chapter 16 widget
// uses: a colored filter re-scales the Rec. 709 luminance weights by its per-channel
// transmission and renormalizes them to sum to one, which holds a neutral grey fixed (the
// filter factor is the exposure you add back) and lets only the colored things move.

type RGB = [number, number, number];

const BASE: RGB = [0.2126, 0.7152, 0.0722]; // Rec. 709 luminance weights on sRGB values

// Four things in the scene, as flat regions of real color (shared with the sister chapter's
// palette so the two chapters agree).
const SKY: RGB = [60, 105, 190];
const BARN: RGB = [178, 58, 46];
const FIELD: RGB = [190, 170, 84];
const CLOUD: RGB = [230, 234, 236];

// Three conversions, each a per-channel transmission. "default" is a straight luminance
// desaturate; "red mix" passes red and blocks cyan/blue; "blue mix" does the reverse.
const MIXES: { key: string; label: string; t: RGB }[] = [
  { key: "default", label: "default", t: [1, 1, 1] },
  { key: "red", label: "red mix", t: [1, 0.06, 0.03] },
  { key: "blue", label: "blue mix", t: [0.22, 0.4, 1] },
];

// The grey (0..1) a color becomes under a filter, weights renormalized so neutrals hold.
function greyUnder([r, g, b]: RGB, [tr, tg, tb]: RGB): number {
  const wr = BASE[0] * tr;
  const wg = BASE[1] * tg;
  const wb = BASE[2] * tb;
  return (wr * r + wg * g + wb * b) / (wr + wg + wb) / 255;
}

const greyStr = (y: number) => {
  const v = Math.round(Math.max(0, Math.min(1, y)) * 255);
  return `rgb(${v}, ${v}, ${v})`;
};
const rgbStr = ([r, g, b]: RGB) => `rgb(${r}, ${g}, ${b})`;

// Ladder geometry: white at the top, black at the bottom.
const TOP = 92;
const BOT = 352;
const yOf = (grey: number) => TOP + (1 - grey) * (BOT - TOP);
const LADDER_X = [210, 372, 534];

const TRACERS: { color: RGB; name: string }[] = [
  { color: SKY, name: "blue sky" },
  { color: BARN, name: "red barn" },
  { color: FIELD, name: "yellow field" },
  { color: CLOUD, name: "white cloud" },
];

export function BlackAndWhiteConversionFigure() {
  return (
    <svg
      viewBox="0 0 600 430"
      className="w-full min-w-[560px]"
      role="img"
      aria-label="Three tonal ladders side by side, white at the top and black at the bottom, labelled default, red mix, and blue mix. A blue sky, a red barn, a yellow field, and a white cloud are each plotted on all three ladders at the grey they become under that conversion, joined by a line in the thing's real color, with the dot at each stop filled with the resulting grey. Under the default the blue sky and red barn sit close and mid-grey. Under the red mix they fly apart and swap order: the sky sinks toward black and the barn leaps toward white. Under the blue mix they swap back. The near-neutral white cloud stays near the top on all three. The figure shows that a channel mix decides the tonal order and can invert which color is lighter."
      fill="none"
    >
      <text x={20} y={24} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// the conversion decides where each color lands from black to white."}
      </text>
      <text x={20} y={41} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// same scene, three mixes. follow the blue and red lines: the mix reorders the tones."}
      </text>

      {/* the three ladders: a tonal scale bar, a label, and white/black anchors */}
      <defs>
        <linearGradient id="bwc-scale" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(238,238,238)" />
          <stop offset="1" stopColor="rgb(14,14,14)" />
        </linearGradient>
      </defs>
      {MIXES.map((m, i) => {
        const x = LADDER_X[i];
        return (
          <g key={m.key}>
            <rect x={x - 6} y={TOP} width={12} height={BOT - TOP} rx={3} fill="url(#bwc-scale)" stroke="var(--border)" strokeWidth={0.75} />
            <text x={x} y={TOP - 12} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill={m.key === "default" ? "var(--fg-muted)" : "var(--fg)"}>
              {m.label}
            </text>
            {i === 0 && (
              <>
                <text x={x - 14} y={TOP + 4} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">white</text>
                <text x={x - 14} y={BOT} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">black</text>
              </>
            )}
          </g>
        );
      })}

      {/* one tinted line per thing, connecting the grey it becomes under each mix */}
      {TRACERS.map((tr) => {
        const pts = MIXES.map((m, i) => ({ x: LADDER_X[i], y: yOf(greyUnder(tr.color, m.t)) }));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x} ${p.y.toFixed(1)}`).join(" ");
        return (
          <g key={tr.name}>
            <path d={d} stroke={rgbStr(tr.color)} strokeWidth={2} strokeOpacity={0.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {pts.map((p, i) => (
              <circle key={i} cx={p.x} cy={p.y} r={6.5} fill={greyStr(greyUnder(tr.color, MIXES[i].t))} stroke={rgbStr(tr.color)} strokeWidth={2} />
            ))}
          </g>
        );
      })}

      {/* annotate the crossing between the default and the red mix */}
      <text x={291} y={318} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
        they swap
      </text>
      <path d="M291 310 q0 -14 12 -24" stroke="var(--accent)" strokeWidth={1} fill="none" strokeDasharray="3 2" />

      {/* legend: which line is which thing, in its real color */}
      <text x={20} y={402} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {"// each dot is the grey that color becomes; the line is tinted with the real color:"}
      </text>
      {TRACERS.map((tr, i) => {
        const x = 24 + i * 140;
        return (
          <g key={tr.name} transform="translate(0 414)">
            <rect x={x} y={-9} width={12} height={12} rx={2} fill={rgbStr(tr.color)} stroke="var(--border)" strokeWidth={0.5} />
            <text x={x + 18} y={1} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
              {tr.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
