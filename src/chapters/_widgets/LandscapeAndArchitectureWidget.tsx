import { useId, useState } from "react";

// LandscapeAndArchitectureWidget: the signature widget for "Landscape and architecture".
// One focused interaction: tilt the camera up at a tower and watch its verticals converge
// (the keystone), then press "correct verticals" and watch the fix crop the frame and
// spend resolution. The single live control is the tilt slider; the correction is a
// toggle. The payoff readout ties the whole chapter together: correcting perspective in
// software is a crop, and a 100-megapixel file is what lets you afford it. React state
// only, no persistence. No animation loop, so it respects reduced motion for free.

const FRAME_W = 300;
const FRAME_H = 226;
const GROUND = 196;
const TOP = 26;
const CX = 150;
const BASE_HALF = 78; // half-width of the tower base, in frame units

const THETA_MAX = 24; // degrees of upward tilt at the far end of the slider

// The X2D II 100C captures 11656 x 8742 pixels (~100 MP). A vertical correction stretches
// the narrow top back out and crops the frame to a rectangle; we model the retained
// fraction with the same parameter that drives the visible convergence, so the picture
// and the numbers always agree.
const FULL_MP = 100;
const LONG_EDGE_PX = 11656;
const Q3_MP = 60; // the Leica Q3, for contrast

// top-edge width as a fraction of the base, and the fraction of the frame kept after the
// correcting crop. One monotonic parameter keeps the drawing and the readout consistent.
const keystone = (deg: number) => 1 - 0.4 * (deg / THETA_MAX);

