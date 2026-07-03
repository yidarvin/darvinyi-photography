// LocalAdjustmentsAndMaskingFigure: the signature figure for "Local adjustments and masking".
// Inline SVG, themed with the CSS variables so the chrome matches the house style and stays
// crisp at any width. The scene tones are grayscale rgb() literals because the figure is about
// TONE and where the eye lands; everything structural (frames, text, the teal used for the mask
// and the eye) resolves to the palette tokens.
//
// The structural claim: a local edit is TWO independent choices run as one operation.
//   mask (the WHERE)  x  adjustment (the WHAT)  =  local edit
// The mask is a grayscale selection that says where the sliders reach; the adjustment is the
// ordinary develop sliders, applied only inside it. Reading the equation left to right: select
// the subject (the WHERE), push exposure and contrast (the WHAT), and the result is a dodged
// subject against a burned surround, so the eye lands on the subject. Below the equation, the
// WHERE has four sources, and masks combine with add, subtract, and intersect. The figure says:
// separate the where from the what, and you can direct attention on purpose.

// Grayscale fill from a 0..1 luminance. Tone is the whole subject of the figure, so it is drawn
// literally rather than through a token.
const gray = (l: number) => {
  const v = Math.round(Math.max(0, Math.min(1, l)) * 255);
  return `rgb(${v}, ${v}, ${v})`;
};

// A small schematic scene: sky band, ground band, a person. Fixed 120x92 so the subject path is
// shared between the "select" panel and the "result" panel.
function MiniScene({
  subjectL,
  skyL,
  groundL,
  mode,
}: {
  subjectL: number;
  skyL: number;
  groundL: number;
  mode: "select" | "result";
}) {
  return (
    <g>
      <clipPath id={`las-clip-${mode}`}>
        <rect x={0} y={0} width={120} height={92} rx={4} />
      </clipPath>
      <g clipPath={`url(#las-clip-${mode})`}>
        <rect x={0} y={0} width={120} height={52} fill={gray(skyL)} />
        <rect x={0} y={52} width={120} height={40} fill={gray(groundL)} />
        {/* the person: head + torso */}
        <circle cx={60} cy={40} r={10} fill={gray(subjectL)} />
        <path d="M46 90 L51 58 Q60 51 69 58 L74 90 Z" fill={gray(subjectL)} />
        {mode === "select" && (
          <>
            {/* dim everything, then reveal the subject as the selected region */}
            <rect x={0} y={0} width={120} height={92} fill="var(--bg)" opacity={0.42} />
            <g>
              <circle cx={60} cy={40} r={10} fill="var(--accent)" opacity={0.34} />
              <path d="M46 90 L51 58 Q60 51 69 58 L74 90 Z" fill="var(--accent)" opacity={0.34} />
              <circle cx={60} cy={40} r={10} fill="none" stroke="var(--accent)" strokeWidth={1.2} strokeDasharray="3 2" />
              <path d="M46 90 L51 58 Q60 51 69 58 L74 90 Z" fill="none" stroke="var(--accent)" strokeWidth={1.2} strokeDasharray="3 2" />
            </g>
          </>
        )}
      </g>
      <rect x={0} y={0} width={120} height={92} rx={4} fill="none" stroke="var(--border)" />
      {mode === "result" && (
        <g>
          {/* the reticle: where the eye lands once the subject is dodged and the surround burned */}
          <circle cx={60} cy={48} r={13} fill="none" stroke="var(--accent)" strokeWidth={1.4} />
          <line x1={60} y1={31} x2={60} y2={41} stroke="var(--accent)" strokeWidth={1.4} />
          <line x1={60} y1={55} x2={60} y2={65} stroke="var(--accent)" strokeWidth={1.4} />
          <line x1={43} y1={48} x2={53} y2={48} stroke="var(--accent)" strokeWidth={1.4} />
          <line x1={67} y1={48} x2={77} y2={48} stroke="var(--accent)" strokeWidth={1.4} />
          <text x={60} y={106} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
            eye lands here
          </text>
        </g>
      )}
    </g>
  );
}

// The four ways to build the WHERE.
const SOURCES = [
  { key: "brush", label: "brush", sub: "paint it by hand" },
  { key: "gradient", label: "gradient", sub: "linear or radial" },
  { key: "range", label: "range", sub: "luma · color · depth" },
  { key: "ai", label: "AI select", sub: "subject · sky · object" },
];

