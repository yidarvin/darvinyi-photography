import { useMemo, useState } from "react";

// OrderOfOperationsWidget: the signature widget for "Order of operations".
// One focused interaction that makes the thesis felt: a develop has a natural order
// because each step assumes the one before it is settled. The reader reorders the eight
// develop steps with move-earlier / move-later controls, and the widget names every
// dependency they just broke in plain language. A broken dependency is a step that now
// lands on a base a later step already assumed, which is exactly what forces rework.
//
// It opens on a realistic beginner order: dive into exposure and contrast and color, start
// masking, remember white balance late, sharpen before denoising, and only crop at the
// very end. That order breaks four dependencies. Sort the steps until zero are broken and
// the develop stops fighting itself. React state only, no persistence.
//
// Honesty note for the curious: a parametric editor like Lightroom re-cooks from the raw
// and applies its own fixed internal pipeline, so the order you touch the sliders does not
// change the pixels there. What this models is the order you WORK in (and the literal order
// of a destructive, baked edit): work out of sequence and you keep re-deciding settled
// steps, whether the engine reorders the math for you or not.

interface Step {
  id: string;
  label: string;
  blurb: string;
}

const STEPS: Record<string, Step> = {
  geometry: { id: "geometry", label: "geometry & lens", blurb: "distortion, straighten, crop" },
  wb: { id: "wb", label: "white balance", blurb: "set neutral" },
  exposure: { id: "exposure", label: "exposure", blurb: "global brightness" },
  contrast: { id: "contrast", label: "contrast & curve", blurb: "shape the tones" },
  color: { id: "color", label: "color & grade", blurb: "hue, saturation, grade" },
  local: { id: "local", label: "local adjustments", blurb: "masks, dodge & burn" },
  nr: { id: "nr", label: "noise reduction", blurb: "clean the shadows" },
  sharpen: { id: "sharpen", label: "sharpen & export", blurb: "output, sized to the export" },
};

// The dependency chain. Each edge says "before" must come before "after", and why: the
// "after" step lands on something the "before" step is supposed to have already settled.
interface Edge {
  before: string;
  after: string;
  why: string;
}

const EDGES: Edge[] = [
  {
    before: "wb",
    after: "color",
    why: "white balance sets what counts as neutral. Grade before it and the grade shifts when you fix the white, so you grade twice.",
  },
  {
    before: "exposure",
    after: "contrast",
    why: "the tone curve maps a settled exposure. Move exposure after the curve and the curve lands on tones that are no longer there.",
  },
  {
    before: "exposure",
    after: "local",
    why: "a local mask refines the global exposure. Change the base exposure after masking and every mask is aimed at the wrong brightness.",
  },
  {
    before: "contrast",
    after: "local",
    why: "local dodging builds on the global contrast. Reshape the curve afterward and the local work no longer fits.",
  },
  {
    before: "color",
    after: "local",
    why: "local color work assumes the global grade is settled. Change the grade afterward and the local edits fight it.",
  },
  {
    before: "geometry",
    after: "local",
    why: "the crop and distortion fix move the frame. Place a mask before the frame is set and it no longer covers what you aimed at.",
  },
  {
    before: "nr",
    after: "sharpen",
    why: "sharpening amplifies whatever is there, noise included. Sharpen before you denoise and you sharpen the grain, then smear real detail removing it.",
  },
  {
    before: "local",
    after: "sharpen",
    why: "sharpening is a finish on the final image. Sharpen before the local work is done and you are sharpening a picture you are still changing.",
  },
  {
    before: "geometry",
    after: "sharpen",
    why: "output sharpening is sized to the final pixels. Sharpen before the crop and the amount is wrong for what you export.",
  },
];

// A realistic out-of-order start: the eye-catching edits first, the housekeeping last.
const INITIAL = ["exposure", "contrast", "color", "local", "wb", "sharpen", "nr", "geometry"];