export function LandscapeAndArchitectureWidget() {
  const uid = useId().replace(/:/g, "");
  const [tilt, setTilt] = useState(14); // degrees, 0..THETA_MAX
  const [corrected, setCorrected] = useState(false);

  const k = keystone(tilt); // 1 at level, ~0.6 at full tilt
  const topHalf = BASE_HALF * k;

  // symmetric crop whose area equals the retained fraction k
  const scale = Math.sqrt(k);
  const cropW = FRAME_W * scale;
  const cropH = FRAME_H * scale;
  const cropX = (FRAME_W - cropW) / 2;
  const cropY = (FRAME_H - cropH) / 2;

  const mpAfter = Math.round(FULL_MP * k);
  const q3After = Math.round(Q3_MP * k);
  const printIn = Math.round((LONG_EDGE_PX * scale) / 300); // long edge inches at 300 dpi
  const topPct = Math.round(k * 100);

  // uncorrected tower: a trapezoid, sides converging toward the top
  const towerPoly = `${CX - BASE_HALF},${GROUND} ${CX + BASE_HALF},${GROUND} ${CX + topHalf},${TOP} ${CX - topHalf},${TOP}`;

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
        {/* the captured frame */}
        <figure className="sm:w-[56%]">
          <svg
            viewBox={`0 0 ${FRAME_W} ${FRAME_H}`}
            className="w-full rounded-md border border-border"
            role="img"
            aria-label={
              corrected
                ? `Verticals corrected: the tower's sides are parallel, and the correcting crop leaves about ${mpAfter} of the original 100 megapixels.`
                : `Camera tilted up ${tilt} degrees: the tower's vertical sides converge, its top edge about ${topPct} percent as wide as its base.`
            }
          >
            <defs>
              <linearGradient id={`la-sky-${uid}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#16222a" />
                <stop offset="1" stopColor="#24333a" />
              </linearGradient>
              <clipPath id={`la-clip-${uid}`}>
                <rect x={0} y={0} width={FRAME_W} height={FRAME_H} />
              </clipPath>
            </defs>

            <g clipPath={`url(#la-clip-${uid})`}>
              {/* sky and ground */}
              <rect x={0} y={0} width={FRAME_W} height={FRAME_H} fill={`url(#la-sky-${uid})`} />
              <rect x={0} y={GROUND} width={FRAME_W} height={FRAME_H - GROUND} fill="#0e1417" />

              {corrected ? (
                <>
                  {/* corrected: verticals parallel (a rectangle) */}
                  <rect
                    x={CX - BASE_HALF}
                    y={TOP}
                    width={BASE_HALF * 2}
                    height={GROUND - TOP}
                    fill="var(--accent)"
                    fillOpacity={0.16}
                    stroke="var(--accent)"
                    strokeWidth={1.6}
                  />
                  {[70, 110, 150].map((y) => (
                    <line key={y} x1={CX - BASE_HALF} y1={y} x2={CX + BASE_HALF} y2={y} stroke="var(--accent)" strokeOpacity={0.45} strokeWidth={0.8} />
                  ))}

                  {/* the discarded margin, dimmed, and the crop boundary */}
                  <path
                    d={`M0 0 H${FRAME_W} V${FRAME_H} H0 Z M${cropX} ${cropY} V${cropY + cropH} H${cropX + cropW} V${cropY} Z`}
                    fill="#0a0e0f"
                    fillOpacity={0.66}
                    fillRule="evenodd"
                  />
                  <rect
                    x={cropX}
                    y={cropY}
                    width={cropW}
                    height={cropH}
                    fill="none"
                    stroke="var(--accent)"
                    strokeWidth={1.2}
                    strokeDasharray="5 3"
                  />
                  <text x={cropX + 5} y={cropY + 14} fontFamily="var(--font-mono)" fontSize="9" fill="var(--accent)">
                    {`crop → ${mpAfter} MP`}
                  </text>
                </>
              ) : (
                <>
                  {/* uncorrected: the tower keystones as the camera tilts */}
                  <polygon
                    points={towerPoly}
                    fill={tilt > 1 ? "var(--danger)" : "var(--accent)"}
                    fillOpacity={0.13}
                    stroke={tilt > 1 ? "var(--danger)" : "var(--accent)"}
                    strokeWidth={1.6}
                  />
                  {/* horizontal floor bands stay level; only the verticals lean */}
                  {[70, 110, 150].map((y) => {
                    const f = (GROUND - y) / (GROUND - TOP);
                    const half = BASE_HALF + (topHalf - BASE_HALF) * f;
                    return (
                      <line
                        key={y}
                        x1={CX - half}
                        y1={y}
                        x2={CX + half}
                        y2={y}
                        stroke={tilt > 1 ? "var(--danger)" : "var(--accent)"}
                        strokeOpacity={0.4}
                        strokeWidth={0.8}
                      />
                    );
                  })}
                </>
              )}
            </g>

            <rect x={0.5} y={0.5} width={FRAME_W - 1} height={FRAME_H - 1} fill="none" stroke="var(--border)" />
            <text x={10} y={18} fontFamily="var(--font-mono)" fontSize="9.5" fill="var(--comment)">
              {corrected ? "// verticals true" : `// tilt ${tilt}°`}
            </text>
          </svg>
        </figure>

        {/* readout and controls */}
        <div className="sm:flex-1">
          <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 font-mono text-xs">
            <dt className="text-comment">camera</dt>
            <dd className="text-muted">X2D II · 100 MP · 11656×8742</dd>
            <dt className="text-comment">tilt</dt>
            <dd className="text-muted">{tilt}° up</dd>
            <dt className="text-comment">verticals</dt>
            <dd className={corrected ? "text-accent" : tilt > 1 ? "text-fg" : "text-accent"}>
              {corrected ? "parallel (corrected)" : tilt > 1 ? `converging · top ${topPct}% of base` : "parallel"}
            </dd>
            <dt className="text-comment">resolution</dt>
            <dd className={corrected && k < 0.98 ? "text-fg" : "text-muted"}>
              {corrected ? `${mpAfter} MP after crop` : "100 MP (full)"}
            </dd>
            {corrected && (
              <>
                <dt className="text-comment">prints to</dt>
                <dd className="text-muted">≈ {printIn}″ wide @ 300 dpi</dd>
              </>
            )}
          </dl>

          <div className="mt-5">
            <label htmlFor={`la-tilt-${uid}`} className="mb-2 block font-mono text-xs text-comment">
              tilt the camera up to fit the tower
            </label>
            <input
              id={`la-tilt-${uid}`}
              type="range"
              min={0}
              max={THETA_MAX}
              step={1}
              value={tilt}
              onChange={(e) => setTilt(Number(e.target.value))}
              aria-label={`Camera tilt, ${tilt} degrees up`}
              className="w-full"
              style={{ accentColor: "var(--accent)" }}
            />
            <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-comment">
              <span>level</span>
              <span>{tilt}° up</span>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCorrected((v) => !v)}
              aria-pressed={corrected}
              className="rounded border border-accent/50 bg-accent/10 px-3 py-1.5 font-mono text-xs text-accent transition-colors hover:bg-accent/20"
            >
              {corrected ? "show the capture" : "correct verticals"}
            </button>
            {tilt !== 0 && (
              <button
                onClick={() => {
                  setTilt(0);
                  setCorrected(false);
                }}
                className="rounded border border-border px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:bg-surface-2"
              >
                reset to level
              </button>
            )}
          </div>

          <p className="mt-3 font-mono text-xs">
            <span className="text-comment">{"// the same crop on a 60 MP Q3 → "}</span>
            <span className="text-muted">{q3After} MP</span>
          </p>

          <p className="mt-3 font-mono text-[0.7rem] leading-relaxed text-comment">
            {"// correcting the keystone stretches the narrow top back out and crops to a rectangle. resolution is what you spend. 100 MP is what you spend it from."}
          </p>
        </div>
      </div>
    </div>
  );
}
