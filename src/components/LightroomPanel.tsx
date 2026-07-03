import type { ReactNode } from "react";

export interface LrSlider {
  label: string;
  value: number;
  /** Track minimum. Default -100. */
  min?: number;
  /** Track maximum. Default 100. */
  max?: number;
  /** Where the fill starts. Bipolar sliders (most of them) anchor at center. Default "center". */
  anchor?: "center" | "left";
  /** Optional label tint, e.g. for the HSL mixer. */
  color?: string;
  /** Pre-formatted value text, e.g. "5,500 K". Overrides the signed-number default. */
  display?: string;
}

function fmt(v: number): string {
  const r = Math.round(v * 100) / 100;
  return r > 0 ? `+${r}` : `${r}`;
}

function Row({ s }: { s: LrSlider }) {
  const min = s.min ?? -100;
  const max = s.max ?? 100;
  const anchor = s.anchor ?? "center";
  const p = Math.min(100, Math.max(0, ((s.value - min) / (max - min)) * 100));
  const anchorPct = anchor === "left" ? 0 : ((0 - min) / (max - min)) * 100;
  const fillLeft = Math.min(p, anchorPct);
  const fillWidth = Math.abs(p - anchorPct);
  return (
    <div className="flex items-center gap-3 py-1.5">
      <span
        className="w-24 shrink-0 truncate font-mono text-[0.72rem]"
        style={{ color: s.color ?? "var(--fg-muted)" }}
      >
        {s.label}
      </span>
      <div className="relative h-3 grow">
        <div className="absolute top-1/2 h-px w-full -translate-y-1/2 bg-border" />
        <div
          className="absolute top-1/2 h-0.5 -translate-y-1/2 rounded-full"
          style={{ left: `${fillLeft}%`, width: `${fillWidth}%`, backgroundColor: "var(--accent-dim)" }}
        />
        <div
          className="absolute top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full border"
          style={{ left: `${p}%`, backgroundColor: "var(--surface)", borderColor: "var(--accent)" }}
        />
      </div>
      <span className="w-12 shrink-0 text-right font-mono text-[0.72rem] tabular-nums text-fg">
        {s.display ?? fmt(s.value)}
      </span>
    </div>
  );
}

interface LightroomPanelProps {
  /** Panel name, e.g. "Basic", "Detail", "Effects". */
  title?: string;
  sliders: LrSlider[];
  caption?: ReactNode;
  id?: string;
}

/**
 * A faithful, on-brand replica of a Lightroom Develop panel: labelled sliders with a
 * knob at the exact value and the value read out beside it. Not a screenshot, so it
 * stays crisp, themeable, and shows the precise numbers a chapter's edit uses. Pair it
 * with a <BeforeAfter> to show the control and its result together.
 */
