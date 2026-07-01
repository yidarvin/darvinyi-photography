// FlashSyncAndTheLeafAdvantageFigure: the figure for "Flash sync and the leaf advantage".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. The structure it encodes is the chapter's thesis. One frame holds
// two exposures: a flash-lit subject and the ambient sky behind it. Aperture and flash
// power are set once, so the subject stays evenly lit across the row. Only the shutter
// speed moves, left to right, and the shutter changes the ambient alone: the sky slides
// from blown-out at a slow speed to dark at a fast one, while the subject does not budge.
// A flash needs an instant when the whole frame is open, so a focal-plane shutter can
// only fire an ordinary flash up to its sync speed, about 1/250. Past that it is a wall:
// a single burst lights only a band. A leaf shutter has no wall and syncs at every speed,
// so the shaded zone to the right of 1/250 is reachable only with a leaf shutter. That
// zone, about three stops of extra control over the sky at the same aperture (to the Q3's
// 1/2000 top mechanical speed), is the leaf advantage the chapter is named for.

interface Tile {
  denom: number; // shutter speed 1/denom
  sky: string; // ambient sky fill at this speed (f/8, ISO 100, full sun)
}

// f/8, ISO 100, full sun: sunny-16 puts a correct ambient at 1/500. Each faster stop
// darkens the sky by one stop; each slower stop blows it out further. The subject is held
// by the flash, so it is the same in every tile. The row ends at 1/2000, the Q3's top
// mechanical speed, which is also the widget's leaf ceiling.
const TILES: Tile[] = [
  { denom: 60, sky: "#dfe7ea" },
  { denom: 125, sky: "#b8c6cc" },
  { denom: 250, sky: "#8fa1a9" },
  { denom: 500, sky: "#63767e" },
  { denom: 1000, sky: "#43535a" },
  { denom: 2000, sky: "#26333a" },
];

const M_L = 26; // left margin
const TW = 82; // tile width
const GAP = 12; // gap between tiles
const TY = 78; // tile top
const TH = 116; // tile height
const SKY_H = 72; // sky band height inside a tile

const tileX = (i: number) => M_L + i * (TW + GAP);

// The focal-plane sync wall sits between 1/250 (index 2) and 1/500 (index 3): the last
// fully-open speed on a typical focal-plane shutter. Everything to its right is the
// leaf-only zone.
const WALL_I = 3;
const wallX = tileX(WALL_I) - GAP / 2;
const zoneW = tileX(TILES.length - 1) + TW - wallX + 6;

function TileGraphic({ t, i }: { t: Tile; i: number }) {
  const x = tileX(i);
  const cx = x + TW / 2;
  return (
    <g>
      {/* the frame */}
      <clipPath id={`fs-clip-${i}`}>
        <rect x={x} y={TY} width={TW} height={TH} rx="6" />
      </clipPath>
      <g clipPath={`url(#fs-clip-${i})`}>
        {/* ambient sky: the shutter's job, darkening left to right */}
        <rect x={x} y={TY} width={TW} height={SKY_H} fill={t.sky} />
        {/* ground, a constant dark foreground */}
        <rect x={x} y={TY + SKY_H} width={TW} height={TH - SKY_H} fill="#141d21" />
        {/* the flash-lit subject: identical in every tile, held by aperture + flash */}
        <g>
          <circle cx={cx} cy={TY + SKY_H - 8} r="12" fill="#cbd5d9" />
          <path
            d={`M ${cx - 22} ${TY + TH} Q ${cx - 20} ${TY + SKY_H + 2} ${cx} ${TY + SKY_H + 2} Q ${cx + 20} ${TY + SKY_H + 2} ${cx + 22} ${TY + TH} Z`}
            fill="#cbd5d9"
          />
          {/* teal rim: the flash is what holds the subject */}
          <circle cx={cx} cy={TY + SKY_H - 8} r="12" fill="none" stroke="var(--accent)" strokeOpacity="0.7" strokeWidth="1.2" />
        </g>
      </g>
      <rect x={x} y={TY} width={TW} height={TH} rx="6" fill="none" stroke="var(--border)" />

      {/* shutter speed under the tile */}
      <text x={cx} y={TY + TH + 16} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="10.5" fill="var(--fg)">
        1/{t.denom}
      </text>
    </g>
  );
}

export function FlashSyncAndTheLeafAdvantageFigure() {
  return (
    <svg
      viewBox="0 0 610 268"
      className="w-full min-w-[600px]"
      role="img"
      aria-label="Six frames of the same portrait across a row of shutter speeds, from 1/60 on the left to 1/2000 on the right. The aperture and the flash are set once, so the flash-lit subject looks identical in every frame. Only the shutter changes, and the shutter controls the ambient alone, so the sky behind the subject slides from blown-out white at 1/60 to dark at 1/2000 while the subject does not change. A focal-plane shutter can only sync an ordinary flash up to about 1/250; past that a single burst lights only a band of the frame, so those faster speeds, shaded here, are reachable with flash only by a leaf shutter. That shaded region, about three stops of extra control over the sky at the same aperture, is the leaf advantage."
      fill="none"
    >
      {/* the governing statement, in the code-comment motif */}
      <text x={M_L} y={24} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// one aperture, one flash, set once. only the shutter moves."}
      </text>
      <text x={M_L} y={44} fontFamily="var(--font-mono)" fontSize="12.5" fill="var(--accent)">
        the shutter darkens the sky; the flash holds the subject
      </text>

      {/* the leaf-only zone: shutter speeds a focal-plane shutter cannot reach with flash */}
      <rect x={wallX} y={TY - 8} width={zoneW} height={TH + 40} rx="8" fill="var(--accent)" fillOpacity="0.06" stroke="var(--accent)" strokeOpacity="0.28" strokeDasharray="3 3" />
      <text x={wallX + zoneW - 6} y={TY - 14} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--accent)">
        leaf-shutter-only flash zone
      </text>

      {/* the focal-plane sync wall */}
      <line x1={wallX} y1={TY - 8} x2={wallX} y2={TY + TH + 22} stroke="var(--danger)" strokeWidth="1.5" strokeDasharray="4 3" />
      <text x={wallX - 6} y={TY - 14} textAnchor="end" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--danger)">
        focal-plane wall &middot; 1/250
      </text>

      {TILES.map((t, i) => (
        <TileGraphic key={t.denom} t={t} i={i} />
      ))}

      {/* the takeaway, spelled out under the row */}
      <text x={M_L} y={TY + TH + 44} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// past the wall, a plain flash lights only a band; a leaf shutter lights it all."}
      </text>
    </svg>
  );
}
