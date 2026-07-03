# Critique fix-pass log

Acting on `prompts/critique-findings.md` (28-agent Fable-5 critique). Rule: every
finding was a lead to verify, not a proven defect. Static factual/editorial items were
confirmed by reading the file and viewing the image; overlay / afterClip / live-filter
items were canvas-sampled in the browser before any coordinate moved. Started from
commit `bfc4b5d`. No push.

## Tier A + C (static correctness + editorial) — commits `1f78dc3`, `668b575`

Fanned out one owner-agent per chapter (26 chapters; ch20 owned directly). Each applied
only static findings: factual/terminology/math, caption+alt scene-mismatch rewrites,
duplication/verbosity cuts, clarity, em/en-dash and AI-tell removal, and widget/figure
**code-logic** fixes. Overlay geometry, afterClip, and live-filter values were deferred
to the browser pass. Gates after: typecheck + build green, 0 em dashes in `src/chapters`,
ids sequential/unique, all `/photos` paths resolve.

Notable correctness fixes verified and applied:
- **20.1 signature figure (highest-value):** the drawn contrast-S maps near-white inputs
  ABOVE the diagonal (tone(0.9)=0.992), toward the wall, yet the caption/annotation said
  "flatten the shoulder -> highlights recover." Recovery needs a shoulder BELOW the
  diagonal. Redrew the figure to show BOTH moves as opposite curves: the solid teal
  contrast-S (pushes tones at the walls) and a dashed recovery curve (rolls the shoulder
  down off white, lifts the toe off black), matching the widget's "recover the ends"
  preset and LightroomCurve 20.8. Rewrote the aria-label, comment, and Figure 20.1
  caption. Rendered and confirmed in the browser.
- 1.2 caption+alt (moving-car light trails, not a tripod shot), 2 "two thirds of a stop"
  and "entrance pupil", 3 the 3600x dial misread and 1/4000 s, 5 the inverted cosine
  recompose sentence, 8.2 the six-blade Q400 propeller, 14.6 aerial perspective vs
  perspective of disappearance, 17.2/17.3 the bronze statue + "whole develop" softening,
  23.3 the honest channel-mix recaption (measured convergence, no swap), 10.2 kilometers,
  15 von Kries 1902, plus the smaller per-chapter slips.
- Widget/figure code-logic (verified live where visual): 5 method-aware AF status,
  7 conditional flash-sync readout, 18 resilience_lab hint + third footer branch,
  24 black-point-compensation math, 19 figure bracket/NR note + "sized to the export"
  typo, colour->color unification.

Critic leads checked and left as is (not defects): preface X2D companion photo (image-add,
gated on a licensable frame); several "cut X" verbosity leads where X was not actually
redundant after the prior passes.

## Tier B (browser-verified overlays / afterClip / filters) — commits `b9fba17`, `1852daf`

Canvas-sampled every lead; moved only what the pixels disproved.

Changed:
- **25.5 terminator (portrait):** re-fit the trace to the measured lit/shadow boundary
  (x50 upper to x44 lower). The critic's x58-63 was deep shadow (lum 10-49). Catchlight
  label moved adjacent to its circle.
- **9.2 head-and-shoulders trace (flash sync):** the prior pass fixed the labels but not
  this trace. Measured head edges x36-62, chin ~y60, shoulders to the frame; the old
  trace put the chin at the mouth (y44) and stopped the shoulders at x27-69. Redrew;
  sky label off the hairline.
- **21.2 neutralize matrix:** R0.9/B1.12 left the tungsten skin at [143,90,60], still
  orange. Strengthened to R0.78/B1.42 (lit skin lands natural, shadows not over-cooled).
- **21.5 blue-boat afterClip:** extended to the measured hull (x45-69, bow tip + lower
  stern) so it darkens as one object; green water untouched.
- **22.6 face-dodge afterClip:** extended to the whole face silhouette; it was clipping
  mid-cheek and leaving the viewer-right side unlifted.
