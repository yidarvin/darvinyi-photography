// HowAShutterUncoversTheFrameFigure: the figure for "How a shutter uncovers the frame".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. The structure it encodes is the chapter's thesis: sort the four
// shutter mechanisms by ONE question, does the whole frame sit open at the same instant?
// Each panel is a space-time plot, sensor rows down the side and time across the bottom,
// with the open (light-collecting) region shaded. Leaf and global draw a vertical band:
// a moment when every row is open together, so a single flash burst lights all of it.
// Focal-plane above its sync speed and the rolling electronic shutter draw a diagonal
// slit that travels down the frame: no instant has the whole frame open, so a single
// burst lights only a band and fast motion is recorded row by row at shifting times.

import type { ReactNode } from "react";

interface PanelSpec {
  x: number;
  y: number;
  title: string;
  kind: "band" | "sweep";
  note: string;
}

const PW = 250; // panel width
const PH = 150; // panel height
const COL2 = 384; // x of the right column
const ROW1 = 52;
const ROW2 = 268;

const PANELS: PanelSpec[] = [
  { x: 36, y: ROW1, title: "leaf", kind: "band", note: "opens in the lens, all at once" },
  { x: COL2, y: ROW1, title: "global electronic", kind: "band", note: "every pixel together" },
  { x: 36, y: ROW2, title: "focal-plane, above sync", kind: "sweep", note: "a slit of two curtains" },
  { x: COL2, y: ROW2, title: "rolling electronic", kind: "sweep", note: "reset and read, row by row" },
];

// Panel interior geometry, shared by both kinds.
const PAD_L = 30; // room for the "rows" axis
const PAD_T = 26; // room for the title
const PAD_B = 20; // room for the "time" axis
const PAD_R = 12;

function Panel({ p }: { p: PanelSpec }) {
  const ix = p.x + PAD_L;
  const iy = p.y + PAD_T;
  const iw = PW - PAD_L - PAD_R;
  const ih = PH - PAD_T - PAD_B;
  const top = iy;
  const bottom = iy + ih;

  // Where a single flash burst fires: one vertical instant in time.
  let flash: { fx: number; litTop: number; litBottom: number; lightsAll: boolean };

  let openShape: ReactNode;

  if (p.kind === "band") {
    // Whole frame open together: a vertical band spanning every row.
    const ox = ix + iw * 0.34;
    const ow = iw * 0.26;
    openShape = <rect x={ox} y={top} width={ow} height={ih} fill="var(--accent)" fillOpacity="0.26" />;
    const fx = ox + ow * 0.5;
    flash = { fx, litTop: top, litBottom: bottom, lightsAll: true };
  } else {
    // A slit that travels down the frame: a parallelogram leaning right as time passes.
    const x0L = ix + iw * 0.14; // left edge of the slit at the top row
    const x1L = ix + iw * 0.6; // left edge of the slit at the bottom row
    const slit = iw * 0.14; // slit width in time
    const slope = (x1L - x0L) / ih; // rightward drift per row
    openShape = (
      <polygon
        points={`${x0L},${top} ${x0L + slit},${top} ${x1L + slit},${bottom} ${x1L},${bottom}`}
        fill="var(--accent)"
        fillOpacity="0.26"
      />
    );
    // Flash at mid-travel: it lights only the rows whose slit is open at that instant.
    const fx = ix + iw * 0.44;
    const yTopLit = top + (fx - (x0L + slit)) / slope; // where the slit's trailing edge reaches fx
    const yBotLit = top + (fx - x0L) / slope; // where the slit's leading edge reaches fx
    flash = {
      fx,
      litTop: Math.max(top, Math.min(bottom, yTopLit)),
      litBottom: Math.max(top, Math.min(bottom, yBotLit)),
      lightsAll: false,
    };
  }

  return (
    <g>
      {/* panel frame */}
      <rect x={p.x} y={p.y} width={PW} height={PH} rx="8" fill="var(--surface-2)" stroke="var(--border)" />

      {/* title */}
      <text x={p.x + 12} y={p.y + 17} fontFamily="var(--font-mono)" fontSize="12" fill="var(--fg)">
        {p.title}
      </text>

      {/* plot frame: rows down the left, time across the bottom */}
      <line x1={ix} y1={top} x2={ix} y2={bottom} stroke="var(--border)" strokeWidth="1" />
      <line x1={ix} y1={bottom} x2={ix + iw} y2={bottom} stroke="var(--border)" strokeWidth="1" />
      <text
        x={p.x + 8}
        y={top + ih / 2}
        fontFamily="var(--font-mono)"
        fontSize="8"
        fill="var(--fg-muted)"
        textAnchor="middle"
        transform={`rotate(-90 ${p.x + 8} ${top + ih / 2})`}
      >
        rows
      </text>
      <text x={ix + iw} y={bottom + 14} textAnchor="end" fontFamily="var(--font-mono)" fontSize="8" fill="var(--fg-muted)">
        time →
      </text>

      {openShape}

      {/* the single flash burst, and the rows it manages to light */}
      <line x1={flash.fx} y1={top} x2={flash.fx} y2={bottom} stroke="var(--fg-muted)" strokeWidth="1" strokeDasharray="2 3" />
      <line
        x1={flash.fx}
        y1={flash.litTop}
        x2={flash.fx}
        y2={flash.litBottom}
        stroke="var(--accent)"
        strokeWidth="2.5"
      />
      <text x={ix} y={p.y + PH - 6} fontFamily="var(--font-mono)" fontSize="8.5" fill={flash.lightsAll ? "var(--accent)" : "var(--danger)"}>
        {flash.lightsAll ? "flash: whole frame" : "flash: one band"}
      </text>
    </g>
  );
}

export function HowAShutterUncoversTheFrameFigure() {
  return (
    <svg
      viewBox="0 0 660 428"
      className="w-full min-w-[620px]"
      role="img"
      aria-label="Four shutter mechanisms drawn as space-time plots, sensor rows down the side and time across the bottom, with the light-collecting region shaded. The leaf shutter and the global electronic shutter draw a vertical band: every row is open at the same instant, so a single flash burst lights the whole frame. The focal-plane shutter above its sync speed and the rolling electronic shutter draw a diagonal slit that travels down the frame: no instant has every row open, so a single flash burst lights only one band of rows and the rest records dark."
      fill="none"
    >
      {/* the organizing question, stated in the figure */}
      <text x={36} y={26} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// is the whole frame open at the same instant?"}
      </text>

      {/* row headers, the two answers */}
      <text x={36} y={ROW1 - 8} fontFamily="var(--font-mono)" fontSize="10" fill="var(--accent)">
        yes — a vertical band, flash at any speed
      </text>
      <text x={36} y={ROW2 - 8} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-muted)">
        no — a slit travels down, flash limited
      </text>

      {PANELS.map((p) => (
        <Panel key={p.title} p={p} />
      ))}
    </svg>
  );
}
