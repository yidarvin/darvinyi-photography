// LensesOpticsAndPerspectiveFigure: the figure for "Lenses, optics, and perspective".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. The structure it encodes is why a lens has a best aperture rather
// than a "sharper the more you stop down" rule. Two flaws pull in opposite directions.
// Wide open, aberrations at the margin of the big opening keep the frame soft, and
// stopping down cuts them, so the sharpness the lens can reach (the aberration ceiling)
// rises to the right. Stop down far enough and diffraction spreads every point into a
// growing Airy disc, so the sharpness diffraction allows (the diffraction ceiling) falls
// to the right. Real sharpness is capped by whichever flaw is worse at that aperture, so
// the teal curve traces the lower of the two ceilings and peaks where they cross: the
// sweet spot, about two to three stops down. On the 60- and 100-megapixel sensors in this
// book the fine pixels pull the diffraction wall inward, so softening shows by ~f/8.

interface Stop {
  f: string; // f-number label
  ab: number; // sharpness ceiling set by aberrations (rises as you stop down)
  dif: number; // sharpness ceiling set by diffraction (falls as you stop down)
}

// Ceilings in arbitrary sharpness units (1.0 = the peak the lens actually reaches). The
// visible teal curve is min(ab, dif) at each stop: aberration-limited on the left,
// diffraction-limited on the right, crossing at the sweet spot near f/4-f/5.6.
const STOPS: Stop[] = [
  { f: "1.7", ab: 0.45, dif: 1.1 },
  { f: "2.8", ab: 0.73, dif: 1.08 },
  { f: "4", ab: 0.92, dif: 1.05 },
  { f: "5.6", ab: 1.02, dif: 1.0 },
  { f: "8", ab: 1.06, dif: 0.9 },
  { f: "11", ab: 1.08, dif: 0.75 },
  { f: "16", ab: 1.09, dif: 0.56 },
  { f: "22", ab: 1.1, dif: 0.4 },
];

const LEFT = 70; // x of the first stop
const STEP = 70; // x spacing between stops
const BOT = 250; // y of the sharpness = 0 baseline (the x-axis)
const SPAN = 165; // y units per 1.0 of sharpness
const TOP = 66; // top of the plot area

const xOf = (i: number) => LEFT + i * STEP;
const yOf = (s: number) => BOT - s * SPAN;
const totalOf = (s: Stop) => Math.min(s.ab, s.dif);

const poly = (pick: (s: Stop) => number) =>
  STOPS.map((s, i) => `${xOf(i).toFixed(1)},${yOf(pick(s)).toFixed(1)}`).join(" ");

const PEAK_I = 3; // f/5.6, the peak of the actual-sharpness curve
const F8_X = xOf(4); // where fine-pixel diffraction starts to bite

export function LensesOpticsAndPerspectiveFigure() {
  return (
    <svg
      viewBox="0 0 640 300"
      className="w-full min-w-[600px]"
      role="img"
      aria-label="A graph of lens sharpness against aperture, from f/1.7 wide open on the left to f/22 stopped down on the right. Two dashed lines mark the two limits: an aberration ceiling that is low wide open and rises as you stop down, and a diffraction ceiling that is high wide open and falls as you stop down. The solid teal curve is the sharpness the lens actually reaches, which follows whichever ceiling is lower, so it climbs from a soft wide-open corner, peaks in a marked sweet-spot band around f/4 to f/5.6 where the two ceilings cross, then falls again as diffraction takes over. A note marks that on the 60- and 100-megapixel sensors in this book, softening from diffraction shows by about f/8."
      fill="none"
    >
      {/* the governing statement, in the code-comment motif */}
      <text x={LEFT} y={24} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// two flaws pull opposite ways; sharpness peaks where they cross"}
      </text>
      <text x={LEFT} y={44} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        a lens is sharpest a few stops down, not wide open
      </text>

      {/* axes */}
      <line x1={62} y1={TOP} x2={62} y2={BOT} stroke="var(--border)" />
      <line x1={62} y1={BOT} x2={584} y2={BOT} stroke="var(--border)" />
      <text x={62} y={TOP - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        sharper
      </text>

      {/* the sweet-spot band, f/4 to f/5.6 */}
      <rect x={xOf(2) - 16} y={TOP} width={xOf(PEAK_I) - xOf(2) + 32} height={BOT - TOP} fill="var(--accent)" fillOpacity="0.07" stroke="var(--accent)" strokeOpacity="0.28" strokeDasharray="3 3" />
      <text x={(xOf(2) + xOf(PEAK_I)) / 2} y={TOP + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="11" fill="var(--accent)">
        sweet spot
      </text>
      <text x={(xOf(2) + xOf(PEAK_I)) / 2} y={TOP + 30} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        f/4 &ndash; f/5.6
      </text>

      {/* the two ceilings, dashed and muted, so the one teal curve stays the loud thing */}
      <polyline points={poly((s) => s.ab)} stroke="var(--fg-muted)" strokeWidth="1.3" strokeDasharray="2 3" strokeOpacity="0.85" />
      <polyline points={poly((s) => s.dif)} stroke="var(--fg-muted)" strokeWidth="1.3" strokeDasharray="7 4" strokeOpacity="0.85" />

      {/* the actual sharpness the lens reaches: the lower of the two ceilings */}
      <polyline points={poly(totalOf)} stroke="var(--accent)" strokeWidth="2.4" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={xOf(PEAK_I)} cy={yOf(totalOf(STOPS[PEAK_I]))} r="4" fill="var(--accent)" />

      {/* label each ceiling where it is visible above the teal curve */}
      <text x={xOf(1) + 6} y={yOf(STOPS[1].dif) - 6} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
        diffraction limit
      </text>
      <text x={xOf(6) - 4} y={yOf(STOPS[6].ab) - 6} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
        aberration limit
      </text>

      {/* why the teal curve is soft at each end */}
      <text x={xOf(0) + 2} y={yOf(totalOf(STOPS[0])) + 16} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        soft: aberrations
      </text>
      <text x={xOf(7) + 2} y={yOf(totalOf(STOPS[7])) - 8} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        soft: diffraction
      </text>

      {/* the book-specific note: fine sensors reach the diffraction wall early */}
      <line x1={F8_X} y1={yOf(totalOf(STOPS[4])) + 6} x2={F8_X} y2={BOT} stroke="var(--comment)" strokeWidth="1" strokeDasharray="2 3" strokeOpacity="0.7" />
      <text x={F8_X + 5} y={BOT - 8} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        60&ndash;100 MP soften by ~f/8
      </text>

      {/* aperture ticks */}
      {STOPS.map((s, i) => (
        <text key={s.f} x={xOf(i)} y={BOT + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg)">
          f/{s.f}
        </text>
      ))}
      <text x={62} y={BOT + 34} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// aperture: wide open  →  stopped down"}
      </text>
    </svg>
  );
}
