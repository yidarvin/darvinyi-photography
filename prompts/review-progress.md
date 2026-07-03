# Review progress: deep second editorial + visual pass

Second pass over "The Deliberate Photograph" (preface + 27 chapters). Started from
commit `7e75cff`. One row per chapter. Update after every chapter so a compaction or
restart loses nothing. Resume from the first row not marked DONE.

## Legend

- **status**: TODO / IN-PROGRESS / DONE
- **words**: body word count before -> after (target: cut 5-15% where flab exists;
  already-tight chapters keep their length, noted in the row)
- **photos**: Photo + AnnotatedPhoto + BeforeAfter count before -> after
- **overlays**: count of AnnotatedPhoto overlays pixel-verified in the browser
- Targets: >=3 photo-objects in visually-led chapters (light, composition, color,
  B&W, genres 25-27); >=1 in every chapter.

## Pre-pass gate fixes (done)

- Cleared 5 em dashes from `_widgets`/`_figures` TSX (gate #2 greps `src/chapters/`
  recursively): HowAShutterUncoversTheFrameFigure, FocusAndAutofocusWidget (x2, now
  `·` placeholders), ColorGradingWidget. En-dashes in numeric ranges left as correct
  typography (gate #2 only catches U+2014).

## Part I --- How a camera works (ch 1-11)

| # | chapter | status | words | photos | overlays | notes |
|---|---------|--------|-------|--------|----------|-------|
| 0 | preface | DONE | 824->821 | 1 | 1/1 | Q3 pointer-1 was in flat black above the SUMMILUX engraving; moved endpoint to (44.5,67.5) on the text, canvas-verified sd 51-66. Prose already tight, one repeat removed. X2D photo -> shot wish (only licensable X2D is a brown Earth-Explorer LE; would mislead). |
| 1 | the-exposure-triangle | DONE | 1781->1779 | 1 | 1/1 | Genuinely tight; one filler trim. Overlay 1.2 VP at (48,63) vs measured convergence x~50 at y62 = within 3%, radiating guides track the streaks. Verified. |
| 2 | aperture-and-depth-of-field | DONE | 2247->2249 | 2 | 1/1 | Overlay 2.1 verified: sharpness peaks at plane line x=36 (22-24), dissolve arrow at (74,33) in bokeh (3). Fixed alt ("young woman"->"young girl w/ pink bow", it's a child). Prose tight. Shallow(2.1)+deep(2.3) pairing satisfies photo-notes. |
| 3 | shutter-speed-and-motion | DONE | 2774->2772 | 3 | 1/1 | Overlay 3.4 verified: silhouette centroid (72,62) inside box; streak arrows in streaked bands; pan dir correct. Fixed a genuinely muddled sentence ("closer to the road than the table is far"). Photos at target. |
| 4 | iso-sensor-and-dynamic-range | DONE | 2945 | 2 | 2/2 | Overlays 4.1 (wall lum113 flat / shell lum32 dark) + 4.3 (pink-cloud highlight lum156 with 0% clipped = "no clip" verified / houses shadow lum49 out of black) all canvas-confirmed. Dense technical prose, already tight; no forced cuts. Both photo-notes frames present. |
| 5 | focus-and-autofocus | DONE | 2798 | 1->2 | 2/2 | Overlay 5.1 verified (eye circles/plane line on eyes within ~1-2%; hair confounded the dark-min search, confirmed visually). ADDED lemur photo 5.3 (Ashishkattoor/Commons CC BY-SA 4.0, attribution re-verified via API): subject-box + eye-AF crosshair; crosshair (51,47) canvas-verified on amber eye (50.5,47.8). Prose tight. |
| 6 | metering-and-exposure-decisions | DONE | 3182 | 1 | 1/1 | Overlay 6.2 verified: sunlit-snow box lum169 0%clip (held white), peak label lum203 not clipped, shadowed-slope lum148 (bluer/dimmer, distinct). Kept at 1 photo: snow(6.2) covers high-key, figure 6.1 covers the black-cat direction = balanced. Note: sourcing agent's "Tatra" candidate was the SAME file already in use. Prose thorough+tight. |
| 7 | how-a-shutter-uncovers-the-frame | DONE | 2671 | 0->2 | 2/2 | ZERO->TWO. Added 7.2 focal-plane module (Dinkun Chen/Commons CC BY-SA 4.0, API-verified): gate box lum67 dark curtain vs mech-left 135, travel arrow. Added 7.3 leaf shutter (Runner1616/Commons CC BY-SA 4.0, API-verified): circle on star aperture, escapement arrow on gear train (lum48). Both overlays canvas-verified. Prose tight. |
| 8 | rolling-shutter-and-readout | DONE | 3097 | 1 | 1/1 | FIXED broken overlay 8.2: old down-curve lay in empty sky (lum 205/168/151, no blade). Rebuilt: traced ONE real bowed blade (onPath 32-47 vs sky-ref 60-123), hub on spinner (34), readout arrow. Fixed credit ("+Wikimedia Commons") and meta (middot->" - "). Skipped staged train-skew: its two poles lean OPPOSITE ways = ambiguous perspective, not a clean shear. Prose tight. |
| 9 | flash-sync-and-the-leaf-advantage | DONE | 3071 | 1 | 1/1 | Verified 9.2 Flickr license is genuinely CC BY 2.0 (licenses/by/2.0, title="CC BY 2.0"). FIXED overlay: grid showed left "shade" label + left horizon line sat on a bright SKY sliver (lum123-180), not shade; removed both horizon lines, moved "shade falls dark" onto real dark trees (lum1-7). Subject lum130-176, sky held lum147 (not blown). Sourcing found nothing new (hard to license, as predicted). Prose tight. |
| 10 | lenses-optics-and-perspective | DONE | 2529 | 2 | 1/1 | Overlay 10.1 distance-ladder: nose rung y90 (nose) + blinds rung y18 (bg) correct; FIXED eye rung from y42 (on white muzzle, lum202) to y33 (eye level). 10.2 Palouse=plain Photo (compression is global, caption teaches). Pair satisfies photo-notes. Prose tight. |
| 11 | choosing-a-lens | DONE | 2488 | 1 | 1/1 | Overlay 11.1 (nested crop boxes on the 24mm panel) verified GEOMETRICALLY EXACT: box widths = 24/f x panel (15/12/8.4/5.8), panel content x1-18.5/y5-90 matches overlay bounds (black gaps confirmed at x0,19-20). License verified PD (Patche99z). Focal-length comparison = photo-notes idea, no new photo. Prose tight. |

## Part II --- Shooting aesthetically (ch 12-16)

| # | chapter | status | words | photos | overlays | notes |
|---|---------|--------|-------|--------|----------|-------|
| 12 | reading-light | TODO | 3952 | 6 | 0/4 | exemplar; visually-led, target met |
| 13 | composition-fundamentals | TODO | 3358 | 5 | 0/5 | visually-led, target met |
| 14 | advanced-composition | TODO | 3455 | 4 | 0/4 | visually-led, target met |
| 15 | color-science-for-photographers | TODO | 4064 | 5 | 0/4 | visually-led; fix 2 "not just" constructions |
| 16 | black-and-white-seeing | TODO | 3483 | 4 | 0/1 | visually-led, target met |

## Part III --- Editing (ch 17-24)

| # | chapter | status | words | photos | overlays | notes |
|---|---------|--------|-------|--------|----------|-------|
| 17 | the-digital-negative | TODO | 2811 | 1 | 0/0 | editing: add BeforeAfter + panel |
| 18 | ingest-and-catalog | TODO | 2823 | 0 | 0/0 | ZERO photos; idea: contact-sheet culling grid |
| 19 | order-of-operations | TODO | 2884 | 0 | 0/0 | ZERO photos; idea: same frame at edit stages |
| 20 | tone-and-the-curve | TODO | 3371 | 1 | 0/0 | editing: use LightroomCurve (curve IS lesson) |
| 21 | color-grading | TODO | 3958 | 2 | 0/0 | editing |
| 22 | local-adjustments-and-masking | TODO | 3785 | 3 | 0/2 | HONESTY BUG: 22.3 global filter vs masked claim |
| 23 | black-and-white-conversion | TODO | 4189 | 2 | 0/1 | editing: use LightroomCurve |
| 24 | output-and-print | TODO | 4120 | 0 | 0/0 | ZERO photos; idea: screen-vs-print soft-proof |

## Part IV --- In practice (ch 25-27)

| # | chapter | status | words | photos | overlays | notes |
|---|---------|--------|-------|--------|----------|-------|
| 25 | portrait-in-practice | TODO | 4550 | 2 | 0/1 | visually-led; needs +1 to hit 3 |
| 26 | street-and-documentary | TODO | 4460 | 3 | 0/3 | visually-led, target met |
| 27 | landscape-and-architecture | TODO | 3388 | 4 | 0/3 | visually-led, target met |

## Shot wishes (frames the author could shoot on the Q3 / X2D II)

Accumulated as chapters are worked. Filled when no licensable photo genuinely teaches
the point.

- **Preface** --- a clean three-quarter product frame of the author's own Hasselblad
  X2D II 100C (standard slate finish) with an XCD lens, to sit beside the Q3 and
  complete the "two cameras" opening. No standard-finish X2D II is licensable on
  Commons / Unsplash / Pexels; the only CC0 body shots are the tundra-brown
  Earth-Explorer limited edition, which would mislead in a reference manual.
- **Aperture and depth of field (ch2)** --- the author's own matched Q3 (f/1.7) vs
  X2D II (f/2.2) frames at the same portrait framing, to show the format equivalence
  as a real photo pair rather than only the SVG diagram (Fig 2.2). Not licensable;
  the exact matched pair only exists if the author shoots it.
- **Focus and autofocus (ch5)** --- a focus-and-recompose MISS pair: the same portrait
  focused-then-swung vs focus-point-moved-to-the-eye, at 100% on the eye, to show
  cosine error as a real photo. Not licensable as a controlled demo; a Q3 wide-open
  pair would nail it. (The "Focus and recompose" section currently has no photo.)

## Photos staged in scratchpad (sourced, awaiting wire-in)

- **how-a-shutter-uncovers-the-frame (ch7)**: focal-plane blade curtain (Canon R5
  module, Dinkun Chen / Wikimedia Commons (CC BY-SA 4.0)) + leaf shutter with iris
  blades (Runner1616 / Wikimedia Commons (CC BY-SA 4.0)); backups: classic
  focal-plane (Hustvedt, CC BY-SA 3.0), Nikon D90 module (Raimond Spekking, CC BY-SA
  4.0). Staged in scratchpad/photo-staging/how-a-shutter/.

## Component extensions made this pass

- (none yet)
