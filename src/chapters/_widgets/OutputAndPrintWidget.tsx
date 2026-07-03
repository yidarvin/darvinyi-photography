import { useId, useMemo, useState } from "react";
import type { ReactNode } from "react";

// OutputAndPrintWidget: the signature widget for "Output and print".
// One focused interaction: SOFT-PROOF a finished frame. Flip the same master between how it
// glows on the screen and how it will sit on a sheet of paper, and watch it change. A print
// is a smaller box than a screen in three ways, and the widget lets the reader feel all three
// and then choose how the picture is fitted into the box. React state only, no persistence.
//
// The model is honest but schematic. Every region of the scene is an RGB color. A paper is
// three numbers: the WHITE it can show (a ceiling below screen white), the BLACK it can hold
// (a floor above screen black, set by the paper's Dmax), and how much of the master's chroma
// it can carry (its gamut). A pixel is split into its luminance Y and a chroma vector
// (r - Y, g - Y, b - Y), exactly as the black-and-white chapter's toning did, so tone and
// color can be remapped separately. The rendering intent decides the remap:
//   - perceptual: squeeze the WHOLE tonal range into the paper's box and pull ALL chroma in
//     by the paper's gamut, so nothing clips but everything flattens a little.
//   - relative colorimetric: leave colors that already fit UNCHANGED, and clip only what does
//     not: highlights above paper white blow flat, and (without black point compensation)
//     shadows below the paper's black crush together, while over-saturated colors clip to the
//     gamut boundary. Black point compensation rescales the shadows so their separation is
//     kept instead of crushed.
// The gamut warning marks every region the paper cannot print as-is, before any remap.

type RGB = [number, number, number];

const LUMA: RGB = [0.2126, 0.7152, 0.0722]; // Rec. 709

interface Paper {
  key: string;
  label: string;
  white: number; // brightest tone the paper shows (0..1), below screen white
  black: number; // darkest tone the paper holds (0..1), above screen black; set by Dmax
  gamut: number; // fraction of the scene's peak chroma the paper can carry (0..1)
  note: string;
}

// Four papers from glossy to newsprint, ordered by how large a box they give you. The numbers
// are schematic but ranked the way real Dmax and gamut are: baryta holds the deepest black and
// the widest color, matte rag is softer, newsprint is a small box on purpose.
const PAPERS: Paper[] = [
  { key: "baryta", label: "glossy baryta", white: 0.97, black: 0.05, gamut: 0.9, note: "deep black, wide gamut" },
  { key: "luster", label: "luster", white: 0.95, black: 0.08, gamut: 0.8, note: "a touch less punch" },
  { key: "matte", label: "matte rag", white: 0.9, black: 0.16, gamut: 0.62, note: "raised black, softer color" },
  { key: "news", label: "newsprint", white: 0.8, black: 0.24, gamut: 0.42, note: "a small box on purpose" },
];

// The scene: flat regions spanning the full tonal range and carrying a few saturated colors,
// so the tonal squeeze and the gamut clip both have something to bite on.
interface Shape {
  id: string;
  rgb: RGB;
  render: (fill: string, key: string) => ReactNode;
}

const SKY_ROWS: RGB[] = [
  [0.26, 0.46, 0.86],
  [0.36, 0.55, 0.88],
  [0.48, 0.64, 0.9],
  [0.6, 0.73, 0.92],
];

