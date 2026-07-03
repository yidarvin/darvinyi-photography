import type { ReactNode } from "react";

// ColorGradingFigure: the signature figure for "Color grading".
// Inline SVG, themed with the CSS variables so the chrome matches the house style and
// stays crisp at any width. Teaching hues (the swatches, the temp/tint plane, the HSL
// bands, the three grading wheels) use hsl() literals because the figure is about color
// itself; everything structural (frames, spine, text, the accent used to flag the one
// correction step) resolves to the palette tokens.
//
// The structural claim: color editing is a STACK run in one order, from the global
// rendering at the top to the targeted push at the bottom. Four stages, reading down:
//   01 profile / calibration  -- the baseline color science (where two cameras differ)
//   02 white balance          -- temperature + tint, set to a neutral
//   03 HSL / color mixer       -- eight hue bands, each with hue / sat / luminance
//   04 color grading           -- shadows / midtones / highlights wheels, for mood
// Exactly one of these is CORRECTION: white balance has a right answer, the neutral.
// The other three are CHOICE: there is no correct profile, HSL, or grade, only a chosen
// one. The figure flags the white-balance stage in accent and tags each stage so the
// reader can hold the whole panel as one ordered idea: correct first, then choose.

// The eight HSL hue bands, in panel order.
const HSL_BANDS = [0, 30, 52, 130, 180, 220, 275, 320];

// The three grading wheels: shadows pushed to teal, mids left neutral, highlights to
// orange -- the canonical warm-highlights / cool-shadows grade.
const WHEELS = [
  { label: "S", hue: 185, push: 1 }, // shadows -> teal
  { label: "M", hue: 0, push: 0 }, // midtones -> neutral
  { label: "H", hue: 32, push: 1 }, // highlights -> orange
];

// Vertical card geometry (viewBox 0 0 600 452). Four stacked cards down the frame.
const CARD_X = 72;
const CARD_W = 508;
const CARD_H = 66;
const ROWS = [58, 142, 226, 310];
const SPINE_X = 44;
const cy = (row: number) => row + CARD_H / 2;

