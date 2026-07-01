import { useRef, useState } from "react";

// CompositionFundamentalsWidget: the signature widget for "Where the eye lands".
// One focused move: place the subject in the frame and choose which way it looks.
// Everything the chapter names is felt from that one move. Drag the subject off the
// dead center and the frame comes alive; the nearest thirds intersection lights up as
// a power point; the open space in the subject's facing direction shades in as the
// "lead room" the eye expects to see ahead of a subject; and the reading names the
// result the way a photographer would, from "formal and still" at the center to
// "boxed against the edge it faces" when the subject is short-sided. React state only.

const W = 360;
const H = 240;
const PAD = 6;
const IW = W - PAD * 2;
const IH = H - PAD * 2;

// fraction (0..1) across the frame -> view coordinate
const vx = (fx: number) => PAD + fx * IW;
const vy = (fy: number) => PAD + fy * IH;

const THIRDS = [1 / 3, 2 / 3];
const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

// Name the horizontal zone by the nearest landmark: the center, a third, or an edge.
function zone(fx: number): "center" | "third" | "edge" | "drift" {
  const dCenter = Math.abs(fx - 0.5);
  const dThird = Math.min(Math.abs(fx - 1 / 3), Math.abs(fx - 2 / 3));
  const dEdge = Math.min(fx, 1 - fx);
  const m = Math.min(dCenter, dThird, dEdge);
  if (m === dCenter) return "center";
  if (m === dThird) return "third";
  if (m === dEdge) return "edge";
  return "drift";
}

// Is the subject sitting on one of the four thirds intersections (a "power point")?
function onPowerPoint(fx: number, fy: number): boolean {
  const near = (v: number) => THIRDS.some((t) => Math.abs(v - t) < 0.06);
  return near(fx) && near(fy);
}

interface Reading {
  name: string;
  note: string;
  feel: "static" | "settled" | "tense" | "unbalanced" | "loose";
}

function read(fx: number, fy: number, facing: 1 | -1): Reading {
  const leadRoom = facing === 1 ? 1 - fx : fx; // open width in the facing direction
  const ample = leadRoom >= 0.5;
  const cramped = leadRoom < 0.4;
  const z = zone(fx);
  const power = onPowerPoint(fx, fy);

  if (power && !cramped)
    return {
      name: "on a power point",
      note: "the textbook sweet spot: the subject on a thirds intersection with room to look into. dynamic, and it reads as balanced because the open space carries the far arm.",
      feel: "settled",
    };
  if (z === "center")
    return {
      name: "dead center",
      note: "formal and still. a symmetric subject earns the center; most subjects go flat there, with the eye parked and nowhere to travel.",
      feel: "static",
    };
  if (z === "third" && ample)
    return {
      name: "on a third, looking in",
      note: "the everyday win. the subject sits off the center and looks across the open space, so the frame feels alive and settled at once.",
      feel: "settled",
    };
  if (z === "third" && cramped)
    return {
      name: "on a third, looking out",
      note: "a good placement facing the wrong way. the empty room piles up behind the subject. flip its gaze, or slide it across so it looks into the space.",
      feel: "unbalanced",
    };
  if (z === "edge" && ample)
    return {
      name: "hard to the edge",
      note: "pushed to the wall with a long runway ahead. tense, and it works only when you meant the tension. otherwise it just looks like a miss.",
      feel: "tense",
    };
  if (z === "edge" && cramped)
    return {
      name: "boxed against the edge",
      note: "short-sided: crammed against the very edge it faces, staring out of the frame. cramped and unbalanced, the usual accident.",
      feel: "unbalanced",
    };
  return {
    name: "off center, drifting",
    note: "between the landmarks, committed to neither. push it onto a third or let the edge do the talking.",
    feel: "loose",
  };
}

const FEEL_COLOR: Record<Reading["feel"], string> = {
  static: "var(--fg-muted)",
  settled: "var(--accent)",
  tense: "var(--fg)",
  unbalanced: "var(--danger)",
  loose: "var(--fg-muted)",
};

