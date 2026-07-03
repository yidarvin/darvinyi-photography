# Fix pass: act on the chapter critique

> To run this in a fresh Claude Code session, just say: **"Read
> `prompts/critique-fix-prompt.md` and carry out the fix pass it describes."** No need
> to paste anything; this file and the findings file below are in the repo.

You are working in the repo for **"The Deliberate Photograph"**, a Vite + React +
TypeScript + MDX photography reference site (preface + 27 chapters, one file each at
`src/chapters/<slug>.mdx`), written around a Leica Q3 (fixed 28mm) and a Hasselblad
X2D II 100C. A 28-agent critique just ran over every chapter. Your job is to fix the
real problems it found, verifying each one before you change anything.

## Read first

1. **`prompts/critique-findings.md`** — the full per-chapter critique (verdict, top
   fixes, correctness issues, image-density notes, clarity, verbosity). This is your
   worklist. Every item is a **lead to verify, not a proven defect.**
2. `~/.claude/skills/refsite-runner/references/authoring-spec.md` and `house-style.md`
   — the voice and quality contract.
3. `prompts/image-density.md` and `prompts/review-progress.md` — what two prior passes
   already did. **Do not regress that work.**
4. The three teaching components before using them: `src/components/AnnotatedPhoto.tsx`,
   `src/components/BeforeAfter.tsx`, `src/components/LightroomPanel.tsx`.

## The one rule that matters most: verify, then fix

Several findings are about overlay coordinates or live filter/widget behavior, and the
critics **eyeballed the raw image files** (imprecise) rather than the rendered overlay.
Some of their coordinates contradict earlier canvas-verified placements. So:

- For any finding tagged `verifyHow=browser` (overlay position, `afterClip` region,
  live `svgFilter`/widget behavior), **reproduce it in the preview browser first.**
  Draw the image to a canvas via `preview_eval` and sample luminance/RGB at the
  overlay coordinates to confirm the feature (eye, terminator, column, ridgeline,
  sun, subject) is actually there. Only move a coordinate if the canvas disagrees
  with where it currently sits. Do not trust the critic's numbers or your own eye.
- For `afterClip` honesty findings, force the after `<img>` eager, set the wipe, and
  screenshot to see exactly what darkens/changes; adjust the polygon until the caption
  is literally true.
- Findings tagged `verifyHow=static` (a wrong number, a wrong term, a caption that
  describes a different scene than the photo, a duplicated sentence, an em dash) you
  can confirm by reading the file and viewing the image with the Read tool. Fix those
  directly.

Dev server: `.claude/launch.json` name `dev` (Vite, port 5188, strictPort). Use
`preview_start`, `preview_eval`, `preview_console_logs`, `preview_screenshot`. Chapter
routes are `/<slug>`. Every route you touch must render with **zero console errors.**

## Non-negotiable house rules (unchanged from the book's contract)

- **No em dashes** anywhere: prose, captions, labels, alt text. Checked with
  `grep -rn '—' src/chapters/`.
- **No AI tells**: "it's important to note", "delve", "tapestry", "at its core",
  "unlock", "elevate", "whether you're X or Y", the "it's not just A, it's B"
  construction, "in today's...", "game-changer", and kin.
- **Captions teach** (say what to look at and why). **Alt describes** the image and
  must differ from the caption. Keep them distinct.
- **ids sequential and unique** within a chapter; renumber later ids when you insert.
- Exactly **one `<Figure>` and one `<Widget>`** per chapter; photos are additional.
- **Honesty rule**: a `<BeforeAfter>` caption may claim a local/masked/"only the X"/
  "stops at the ridgeline" edit **only** if the after side is region-limited with
  `afterClip`. A global filter under a local caption is a bug: either add `afterClip`
  or reword the caption.
- **Edits stay live**: before/after tone/color/mask demos are live `svgFilter` /
  `afterFilter` / `afterClip` or a genuine second frame, never a pixel-baked copy.
- **New photos** must be properly licensed (author's own Q3/X2D frames first, else
  CC0 / public domain / CC BY / CC BY-SA from Wikimedia Commons, or Unsplash /
  Pexels). View every candidate with Read before wiring it, verify the attribution on
  the source page, and put the verbatim `credit` + `href` on the component. Save to
  `public/photos/<slug>/<name>.jpg`, ~1600px long edge (`sips -Z 1600 IN --out OUT`;
  no ImageMagick). If nothing genuinely teaches the point, log a shot-wish instead of
  forcing a weak image. Mechanism/workflow chapters stay diagram-first (1 to 3): do
  NOT add images to them to hit a number.