- **22.7 subject-separation afterClip:** the fingers of the raised hand measured to
  y34-36 sat inside the darkened region; carved the polygon up around the hand so
  "nothing on the man himself changes" holds.
- **13.2:** moved the "vanishing point" chip beside its (prior-verified) circle.
- **6.2:** "shadowed slope" sat on bright snow (lum192); moved onto the shadowed slope
  (lum ~130). The held-white arrow points into bright snow (lum200) and was left.
- **26.6:** "middle: the street" was on the building facade; moved onto the mid-ground
  street/vehicles behind the man.
- **27.4:** the two central keystone lines crossed mid-frame; re-fit to the measured sky
  gap (x53-55 bottom to x52-53 top) so they converge without crossing.

Canvas disproved the critic, left unchanged:
- **15.4 triad circles:** red-orange is R-dominant [100,74,74], blue B-dominant
  [108,130,154], green G-dominant [57,64,48] — all correct.
- **14.2 colonnade ticks:** all four land on bright column shafts (lum 137-207); the dark
  piers are lum 63-76. Not on the brick pier as the critic claimed.
- **23.3 triptych recaption confirmed:** red-mix panel sky 123 / barn 113 (converge to
  mid-grey); blue-mix panel sky 168 / barn 74 (pale sky, dark barn). The static
  recaption is accurate.

Widget-behavior leads were handled as code in Tier A and confirmed live: the how-a-shutter
sync readout now reads "only when longer than ~30 ms" in the whole-frame-open state (no
more contradiction); the resilience_lab footer now reports the 2-copies-survive-all-three
state without claiming a disaster is still lost.

## Tier D (image-density gaps) — commit `ec3b595`

All eight candidate chapters were already at the 5+ target from the prior density pass, so
these are additive. Added the one clearest, lowest-risk, highest-value gap; logged the
rest as shot-wishes rather than force weaker/riskier sourced images.

Added:
- **26 street/documentary:** Dorothea Lange, "Migrant Mother" (Nipomo, CA, 1936), a US
  Farm Security Administration work in the public domain, from Wikimedia Commons. Fills
  the previously image-free documentary half and ties to the "right to the picture"
  ethics. Plain `<Photo>` 26.7; also varies the all-AnnotatedPhoto mix.

Shot wishes (real gaps left for a properly sourced or author-shot frame):
- **25 portrait — perspective pair** (close 28mm vs stepped-back short tele, same crop):
  best as the author's own Q3-at-2ft vs XCD-90V pair; a licensed substitute would overlap
  reading-light. (Already on the accumulated shot-wish list.)
- **16 black-and-white-seeing — low-key photo** to complete the key triad (high-key 16.6
  and full-scale 16.4 exist; low-key only described). Needs a strong licensed low-key
  frame that converts well to mono.
- **15 color-science — global white-balance BeforeAfter** for "Warm, cool, and the choice
  of white" (its only image-free stretch, rehearses Exercise 04). Needs a warm-lit frame
  to carry a temperature `afterFilter`, honestly captioned as global.
- **27 landscape — long-exposure frame** (silky water / streaked cloud) for the DR/ND
  passage.
- **13 composition — asymmetric-balance photo** (large quiet mass near center answered by
  a small bright accent far out) to give caption 13.6's "livelier asymmetry" a referent.
- **21 color-grading — fifth image** (a green-cast/tint-axis wipe, or Vibrance-vs-Saturation
  skin protection). Chapter is at 4 photo-objects; would reach 5.
- **23 black-and-white-conversion — banding-to-dither BeforeAfter** (posterized smooth sky
  vs the same sky with grain). Only honest as a genuine processed pair.

## Gates (end of run)

- `npm run typecheck` and `npm run build`: green.
- `grep -rn U+2014 src/chapters/`: 0.
- No AI tells introduced (scanned the banned list).
- ids sequential/unique per chapter; all `/photos` paths resolve on disk.
- Every touched route re-rendered with zero console errors (checked ch20 figure and the
  changed widgets/overlays live).
- Not pushed. Review with `npm run dev`.
