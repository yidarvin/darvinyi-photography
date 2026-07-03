// LandscapeAndArchitectureFigure: the signature figure for "Landscape and architecture".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. Three side-by-side cases fit a phone by scrolling rather than
// shrinking (the wrapper sets a min width).
//
// The structural claim of the chapter: a building's vertical edges are parallel to each
// other, and they stay parallel in the photograph ONLY while the sensor plane is kept
// parallel to them, that is, while the camera back is vertical and the lens axis is level.
// Each case shows a side elevation (camera, its sensor plane, the lens axis, the tower)
// on top, and the frame it captures underneath.
//   1. Keep the camera level: verticals stay parallel, but the top of the tower falls
//      outside the frame.
//   2. Tilt the camera up to fit the whole tower: the sensor plane is no longer parallel
//      to the building, so the verticals converge (the keystone).
//   3. Keep the camera level and raise the lens (rise / shift), or shoot wide and crop:
//      the whole tower fits AND the verticals stay parallel.
// The teal sensor-plane line is drawn vertical (parallel to the tower) in cases 1 and 3,
// and tilted back in case 2, which is the whole point.

type Variant = "level" | "tilt" | "shift";

interface Case {
  x0: number;
  variant: Variant;
  line1: string;
  line2: string;
  result: string;
}

const CASES: Case[] = [
  { x0: 12, variant: "level", line1: "keep it level", line2: "sensor ∥ tower, top clipped", result: "parallel · top lost" },
  { x0: 244, variant: "tilt", line1: "tilt up to fit it", line2: "sensor tips back, lines meet", result: "whole tower · keystoned" },
  { x0: 476, variant: "shift", line1: "rise / shift, or crop", line2: "sensor ∥ tower, top kept", result: "whole tower · true" },
];