export function LightroomPanel({ title = "Basic", sliders, caption, id }: LightroomPanelProps) {
  return (
    <figure className="my-8 rounded-lg border border-border bg-surface-2 p-4">
      <header className="mb-2 flex items-baseline justify-between border-b border-border pb-2">
        <span className="font-mono text-xs font-medium text-fg">{title}</span>
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-comment">
          develop
        </span>
      </header>
      <div className="divide-y divide-border/60">
        {sliders.map((s, i) => (
          <Row key={i} s={s} />
        ))}
      </div>
      {caption && (
        <figcaption className="mt-3 font-mono text-xs leading-relaxed text-muted">
          {id && <span className="text-comment">{`/* panel ${id} */ `}</span>}
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

const HUES: { label: string; color: string }[] = [
  { label: "Red", color: "#ef4444" },
  { label: "Orange", color: "#f59e0b" },
  { label: "Yellow", color: "#d9c60b" },
  { label: "Green", color: "#22c55e" },
  { label: "Aqua", color: "#14b8a6" },
  { label: "Blue", color: "#3b82f6" },
  { label: "Purple", color: "#8b5cf6" },
  { label: "Magenta", color: "#ec4899" },
];

interface LightroomHSLProps {
  /** Eight values, one per hue: Red, Orange, Yellow, Green, Aqua, Blue, Purple, Magenta. */
  values: number[];
  /** Which mixer channel, e.g. "Saturation", "Luminance", "Hue", "B&W Mix". */
  channel?: string;
  caption?: ReactNode;
  id?: string;
}

/** The HSL / color-mixer panel: eight per-hue sliders, each label tinted its own color. */
export function LightroomHSL({ values, channel = "Saturation", caption, id }: LightroomHSLProps) {
  const sliders: LrSlider[] = HUES.map((h, i) => ({
    label: h.label,
    color: h.color,
    value: values[i] ?? 0,
  }));
  return <LightroomPanel title={`Color Mixer · ${channel}`} sliders={sliders} caption={caption} id={id} />;
}

interface CurvePoint {
  /** Input level, 0-255. */
  x: number;
  /** Output level, 0-255. */
  y: number;
}

function smoothPath(points: CurvePoint[], w: number, h: number): string {
  const pts = [...points].sort((a, b) => a.x - b.x);
  const sx = (v: number) => (v / 255) * w;
  const sy = (v: number) => h - (v / 255) * h;
  if (pts.length < 2) return "";
  let d = `M ${sx(pts[0].x)} ${sy(pts[0].y)}`;
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[i - 1] ?? pts[i];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[i + 2] ?? p2;
    const c1x = sx(p1.x) + (sx(p2.x) - sx(p0.x)) / 6;
    const c1y = sy(p1.y) + (sy(p2.y) - sy(p0.y)) / 6;
    const c2x = sx(p2.x) - (sx(p3.x) - sx(p1.x)) / 6;
    const c2y = sy(p2.y) - (sy(p3.y) - sy(p1.y)) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${sx(p2.x)} ${sy(p2.y)}`;
  }
  return d;
}

const CHANNEL_COLORS: Record<string, string> = {
  rgb: "var(--accent)",
  luma: "var(--accent)",
  red: "#ef4444",
  green: "#22c55e",
  blue: "#3b82f6",
};

interface LightroomCurveProps {
  /** Control points in input/output levels, 0-255 each. */
  points: CurvePoint[];
  channel?: "rgb" | "luma" | "red" | "green" | "blue";
  title?: string;
  caption?: ReactNode;
  id?: string;
}

/** The Tone Curve panel: a smooth curve through control points over the identity diagonal. */
export function LightroomCurve({
  points,
  channel = "rgb",
  title = "Tone Curve",
  caption,
  id,
}: LightroomCurveProps) {
  const W = 240;
  const H = 240;
  const color = CHANNEL_COLORS[channel] ?? "var(--accent)";
  const grid = [0.25, 0.5, 0.75];
  return (
    <figure className="my-8 rounded-lg border border-border bg-surface-2 p-4">
      <header className="mb-3 flex items-baseline justify-between border-b border-border pb-2">
        <span className="font-mono text-xs font-medium text-fg">{title}</span>
        <span className="font-mono text-[0.65rem] uppercase tracking-wider text-comment">
          {channel}
        </span>
      </header>
      <div className="flex justify-center">
        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="h-auto w-full max-w-[280px]"
          role="img"
          aria-label={`Tone curve on the ${channel} channel`}
        >
          <rect x={0} y={0} width={W} height={H} fill="var(--surface)" stroke="var(--border)" />
          {grid.map((g) => (
            <line key={`v${g}`} x1={g * W} y1={0} x2={g * W} y2={H} stroke="var(--border)" strokeWidth={1} />
          ))}
          {grid.map((g) => (
            <line key={`h${g}`} x1={0} y1={g * H} x2={W} y2={g * H} stroke="var(--border)" strokeWidth={1} />
          ))}
          <line x1={0} y1={H} x2={W} y2={0} stroke="var(--comment)" strokeWidth={1} strokeDasharray="4 4" />
          <path d={smoothPath(points, W, H)} fill="none" stroke={color} strokeWidth={2} />
          {points.map((p, i) => (
            <circle key={i} cx={(p.x / 255) * W} cy={H - (p.y / 255) * H} r={3} fill={color} />
          ))}
        </svg>
      </div>
      {caption && (
        <figcaption className="mt-3 font-mono text-xs leading-relaxed text-muted">
          {id && <span className="text-comment">{`/* curve ${id} */ `}</span>}
          {caption}
        </figcaption>
      )}
    </figure>
  );
}
