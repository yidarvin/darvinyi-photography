// ApertureAndDepthOfFieldFigure: the figure for "Aperture and depth of field".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. The structure it encodes is the chapter's thesis: at the same
// framing and the SAME f-number, a larger sensor needs a longer lens, and a longer
// lens at the same f-number opens a physically wider hole (entry pupil = focal length
// / f-number). The wider hole sprays a point in the background into a bigger blur
// disc, so the picture renders shallower. Two rows, same subject and background
// distances, same f/1.7: full frame on top, medium format below.

// Shared horizontal stations along the optical axis.
const SENSOR_X = 30;
const LENS_X = 138;
const SUBJ_X = 398;
const BG_X = 616;

// How far a point behind the subject spreads on its way to the background plane,
// as a fraction of the pupil half-height. Pure similar triangles, so the blur disc
// is exactly proportional to the physical hole. This is the whole point of the figure.
const SPREAD = (BG_X - SUBJ_X) / (SUBJ_X - LENS_X);

interface Row {
  cy: number;
  format: string;
  dims: string;
  lens: string;
  hole: string;
  pupilHalf: number;
  sensorHalf: number;
  equiv?: string;
}

const ROWS: Row[] = [
  {
    cy: 104,
    format: "FULL FRAME",
    dims: "36x24",
    lens: "28mm - f/1.7",
    hole: "hole 16mm",
    pupilHalf: 17,
    sensorHalf: 22,
  },
  {
    cy: 264,
    format: "MEDIUM FORMAT",
    dims: "44x33",
    lens: "35mm - f/1.7",
    hole: "hole 21mm",
    pupilHalf: 22,
    sensorHalf: 29,
    equiv: "renders like f/1.3",
  },
];

function OpticalRow({ row }: { row: Row }) {
  const { cy, pupilHalf } = row;
  const blurHalf = pupilHalf * SPREAD;
  // Two rays: each leaves an edge of the hole, crosses at the in-focus point, and
  // keeps going to the background, where the pair bracket the blur disc.
  const rayTop = `${LENS_X},${cy - pupilHalf} ${SUBJ_X},${cy} ${BG_X},${cy + blurHalf}`;
  const rayBot = `${LENS_X},${cy + pupilHalf} ${SUBJ_X},${cy} ${BG_X},${cy - blurHalf}`;
  return (
    <g>
      {/* the diverging cone past the subject: the "spray" that becomes background blur */}
      <polygon
        points={`${SUBJ_X},${cy} ${BG_X},${cy - blurHalf} ${BG_X},${cy + blurHalf}`}
        fill="var(--accent)"
        opacity="0.12"
      />
      <polyline points={rayTop} stroke="var(--accent-dim)" strokeWidth="1.25" />
      <polyline points={rayBot} stroke="var(--accent-dim)" strokeWidth="1.25" />

      {/* sensor */}
      <rect
        x={SENSOR_X}
        y={cy - row.sensorHalf}
        width="12"
        height={row.sensorHalf * 2}
        rx="2"
        fill="var(--surface-2)"
        stroke="var(--border)"
      />

      {/* the lens opening (entry pupil): a physical height, wider on medium format */}
      <line
        x1={LENS_X}
        y1={cy - pupilHalf}
        x2={LENS_X}
        y2={cy + pupilHalf}
        stroke="var(--accent)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <text x={LENS_X} y={cy + pupilHalf + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
        {row.hole}
      </text>

      {/* the in-focus point, same size and place in both rows: same framing */}
      <circle cx={SUBJ_X} cy={cy} r="3.5" fill="var(--fg)" />
      <circle cx={SUBJ_X} cy={cy} r="7" fill="none" stroke="var(--fg-muted)" strokeWidth="1" />

      {/* the background plane and the blur disc the point smears into */}
      <line x1={BG_X} y1={cy - 42} x2={BG_X} y2={cy + 42} stroke="var(--border)" strokeWidth="1.5" strokeDasharray="3 3" />
      <ellipse cx={BG_X} cy={cy} rx="5.5" ry={blurHalf} fill="var(--accent)" opacity="0.55" />

      {/* labels */}
      <text x={SENSOR_X - 6} y={cy - row.sensorHalf - 12} fontFamily="var(--font-mono)" fontSize="12" fontWeight="bold" fill="var(--accent)" letterSpacing="0.5">
        {row.format}
      </text>
      <text x={SENSOR_X - 6} y={cy - row.sensorHalf - 12 + 15} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {row.dims} - {row.lens}
      </text>
      {row.equiv && (
        <text x={BG_X} y={cy + blurHalf + 20} textAnchor="end" fontFamily="var(--font-mono)" fontSize="10" fill="var(--accent)">
          {row.equiv}
        </text>
      )}
    </g>
  );
}

export function ApertureAndDepthOfFieldFigure() {
  return (
    <svg
      viewBox="0 0 660 360"
      className="w-full min-w-[600px]"
      role="img"
      aria-label="Two optical setups framing the same subject at the same f-number, f/1.7. The full-frame setup uses a 28mm lens that opens a 16mm hole. The medium-format setup needs a 35mm lens to hold the same framing, and at the same f/1.7 that longer lens opens a wider 21mm hole, which sprays a point in the background into a larger blur disc and renders like f/1.3 on full frame."
      fill="none"
    >
      {/* shared reference guides: same subject distance, same background distance */}
      <line x1={SUBJ_X} y1="40" x2={SUBJ_X} y2="330" stroke="var(--border)" strokeWidth="1" opacity="0.5" />
      <text x={SUBJ_X} y="34" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        point in focus
      </text>
      <text x={BG_X} y="34" textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        background
      </text>

      {ROWS.map((row) => (
        <OpticalRow key={row.format} row={row} />
      ))}
    </svg>
  );
}
