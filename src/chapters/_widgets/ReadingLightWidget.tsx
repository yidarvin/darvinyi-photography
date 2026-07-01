import { useState } from "react";

// ReadingLightWidget: the signature widget for "Reading light". One focused
// interaction: you swing a single key light around the subject and watch the shadows
// move. The chapter's claim is that DIRECTION is a control, not an accident, so the
// widget shows the one move two honest ways. The plan view (top-down) says where the
// light stands relative to you and the subject; the front view says what the camera
// then sees, shaded the way a real sphere is lit from that angle (the moon-phase
// geometry). As the light travels from beside the camera around to behind the subject,
// the readout names the lighting the way a portrait photographer would: front, loop,
// Rembrandt, split, rim, backlight. React state only, no persistence.

const RAD = Math.PI / 180;

// The classic patterns as a function of the key light's azimuth, measured from the
// camera-to-subject axis. 0 deg is a light beside the camera (flat front light); 180
// deg is a light directly behind the subject (backlight). The light orbits to the
// right, so the subject's right side (screen right) is the lit side.
function pattern(phi: number): { name: string; note: string } {
  if (phi < 15)
    return { name: "front / flat", note: "even and open, shadows thrown behind the subject. flattering, but the shape goes flat." };
  if (phi < 37)
    return { name: "loop", note: "the everyday key: a small shadow loops beside the nose. gentle, natural modeling." };
  if (phi < 62)
    return { name: "Rembrandt", note: "the portrait classic: a lit triangle sits on the shadow-side cheek. shape and mood." };
  if (phi < 98)
    return { name: "split", note: "half lit, half dark, the divide down the middle. dramatic, and every texture shows." };
  if (phi < 140)
    return { name: "rim / kicker", note: "the light rakes from behind the side. the subject is drawn by its bright edge." };
  return { name: "backlight", note: "the light is behind the subject: an outline and a halo, with detail falling to shadow." };
}

// PLAN VIEW geometry (top-down): camera at the bottom, subject in the middle, the key
// light orbiting on a ring. Screen down is toward the camera, so the light sits near
// the camera at phi 0 and swings up and behind as phi grows.
const P_CX = 100;
const P_CY = 88;
const P_ORBIT = 64;
const sunPlan = (phi: number) => ({
  x: P_CX + P_ORBIT * Math.sin(phi * RAD),
  y: P_CY + P_ORBIT * Math.cos(phi * RAD),
});

// FRONT VIEW geometry: the subject is a sphere; the camera sees a lit crescent whose
// shape is exactly a moon phase. Lit on the right, the terminator is an ellipse whose
// half-width is R*cos(phi): a full disc at the front, a half disc at the side, a thin
// rim at the back.
const F_CX = 100;
const F_CY = 94;
const F_R = 62;

function litPath(phi: number): string {
  const t = Math.cos(phi * RAD); // +1 front (full) .. 0 side (half) .. -1 back (none)
  const rx = Math.abs(t) * F_R;
  const sweep = t > 0 ? 0 : 1; // gibbous bulges left, crescent bulges right
  return (
    `M ${F_CX} ${F_CY - F_R} ` +
    `A ${F_R} ${F_R} 0 0 1 ${F_CX} ${F_CY + F_R} ` +
    `A ${rx.toFixed(2)} ${F_R} 0 0 ${sweep} ${F_CX} ${F_CY - F_R} Z`
  );
}

