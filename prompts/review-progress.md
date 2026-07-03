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

**CHECKPOINT: Part I (ch 0-11) committed + pushed to main @ 43aa3bf.**

## Part II --- Shooting aesthetically (ch 12-16)

_All five Part II chapters already meet the >=3 visually-led photo target, so the
work here is overlay pixel-verification + prose + the two color-science "not just"
fixes; no new photo sourcing needed._

| # | chapter | status | words | photos | overlays | notes |
|---|---------|--------|-------|--------|----------|-------|
| 12 | reading-light | DONE | 3952 | 6 | 4/4 | REBUILT overlay 12.2 (Rembrandt): old one was inconsistent (key-arrow from left but terminator path meandering to lower-LEFT, labels on wrong side). Canvas showed face lit from viewer's LEFT (L-cheek 168 vs R 47), terminator x42-47, triangle at (56,51) lum154 -> retraced all. 12.3 backlight (sun252/face-shade81/rim153-157), 12.5 hard-light (center split x49, cast shadow), 12.7 golden-hour (warm sky r252/dark ground L19) all verified accurate. Prose exemplar-tight. |
| 13 | composition-fundamentals | DONE | 3358 | 5 | 5/5 | All 5 overlays verified accurate (first-pass got these right): 13.1 lighthouse on right third (tower x~66) + horizon lower third; 13.2 road VP at convergence (67.5,37.5); 13.3 arch path traces dark opening (lum9-43) around bright sea (139); 13.4 tree=dark point (lum3) in box; 13.6 Taj axis x=50 (dome/finial/pool all centered - canvas "brightest" wrongly picked sky). Prose tight. |
| 14 | advanced-composition | DONE | 3455 | 4 | 4/4 | 14.2 spiral (center circle on skylight lum252), 14.5 ridges (fg black 0,0,0 / mid blue-grey 95,120,148 / far pale 212,226,229) verified. 14.1 starling oval acceptable (perceived-shape enclosure of the wave-shaped flock). 14.4 wave: recentered surfer circle (28,38)->(30,39) r5 onto the yellow surfer (found at 29.5,33); diagonal+labels ok. Prose tight. |
| 15 | color-science-for-photographers | DONE | 4064 | 5 | 4/4 | Fixed 2 "not just" AI-tells (warm/cool depth; WB mood decision). Overlays: 15.3 analogous gradient (gold/orange/pink/violet) + 15.5 tent (warm 255,185,0 / cool bg blue) verified. FIXED 15.2 warm circle (was on blown white sun 235,233,234 -> moved center to orange glow 33,31). FIXED 15.4 triad: all 3 circles were on dark rigging/water; repositioned to confirmed red-orange rail (52,68)=176,54,34 / blue cabin (62,60)=58,113,161 / green hull (81,84)=30,55,39. Prose dense+tight. |
| 16 | black-and-white-seeing | DONE | 3483 | 4 | 1/1 | 16.2 value-collapse BeforeAfter (2 real images) verified HONEST: mono berries (24-81) merge into similarly-toned leaves (14-105). 16.3 dunes = global saturate:0, caption says whole frame greys = honest (no false local claim). REBUILT 16.4 Adams overlay: old river path overshot into peaks (y50) + snow circle was on cloudy SKY (55,24). Retraced river to bright water (150/146/126); snow circle -> left-peak snowfield (18,43) L118; river=brightest tone (219-238) confirmed. Prose tight. |

**CHECKPOINT: Part II (ch 12-16) committed + pushed to main @ d2b761b.**

## Part III --- Editing (ch 17-24)

