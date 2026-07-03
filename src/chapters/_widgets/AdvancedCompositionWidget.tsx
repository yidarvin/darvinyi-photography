import { useState } from "react";

// AdvancedCompositionWidget: the signature widget for "Working the frame".
// One focused move: the reader switches the grouping cue applied to a single, fixed
// field of twenty dots and watches the same dots reorganize into different groups.
// The dots never move. Only the cue changes, and with it what the eye is forced to
// see. It runs the four cues in the order of their strength, so the reader feels the
// contest between them: proximity is the baseline reading, similarity cuts across it,
// a shared boundary overrides both, and a drawn connection beats them all. That is the
// chapter's spine in one interaction: the mind is compelled to organize a field, and
// composition is arranging the cues so it organizes the way you want. React state only.

type Cue = "proximity" | "similarity" | "region" | "connect";

interface Dot {
  id: string;
  x: number;
  y: number;
  fam: 0 | 1; // color family, for the similarity cue
}

// Twenty dots at fixed positions, laid out in three loose spatial clumps so proximity
// has something to group. The color families, the enclosed set, and the links all cut
// ACROSS those clumps on purpose, so each later cue visibly fights the proximity one.
const DOTS: Dot[] = [
  // clump A (left)
  { id: "a1", x: 58, y: 88, fam: 1 },
  { id: "a2", x: 92, y: 78, fam: 0 },
  { id: "a3", x: 66, y: 120, fam: 0 },
  { id: "a4", x: 98, y: 116, fam: 1 },
  { id: "a5", x: 78, y: 100, fam: 1 },
  { id: "a6", x: 110, y: 92, fam: 0 },
  // clump B (upper right)
  { id: "b1", x: 250, y: 62, fam: 0 },
  { id: "b2", x: 290, y: 58, fam: 1 },
  { id: "b3", x: 262, y: 92, fam: 1 },
  { id: "b4", x: 300, y: 88, fam: 0 },
  { id: "b5", x: 278, y: 76, fam: 1 },
  { id: "b6", x: 312, y: 70, fam: 0 },
  { id: "b7", x: 248, y: 104, fam: 1 },
  // clump C (lower centre)
  { id: "c1", x: 166, y: 172, fam: 0 },
  { id: "c2", x: 204, y: 166, fam: 1 },
  { id: "c3", x: 180, y: 196, fam: 1 },
  { id: "c4", x: 218, y: 192, fam: 0 },
  { id: "c5", x: 150, y: 190, fam: 1 },
  { id: "c6", x: 232, y: 176, fam: 0 },
  { id: "c7", x: 196, y: 208, fam: 1 },
];

// the three proximity halos, one per clump
const HALOS = [
  { cx: 84, cy: 99, rx: 42, ry: 35 },
  { cx: 280, cy: 81, rx: 50, ry: 35 },
  { cx: 191, cy: 187, rx: 54, ry: 32 },
];

// common region: one boundary that encloses the whole right clump plus a single dot
// from the clump below, binding dots that proximity keeps apart.
const ENCLOSED = new Set(["b1", "b2", "b3", "b4", "b5", "b6", "b7", "c6"]);
const PEN = { x: 226, y: 48, w: 112, h: 146, rx: 16 };

// connection: three links, each joining two dots across different clumps.
const LINKS: [string, string][] = [
  ["a6", "b7"],
  ["c2", "b3"],
  ["a4", "c5"],
];
const LINKED = new Set(LINKS.flat());

const byId = (id: string) => DOTS.find((d) => d.id === id)!;

interface CueInfo {
  label: string;
  sees: string;
  note: string;
}

const CUES: Record<Cue, CueInfo> = {
  proximity: {
    label: "proximity",
    sees: "three clusters",
    note: "the baseline reading. the eye bundles whatever sits close, so the field falls into three groups before you decide anything. nearness is the first cue and the hardest to switch off.",
  },
  similarity: {
    label: "similarity",
    sees: "two color families",
    note: "color cuts clean across the three clusters. like reads with like, so the eye now sorts the same dots into two families by hue instead of by where they sit. the newer cue takes the field.",
  },
  region: {
    label: "common region",
    sees: "one enclosed set",
    note: "a shared boundary overrides both. the eight dots inside the outline read as one group even though one of them belongs, by nearness, to the cluster below. an enclosure beats nearness and color.",
  },
  connect: {
    label: "connection",
    sees: "three joined pairs",
    note: "the strongest bind there is. a drawn line fuses two dots into one unit no matter how far apart or how unalike, overriding every other cue. this is why an eyeline or a road welds a frame together.",
  },
};

