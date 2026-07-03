import { useState } from "react";

// ColorScienceForPhotographersWidget: the signature widget for "Seeing in color".
// One focused interaction that proves the chapter's thesis: color is a relationship
// the eye computes, not a fixed property of a patch. Two center squares are filled with
// the EXACT same neutral grey. Their surrounds are set to a complementary pair by a
// single hue slider. Because the eye codes color on opponent channels, each identical
// grey drifts toward the complement of its surround, so the two squares that are the
// same colour look plainly different. The reveal toggle neutralizes both grounds; with
// the surrounds gone the illusion collapses and the squares snap back to obviously
// identical. Nothing about the centers ever changes. React state only, no persistence.

// The two center squares are always this exact neutral grey. Keeping them identical is
// the whole point, so this is one constant, referenced by both panels.
const CENTER = "hsl(0, 0%, 63%)";
const NEUTRAL_GROUND = "hsl(0, 0%, 34%)"; // the "reveal" ground: plainly not the centre

const ground = (hue: number) => `hsl(${hue}, 66%, 48%)`;

// Coarse hue names, so the readout can say what the surround is and what it induces.
function hueName(h: number): string {
  const x = ((h % 360) + 360) % 360;
  if (x < 15 || x >= 345) return "red";
  if (x < 45) return "orange";
  if (x < 70) return "yellow";
  if (x < 100) return "yellow-green";
  if (x < 150) return "green";
  if (x < 175) return "teal";
  if (x < 200) return "cyan";
  if (x < 250) return "blue";
  if (x < 290) return "violet";
  if (x < 330) return "magenta";
  return "rose";
}

function Panel({ groundColor, label }: { groundColor: string; label: string }) {
  return (
    <figure className="flex-1">
      <div
        className="flex aspect-[4/3] items-center justify-center rounded-md border border-border transition-colors duration-500 motion-reduce:transition-none"
        style={{ backgroundColor: groundColor }}
      >
        <div className="h-1/3 w-1/3 rounded-sm" style={{ backgroundColor: CENTER }} />
      </div>
      <figcaption className="mt-2 text-center font-mono text-[0.7rem] text-comment">{label}</figcaption>
    </figure>
  );
}

export function ColorScienceForPhotographersWidget() {
  const [hue, setHue] = useState(8); // open on a red / cyan pair, the strongest induction
  const [reveal, setReveal] = useState(false);

  const leftHue = hue;
  const rightHue = (hue + 180) % 360;
  const leftGround = reveal ? NEUTRAL_GROUND : ground(leftHue);
  const rightGround = reveal ? NEUTRAL_GROUND : ground(rightHue);

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Panel groundColor={leftGround} label={reveal ? "neutral ground" : `${hueName(leftHue)} ground`} />
        <Panel groundColor={rightGround} label={reveal ? "neutral ground" : `${hueName(rightHue)} ground`} />
      </div>

      {/* readout */}
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">centers</dt>
        <dd className="text-fg">identical neutral grey, both squares</dd>
        <dt className="text-comment">grounds</dt>
        <dd className="text-accent">
          {reveal ? "neutralized" : `${hueName(leftHue)} ↔ ${hueName(rightHue)} (complementary)`}
        </dd>
        <dt className="text-comment">illusion</dt>
        <dd className="text-muted">
          {reveal
            ? "grounds gone, the two greys read as the same patch again. the color was never in the square."
            : `each grey drifts toward its ground's complement: the left toward ${hueName(rightHue)}, the right toward ${hueName(leftHue)}.`}
        </dd>
      </dl>

      {/* the one move: rotate the complementary pair of surrounds */}
      <div className="mt-5">
        <label htmlFor="cs-hue" className="mb-2 block font-mono text-xs text-comment">
          rotate the surrounds (they stay a complementary pair)
        </label>
        <input
          id="cs-hue"
          type="range"
          min={0}
          max={359}
          step={1}
          value={hue}
          disabled={reveal}
          onChange={(e) => setHue(Number(e.target.value))}
          aria-label={`Surround hue, currently ${hueName(leftHue)} against ${hueName(rightHue)}`}
          className="w-full disabled:opacity-40"
          style={{ accentColor: "var(--accent)" }}
        />
      </div>

      <div className="mt-4">
        <button
          type="button"
          onClick={() => setReveal((v) => !v)}
          aria-pressed={reveal}
          className={`rounded border px-3 py-1 font-mono text-xs transition-colors ${
            reveal
              ? "border-accent bg-accent/15 text-accent"
              : "border-border text-muted hover:bg-surface-2"
          }`}
        >
          {reveal ? "restore the grounds" : "prove they are identical"}
        </button>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
        {"// the two center squares never change. what changes is what surrounds them, "}
        {"and that is enough to change the color you see."}
      </p>
    </div>
  );
}