_Priorities: honesty bug 22.3 (global filter vs masked claim; fix via a region clip
on BeforeAfter's after side), use LightroomCurve in ch20 + ch23 (exists but unused),
add BeforeAfter+panel to core edits, source/build photos for the 3 ZERO chapters
(18 contact-sheet, 19 edit-stages, 24 screen-vs-print). Many ZERO-chapter "photos"
are really BeforeAfter/figures built from one real frame via svgFilter, not single
licensable images._

| # | chapter | status | words | photos | overlays | notes |
|---|---------|--------|-------|--------|----------|-------|
| 17 | the-digital-negative | DONE | 2811 | 1 | n/a | Already has raw->developed before/after (17.2 composite) + Basic panel (17.3, values match the visible lift-shadows/hold-highlights edit). Tried splitting the composite into a wipe slider but the developed half has DIFFERENT framing (verticals corrected, no streetlamp, statue larger) so a wipe would misalign; static side-by-side is correct here. Prose tight. |
| 18 | ingest-and-catalog | IN-PROGRESS | 2823 | 0 | 0/0 | ZERO. Contact-sheet cull grid = not a single licensable photo; plan: construct a montage of small licensed frames (PIL grid) OR shot-wish (author's own Lightroom cull grid). Has Figure + widget. |
| 19 | order-of-operations | DONE | 2884 | 0->1 | n/a | ZERO->1. ADDED BeforeAfter 19.4 "as the raw opens -> developed in order" (Wolfgang Hasselmann / Unsplash foggy valley - a genuinely flat capture). svgFilter = global develop (saturate 1.6 + contrast-S feComponentTransfer w/ slight warmth); honest (whole-frame develop, no false local claim). Screenshot-verified: flat/cool -> warm/punchy/green. Pairs with panels 19.2/19.3. |
| 20 | tone-and-the-curve | DONE | 3371 | 1 | n/a | ADDED LightroomCurve 20.4 (finally uses the component) drawing the exact recovery curve behind the 20.2 BeforeAfter svgFilter: lifted toe (0->12), mids above diagonal (128->165), rolled shoulder (255->240) - matches the tableValues. 20.2 is a global tone-curve recovery, caption makes no false local claim = honest. 20.3 panel values match. Renders, no errors. Prose tight. |
| 21 | color-grading | DONE | 3958 | 2 | n/a | Well-equipped already: 21.2 BeforeAfter (warm-cast->neutralized) is a GLOBAL white-balance correction (svgFilter cools R*0.9/B*1.12, matches panel 21.3 Temp 2700->neutral) - honest, WB is global, no false local claim. 21.4 teal-orange grade Photo + HSL 21.5. No AnnotatedPhoto overlays to verify. Prose tight. No changes needed. |
| 22 | local-adjustments-and-masking | DONE | 3785 | 3 | 2/2 | HONESTY BUG FIXED: extended BeforeAfter with `afterClip` (CSS clip-path region), applied a sky-region polygon to 22.3 so the burn genuinely stops at the ridgeline. Screenshot-verified: sky darkens on the after side, lit golden hillside HOLDS (caption now true). Updated 22.2 red sky-mask path to the canvas-verified ridgeline (same polygon). FIXED 22.5 dodge region: was on dark HAIR (lum 3-4); moved onto the lit skin strip (centroid 37,45, interior 186-229). Prose tight. |
| 23 | black-and-white-conversion | DONE | 4189->4280 | 2 | 1/1 | ADDED LightroomCurve 23.6 (print-contrast S-curve, cross-refs ch20) - fills the under-covered contrast gap + uses the component per spec (+~90 words). FIXED 23.2 triptych "same grey" circles: were on the bright metal DOME (207/229/240); moved to the grey silo BODY where the two mixes give an IDENTICAL grey (74/74) = clean "neutral holds" proof, matching the "middle grey" caption. Renders, no errors. |
| 24 | output-and-print | DONE | 4120 | 0->1 | n/a | ZERO->1. ADDED BeforeAfter 24.2 "on screen -> soft-proof: matte paper" (Basile Morin / Commons CC BY-SA 4.0, Kabukicho neon - gamut-exceeding). svgFilter = global soft-proof sim (saturate 0.68 + range compressed: blacks lift to paper-black, whites drop to paper-white, warm paper tint); honest (soft-proof is global). Screenshot-verified: vivid neon -> muted/flatter/warm. Renumbered old panel 24.2->24.3. |

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

- **BeforeAfter `afterClip` prop** (src/components/BeforeAfter.tsx): optional CSS
  clip-path (e.g. `polygon(...)`) that region-limits the after side, so a filtered/
  graded edit reads as genuinely local (masked). Composes with the wipe (after shows
  only inside region ∩ revealed) by wrapping the after `<img>` in a clip-path div.
  Used to fix the ch22 honesty bug (22.3 sky burn).
