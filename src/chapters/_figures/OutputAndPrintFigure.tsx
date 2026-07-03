// OutputAndPrintFigure: the signature figure for "Output and print".
// Inline SVG, themed with the CSS variables so it matches the house style and stays crisp
// at any width. The structural claim of the chapter: your finished master file is bigger
// than any single output can show, and a reflective PRINT is a smaller delivery envelope
// than an emissive SCREEN. The figure draws both envelopes in the same lightness-by-chroma
// plane so the reader can see the three ways paper is smaller, all at once.
//
// The plane: vertical axis is lightness (black at the bottom, white at the top), horizontal
// axis is chroma (neutral greys on the left edge, more saturated toward the right). A device
// gamut plotted this way is a leaf: narrow at the black and white ends, widest through the
// midtones. The big leaf is the screen (sRGB / P3): it reaches a bright emissive white at the
// top, a near-true black at the bottom, and holds vivid color. The small nested leaf is the
// print: its ceiling is PAPER WHITE, which is dimmer than screen white; its floor is the
// INK BLACK the paper can hold (its Dmax), which is lighter than screen black; and it bulges
// less far right, because paper holds fewer saturated colors. Three of the master's colors
// (a bright cyan, a vivid red, a deep shadow) fall outside the print leaf; the teal arrows
// are the soft-proof remap that pulls each one onto the boundary the paper can actually
// print. One in-gamut color sits inside both and needs no move. That remap, choosing how the
// out-of-envelope colors come in, is the whole job of soft proofing and the rendering intent.

// Neutral axis (chroma = 0) and the plot bounds.
const NX = 116;
const XR = 556; // right edge of the plot

// The two envelopes, as leaf paths in the lightness-by-chroma plane.
const SCREEN_PATH = "M116 56 C 340 48, 536 108, 548 188 C 536 288, 330 360, 116 360 Z";
const PRINT_PATH = "M116 92 C 300 86, 414 132, 424 200 C 414 268, 292 320, 116 320 Z";

// A master color that must be remapped into the print leaf: where it wants to sit, where the
// paper can put it, and its real color so the reader can follow it.
interface Remap {
  from: [number, number];
  to: [number, number];
  color: string;
  label: string;
}

const REMAPS: Remap[] = [
  { from: [502, 150], to: [408, 160], color: "rgb(38, 205, 200)", label: "bright cyan" },
  { from: [470, 250], to: [372, 244], color: "rgb(210, 66, 54)", label: "vivid red" },
  { from: [118, 348], to: [118, 322], color: "rgb(70, 70, 70)", label: "deep shadow" },
];

// One color that already fits inside the print leaf and needs no remap.
const IN_GAMUT: [number, number] = [292, 214];

export function OutputAndPrintFigure() {
  return (
    <svg
      viewBox="0 0 600 460"
      className="w-full min-w-[560px]"
      role="img"
      aria-label="A lightness-by-chroma plane: the vertical axis is lightness from black at the bottom to white at the top, the horizontal axis is color saturation from neutral grey on the left to saturated on the right. Two nested leaf shapes are drawn. The larger leaf is the screen gamut: it reaches a bright white at the top, a near-black at the bottom, and holds vivid saturated color. The smaller nested leaf is the print gamut on paper: its top is lower, labelled paper white, its bottom is higher, labelled ink black or Dmax, and it does not reach as far into saturated color. Three of the master image's colors, a bright cyan, a vivid red, and a deep shadow, sit outside the print leaf; teal arrows show them being pulled onto the print boundary, which is the soft-proof remap. One muted color sits inside both leaves and is left unchanged. The figure shows that a print is a smaller delivery envelope than a screen in three ways at once: a lower white, a higher black, and a smaller color gamut."
      fill="none"
    >
      <text x={20} y={24} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// the master is bigger than any one output. a print is a smaller envelope than a screen."}
      </text>
      <text x={20} y={41} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// lower white, higher black, smaller gamut. output remaps the master into the box that fits."}
      </text>

      {/* axes: lightness up the left, chroma across the bottom */}
      <line x1={NX} y1={56} x2={NX} y2={372} stroke="var(--border)" strokeWidth={1} />
      <line x1={NX} y1={372} x2={XR} y2={372} stroke="var(--border)" strokeWidth={1} />
      <text x={NX - 10} y={62} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">white</text>
      <text x={NX - 10} y={360} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">black</text>
      <text x={NX - 8} y={214} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)" transform={`rotate(-90 ${NX - 8} 214)`}>lighter</text>
      <text x={XR} y={388} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">more saturated {"->"}</text>

      {/* the screen envelope: the larger leaf */}
      <path d={SCREEN_PATH} fill="var(--surface-2)" stroke="var(--fg-muted)" strokeWidth={1.25} strokeOpacity={0.9} />
      <text x={470} y={96} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-muted)">screen</text>
      <text x={470} y={109} fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">emissive, wide</text>

      {/* the print envelope: the smaller nested leaf, tinted with the accent so it reads as the target */}
      <path d={PRINT_PATH} fill="var(--accent)" fillOpacity={0.1} stroke="var(--accent)" strokeWidth={1.5} strokeOpacity={0.75} />
      <text x={300} y={244} fontFamily="var(--font-mono)" fontSize="10" fill="var(--accent)">print</text>

      {/* the two ceilings and the floor that make the print smaller */}
      <line x1={NX} y1={92} x2={250} y2={92} stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 2" />
      <text x={254} y={90} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--accent)">paper white</text>
      <line x1={NX} y1={320} x2={250} y2={320} stroke="var(--accent)" strokeWidth={1} strokeDasharray="3 2" />
      <text x={254} y={318} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--accent)">ink black (Dmax)</text>

      {/* the remap: master colors outside the print leaf, pulled onto the boundary */}
      <defs>
        <marker id="oap-arrow" viewBox="0 0 8 8" refX={6} refY={4} markerWidth={6} markerHeight={6} orient="auto-start-reverse">
          <path d="M0 0 L8 4 L0 8 z" fill="var(--accent)" />
        </marker>
      </defs>
      {REMAPS.map((m) => (
        <g key={m.label}>
          <line
            x1={m.from[0]}
            y1={m.from[1]}
            x2={m.to[0]}
            y2={m.to[1]}
            stroke="var(--accent)"
            strokeWidth={1.25}
            strokeDasharray="4 2"
            markerEnd="url(#oap-arrow)"
          />
          <circle cx={m.from[0]} cy={m.from[1]} r={6} fill={m.color} stroke="var(--fg)" strokeWidth={1} />
        </g>
      ))}

      {/* one color already inside both: no remap needed */}
      <circle cx={IN_GAMUT[0]} cy={IN_GAMUT[1]} r={6} fill="rgb(120, 140, 96)" stroke="var(--fg)" strokeWidth={1} />
      <text x={IN_GAMUT[0] + 10} y={IN_GAMUT[1] + 3} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--fg-muted)">in gamut: unchanged</text>

      {/* legend */}
      <text x={20} y={432} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {"// a filled dot is a master color; the teal arrow is the soft-proof remap onto the print boundary."}
      </text>
      <text x={20} y={447} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {"// perceptual squeezes the whole leaf inward; relative colorimetric clips only what falls outside."}
      </text>
    </svg>
  );
}