const CUE_ORDER: Cue[] = ["proximity", "similarity", "region", "connect"];

export function AdvancedCompositionWidget() {
  const [cue, setCue] = useState<Cue>("proximity");
  const info = CUES[cue];

  // per-dot fill under the active cue
  const fillFor = (d: Dot): { fill: string; opacity: number } => {
    if (cue === "similarity")
      return { fill: d.fam === 1 ? "var(--accent)" : "var(--fg-muted)", opacity: 0.95 };
    if (cue === "region")
      return ENCLOSED.has(d.id)
        ? { fill: "var(--accent)", opacity: 0.95 }
        : { fill: "var(--fg-muted)", opacity: 0.4 };
    if (cue === "connect")
      return LINKED.has(d.id)
        ? { fill: "var(--accent)", opacity: 0.95 }
        : { fill: "var(--fg-muted)", opacity: 0.4 };
    // proximity: every dot the same, the grouping carried by the halos
    return { fill: "var(--fg-muted)", opacity: 0.9 };
  };

  return (
    <div className="font-sans">
      <svg
        viewBox="0 0 360 240"
        className="w-full select-none rounded-md border border-border bg-surface-2"
        role="img"
        aria-label={`Twenty identical dots in three loose clusters. Active grouping cue: ${info.label}. The eye reads: ${info.sees}. ${info.note}`}
        fill="none"
      >
        {/* proximity halos */}
        {HALOS.map((h, i) => (
          <ellipse
            key={i}
            cx={h.cx}
            cy={h.cy}
            rx={h.rx}
            ry={h.ry}
            fill="var(--accent)"
            className="transition-opacity duration-300 motion-reduce:transition-none"
            opacity={cue === "proximity" ? 0.08 : 0}
            stroke="var(--accent)"
            strokeOpacity={cue === "proximity" ? 0.35 : 0}
            strokeDasharray="4 5"
          />
        ))}

        {/* common-region boundary */}
        <rect
          x={PEN.x}
          y={PEN.y}
          width={PEN.w}
          height={PEN.h}
          rx={PEN.rx}
          fill="var(--accent)"
          className="transition-opacity duration-300 motion-reduce:transition-none"
          fillOpacity={cue === "region" ? 0.08 : 0}
          stroke="var(--accent)"
          strokeOpacity={cue === "region" ? 0.6 : 0}
        />

        {/* connection links */}
        {LINKS.map(([p, q], i) => {
          const A = byId(p);
          const B = byId(q);
          return (
            <line
              key={i}
              x1={A.x}
              y1={A.y}
              x2={B.x}
              y2={B.y}
              stroke="var(--accent)"
              strokeWidth={2}
              strokeLinecap="round"
              className="transition-opacity duration-300 motion-reduce:transition-none"
              opacity={cue === "connect" ? 0.8 : 0}
            />
          );
        })}

        {/* the dots: the same twenty every time */}
        {DOTS.map((d) => {
          const f = fillFor(d);
          return (
            <circle
              key={d.id}
              cx={d.x}
              cy={d.y}
              r={7}
              fill={f.fill}
              className="transition-all duration-300 motion-reduce:transition-none"
              style={{ opacity: f.opacity }}
            />
          );
        })}

        <text x={12} y={228} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          {"// same twenty dots · switch the cue below"}
        </text>
      </svg>

      {/* the one control: which cue the eye is given */}
      <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="grouping cue">
        {CUE_ORDER.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => setCue(c)}
            aria-pressed={cue === c}
            className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
              cue === c
                ? "border-accent bg-accent/15 text-accent"
                : "border-border text-muted hover:bg-surface-2"
            }`}
          >
            {CUES[c].label}
          </button>
        ))}
      </div>

      {/* readout */}
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">cue</dt>
        <dd className="text-accent">{info.label}</dd>
        <dt className="text-comment">eye reads</dt>
        <dd className="text-fg">{info.sees}</dd>
        <dt className="text-comment">so</dt>
        <dd className="text-muted">{info.note}</dd>
      </dl>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
        {"// the dots never changed. each cue is an instruction to the eye, and the grouping is the eye obeying it."}
      </p>
    </div>
  );
}
