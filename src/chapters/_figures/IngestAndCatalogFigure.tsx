// IngestAndCatalogFigure: the signature figure for "Ingest and catalog".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. It encodes the chapter's structural claim: after ingest there are
// two layers, and confusing them is what loses people their pictures. The lower layer is
// the FILES ON DISK: the raw negatives, copied off the card by a verified ingest, renamed
// to a unique date scheme, sorted into a date-based folder, and never modified again. The
// upper layer is the CATALOG: a database that holds what you know ABOUT each frame, its
// rating, keywords, and develop edits, and points DOWN at the file on disk. The catalog
// references the negatives; it never contains them. Delete the catalog and every negative
// survives; the pointers are the only thing lost.

// Three frames from one import, shown as aligned catalog-card / file-chip pairs. The data
// varies so the pair reads like real library metadata: a keeper, a maybe, and a reject.
const COLS = [
  { cx: 330, stars: "★★★★★", flag: "pick", keyword: "#portrait", edit: "crop 4:5", file: "20260701-0142.DNG" },
  { cx: 486, stars: "★★★☆☆", flag: "maybe", keyword: "#street", edit: "+0.7 ev", file: "20260701-0143.DNG" },
  { cx: 642, stars: "★☆☆☆☆", flag: "reject", keyword: "#test", edit: "none", file: "20260701-0144.3FR" },
];

export function IngestAndCatalogFigure() {
  const CARD_W = 128;
  const cardTop = 78;
  const cardH = 68;
  const chipTop = 214;
  const chipH = 64;
  const left = (cx: number) => cx - CARD_W / 2;

  return (
    <svg
      viewBox="0 0 780 344"
      className="w-full min-w-[700px]"
      role="img"
      aria-label="A diagram of the two layers a photo library keeps after import. On the left a memory card holds a single at-risk copy; an arrow labeled verified copy carries the frames into the system. The lower layer is the files on disk: raw negatives renamed to a date scheme inside a dated folder and never modified. The upper layer is the catalog, a database of cards that hold each frame's rating, keywords, and develop edits and point down at the file on disk with dashed arrows. The catalog references the negatives but never contains them, so deleting the catalog leaves every negative intact."
      fill="none"
    >
      <text x={24} y={28} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// two layers: the catalog indexes the negatives; it never holds them"}
      </text>

      {/* the card: where the frame is born, a single copy until you copy it off */}
      <rect x={24} y={218} width={104} height={64} rx={7} fill="var(--surface-2)" stroke="var(--border)" />
      <text x={76} y={244} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="12" fill="var(--fg)">
        card
      </text>
      <text x={76} y={260} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        1 copy
      </text>
      <text x={76} y={272} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        at risk
      </text>

      {/* ingest: the one moment a frame can silently vanish, so verify the copy */}
      <text x={162} y={238} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--accent)">
        ingest
      </text>
      <path d={`M 128 250 L 190 250`} stroke="var(--accent)" strokeWidth={1.5} />
      <path d={`M 185 246 L 190 250 L 185 254`} stroke="var(--accent)" strokeWidth={1.5} />
      <text x={160} y={266} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        verified copy
      </text>

      {/* the system container holding both layers */}
      <rect x={196} y={56} width={560} height={256} rx={9} fill="var(--surface)" stroke="var(--border)" />

      {/* upper layer: the catalog. a row of cards, each pointing at a file below */}
      <text x={210} y={74} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// catalog · the index: rating, keywords, edits"}
      </text>
      {COLS.map((c) => (
        <g key={`cat-${c.cx}`}>
          <rect x={left(c.cx)} y={cardTop} width={CARD_W} height={cardH} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
          <text x={left(c.cx) + 10} y={cardTop + 20} fontFamily="var(--font-mono)" fontSize="11" fill="var(--accent)">
            {c.stars}
          </text>
          <text x={left(c.cx) + CARD_W - 10} y={cardTop + 20} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
            {c.flag}
          </text>
          <text x={left(c.cx) + 10} y={cardTop + 40} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg)">
            {c.keyword}
          </text>
          <text x={left(c.cx) + 10} y={cardTop + 57} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
            {`develop: ${c.edit}`}
          </text>
        </g>
      ))}

      {/* the pointers: the catalog references the file on disk, it does not hold it */}
      {COLS.map((c) => (
        <g key={`ptr-${c.cx}`}>
          <circle cx={c.cx} cy={cardTop + cardH} r={2.6} fill="var(--accent)" />
          <path d={`M ${c.cx} ${cardTop + cardH} L ${c.cx} ${chipTop - 4}`} stroke="var(--accent)" strokeWidth={1.3} strokeDasharray="4 3" />
          <path d={`M ${c.cx - 4} ${chipTop - 9} L ${c.cx} ${chipTop - 4} L ${c.cx + 4} ${chipTop - 9}`} stroke="var(--accent)" strokeWidth={1.3} />
        </g>
      ))}
      <text x={210} y={188} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
        {"// points at ↓"}
      </text>

      {/* lower layer: the files on disk. the negatives, in a dated folder, untouched */}
      <text x={210} y={206} fontFamily="var(--font-mono)" fontSize="10" fill="var(--comment)">
        {"// files on disk · dir: 2026/2026-07-01/  (renamed, never modified)"}
      </text>
      {COLS.map((c) => (
        <g key={`file-${c.cx}`}>
          <rect x={left(c.cx)} y={chipTop} width={CARD_W} height={chipH} rx={6} fill="var(--surface-2)" stroke="var(--border)" />
          <text x={c.cx} y={chipTop + 27} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--fg)">
            {c.file}
          </text>
          <text x={c.cx} y={chipTop + 45} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
            raw · the negative
          </text>
        </g>
      ))}

      {/* the payoff line, restating the split the two layers make */}
      <text x={476} y={332} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {"// lose the catalog and the negatives survive. lose the disk with no backup and no catalog can bring a frame back."}
      </text>
    </svg>
  );
}