export function OrderOfOperationsWidget() {
  const [order, setOrder] = useState<string[]>(INITIAL);

  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir;
    if (j < 0 || j >= order.length) return;
    setOrder((prev) => {
      const next = prev.slice();
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });
  };

  const pos = useMemo(() => {
    const m: Record<string, number> = {};
    order.forEach((id, i) => (m[id] = i));
    return m;
  }, [order]);

  // A broken edge is one whose "after" step now sits before its "before" step.
  const broken = useMemo(() => EDGES.filter((e) => pos[e.after] < pos[e.before]), [pos]);
  const offenders = useMemo(() => {
    const s = new Set<string>();
    broken.forEach((e) => {
      s.add(e.before);
      s.add(e.after);
    });
    return s;
  }, [broken]);

  const clean = broken.length === 0;

  return (
    <div className="font-sans">
      <p className="mb-3 font-mono text-xs text-comment">
        {"// order the develop. earlier is higher. red = a step placed before the base it depends on."}
      </p>

      {/* the one move: reorder the steps */}
      <ol className="grid gap-2">
        {order.map((id, i) => {
          const step = STEPS[id];
          const flagged = offenders.has(id);
          return (
            <li
              key={id}
              className={`flex items-center gap-3 rounded-md border px-3 py-2 ${
                flagged ? "border-danger/50 bg-surface-2" : "border-border bg-surface-2"
              }`}
            >
              <span className="w-5 shrink-0 text-center font-mono text-xs tabular-nums text-comment">
                {i + 1}
              </span>
              <span className="min-w-0 flex-1">
                <span className={`font-mono text-xs ${flagged ? "text-danger" : "text-fg"}`}>
                  {step.label}
                </span>
                <span className="ml-2 font-mono text-[0.65rem] text-comment">{step.blurb}</span>
              </span>
              <span className="flex shrink-0 gap-1">
                <button
                  type="button"
                  onClick={() => move(i, -1)}
                  disabled={i === 0}
                  aria-label={`move ${step.label} earlier`}
                  className="rounded border border-border bg-surface px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/60 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted"
                >
                  ↑
                </button>
                <button
                  type="button"
                  onClick={() => move(i, 1)}
                  disabled={i === order.length - 1}
                  aria-label={`move ${step.label} later`}
                  className="rounded border border-border bg-surface px-2 py-1 font-mono text-xs text-muted transition-colors hover:border-accent/60 hover:text-accent disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:border-border disabled:hover:text-muted"
                >
                  ↓
                </button>
              </span>
            </li>
          );
        })}
      </ol>

      {/* the feedback: which dependencies the current order breaks, and why */}
      <div className="mt-5">
        <div className="flex items-baseline justify-between font-mono text-xs">
          <span className={clean ? "text-accent" : "text-danger"}>
            {clean ? "0 broken" : `${broken.length} broken`}
          </span>
          <button
            type="button"
            onClick={() => setOrder(INITIAL)}
            className="font-mono text-[0.7rem] text-comment underline-offset-2 hover:text-accent hover:underline"
          >
            reset
          </button>
        </div>

        {clean ? (
          <p className="mt-2 font-mono text-xs leading-relaxed text-comment">
            {
              "// the develop does not fight itself. every step lands on a base the step before it settled, so each decision is made once."
            }
          </p>
        ) : (
          <ul className="mt-2 grid gap-2">
            {broken.map((e) => (
              <li
                key={`${e.before}-${e.after}`}
                className="rounded-md border border-danger/40 bg-surface-2 px-3 py-2"
              >
                <div className="font-mono text-[0.7rem] text-danger">
                  {STEPS[e.before].label}
                  <span className="text-comment"> {"→ before → "}</span>
                  {STEPS[e.after].label}
                </div>
                <div className="mt-1 font-mono text-[0.7rem] leading-relaxed text-comment">
                  {e.why}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
