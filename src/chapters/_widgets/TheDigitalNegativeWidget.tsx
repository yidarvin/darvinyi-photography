import { useMemo, useState } from "react";

// TheDigitalNegativeWidget: the signature widget for "The digital negative".
// One focused interaction that proves the chapter's thesis: a raw file is a negative
// you develop, and it holds far more than the finished JPEG the camera would have
// baked. The reader drags one "develop push" slider and watches the SAME scene develop
// two ways: from the raw negative (deep precision, highlights still there) and from the
// 8-bit JPEG the camera already committed to (few levels, highlights clipped away).
//
// As the push rises, the raw develops cleanly while the JPEG shows the two costs of
// having baked the picture in-camera: the lifted foreground POSTERIZES into visible
// bands, because 8 bits left only a couple dozen levels in that dark band, and the
// bright sky pulls down to a flat, textureless grey, because everything above white was
// clipped to a single value and thrown away. Nothing about the scene changes. Only what
// each file kept of it does. React state only, no persistence.
//
// The model is schematic but directionally honest: the raw keeps ~14-bit precision and
// real headroom above the JPEG's white point; the JPEG is quantized to 256 levels per
// channel and hard-clipped at 1.0. The same develop transform is applied to both, so any
// difference you see is a difference in what the file had left to give.

const N = 90; // columns across each strip; enough that raw reads smooth

const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
const norm = (v: number, lo: number, hi: number) => Math.max(0, Math.min(1, (v - lo) / (hi - lo)));

// The true scene, in scene-linear terms. The sky sits mostly ABOVE 1.0: light the
// sensor caught but that overflows the JPEG's white. Its gentle undulation is cloud
// detail. The ground is a narrow, dark band, the kind of flat shadow you lift in editing.
const skyTrue = (x: number) => 1.12 + 0.15 * Math.sin(x * Math.PI * 2.4);
const groundTrue = (x: number) => 0.15 + 0.09 * x;

// Capture. Raw keeps deep precision and the values above 1.0. The JPEG renders to 8 bits
// (256 levels) and clips anything past white to a single flat value.
const q14 = (v: number) => Math.round(v * 16383) / 16383;
const q8 = (v: number) => Math.round(clamp01(v) * 255) / 255;

// The develop push, applied identically to whatever the file kept.
// Foreground: lift the dark band and stretch its contrast. On the raw this reveals a
// smooth ramp; on the 8-bit JPEG the handful of surviving levels spread into bands.
const developGround = (stored: number, t: number) => {
  const band = norm(stored, 0.14, 0.245); // position within the dark band
  return clamp01(0.1 + band * (0.16 + 0.66 * t));
};
// Sky: pull the highlight down to try to recover cloud detail. On the raw the detail is
// still there (values above 1.0 were kept); on the JPEG it was clipped to flat white, so
// pulling down only yields a dull, even grey.
const developSky = (stored: number, t: number) => {
  const recovered = 0.42 + norm(stored, 0.85, 1.3) * 0.52;
  return clamp01(stored * (1 - t) + recovered * t);
};

const g = (v: number) => {
  const n = Math.round(clamp01(v) * 255);
  return `rgb(${n}, ${n}, ${n})`;
};

type Kept = "raw" | "jpeg";

// One developed strip: sky band on top, ground band below, painted column by column so
// posterization emerges honestly where it would in a real file.
function Strip({ kept, t, label }: { kept: Kept; t: number; label: string }) {
  const capture = kept === "raw" ? q14 : q8;
  const cols = Array.from({ length: N }, (_, i) => i / (N - 1));
  const SKY_TOP = 20;
  const SKY_H = 62;
  const GND_H = 66;
  const W = 240;
  const cw = W / N + 0.6; // slight overlap so no hairline seams

  return (
    <figure className="flex-1">
      <svg
        viewBox="0 0 240 150"
        className="w-full rounded-md border border-border bg-surface-2"
        role="img"
        aria-label={`The scene developed from the ${kept === "raw" ? "raw negative" : "baked 8-bit JPEG"}.`}
      >
        <text x={8} y={13} fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
          {`// ${label}`}
        </text>
        {cols.map((x, i) => (
          <rect
            key={`s${i}`}
            x={x * W}
            y={SKY_TOP}
            width={cw}
            height={SKY_H}
            fill={g(developSky(capture(skyTrue(x)), t))}
          />
        ))}
        {cols.map((x, i) => (
          <rect
            key={`g${i}`}
            x={x * W}
            y={SKY_TOP + SKY_H}
            width={cw}
            height={GND_H}
            fill={g(developGround(capture(groundTrue(x)), t))}
          />
        ))}
        <line x1={0} y1={SKY_TOP + SKY_H} x2={W} y2={SKY_TOP + SKY_H} stroke="var(--bg)" strokeWidth={0.75} />
      </svg>
    </figure>
  );
}

// Count the distinct tones the develop leaves in the dark band. This is the number that
// stops the JPEG from being smooth: the push spreads its few levels apart into bands.
function groundTones(kept: Kept, t: number): number {
  const capture = kept === "raw" ? q14 : q8;
  const set = new Set<number>();
  for (let i = 0; i < N; i++) {
    const x = i / (N - 1);
    set.add(Math.round(developGround(capture(groundTrue(x)), t) * 255));
  }
  return set.size;
}

export function TheDigitalNegativeWidget() {
  const [t, setT] = useState(0.7); // open partway in, where the split is already plain

  const rawTones = useMemo(() => groundTones("raw", t), [t]);
  const jpegTones = useMemo(() => groundTones("jpeg", t), [t]);
  const pushPct = Math.round(t * 100);

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-4 sm:flex-row">
        <Strip kept="raw" t={t} label="developed from the raw negative" />
        <Strip kept="jpeg" t={t} label="developed from the baked jpeg" />
      </div>

      {/* the one move: how hard you develop the file */}
      <div className="mt-5">
        <label htmlFor="develop-push" className="mb-2 flex items-baseline justify-between font-mono text-xs">
          <span className="text-comment">develop push</span>
          <span className="tabular-nums text-accent">{pushPct}%</span>
        </label>
        <input
          id="develop-push"
          type="range"
          min={0}
          max={100}
          value={pushPct}
          onChange={(e) => setT(Number(e.target.value) / 100)}
          className="w-full accent-[var(--accent)]"
        />
        <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-comment">
          <span>as shot</span>
          <span>lift the shadows, recover the sky</span>
        </div>
      </div>

      {/* readout: the two costs of having kept only the baked picture */}
      <dl className="mt-5 grid grid-cols-[auto_1fr_1fr] gap-x-4 gap-y-2 font-mono text-xs">
        <dt className="text-comment" />
        <dd className="text-accent">raw negative</dd>
        <dd className="text-muted">baked jpeg</dd>

        <dt className="self-center text-comment">shadow band</dt>
        <dd className="text-fg">
          <span className="tabular-nums">{rawTones}</span> tones · smooth
        </dd>
        <dd className="text-fg">
          <span className="tabular-nums">{jpegTones}</span> tones · {jpegTones < 40 ? "banded" : "coarsening"}
        </dd>

        <dt className="self-center text-comment">clipped sky</dt>
        <dd className="text-fg">detail recovers</dd>
        <dd className="text-fg">gone, flat grey</dd>
      </dl>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
        {"// both files came from one exposure. the raw kept the negative; the jpeg kept "}
        {"one print of it and threw the negative away. the push only asks what is still there."}
      </p>
    </div>
  );
}
