// ColorScienceForPhotographersFigure: the signature figure for "Seeing in color".
// Inline SVG, themed with the CSS variables for all chrome (frame, labels, overlay
// lines) so it matches the house style. The one exception is the hue swatches
// themselves: a figure about color must show real color, so the ring is filled with
// generated HSL values, the same way ReadingLightWidget shaded a real lit sphere with
// literal tones. Everything that is not a hue stays on the tokens.
//
// The figure encodes the chapter's structural claim: color relationships are GEOMETRY
// on a wheel. Hue is an angle, so a color's opposite is the point across the circle,
// and every named harmony is just a shape you inscribe. The big wheel establishes the
// map and marks the hero relationship (a warm hue against its cool complement). The row
// of four glyph-wheels below shows the common schemes as the patterns they are:
// complementary is a diameter, analogous is a short arc, split-complementary and triadic
// are triangles. Learn the shapes and you can find them in any scene.

const HUES = Array.from({ length: 12 }, (_, i) => i * 30); // 0..330, one swatch per 30 deg

// Point on a circle for a given hue, with hue 0 at the top and increasing clockwise.
function huePoint(cx: number, cy: number, r: number, hue: number) {
  const rad = (hue * Math.PI) / 180;
  return { x: cx + r * Math.sin(rad), y: cy - r * Math.cos(rad) };
}

const swatch = (hue: number) => `hsl(${hue}, 68%, 55%)`;

// The four harmony schemes, as sets of hue offsets from a base. Drawn as glyphs so the
// reader sees each relationship as one shape.
const SCHEMES: { name: string; offsets: number[] }[] = [
  { name: "complementary", offsets: [0, 180] },
  { name: "analogous", offsets: [-30, 0, 30] },
  { name: "split-comp", offsets: [0, 150, 210] },
  { name: "triadic", offsets: [0, 120, 240] },
];

const BASE = 30; // orange: the base hue used for the hero axis and the glyphs

export function ColorScienceForPhotographersFigure() {
  const CX = 280;
  const CY = 196;
  const R = 128; // radius of the swatch ring

  const heroA = huePoint(CX, CY, R, BASE); // orange, top-right
  const heroB = huePoint(CX, CY, R, BASE + 180); // its complement, lower-left

  return (
    <svg
      viewBox="0 0 560 560"
      className="w-full min-w-[440px]"
      role="img"
      aria-label="A color wheel: twelve hue swatches arranged in a ring, red at the top and running through orange, yellow, green, cyan, blue, and magenta back to red. A line drawn straight across the center joins an orange swatch to the cyan-blue swatch directly opposite it, labeled as a complementary pair, because a hue's complement is the point across the circle. Below the wheel, four small glyph-wheels show the common harmony schemes as shapes: complementary is a diameter joining two opposite points, analogous is three neighboring points on a short arc, split-complementary and triadic are triangles inscribed in the ring. The caption reads: color relationships are geometry on a wheel."
      fill="none"
    >
      {/* the governing statement, in the code-comment motif */}
      <text x={30} y={26} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--comment)">
        {"// color relationships are geometry on a wheel"}
      </text>
      <text x={30} y={45} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        hue is an angle · a color's opposite is across the circle
      </text>

      {/* THE WHEEL */}
      {/* faint guide ring the swatches sit on */}
      <circle cx={CX} cy={CY} r={R} stroke="var(--border)" strokeWidth={1} />

      {/* the hero relationship: a complementary diameter, warm against cool */}
      <line
        x1={heroA.x}
        y1={heroA.y}
        x2={heroB.x}
        y2={heroB.y}
        stroke="var(--fg)"
        strokeOpacity={0.6}
        strokeWidth={1.5}
        strokeDasharray="4 4"
      />

      {/* the twelve hue swatches */}
      {HUES.map((hue) => {
        const p = huePoint(CX, CY, R, hue);
        const isHero = hue === BASE || hue === (BASE + 180) % 360;
        return (
          <circle
            key={hue}
            cx={p.x}
            cy={p.y}
            r={isHero ? 22 : 17}
            fill={swatch(hue)}
            stroke={isHero ? "var(--fg)" : "var(--border)"}
            strokeWidth={isHero ? 2 : 1}
          />
        );
      })}

      {/* hub label */}
      <circle cx={CX} cy={CY} r={30} fill="var(--surface)" stroke="var(--border)" />
      <text x={CX} y={CY - 2} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        opposite
      </text>
      <text x={CX} y={CY + 10} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        = complement
      </text>

      {/* hero endpoint labels */}
      <text x={heroA.x + 24} y={heroA.y - 2} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
        warm
      </text>
      <text x={heroB.x - 24} y={heroB.y + 6} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg-muted)">
        cool
      </text>

      {/* divider */}
      <line x1={30} y1={372} x2={530} y2={372} stroke="var(--border)" />
      <text x={30} y={396} fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--comment)">
        {"// every named harmony is a shape you inscribe"}
      </text>

      {/* THE FOUR SCHEME GLYPHS */}
      {SCHEMES.map((scheme, i) => {
        const gx = 100 + i * 120;
        const gy = 468;
        const gr = 40;
        const pts = scheme.offsets.map((o) => ({
          hue: ((BASE + o) % 360 + 360) % 360,
          p: huePoint(gx, gy, gr, BASE + o),
        }));
        // connecting geometry: a diameter for pairs, a closed polygon for 3+
        const linkPath =
          pts.length === 2
            ? `M ${pts[0].p.x} ${pts[0].p.y} L ${pts[1].p.x} ${pts[1].p.y}`
            : `M ${pts.map((q) => `${q.p.x} ${q.p.y}`).join(" L ")} Z`;
        return (
          <g key={scheme.name}>
            <circle cx={gx} cy={gy} r={gr} stroke="var(--border)" strokeWidth={1} />
            <path d={linkPath} stroke="var(--fg-muted)" strokeWidth={1.25} strokeOpacity={0.8} />
            {pts.map((q, j) => (
              <circle key={j} cx={q.p.x} cy={q.p.y} r={8} fill={swatch(q.hue)} stroke="var(--border)" strokeWidth={0.75} />
            ))}
            <text x={gx} y={gy + gr + 22} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-muted)">
              {scheme.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