export function CompositionFundamentalsWidget() {
  const [fx, setFx] = useState(1 / 3);
  const [fy, setFy] = useState(2 / 3);
  const [facing, setFacing] = useState<1 | -1>(1);
  const [drag, setDrag] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);

  const sx = vx(fx);
  const sy = vy(fy);
  const r = read(fx, fy, facing);
  const power = onPowerPoint(fx, fy);

  // the open space in the facing direction: the "lead room" the eye wants ahead
  const leadX = facing === 1 ? sx : PAD;
  const leadW = facing === 1 ? W - PAD - sx : sx - PAD;
  const leadRoom = facing === 1 ? 1 - fx : fx;

  const zoneLabel =
    zone(fx) === "center"
      ? "center column"
      : zone(fx) === "third"
        ? fx < 0.5
          ? "left third"
          : "right third"
        : zone(fx) === "edge"
          ? fx < 0.5
            ? "left edge"
            : "right edge"
          : "off center";
  const rowLabel =
    Math.abs(fy - 1 / 3) < 0.12
      ? "upper third"
      : Math.abs(fy - 2 / 3) < 0.12
        ? "lower third"
        : Math.abs(fy - 0.5) < 0.1
          ? "mid height"
          : fy < 0.5
            ? "high"
            : "low";
  const roomLabel = leadRoom >= 0.5 ? "open" : leadRoom < 0.4 ? "cramped" : "some";

  const pointTo = (clientX: number, clientY: number) => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return;
    setFx(clamp((clientX - rect.left) / rect.width, 0.05, 0.95));
    setFy(clamp((clientY - rect.top) / rect.height, 0.1, 0.9));
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    const step = 1 / 30;
    if (e.key === "ArrowLeft") setFx((v) => clamp(v - step, 0.05, 0.95));
    else if (e.key === "ArrowRight") setFx((v) => clamp(v + step, 0.05, 0.95));
    else if (e.key === "ArrowUp") setFy((v) => clamp(v - step, 0.1, 0.9));
    else if (e.key === "ArrowDown") setFy((v) => clamp(v + step, 0.1, 0.9));
    else if (e.key === "f" || e.key === "F") setFacing((f) => (f === 1 ? -1 : 1));
    else return;
    e.preventDefault();
  };

  return (
    <div className="font-sans">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full touch-none select-none rounded-md border border-border bg-surface-2"
        role="group"
        aria-label={`A photographic frame with a rule-of-thirds grid. The subject sits at the ${zoneLabel}, ${rowLabel}, facing ${facing === 1 ? "right" : "left"}. Reading: ${r.name}. ${r.note}`}
        onPointerMove={(e) => drag && pointTo(e.clientX, e.clientY)}
        onPointerUp={() => setDrag(false)}
        onPointerLeave={() => setDrag(false)}
      >
        {/* the lead room: open space in the direction the subject faces */}
        <rect x={leadX} y={PAD} width={Math.max(0, leadW)} height={IH} fill="var(--accent)" opacity={0.07} />

        {/* rule-of-thirds grid */}
        {THIRDS.map((t) => (
          <line key={`v${t}`} x1={vx(t)} y1={PAD} x2={vx(t)} y2={H - PAD} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 5" />
        ))}
        {THIRDS.map((t) => (
          <line key={`h${t}`} x1={PAD} y1={vy(t)} x2={W - PAD} y2={vy(t)} stroke="var(--border)" strokeWidth="1" strokeDasharray="4 5" />
        ))}

        {/* the four power points; the nearest one lights up when the subject is on it */}
        {THIRDS.map((tx) =>
          THIRDS.map((ty) => {
            const active = Math.abs(fx - tx) < 0.06 && Math.abs(fy - ty) < 0.06;
            return (
              <circle
                key={`p${tx}-${ty}`}
                cx={vx(tx)}
                cy={vy(ty)}
                r={active ? 6 : 3}
                fill={active ? "var(--accent)" : "var(--fg-muted)"}
                opacity={active ? 0.9 : 0.35}
              />
            );
          }),
        )}

        {/* the subject: a draggable head-and-shoulders that looks left or right */}
        <g
          tabIndex={0}
          role="button"
          aria-label={`Subject position. Left and right arrows move it across the frame, up and down move it in height, and f flips which way it faces. Currently ${zoneLabel}, ${rowLabel}, facing ${facing === 1 ? "right" : "left"}. Reading: ${r.name}, ${r.note}`}
          style={{ cursor: drag ? "grabbing" : "grab", outlineOffset: "3px" }}
          onPointerDown={(e) => {
            (e.target as Element).setPointerCapture?.(e.pointerId);
            setDrag(true);
            pointTo(e.clientX, e.clientY);
          }}
          onKeyDown={onKeyDown}
        >
          {/* generous invisible hit area for easy grabbing */}
          <circle cx={sx} cy={sy} r={26} fill="transparent" />
          {/* shoulders */}
          <path
            d={`M ${sx - 17} ${sy + 22} Q ${sx} ${sy + 4} ${sx + 17} ${sy + 22} Z`}
            fill="var(--fg)"
            opacity={0.9}
          />
          {/* head */}
          <circle cx={sx} cy={sy - 2} r={10} fill="var(--fg)" />
          {/* the gaze: an arrow into the facing direction */}
          <line
            x1={sx + facing * 11}
            y1={sy - 2}
            x2={sx + facing * 26}
            y2={sy - 2}
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <path
            d={`M ${sx + facing * 26} ${sy - 2} l ${-facing * 5} -4 M ${sx + facing * 26} ${sy - 2} l ${-facing * 5} 4`}
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
        </g>

        {/* labels in the code-comment motif */}
        <text x={PAD + 4} y={H - PAD - 6} fontFamily="var(--font-mono)" fontSize="9" fill="var(--comment)">
          {"// drag the subject · press f to flip the gaze"}
        </text>
        {leadW > 44 && (
          <text
            x={facing === 1 ? sx + leadW / 2 : PAD + leadW / 2}
            y={PAD + 16}
            textAnchor="middle"
            fontFamily="var(--font-mono)"
            fontSize="9"
            fill="var(--accent)"
            opacity={0.75}
          >
            room ahead
          </text>
        )}
      </svg>

      {/* readout */}
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">placement</dt>
        <dd className="text-fg">
          {zoneLabel} &middot; {rowLabel}
          {power && <span className="text-accent"> &middot; on a power point</span>}
        </dd>
        <dt className="text-comment">room ahead</dt>
        <dd className="text-fg">{roomLabel}</dd>
        <dt className="text-comment">reading</dt>
        <dd style={{ color: FEEL_COLOR[r.feel] }}>{r.name}</dd>
        <dt className="text-comment">so</dt>
        <dd className="text-muted">{r.note}</dd>
      </dl>

      {/* the secondary control: which way the subject looks */}
      <div className="mt-4 flex items-center gap-2">
        <span className="font-mono text-xs text-comment">looks</span>
        <button
          type="button"
          onClick={() => setFacing(-1)}
          aria-pressed={facing === -1}
          className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
            facing === -1 ? "border-accent bg-accent/15 text-accent" : "border-border text-muted hover:bg-surface-2"
          }`}
        >
          &larr; left
        </button>
        <button
          type="button"
          onClick={() => setFacing(1)}
          aria-pressed={facing === 1}
          className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
            facing === 1 ? "border-accent bg-accent/15 text-accent" : "border-border text-muted hover:bg-surface-2"
          }`}
        >
          right &rarr;
        </button>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
        {"// the subject never changed. where you put it, and which way it looks, is the whole game."}
      </p>
    </div>
  );
}