export function ReadingLightWidget() {
  const [phi, setPhi] = useState(45); // open on Rembrandt, a nicely modeled look

  const sun = sunPlan(phi);
  const { name, note } = pattern(phi);
  const rim = Math.min(Math.max((phi - 100) / 80, 0), 1); // backlight rim strength
  const behind = phi > 90; // light has passed behind the subject

  // Front-view contact shadow: swings opposite the light and stretches toward the side.
  const shOff = -30 * Math.sin(phi * RAD);
  const shRx = 24 + 22 * Math.sin(phi * RAD);

  return (
    <div className="font-sans">
      <div className="flex flex-col gap-4 sm:flex-row">
        {/* PLAN VIEW: where the light stands, seen from above */}
        <figure className="flex-1">
          <svg
            viewBox="0 0 200 196"
            className="w-full rounded-md border border-border bg-surface-2"
            role="img"
            aria-label={`Top-down plan: the key light stands at ${Math.round(phi)} degrees around the subject, measured from the camera. This is ${name} lighting.`}
          >
            <text x="12" y="18" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
              {"// from above"}
            </text>

            {/* orbit ring */}
            <circle cx={P_CX} cy={P_CY} r={P_ORBIT} fill="none" stroke="var(--border)" strokeDasharray="3 4" />
            {/* orientation ticks */}
            <text x={P_CX} y={P_CY + P_ORBIT + 13} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--comment)">front</text>
            <text x={P_CX + P_ORBIT + 3} y={P_CY + 3} textAnchor="start" fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--comment)">side</text>
            <text x={P_CX} y={P_CY - P_ORBIT - 6} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7.5" fill="var(--comment)">behind</text>

            {/* the light ray, from the sun toward the subject */}
            <line x1={sun.x} y1={sun.y} x2={P_CX} y2={P_CY} stroke="var(--accent)" strokeOpacity="0.5" strokeWidth="1.3" />

            {/* subject */}
            <circle cx={P_CX} cy={P_CY} r={10} fill="var(--surface)" stroke="var(--border)" />
            <circle cx={P_CX} cy={P_CY} r={3} fill="var(--fg-muted)" />

            {/* the sun / key light, dimmer once it swings behind the subject */}
            <g opacity={behind ? 0.75 : 1}>
              <circle cx={sun.x} cy={sun.y} r={7.5} fill="var(--accent)" />
              {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
                <line
                  key={a}
                  x1={sun.x + 9 * Math.cos(a * RAD)}
                  y1={sun.y + 9 * Math.sin(a * RAD)}
                  x2={sun.x + 12.5 * Math.cos(a * RAD)}
                  y2={sun.y + 12.5 * Math.sin(a * RAD)}
                  stroke="var(--accent)"
                  strokeWidth="1.3"
                />
              ))}
            </g>

            {/* the camera, at the bottom looking up at the subject */}
            <g>
              <rect x={P_CX - 12} y={172} width={24} height={15} rx="2.5" fill="var(--surface)" stroke="var(--fg-muted)" />
              <rect x={P_CX - 4} y={167} width={8} height={6} rx="1.5" fill="var(--surface)" stroke="var(--fg-muted)" />
              <text x={P_CX} y={183.5} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="7" fill="var(--fg-muted)">cam</text>
            </g>
          </svg>
        </figure>

        {/* FRONT VIEW: what the camera sees */}
        <figure className="flex-1">
          <svg
            viewBox="0 0 200 210"
            className="w-full rounded-md border border-border bg-surface-2"
            role="img"
            aria-label={`Front view of the subject under ${name} lighting: ${note}`}
          >
            <defs>
              <radialGradient id="rl-lit" cx="0.68" cy="0.42" r="0.85">
                <stop offset="0%" stopColor="#eef2f4" />
                <stop offset="55%" stopColor="#b7c2c7" />
                <stop offset="100%" stopColor="#41525a" />
              </radialGradient>
            </defs>

            <text x="12" y="18" fontFamily="var(--font-mono)" fontSize="8.5" fill="var(--comment)">
              {"// what the camera sees"}
            </text>

            {/* contact shadow on the ground */}
            <ellipse cx={F_CX + shOff} cy={F_CY + F_R + 14} rx={shRx} ry={7} fill="#05090a" opacity="0.4" />

            {/* the subject sphere: dark body, then the lit crescent on top */}
            <circle cx={F_CX} cy={F_CY} r={F_R} fill="#0c1417" />
            <path d={litPath(phi)} fill="url(#rl-lit)" />

            {/* rim light on the lit limb, glowing as the key swings behind */}
            {rim > 0 && (
              <path
                d={`M ${F_CX} ${F_CY - F_R} A ${F_R} ${F_R} 0 0 1 ${F_CX} ${F_CY + F_R}`}
                fill="none"
                stroke="var(--accent)"
                strokeWidth={2.4}
                strokeLinecap="round"
                strokeOpacity={0.9 * rim}
              />
            )}

            {/* sphere outline */}
            <circle cx={F_CX} cy={F_CY} r={F_R} fill="none" stroke="var(--border)" />

            <text x={F_CX} y={F_CY + F_R + 34} textAnchor="middle" fontFamily="var(--font-mono)" fontSize="8" fill="var(--comment)">
              your subject
            </text>
          </svg>
        </figure>
      </div>

      {/* readout */}
      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1 font-mono text-xs">
        <dt className="text-comment">light at</dt>
        <dd className="text-fg">{Math.round(phi)}&deg; from the camera</dd>
        <dt className="text-comment">pattern</dt>
        <dd className="text-accent">{name}</dd>
        <dt className="text-comment">it gives</dt>
        <dd className="text-muted">{note}</dd>
      </dl>

      {/* the one move: swing the light around the subject */}
      <div className="mt-5">
        <label htmlFor="rl-azimuth" className="mb-2 block font-mono text-xs text-comment">
          swing the key light around the subject
        </label>
        <input
          id="rl-azimuth"
          type="range"
          min={0}
          max={180}
          step={1}
          value={phi}
          onChange={(e) => setPhi(Number(e.target.value))}
          aria-label={`Key-light azimuth, currently ${Math.round(phi)} degrees, giving ${name} lighting`}
          className="w-full"
          style={{ accentColor: "var(--accent)" }}
        />
        <div className="mt-1 flex justify-between font-mono text-[0.7rem] text-comment">
          <span>&larr; front &middot; flat</span>
          <span>side</span>
          <span>behind &middot; rim &rarr;</span>
        </div>
      </div>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
        {"// you never changed the subject or the exposure. moving one light around it "}
        {"is most of what \"good light\" means."}
      </p>
    </div>
  );
}