export function ColorGradingFigure() {
  return (
    <svg
      viewBox="0 0 600 452"
      className="w-full min-w-[540px]"
      role="img"
      aria-label="Color editing drawn as a vertical stack of four stages run in order from top to bottom. Stage one is the camera profile or calibration, the baseline color rendering, shown as two slightly different neutral swatches to stand for two cameras' color sciences. Stage two is white balance, shown as a temperature axis from blue to amber beside a tint axis from green to magenta with a dot at the neutral centre. Stage three is the HSL or colour mixer, shown as eight vertical bars in hue order, each carrying a hue, saturation, and luminance control. Stage four is colour grading, shown as three small wheels for shadows, midtones, and highlights, with the shadow wheel pushed toward teal and the highlight wheel toward orange. A spine down the left links the stages in order. Only the white-balance stage is flagged as correction, a step with one right answer, the neutral. The profile, HSL, and grading stages are each tagged as choice, steps with no correct setting, only a chosen one. The figure says: correct the white balance first, then make the color choices."
      fill="none"
    >
      <text x={20} y={22} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// the stack runs top to bottom: global rendering down to a targeted push"}
      </text>
      <text x={20} y={39} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// one stage is correction (a right answer). the rest are choices."}
      </text>

      {/* the spine that orders the stages */}
      <line x1={SPINE_X} y1={cy(ROWS[0])} x2={SPINE_X} y2={cy(ROWS[3])} stroke="var(--comment)" strokeWidth={1.4} />
      {ROWS.map((r) => (
        <circle key={r} cx={SPINE_X} cy={cy(r)} r={3.4} fill="var(--bg)" stroke="var(--comment)" strokeWidth={1.4} />
      ))}
      {/* downward arrowheads between the cards */}
      {[0, 1, 2].map((i) => {
        const yMid = (cy(ROWS[i]) + cy(ROWS[i + 1])) / 2;
        return (
          <path key={i} d={`M ${SPINE_X - 3.5} ${yMid - 3} L ${SPINE_X} ${yMid + 2} L ${SPINE_X + 3.5} ${yMid - 3}`} stroke="var(--comment)" strokeWidth={1.2} />
        );
      })}

      {/* ---- card 01: profile / calibration ---- */}
      <StageCard row={ROWS[0]} index="01" name="profile / calibration" sub="the baseline color" tag="choice: pick a start" correction={false}>
        <g transform={`translate(300 ${cy(ROWS[0])})`}>
          <rect x={-34} y={-16} width={30} height={32} rx={3} fill="hsl(32, 26%, 58%)" stroke="var(--border)" />
          <rect x={4} y={-16} width={30} height={32} rx={3} fill="hsl(205, 22%, 56%)" stroke="var(--border)" />
          <text x={0} y={30} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
            two color sciences
          </text>
        </g>
      </StageCard>

      {/* ---- card 02: white balance (the one correction) ---- */}
      <StageCard row={ROWS[1]} index="02" name="white balance" sub="temperature + tint" tag="correction: one neutral" correction>
        <g transform={`translate(276 ${cy(ROWS[1])})`}>
          {/* temperature axis: blue -> amber */}
          <defs>
            <linearGradient id="cg-temp" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="hsl(215, 70%, 55%)" />
              <stop offset="0.5" stopColor="hsl(0, 0%, 62%)" />
              <stop offset="1" stopColor="hsl(35, 80%, 58%)" />
            </linearGradient>
            <linearGradient id="cg-tint" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0" stopColor="hsl(300, 55%, 60%)" />
              <stop offset="0.5" stopColor="hsl(0, 0%, 62%)" />
              <stop offset="1" stopColor="hsl(120, 45%, 52%)" />
            </linearGradient>
          </defs>
          <rect x={-8} y={-16} width={70} height={16} rx={2} fill="url(#cg-temp)" stroke="var(--border)" strokeWidth={0.6} />
          <rect x={66} y={-16} width={12} height={32} rx={2} fill="url(#cg-tint)" stroke="var(--border)" strokeWidth={0.6} />
          <circle cx={27} cy={-8} r={3} fill="var(--surface)" stroke="var(--fg)" strokeWidth={1.4} />
          <text x={-8} y={12} fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
            blue
          </text>
          <text x={62} y={12} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
            amber
          </text>
          <text x={90} y={-9} fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
            tint
          </text>
        </g>
      </StageCard>

      {/* ---- card 03: HSL / color mixer ---- */}
      <StageCard row={ROWS[2]} index="03" name="HSL / color mixer" sub="eight hue bands" tag="choice: retarget a hue" correction={false}>
        <g transform={`translate(268 ${cy(ROWS[2])})`}>
          {HSL_BANDS.map((h, i) => (
            <rect key={h} x={i * 13} y={-16} width={9} height={32} rx={1.5} fill={`hsl(${h}, 60%, 52%)`} />
          ))}
          <text x={52} y={30} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
            hue · sat · lum, each band
          </text>
        </g>
      </StageCard>

      {/* ---- card 04: color grading wheels ---- */}
      <StageCard row={ROWS[3]} index="04" name="color grading" sub="shadows · mids · highlights" tag="choice: mood by zone" correction={false}>
        <g transform={`translate(300 ${cy(ROWS[3])})`}>
          {WHEELS.map((w, i) => {
            const wx = -56 + i * 40;
            const dotR = 8;
            const angle = -Math.PI / 4; // push up-right; hue carries the meaning
            const dx = w.push ? Math.cos(angle) * dotR : 0;
            const dy = w.push ? Math.sin(angle) * dotR : 0;
            return (
              <g key={w.label} transform={`translate(${wx} 0)`}>
                <circle cx={0} cy={0} r={13} fill="var(--surface-2)" stroke="var(--border)" />
                <line x1={-13} y1={0} x2={13} y2={0} stroke="var(--border)" strokeWidth={0.6} />
                <line x1={0} y1={-13} x2={0} y2={13} stroke="var(--border)" strokeWidth={0.6} />
                <circle cx={dx} cy={dy} r={4} fill={w.push ? `hsl(${w.hue}, 60%, 55%)` : "hsl(0, 0%, 55%)"} stroke="var(--bg)" strokeWidth={1} />
                <text x={0} y={24} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
                  {w.label}
                </text>
              </g>
            );
          })}
        </g>
      </StageCard>

      <text x={20} y={438} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// correct the white balance first, to a neutral. everything below it is taste."}
      </text>
    </svg>
  );
}

function StageCard({
  row,
  index,
  name,
  sub,
  tag,
  correction,
  children,
}: {
  row: number;
  index: string;
  name: string;
  sub: string;
  tag: string;
  correction: boolean;
  children: ReactNode;
}) {
  return (
    <g>
      <rect
        x={CARD_X}
        y={row}
        width={CARD_W}
        height={CARD_H}
        rx={6}
        fill="var(--surface)"
        stroke={correction ? "var(--accent)" : "var(--border)"}
        strokeWidth={correction ? 1.6 : 1}
      />
      <text x={CARD_X + 16} y={row + 26} fontFamily="var(--font-mono)" fontSize="13" fill={correction ? "var(--accent)" : "var(--fg-muted)"}>
        {index}
      </text>
      <text x={CARD_X + 16} y={row + 44} fontFamily="var(--font-mono)" fontSize="12" fill="var(--fg)">
        {name}
      </text>
      <text x={CARD_X + 16} y={row + 58} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {sub}
      </text>
      {children}
      <text
        x={CARD_X + CARD_W - 14}
        y={row + CARD_H / 2 + 4}
        textAnchor="end"
        fontFamily="var(--font-mono)"
        fontSize="9.5"
        fill={correction ? "var(--accent)" : "var(--comment)"}
      >
        {tag}
      </text>
    </g>
  );
}