## Work in three tiers (highest value first)

### Tier A — correctness bugs that are clearly real (fix directly, confirm by reading/viewing)

These are factual, mathematical, terminology, or scene-mismatch errors that do not
need the browser. Confirm each against the file/image, then fix.

- **20.1 (tone-and-the-curve) signature figure teaches recovery backwards.** The
  drawn contrast-S maps near-white inputs ABOVE the diagonal (toward the wall) while
  the caption and on-figure annotation say "flatten the shoulder -> highlights
  recover." Recovery needs a shoulder pulled BELOW the diagonal. Either add/redraw a
  recovery curve in `ToneAndTheCurveFigure.tsx` or rewrite the caption + annotation so
  the figure and its words agree (cross-check against the correct `LightroomCurve` 20.8
  and the widget's "recover the ends" preset). This is the chapter's signature figure;
  it is the single most important fix in the book.
- **1.2 (the-exposure-triangle)** caption and alt describe a static-camera light-trail
  shot, but the photo is taken from a moving car (dashboard visible, streetlamps
  smeared by the camera's own motion, nothing sharp). Rewrite caption+alt around
  camera motion, or swap in a real tripod light-trail frame. Also: "turned the line
  into the third side" -> "into a triangle".
- **8.2 (rolling-shutter)** prose calls it "a rigid three-blade propeller"; the
  aircraft is a six-blade Q400 and the photo shows ~9-10 arcs. Fix the blade count and
  re-derive or drop the "more than one rotation" claim.
- **14.6 (advanced-composition)** Leonardo's "perspective of disappearance" is
  misapplied to the blue/pale color shift; that is his "aerial perspective". The
  chapter's own Sources entry says so. Fix the prose and caption.
- **17.3 (the-digital-negative)** "The panel below is the whole develop" is false: the
  right half is re-cropped with verticals corrected (a Transform move, not Basic), and
  the slider values are invented for a third-party Wikimedia edit. Reword to stop
  claiming the panel is the exact/whole develop.
- **18 resilience_lab widget** hint says "Only three copies... survives all three",
  but the widget's own logic lets 2 copies (working drive + cloud) survive all three
  disasters. Reconcile the hint with the code (`IngestAndCatalogWidget` /
  `_widgets/...`).
- **2 (aperture-and-depth-of-field)** "a fifth of a stop" (appears twice) is wrong for
  a 0.79x crop; it is about two thirds of a stop. Also "entry pupil" -> "entrance
  pupil".
- **3 (shutter-speed-and-motion)** dial arithmetic: 60" vs 60 differ by 3600x, not
  900x; and "four thousandths of a second" -> "a four-thousandth of a second".
- **5 (focus-and-autofocus)** the cosine sentence is inverted: the recompose miss grows
  with (1 - cos theta), not "with the cosine of the angle".
- Plus the smaller static factual/terminology slips flagged per chapter in the findings
  file (e.g. 4 read-noise wording, 10.2 "meters" -> "kilometers", 15 von Kries date,
  24 sharpening-halo pixel count, 27 "all three subjects meet"). Work the file.

### Tier B — overlay / afterClip / widget-behavior fixes (BROWSER-VERIFY before changing)

Treat the critic's coordinates as hints only. Canvas-sample first; several of these
overlays were canvas-verified in earlier passes and the critic may be wrong.

- **25.5 (portrait)** terminator trace: critic says the real lit/shadow boundary is at
  x~58-63, but the density pass canvas-measured the lit side at x34-46 / shadow x50+
  (terminator ~x46). **Re-sample the luminance transition across the face at several
  heights and place the line on the measured boundary.** Move the catchlight chip only
  if it is off the lit eye.
- **22.7 (masking)** the subject-separation `afterClip` polygon may darken the man's
  raised hand while the caption says "nothing on the man himself changes". Screenshot
  the after side; if the hand is inside the darkened region, raise the notch to exclude
  the fingers (~x43-58%, y~31%), then re-verify.
- **22.6 (masking)** the face-dodge `afterClip` may not cover the whole face the caption
  claims; extend it rightward if the screenshot shows an unlit strip, verifying the edge.
- **21.2 (color-grading)** the "neutralized" WB matrix (R 0.9 / B 1.12) is too weak to
  fully neutralize a 2500-3000K tungsten cast (the chapter's own citation says ~1.5
  stops of blue). Strengthen the matrix by eye (roughly R~0.75 / B~1.5) until the after
  side reads neutral, or soften the label/caption to match the actual correction.
- **21.5 (color-grading)** extend the blue-boat `afterClip` polygon to cover the whole
  hull (bow tip, lower edge, stern behind the posts) so the boat darkens as one object.
- **9.2 (flash-sync)** the dashed head-and-shoulders trace is grossly misplaced
  (traced chin lands on the eyes). Redraw against the live overlay.
- **6.2, 11.1, 13.2, 14.2, 15.4, 26.6, 27.4** overlay-placement leads: canvas-verify
  each; move only what the canvas disproves. (11.1 and 14.2 were verified in prior
  passes, so scrutinize the critic's claim before touching them.)
- Widget-behavior leads: **7** (rolling-electronic sync label), **5** (AF status
  method-aware), **12** (ReadingLight drag-the-sun claim vs behavior), **13**
  (thirds-crossing highlight wording), **24** (BPC tone math in
  `OutputAndPrintWidget.tsx`), **19** (figure "shape the frame" -> "shape the look").
  Read the widget source, confirm the mismatch, fix the code or the hint so they agree.
- **23.3 (b&w-conversion)** the channel-mix triptych's middle panel does not show the
  sky->black / barn->bright swap its caption claims (measured pixels converge to
  mid-grey; the source sky is pale blue and the barn dark red, so no true red filter
  can make them swap). Either re-render the triptych from a scene with a genuinely deep
  blue sky and a brighter red subject, or rewrite the caption+alt to describe what the
  panels actually show (convergence, not a dramatic swap).

### Tier C — clarity + verbosity (editorial pass, keep the voice)

The findings file lists ~73 clarity and ~76 verbosity items. Apply the ones that
genuinely help; the book prizes tight prose and tight captions. Common patterns to cut:
- captions that restate the adjacent body paragraph (trim the last sentence);
- in-prose source callouts ("Cambridge in Colour makes the point...", "the references
  are blunt about it...") where Sources already carries attribution;
- widget lead-in paragraphs that repeat the widget hint verbatim;
- a claim stated three times (diagram label + caption + next paragraph).
Do not cut for its own sake; cut where it reads the same twice.

### Tier D — image-density gaps in visually-led chapters (source + add, only where real)

A few visually-led chapters have a genuinely image-free section teaching a point no
current image shows. Add one licensed image (or an honest live BeforeAfter) each, per
the sourcing rules above. These are the strongest candidates:
- **15 color-science** — a global white-balance BeforeAfter (temperature `afterFilter`,
  honestly captioned as global) for "Warm, cool, and the choice of white".
- **16 black-and-white-seeing** — a low-key photograph to complete the key triad
  (high-key 16.6 and full-scale 16.4 exist; low-key is only described).
- **25 portrait** — a perspective pair (close 28mm vs stepped-back short tele, same
  crop) for "Distance first, then the lens" (its only image-free chain link).
- **26 street** — one public-domain documentary photograph (e.g. Lange/FSA via
  Wikimedia Commons) for the street-vs-documentary section.
- **27 landscape** — a long-exposure frame (silky water / streaked cloud) for the
  dynamic-range / ND passage.
- **13, 21, 23** — asymmetric-balance photo (13), a fifth distinct image (21, e.g. a
  green-cast/tint or Vibrance-vs-Saturation wipe), a banding-to-dither BeforeAfter (23).
Confirm each is a real gap before sourcing; skip any where the section is fine as is.

## Process

- Work through Tier A first (fast, high-confidence, no browser), then Tier B (browser-
  verify each), then C, then D. Or go chapter by chapter using the findings file as the
  checklist; either way, verify Tier B items in the browser before editing.
- After each logical batch: `npm run typecheck && npm run build` must pass; re-render
  every touched route with zero console errors; `grep -rn '—' src/chapters/` returns
  nothing; no AI tells; ids sequential and unique; no duplicate `/photos` paths missing
  on disk.
- Commit in sensible batches (e.g. by tier or by Part). **Do not push, and do not mark
  anything done that fails typecheck or build.** Leave the run with a summary and let
  the user review with `npm run dev`.
- Keep a running log of what you verified, what you changed, and what you checked and
  found already correct (some critic leads will not survive verification, which is
  expected and worth recording).