const SHAPES: Shape[] = [
  ...SKY_ROWS.map((rgb, i) => ({
    id: `sky-${i}`,
    rgb,
    render: (fill: string, key: string) => <rect key={key} x={0} y={i * 20} width={260} height={20.5} fill={fill} />,
  })),
  {
    id: "sun",
    rgb: [0.99, 0.98, 0.9] as RGB,
    render: (fill: string, key: string) => <circle key={key} cx={210} cy={30} r={14} fill={fill} />,
  },
  {
    id: "roof",
    rgb: [0.91, 0.29, 0.18] as RGB, // vivid red: bright and saturated, first to fall out of gamut
    render: (fill: string, key: string) => <path key={key} d="M0,80 L86,80 L64,104 L0,104 Z" fill={fill} />,
  },
  {
    id: "sign",
    rgb: [0.1, 0.74, 0.68] as RGB, // vivid teal accent: the other saturated element
    render: (fill: string, key: string) => <rect key={key} x={150} y={82} width={30} height={16} rx={2} fill={fill} />,
  },
  {
    id: "ridge",
    rgb: [0.44, 0.53, 0.36] as RGB, // muted green: comfortably in gamut
    render: (fill: string, key: string) => <path key={key} d="M0,96 L96,84 L150,98 L200,86 L260,100 L260,132 L0,132 Z" fill={fill} />,
  },
  {
    id: "hill",
    rgb: [0.2, 0.26, 0.22] as RGB,
    render: (fill: string, key: string) => <path key={key} d="M0,120 Q120,108 260,118 L260,175 L0,175 Z" fill={fill} />,
  },
  {
    id: "tree",
    rgb: [0.05, 0.06, 0.05] as RGB, // deep shadow: crushes on a high-black paper without BPC
    render: (fill: string, key: string) => (
      <g key={key} fill={fill}>
        <rect x={62} y={128} width={4.5} height={26} />
        <path d="M64,104 L51,140 L77,140 Z" />
        <path d="M64,114 L54,146 L74,146 Z" />
      </g>
    ),
  },
];

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const lumaOf = ([r, g, b]: RGB) => LUMA[0] * r + LUMA[1] * g + LUMA[2] * b;
const chromaVec = (rgb: RGB): RGB => {
  const y = lumaOf(rgb);
  return [rgb[0] - y, rgb[1] - y, rgb[2] - y];
};
const chromaMag = (rgb: RGB) => {
  const [a, b, c] = chromaVec(rgb);
  return Math.sqrt(a * a + b * b + c * c);
};

// The scene's peak chroma, so "gamut" is a fraction of what the picture actually contains.
const CMAX = Math.max(...SHAPES.map((s) => chromaMag(s.rgb)));

const toCss = ([r, g, b]: RGB) => `rgb(${Math.round(clamp01(r) * 255)}, ${Math.round(clamp01(g) * 255)}, ${Math.round(clamp01(b) * 255)})`;

type Intent = "perceptual" | "relative";

// Is this color outside the paper's box, before any remap?
function outOfGamut(rgb: RGB, paper: Paper): boolean {
  const y = lumaOf(rgb);
  return y > paper.white || y < paper.black || chromaMag(rgb) > paper.gamut * CMAX;
}

// Remap a master color for a paper under an intent. This is the soft proof.
function proof(rgb: RGB, paper: Paper, intent: Intent, bpc: boolean): RGB {
  const y = lumaOf(rgb);
  const cv = chromaVec(rgb);
  const span = paper.white - paper.black;

  let yOut: number;
  let cScale: number;

  if (intent === "perceptual") {
    // squeeze the whole range into the box, and pull all chroma in by the paper's gamut
    yOut = paper.black + y * span;
    cScale = paper.gamut;
  } else {
    // relative colorimetric: keep what fits, clip what does not
    if (bpc) {
      // black point compensation: rescale so shadow separation survives, highlights still clip
      yOut = Math.min(paper.black + y * span, paper.white);
    } else {
      yOut = Math.min(y, paper.white);
      if (yOut < paper.black) yOut = paper.black; // shadows below Dmax crush together
    }
    const cmag = chromaMag(rgb);
    const ceiling = paper.gamut * CMAX;
    cScale = cmag > ceiling ? ceiling / cmag : 1; // only the over-saturated colors move
  }

  return [yOut + cScale * cv[0], yOut + cScale * cv[1], yOut + cScale * cv[2]];
}

