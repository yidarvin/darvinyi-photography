import { useMemo, useState } from "react";

// IngestAndCatalogWidget: the signature widget for "Ingest and catalog".
// One focused interaction that makes the second half of the thesis felt: never lose a
// frame. The reader chooses where the copies of one negative live, then runs three
// disasters and watches whether the frame survives. Each disaster maps to one leg of the
// 3-2-1 rule, so the abstract rule turns into a concrete "what would kill this picture".
//
// The card is drawn as the source, not a copy: you reformat and reuse it, so it is never
// part of your redundancy. The copies you toggle are the real ones. Survival of a disaster
// is honest and simple: you survive if at least one copy you kept is not destroyed.
//   - "a copy is lost"      needs a second copy         (>= 2 copies)
//   - "home is lost"        needs one copy offsite       (a copy with site offsite)
//   - "a whole medium fails" needs a second kind of medium (a copy not on disk)
// The 3-2-1 checklist (3 copies, 2 media, 1 offsite) is computed from the same choice, so
// the reader can see the rule met the moment every disaster is survived. React state only.

type Media = "disk" | "cloud";
type Site = "home" | "offsite";
type CopyId = "working" | "backup" | "offsiteDrive" | "cloud";

interface CopyDef {
  id: CopyId;
  label: string;
  media: Media;
  site: Site;
  sub: string;
}

const COPIES: CopyDef[] = [
  { id: "working", label: "working drive", media: "disk", site: "home", sub: "disk · home" },
  { id: "backup", label: "backup drive", media: "disk", site: "home", sub: "disk · home" },
  { id: "offsiteDrive", label: "offsite drive", media: "disk", site: "offsite", sub: "disk · offsite" },
  { id: "cloud", label: "cloud backup", media: "cloud", site: "offsite", sub: "cloud · offsite" },
];

interface Disaster {
  id: string;
  label: string;
  detail: string;
  need: string;
  survives: (kept: CopyDef[]) => boolean;
}

const DISASTERS: Disaster[] = [
  {
    id: "one",
    label: "a copy is lost",
    detail: "a drive dies, or a file gets deleted",
    need: "a second copy",
    survives: (kept) => kept.length >= 2,
  },
  {
    id: "home",
    label: "home is lost",
    detail: "fire, theft, or a flood",
    need: "one copy offsite",
    survives: (kept) => kept.some((c) => c.site === "offsite"),
  },
  {
    id: "media",
    label: "a whole medium fails",
    detail: "ransomware, or a bad batch of drives",
    need: "a second kind of medium",
    survives: (kept) => kept.some((c) => c.media !== "disk"),
  },
];

export function IngestAndCatalogWidget() {
  // Open on the naive setup: a working drive and one backup drive, both at home. It
  // survives a single failure but nothing site-wide, which is where most people actually
  // sit and where the gap is easiest to feel.
  const [on, setOn] = useState<Record<CopyId, boolean>>({
    working: true,
    backup: true,
    offsiteDrive: false,
    cloud: false,
  });
  const toggle = (id: CopyId) => setOn((s) => ({ ...s, [id]: !s[id] }));

  const kept = useMemo(() => COPIES.filter((c) => on[c.id]), [on]);
  const copies = kept.length;
  const media = useMemo(() => new Set(kept.map((c) => c.media)).size, [kept]);
  const offsite = kept.some((c) => c.site === "offsite");
  const rule321 = copies >= 3 && media >= 2 && offsite;
  const survived = DISASTERS.filter((d) => d.survives(kept)).length;
  const allSurvive = survived === DISASTERS.length;

  const check = (met: boolean) => (met ? "✓" : "✗");

  return (
    <div className="font-sans">
      {/* the frame's origin: the card is the source, never one of your copies */}
      <div className="mb-4 flex flex-wrap items-center gap-2 font-mono text-xs">
        <span className="rounded border border-border bg-surface-2 px-2 py-1 text-muted">card</span>
        <span className="text-comment">
          {"// the source. you reformat and reuse it, so it is never one of your copies."}
        </span>
      </div>

      {/* the one move: choose where the negative's copies live */}
      <p className="mb-2 font-mono text-xs text-comment">{"// keep a copy where?"}</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {COPIES.map((c) => {
          const isOn = on[c.id];
          return (
            <button
              key={c.id}
              type="button"
              aria-pressed={isOn}
              onClick={() => toggle(c.id)}
              className={`rounded-md border px-3 py-2 text-left transition-colors ${
                isOn ? "border-accent/60 bg-accent/10" : "border-border bg-surface-2 hover:bg-surface"
              }`}
            >
              <div className="flex items-baseline justify-between font-mono text-xs">
                <span className={isOn ? "text-accent" : "text-muted"}>{c.label}</span>
                <span className={`text-[0.65rem] ${isOn ? "text-accent" : "text-comment"}`}>
                  {isOn ? "kept" : "off"}
                </span>
              </div>
              <div className="mt-1 font-mono text-[0.65rem] text-comment">{c.sub}</div>
            </button>
          );
        })}
      </div>

      {/* what each choice survives: one disaster per leg of the rule */}
      <div className="mt-5 grid gap-2">
        {DISASTERS.map((d) => {
          const ok = d.survives(kept);
          return (
            <div
              key={d.id}
              className="flex items-center justify-between rounded-md border border-border bg-surface-2 px-3 py-2"
            >
              <div>
                <div className="font-mono text-xs text-fg">{d.label}</div>
                <div className="font-mono text-[0.65rem] text-comment">{`// ${d.detail}`}</div>
              </div>
              <div className="text-right">
                <div className={`font-mono text-xs ${ok ? "text-accent" : "text-danger"}`}>
                  {ok ? "survives" : "lost"}
                </div>
                {!ok && (
                  <div className="font-mono text-[0.6rem] text-comment">{`needs ${d.need}`}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* the rule, read off the same choice */}
      <dl className="mt-5 grid grid-cols-3 gap-2 font-mono">
        <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
          <dt className="text-[0.65rem] text-comment">3 copies</dt>
          <dd className={`mt-1 text-xs tabular-nums ${copies >= 3 ? "text-accent" : "text-muted"}`}>
            {copies}/3 {check(copies >= 3)}
          </dd>
        </div>
        <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
          <dt className="text-[0.65rem] text-comment">2 media</dt>
          <dd className={`mt-1 text-xs tabular-nums ${media >= 2 ? "text-accent" : "text-muted"}`}>
            {media}/2 {check(media >= 2)}
          </dd>
        </div>
        <div className="rounded-md border border-border bg-surface-2 px-3 py-2">
          <dt className="text-[0.65rem] text-comment">1 offsite</dt>
          <dd className={`mt-1 text-xs ${offsite ? "text-accent" : "text-muted"}`}>
            {offsite ? "yes" : "no"} {check(offsite)}
          </dd>
        </div>
      </dl>

      <p className="mt-4 font-mono text-[0.7rem] leading-relaxed text-comment">
        {rule321 && allSurvive
          ? "// 3-2-1 met. the negative survives all three disasters. this is what \"never lose a frame\" costs: three copies, two media, one of them offsite."
          : `// ${survived} of 3 disasters survived · 3-2-1 ${
              rule321 ? "met" : "not yet met"
            }. the disaster still marked lost is the frame you would lose today.`}
      </p>
    </div>
  );
}
