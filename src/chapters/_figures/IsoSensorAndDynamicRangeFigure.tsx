// IsoSensorAndDynamicRangeFigure: the figure for "ISO, the sensor, and dynamic range".
// Inline SVG, themed with the CSS variables so it matches the house style and stays crisp at any
// width. The structure it encodes is the chapter's thesis about dynamic range: the sensor can only
// record the band of scene brightness between the highlight it clips at full well and the shadow it
// can still lift out of noise. That band is the dynamic range, measured in stops, and it is widest
// at base ISO. Raising the ISO applies gain that drives the output to white one stop sooner for
// every stop of push, so each column loses that much off the TOP (the highlights), while the noise
// floor at the bottom barely moves. Base ISO 100, then plus three stops (ISO 800) and plus six
// (ISO 6400): the usable range falls one stop per stop, 14 to 11 to 8.

const BASE_DR = 14; // usable stops at base ISO (a round modern full-frame figure)
const TOP_Y = 62; // y of the base-ISO highlight ceiling (top of the tallest bar)
const FLOOR_Y = 300; // y of the noise floor (shared baseline for every column)
const STEP = (FLOOR_Y - TOP_Y) / BASE_DR; // pixels per stop
const BAR_HALF = 46;

interface Col {
  cx: number;
  iso: string;
  push: number; // stops of ISO above base
}

const COLS: Col[] = [
  { cx: 150, iso: "ISO 100", push: 0 },
  { cx: 330, iso: "ISO 800", push: 3 },
  { cx: 510, iso: "ISO 6400", push: 6 },
];

function DrColumn({ col }: { col: Col }) {
  const { cx, push } = col;
  const ceilingY = TOP_Y + push * STEP; // the ceiling drops as ISO rises
  const usableH = FLOOR_Y - ceilingY;
  const clippedH = ceilingY - TOP_Y;
  const dr = BASE_DR - push;
  const x = cx - BAR_HALF;
  const w = BAR_HALF * 2;
  return (
    <g>
      {/* highlights the gain drives past clipping: lost off the top, growing with ISO */}
      {clippedH > 0 && (
        <>
          <rect x={x} y={TOP_Y} width={w} height={clippedH} fill="url(#clip)" />
          <rect x={x} y={TOP_Y} width={w} height={clippedH} fill="none" stroke="var(--danger)" strokeWidth="1" opacity="0.5" />
          <text x={cx} y={TOP_Y + clippedH / 2 + 3} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--danger)">
            {`-${push} stops`}
          </text>
        </>
      )}

      {/* the usable range: everything the sensor still records, floor to ceiling */}
      <rect x={x} y={ceilingY} width={w} height={usableH} fill="var(--accent)" opacity="0.16" />
      <rect x={x} y={ceilingY} width={w} height={usableH} fill="none" stroke="var(--accent)" strokeWidth="1.5" />
      <text x={cx} y={ceilingY + usableH / 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="15" fontWeight="bold" fill="var(--accent)">
        {`${dr}`}
      </text>
      <text x={cx} y={ceilingY + usableH / 2 + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        stops
      </text>

      {/* labels: which ISO this column is, top and bottom */}
      <text x={cx} y={FLOOR_Y + 20} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fontWeight="bold" fill="var(--fg)">
        {col.iso}
      </text>
      <text x={cx} y={FLOOR_Y + 34} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {push === 0 ? "base" : `+${push} over base`}
      </text>
    </g>
  );
}

export function IsoSensorAndDynamicRangeFigure() {
  return (
    <svg
      viewBox="0 0 660 360"
      className="w-full min-w-[600px]"
      role="img"
      aria-label="Three columns showing a sensor's usable dynamic range at ISO 100, 800, and 6400. At base ISO 100 the recorded band runs the full 14 stops from the noise floor up to the highlight ceiling. Raising the ISO to 800 applies three stops of gain, which clips three stops off the top, leaving 11 stops. At ISO 6400, six stops of gain clip six stops of highlights, leaving 8 stops. The noise floor at the bottom stays fixed; the range is lost from the highlight end, one stop per stop of ISO."
      fill="none"
    >
      <defs>
        {/* diagonal hatch for the clipped-highlight zone */}
        <pattern id="clip" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="var(--danger)" opacity="0.06" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="var(--danger)" strokeWidth="1.4" opacity="0.35" />
        </pattern>
      </defs>

      {/* the structural takeaway, stated in the figure */}
      <text x={20} y={30} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// ISO gain clips the highlights: usable range falls one stop per stop"}
      </text>

      {/* the base-ISO highlight ceiling: a dashed line the raised columns fall away from */}
      <line x1={90} y1={TOP_Y} x2={580} y2={TOP_Y} stroke="var(--fg-muted)" strokeWidth="1" strokeDasharray="3 4" />
      <text x={586} y={TOP_Y + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
        clip
      </text>
      <text x={586} y={TOP_Y + 15} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
        point
      </text>

      {/* the noise floor: the shared baseline every column sits on */}
      <line x1={90} y1={FLOOR_Y} x2={580} y2={FLOOR_Y} stroke="var(--fg-muted)" strokeWidth="1.5" />
      <text x={586} y={FLOOR_Y + 3} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
        noise
      </text>
      <text x={586} y={FLOOR_Y + 15} fontFamily="var(--font-mono)" fontSize="9" fill="var(--fg-muted)">
        floor
      </text>

      {COLS.map((col) => (
        <DrColumn key={col.iso} col={col} />
      ))}
    </svg>
  );
}
