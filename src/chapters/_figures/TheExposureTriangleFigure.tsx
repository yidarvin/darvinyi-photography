// TheExposureTriangleFigure: the figure for "The exposure triangle".
// Inline SVG, themed with the CSS variables so it matches the house style and stays
// crisp at any width. The structure it encodes: three separate controls feed one
// shared output (image brightness), and each control drags a distinct side effect
// along with it. The three arrows point inward to name the one quantity they share;
// the "-> ..." line on each node names the price that control charges.
const NODES = [
  {
    // top vertex
    x: 224,
    y: 16,
    name: "SHUTTER",
    unit: "time the sensor is open",
    scale: "1/30  1/60  1/125  1/250  1/500",
    effect: "-> motion: freeze or blur",
  },
  {
    // bottom-left vertex
    x: 16,
    y: 300,
    name: "APERTURE",
    unit: "width of the opening",
    scale: "f/2  f/2.8  f/4  f/5.6  f/8  f/11",
    effect: "-> depth of field",
  },
  {
    // bottom-right vertex
    x: 432,
    y: 300,
    name: "ISO",
    unit: "gain, applied after the light",
    scale: "100  200  400  800  1600",
    effect: "-> noise",
  },
];

const BOX_W = 192;
const BOX_H = 104;

export function TheExposureTriangleFigure() {
  // Centre of each node box, used to aim the arrows at the hub.
  const centers = NODES.map((n) => ({ cx: n.x + BOX_W / 2, cy: n.y + BOX_H / 2 }));
  const hub = { cx: 320, cy: 232, r: 58 };

  // An arrow from a node centre to the edge of the hub circle.
  const arrow = (cx: number, cy: number) => {
    const dx = hub.cx - cx;
    const dy = hub.cy - cy;
    const len = Math.hypot(dx, dy);
    const ux = dx / len;
    const uy = dy / len;
    // start just outside the node box, end just outside the hub
    const x1 = cx + ux * (BOX_H / 2 + 6);
    const y1 = cy + uy * (BOX_H / 2 + 6);
    const x2 = hub.cx - ux * (hub.r + 8);
    const y2 = hub.cy - uy * (hub.r + 8);
    return { x1, y1, x2, y2 };
  };

  return (
    <svg
      viewBox="0 0 640 420"
      className="w-full min-w-[560px]"
      role="img"
      aria-label="The exposure triangle: three controls, aperture, shutter, and ISO, each stepping in stops and each with its own side effect, all feeding one shared quantity, image brightness, at the centre."
      fill="none"
    >
      <defs>
        <marker
          id="tri-arrow"
          viewBox="0 0 10 10"
          refX="8"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path d="M0,0 L10,5 L0,10 z" fill="var(--accent-dim)" />
        </marker>
      </defs>

      {/* faint triangle joining the three controls: the shape the model is named for */}
      <path
        d={`M ${centers[0].cx} ${centers[0].cy} L ${centers[1].cx} ${centers[1].cy} L ${centers[2].cx} ${centers[2].cy} Z`}
        stroke="var(--border)"
        strokeWidth="1.5"
      />

      {/* three inputs -> one brightness */}
      {centers.map((c, i) => {
        const a = arrow(c.cx, c.cy);
        return (
          <line
            key={`arr-${i}`}
            x1={a.x1}
            y1={a.y1}
            x2={a.x2}
            y2={a.y2}
            stroke="var(--accent-dim)"
            strokeWidth="1.5"
            markerEnd="url(#tri-arrow)"
          />
        );
      })}

      {/* the hub: the one quantity the three dials share */}
      <circle cx={hub.cx} cy={hub.cy} r={hub.r} fill="var(--surface-2)" stroke="var(--accent)" strokeWidth="1.5" />
      <text x={hub.cx} y={hub.cy - 8} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--fg)">
        image
      </text>
      <text x={hub.cx} y={hub.cy + 10} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="13" fill="var(--fg)">
        brightness
      </text>
      <text x={hub.cx} y={hub.cy + 30} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
        1 stop = x2 light
      </text>

      {/* the three control nodes */}
      {NODES.map((n) => (
        <g key={n.name}>
          <rect x={n.x} y={n.y} width={BOX_W} height={BOX_H} rx="8" fill="var(--surface-2)" stroke="var(--border)" />
          <text x={n.x + 14} y={n.y + 27} fontFamily="var(--font-mono)" fontSize="13" fontWeight="bold" fill="var(--accent)" letterSpacing="1">
            {n.name}
          </text>
          <text x={n.x + 14} y={n.y + 46} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
            {n.unit}
          </text>
          <text x={n.x + 14} y={n.y + 69} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg-muted)">
            {n.scale}
          </text>
          <text x={n.x + 14} y={n.y + 91} fontFamily="var(--font-mono)" fontSize="10" fill="var(--fg)">
            {n.effect}
          </text>
        </g>
      ))}
    </svg>
  );
}