function Toggle<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { key: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) {
  return (
    <div>
      <span className="mb-1.5 block font-mono text-xs text-comment">{label}</span>
      <div className="flex flex-wrap gap-1.5" role="group" aria-label={label}>
        {options.map((o) => {
          const active = o.key === value;
          return (
            <button
              key={o.key}
              type="button"
              onClick={() => onChange(o.key)}
              aria-pressed={active}
              className={`rounded border px-2.5 py-1 font-mono text-[0.7rem] transition-colors motion-reduce:transition-none ${
                active ? "border-accent bg-accent/15 text-accent" : "border-border text-muted hover:bg-surface-2"
              }`}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function OutputAndPrintWidget() {
  const [medium, setMedium] = useState<"screen" | "print">("print");
  const [paperKey, setPaperKey] = useState("matte");
  const [intent, setIntent] = useState<Intent>("perceptual");
  const [bpc, setBpc] = useState(true);
  const [warn, setWarn] = useState(false);
  const uid = useId().replace(/:/g, "");

  const paper = PAPERS.find((p) => p.key === paperKey) ?? PAPERS[0];
  const onPrint = medium === "print";

  const paint = (rgb: RGB) => (onPrint ? toCss(proof(rgb, paper, intent, bpc)) : toCss(rgb));

  // how many regions the paper cannot print as-is
  const outCount = useMemo(() => SHAPES.filter((s) => outOfGamut(s.rgb, paper)).length, [paper]);

  const caption = onPrint
    ? `soft proof: ${paper.label}, ${intent === "perceptual" ? "perceptual" : `relative colorimetric${bpc ? " + BPC" : ""}`}`
    : "the master, glowing on the screen";

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-5 lg:flex-row">
        {/* the image */}
        <div className="lg:w-[52%]">
          <p className="mb-2 font-mono text-xs text-comment">{`// ${caption}`}</p>
          <svg
            viewBox="0 0 260 175"
            className="w-full rounded-md border border-border"
            role="img"
            aria-label={
              onPrint
                ? `The photograph soft-proofed for ${paper.label} using ${intent === "perceptual" ? "perceptual" : "relative colorimetric"} rendering intent${intent === "relative" && bpc ? " with black point compensation" : ""}. ${outCount} of ${SHAPES.length} regions fall outside this paper's range.`
                : "The finished photograph as it appears on the screen, at full brightness and full saturation."
            }
          >
            <defs>
              <clipPath id={`oap-frame-${uid}`}>
                <rect x={0} y={0} width={260} height={175} rx={6} />
              </clipPath>
              <pattern id={`oap-warn-${uid}`} width={7} height={7} patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
                <rect width={7} height={7} fill="var(--accent)" fillOpacity={0.12} />
                <line x1={0} y1={0} x2={0} y2={7} stroke="var(--accent)" strokeWidth={1.4} strokeOpacity={0.9} />
              </pattern>
            </defs>
            <g clipPath={`url(#oap-frame-${uid})`}>
              {SHAPES.map((s) => s.render(paint(s.rgb), s.id))}
              {/* gamut-warning overlay: mark what the paper cannot print, before the remap */}
              {onPrint &&
                warn &&
                SHAPES.filter((s) => outOfGamut(s.rgb, paper)).map((s) => s.render(`url(#oap-warn-${uid})`, `warn-${s.id}`))}
            </g>
            <rect x={0.5} y={0.5} width={259} height={174} rx={6} fill="none" stroke="var(--border)" />
          </svg>
          <p className="mt-2 font-mono text-[0.7rem] leading-relaxed text-comment">
            {"// "}
            {onPrint ? (
              <>
                <span className="text-fg/90">{outCount}</span> of {SHAPES.length} regions land outside this paper
              </>
            ) : (
              <>a screen shows every tone and color the file holds</>
            )}
          </p>
        </div>

        {/* the controls */}
        <div className="lg:flex-1">
          <div className="space-y-3">
            <Toggle
              label="where you are looking"
              options={[
                { key: "screen" as const, label: "screen" },
                { key: "print" as const, label: "paper (soft proof)" },
              ]}
              value={medium}
              onChange={setMedium}
            />

            <div className={onPrint ? "space-y-3" : "pointer-events-none space-y-3 opacity-40"}>
              <Toggle label="paper" options={PAPERS.map((p) => ({ key: p.key, label: p.label }))} value={paperKey} onChange={setPaperKey} />
              <p className="font-mono text-[0.7rem] text-comment">
                {"/* "}
                {paper.note}
                {" */"}
              </p>
              <Toggle
                label="rendering intent"
                options={[
                  { key: "perceptual" as const, label: "perceptual" },
                  { key: "relative" as const, label: "relative colorimetric" },
                ]}
                value={intent}
                onChange={setIntent}
              />

              <div className="flex flex-wrap gap-4 pt-1">
                <label className={`flex items-center gap-2 font-mono text-xs ${intent === "relative" ? "text-fg/90" : "text-comment/60"}`}>
                  <input
                    type="checkbox"
                    checked={bpc}
                    disabled={intent !== "relative"}
                    onChange={(e) => setBpc(e.target.checked)}
                    className="h-3.5 w-3.5 accent-accent"
                  />
                  black point compensation
                </label>
                <label className="flex items-center gap-2 font-mono text-xs text-fg/90">
                  <input type="checkbox" checked={warn} onChange={(e) => setWarn(e.target.checked)} className="h-3.5 w-3.5 accent-accent" />
                  gamut warning
                </label>
              </div>
            </div>
          </div>

          <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
            {"// flip screen and paper to feel the squeeze. perceptual pulls everything in and keeps separation; relative keeps the fitting colors exact and clips the rest."}
          </p>
        </div>
      </div>
    </div>
  );
}