export function LocalAdjustmentsAndMaskingFigure() {
  return (
    <svg
      viewBox="0 0 600 404"
      className="w-full min-w-[560px]"
      role="img"
      aria-label="A local photo edit drawn as an equation: a mask times an adjustment equals a local edit. On the left, a schematic scene of a person under a sky with the person outlined in teal as the selected region, labelled mask, the where. In the middle, three develop sliders pushed to the right, labelled adjustment, the what. On the right, the same scene with the person brightened and the sky and ground darkened, and a teal reticle on the person marked eye lands here, labelled local edit. Below the equation, a row of four cards names the four ways to build the where: a brush painted by hand, a linear or radial gradient, a range mask by luminance, color, or depth, and an AI selection of subject, sky, or object. A footer notes that masks combine by add, subtract, and intersect."
      fill="none"
    >
      <text x={20} y={22} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// a global edit moves every pixel. a local edit moves only where the mask is."}
      </text>
      <text x={20} y={39} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// mask = WHERE (a grayscale selection). adjustment = WHAT (the sliders). they are independent."}
      </text>

      {/* ---- the equation: mask x adjustment = local edit ---- */}
      {/* card: the WHERE */}
      <g transform="translate(24 66)">
        <rect x={0} y={0} width={150} height={150} rx={6} fill="var(--surface)" stroke="var(--border)" />
        <text x={14} y={20} fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg)">
          mask
        </text>
        <text x={14} y={33} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--accent)">
          the WHERE
        </text>
        <g transform="translate(15 40)">
          <MiniScene subjectL={0.46} skyL={0.5} groundL={0.4} mode="select" />
          <text x={60} y={106} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
            select the subject
          </text>
        </g>
      </g>

      {/* operator: apply through */}
      <g transform="translate(178 141)" fontFamily="var(--font-mono)" fill="var(--comment)">
        <text x={12} y={6} textAnchor="middle" fontSize="18" fill="var(--fg-muted)">
          &#215;
        </text>
        <text x={12} y={22} textAnchor="middle" fontSize="7.5">
          apply
        </text>
        <text x={12} y={31} textAnchor="middle" fontSize="7.5">
          through
        </text>
      </g>

      {/* card: the WHAT */}
      <g transform="translate(206 66)">
        <rect x={0} y={0} width={132} height={150} rx={6} fill="var(--surface)" stroke="var(--border)" />
        <text x={14} y={20} fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg)">
          adjustment
        </text>
        <text x={14} y={33} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--accent)">
          the WHAT
        </text>
        {[
          { label: "exposure", knob: 0.78 },
          { label: "contrast", knob: 0.68 },
          { label: "clarity", knob: 0.62 },
        ].map((s, i) => {
          const y = 54 + i * 30;
          const tx = 14;
          const tw = 104;
          return (
            <g key={s.label}>
              <text x={tx} y={y - 6} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
                {s.label}
              </text>
              <line x1={tx} y1={y} x2={tx + tw} y2={y} stroke="var(--border)" strokeWidth={2} strokeLinecap="round" />
              <line x1={tx + tw / 2} y1={y} x2={tx + tw * s.knob} y2={y} stroke="var(--accent-dim)" strokeWidth={2} strokeLinecap="round" />
              <circle cx={tx + tw * s.knob} cy={y} r={4} fill="var(--surface-2)" stroke="var(--accent)" strokeWidth={1.4} />
            </g>
          );
        })}
      </g>

      {/* operator: equals */}
      <text x={356} y={147} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="18" fill="var(--fg-muted)">
        =
      </text>

      {/* card: the RESULT */}
      <g transform="translate(376 66)">
        <rect x={0} y={0} width={150} height={150} rx={6} fill="var(--surface)" stroke="var(--accent)" strokeWidth={1.4} />
        <text x={14} y={20} fontFamily="var(--font-mono)" fontSize="11" fill="var(--accent)">
          local edit
        </text>
        <text x={14} y={33} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
          dodge + burn
        </text>
        <g transform="translate(15 40)">
          <MiniScene subjectL={0.82} skyL={0.32} groundL={0.24} mode="result" />
        </g>
      </g>

      {/* ---- the WHERE has four sources ---- */}
      <text x={20} y={250} fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--comment)">
        {"// the WHERE has four sources: different ways to draw the same kind of selection"}
      </text>

      {SOURCES.map((s, i) => {
        const x = 24 + i * 142;
        const y = 264;
        const w = 126;
        const h = 76;
        const cx = x + w / 2;
        return (
          <g key={s.key}>
            <rect x={x} y={y} width={w} height={h} rx={6} fill="var(--surface)" stroke="var(--border)" />
            <SourceIcon kind={s.key} x={x + 14} y={y + 16} />
            <text x={x + 46} y={y + 26} fontFamily="var(--font-mono)" fontSize="11" fill="var(--fg)">
              {s.label}
            </text>
            <text x={cx} y={y + 62} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
              {s.sub}
            </text>
          </g>
        );
      })}

      <text x={20} y={392} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// build the WHERE, then combine masks: add · subtract · intersect. the WHAT never changes."}
      </text>
    </svg>
  );
}

// Small glyphs for the four mask sources, top-left at (x, y).
function SourceIcon({ kind, x, y }: { kind: string; x: number; y: number }) {
  if (kind === "brush") {
    return (
      <g stroke="var(--accent)" strokeWidth={1.4} fill="none" strokeLinecap="round">
        <path d={`M${x} ${y + 20} L${x + 12} ${y + 8}`} />
        <path d={`M${x + 10} ${y + 6} l6 6 -3 5 -8 -8 z`} fill="var(--accent)" fillOpacity={0.25} />
        <circle cx={x + 2} cy={y + 20} r={2} fill="var(--accent)" stroke="none" />
      </g>
    );
  }
  if (kind === "gradient") {
    return (
      <g>
        <defs>
          <linearGradient id="las-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="var(--accent)" stopOpacity={0.7} />
            <stop offset="1" stopColor="var(--accent)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <rect x={x} y={y} width={22} height={22} rx={2} fill="url(#las-grad)" stroke="var(--border)" strokeWidth={0.6} />
      </g>
    );
  }
  if (kind === "range") {
    // a mini histogram with the mid slice picked out
    return (
      <g fill="var(--comment)">
        {[6, 12, 20, 16, 9, 5].map((bh, i) => (
          <rect key={i} x={x + i * 4} y={y + 22 - bh} width={3} height={bh} fill={i === 2 || i === 3 ? "var(--accent)" : "var(--comment)"} />
        ))}
      </g>
    );
  }
  // ai: dashed auto-outline around a subject dot
  return (
    <g>
      <rect x={x} y={y} width={22} height={22} rx={3} fill="none" stroke="var(--accent)" strokeWidth={1.2} strokeDasharray="3 2" />
      <circle cx={x + 11} cy={y + 9} r={3.4} fill="var(--accent)" fillOpacity={0.7} />
      <path d={`M${x + 5} ${y + 20} q6 -7 12 0`} fill="var(--accent)" fillOpacity={0.7} />
    </g>
  );
}