function Panel({ x0, variant, line1, line2, result }: Case) {
  const px = x0;
  const accentLine = variant === "tilt" ? "var(--danger)" : "var(--accent)";
  return (
    <g>
      {/* titles */}
      <text x={px + 12} y={62} fontFamily="var(--font-mono)" fontSize="11" fill="var(--accent)">
        {`${CASES.findIndex((c) => c.x0 === x0) + 1}. ${line1}`}
      </text>
      <text x={px + 12} y={78} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
        {line2}
      </text>

      {/* --- elevation: camera, sensor plane, lens axis, tower --- */}
      {/* ground */}
      <line x1={px + 14} y1={240} x2={px + 206} y2={240} stroke="var(--border)" strokeWidth={1.25} />

      {/* the tower, same in every case */}
      <rect x={px + 150} y={110} width={32} height={130} fill="var(--surface-2)" stroke="var(--fg-muted)" strokeWidth={1.2} />
      <line x1={px + 150} y1={140} x2={px + 182} y2={140} stroke="var(--fg-muted)" strokeWidth={0.8} />
      <line x1={px + 150} y1={170} x2={px + 182} y2={170} stroke="var(--fg-muted)" strokeWidth={0.8} />
      <line x1={px + 150} y1={200} x2={px + 182} y2={200} stroke="var(--fg-muted)" strokeWidth={0.8} />
      <text x={px + 166} y={104} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
        tower
      </text>

      {variant === "tilt" ? (
        <>
          {/* lens axis tilts up toward the tower top */}
          <line x1={px + 46} y1={220} x2={px + 150} y2={120} stroke="var(--fg-muted)" strokeWidth={1} strokeDasharray="4 3" />
          {/* sensor plane tips back (perpendicular to the tilted axis) */}
          <line x1={px + 31} y1={211} x2={px + 49} y2={229} stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={px + 49} cy={212} r={3} fill="var(--accent)" />
        </>
      ) : (
        <>
          {/* lens axis level, at the horizon */}
          <line x1={px + 52} y1={214} x2={px + 150} y2={214} stroke="var(--fg-muted)" strokeWidth={1} strokeDasharray="4 3" />
          {/* sensor plane vertical: parallel to the tower */}
          <line x1={px + 40} y1={200} x2={px + 40} y2={228} stroke="var(--accent)" strokeWidth={2.4} strokeLinecap="round" />
          <circle cx={px + 52} cy={214} r={3} fill="var(--accent)" />
          {variant === "shift" && (
            <>
              {/* the lens rises relative to the sensor */}
              <line x1={px + 52} y1={214} x2={px + 52} y2={200} stroke="var(--accent)" strokeWidth={1.4} />
              <path d={`M ${px + 49} ${203} L ${px + 52} ${198} L ${px + 55} ${203}`} fill="none" stroke="var(--accent)" strokeWidth={1.4} />
              <text x={px + 60} y={202} fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
                rise
              </text>
            </>
          )}
        </>
      )}
      <text x={px + 40} y={252} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
        camera
      </text>

      {/* --- the frame this case captures --- */}
      <rect x={px + 44} y={262} width={144} height={98} rx={3} fill="#0e1417" stroke="var(--border)" strokeWidth={1} />

      {variant === "level" && (
        <>
          {/* verticals parallel, but the tower runs off the top of the frame */}
          <rect x={px + 96} y={262} width={40} height={98} fill="var(--accent)" fillOpacity={0.14} stroke="var(--accent)" strokeWidth={1.4} />
          <line x1={px + 96} y1={300} x2={px + 136} y2={300} stroke="var(--accent)" strokeOpacity={0.5} strokeWidth={0.8} />
          <line x1={px + 96} y1={330} x2={px + 136} y2={330} stroke="var(--accent)" strokeOpacity={0.5} strokeWidth={0.8} />
          <path d={`M ${px + 110} 258 L ${px + 116} 251 L ${px + 122} 258`} fill="none" stroke="var(--fg-muted)" strokeWidth={1.2} />
        </>
      )}
      {variant === "tilt" && (
        // whole tower, but its sides converge toward the top: the keystone
        <polygon
          points={`${px + 92},360 ${px + 140},360 ${px + 126},268 ${px + 106},268`}
          fill="var(--danger)"
          fillOpacity={0.13}
          stroke="var(--danger)"
          strokeWidth={1.4}
        />
      )}
      {variant === "shift" && (
        <>
          {/* whole tower, sides parallel */}
          <rect x={px + 98} y={270} width={36} height={90} fill="var(--accent)" fillOpacity={0.14} stroke="var(--accent)" strokeWidth={1.4} />
          <line x1={px + 98} y1={300} x2={px + 134} y2={300} stroke="var(--accent)" strokeOpacity={0.5} strokeWidth={0.8} />
          <line x1={px + 98} y1={330} x2={px + 134} y2={330} stroke="var(--accent)" strokeOpacity={0.5} strokeWidth={0.8} />
        </>
      )}

      <text x={px + 116} y={374} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill={accentLine}>
        {result}
      </text>
    </g>
  );
}

export function LandscapeAndArchitectureFigure() {
  return (
    <svg
      viewBox="0 0 708 388"
      className="w-full min-w-[640px]"
      role="img"
      aria-label="Three side-by-side cases of photographing a tall tower, each with a side elevation of the camera on top and the frame it captures underneath. Case one, keep the camera level: the sensor plane is drawn vertical and parallel to the tower and the lens axis is level, so in the captured frame the tower's sides stay parallel, but the top of the tower runs off the top edge and is lost. Case two, tilt the camera up to fit the whole tower: the lens axis points up at the tower top and the sensor plane tips back so it is no longer parallel to the tower, and in the captured frame the whole tower fits but its vertical sides converge toward the top, the keystone effect, drawn in red. Case three, keep the camera level and raise the lens, called rise or shift, or shoot wide and crop: the sensor plane is vertical and parallel to the tower again, and the captured frame holds the whole tower with its sides parallel and true. The lesson: vertical lines stay parallel only while the sensor plane is kept parallel to the building."
      fill="none"
    >
      <text x={16} y={24} fontFamily="var(--font-mono)" fontSize="12" fill="var(--comment)">
        {"// verticals stay parallel only while the sensor plane stays parallel to the building"}
      </text>

      {/* dividers between the three cases */}
      <line x1={238} y1={44} x2={238} y2={380} stroke="var(--border)" strokeWidth={1} />
      <line x1={470} y1={44} x2={470} y2={380} stroke="var(--border)" strokeWidth={1} />

      {CASES.map((c) => (
        <Panel key={c.variant} {...c} />
      ))}
    </svg>
  );
}
