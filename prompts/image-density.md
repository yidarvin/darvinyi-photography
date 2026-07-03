# Image density pass

Third pass over "The Deliberate Photograph". Goal: bring the 12 photography /
aesthetics / editing / practice chapters to 5+ teaching image objects (Photo +
AnnotatedPhoto + BeforeAfter), each teaching a distinct point; keep the 15
mechanism / workflow chapters diagram-first (1 to 3, no padding). Started from
commit `7be3e85`. Commit per Part, no push (CLAUDE.md no-push rule honored).

## Legend / rules

- **type**: mechanism / workflow (diagram-first, 1 to 3) vs photo / editing /
  practice (5+, learned by looking).
- Comparisons use `<BeforeAfter>` (live `svgFilter` / `afterFilter`, never
  pixel-baked; `afterClip` for any local/masked claim). Everything else uses
  `<AnnotatedPhoto>` with the lesson drawn on the frame, every overlay
  canvas-verified in the browser (not eyeballed).
- Every image Read-viewed and license-verified before wiring. Credit + href
  verbatim. No em dashes / AI tells. ids sequential and unique per chapter.

## Counts (registry order): now -> after

| # | chapter | type | now | target | after | status | notes |
|---|---------|------|-----|--------|-------|--------|-------|
| 0 | preface | frontmatter | 1 | n/a | 1 | keep | |
| 1-11 | Part I mechanism (11 ch) | mechanism | 1-3 | 1-3 | = | keep | diagram-first, no padding |
| 12 | reading-light | photo | 6 | 5+ | 6 | met (prior) | untouched |
| 13 | composition-fundamentals | photo | 5 | 5+ | 5 | met (prior) | untouched |
| 14 | advanced-composition | photo | 4 | 5+ | 5 | DONE | +1 rhythm colonnade (14.2) |
| 15 | color-science-for-photographers | photo | 5 | 5+ | 5 | met (prior) | untouched |
| 16 | black-and-white-seeing | photo | 4 | 5+ | 5 | DONE | +1 red-filter BeforeAfter (16.5) |
| 17 | the-digital-negative | workflow | 1 | 1-3 | 1 | keep | |
| 18 | ingest-and-catalog | workflow | 1 | 1-3 | 1 | keep | |
| 19 | order-of-operations | workflow | 1 | 1-3 | 1 | keep | |
| 20 | tone-and-the-curve | editing | 1 | 5+ | 5 | DONE | +4: contrast/exposure/endpoint BAs + clipping annotation |
| 21 | color-grading | editing | 2 | 5+ | 5 | DONE | +3: profile BA, masked mixer BA, live teal-orange BA |
| 22 | local-adjustments-and-masking | editing | 3 | 5+ | 5 | DONE | +2: masked face dodge + subject separation (both afterClip) |
| 23 | black-and-white-conversion | editing | 2 | 5+ | 5 | DONE | +3: desaturate-collapse, grain, split-tone BAs |
| 24 | output-and-print | workflow | 1 | 1-3 | 1 | keep | |
| 25 | portrait-in-practice | practice | 2 | 5+ | 5 | DONE | +3: near-eye + light-pattern annotated, skin-tone BA |
| 26 | street-and-documentary | practice | 3 | 5+ | 5 | DONE | +2: staircase geometry + Baghdad layered depth |
| 27 | landscape-and-architecture | practice | 4 | 5+ | 5 | DONE | +1: Grand Canyon shadows-lifted BA |

## Concrete plan (insertion points + ids)

Locked before editing so a compaction loses nothing. Renumber later ids on insert.

**14 advanced-composition (4 -> 5).** +1 rhythm/repetition (similarity) AnnotatedPhoto
in "The mind insists on order" as a second grouping example (keeps the four-device
Callout intact). New 14.2; renumber spiral 14.2->14.3, fig 14.3->14.4, wave
14.4->14.5, ridges 14.5->14.6. Overlay: mark the repeating beat / grouped units.

**16 black-and-white-seeing (4 -> 5).** +1 AnnotatedPhoto in "See the grey before the
shutter" drawing Zone placements (a dark-with-detail, a middle grey, a textured white)
on a full-range mono frame. New 16.5; renumber Prague 16.5->16.6. (Alt: a low-key
companion to 16.5; decide by sourced frame.)

**20 tone-and-the-curve (1 -> 5).** +4 BeforeAfter/annotated, each a distinct curve
move: 20.2 contrast S-curve BA ("Contrast is a budget"); 20.3 exposure-lift BA and
20.4 blacks/whites endpoint BA ("Exposure sets the middle..."); 20.5 clipping/zone
AnnotatedPhoto on a high-contrast frame ("Recovering the ends"). Existing window BA
20.2->20.5? no: renumber window BA 20.2->20.6, panel 20.3->20.7, curve 20.4->20.8.
All live svgFilter, honest global tone (no false local claim). Uses 2-3 flat frames +
1 high-contrast frame.

**21 color-grading (2 -> 5).** +3: profile BA in "The profile is where color starts"
(one raw, two profile renderings); an HSL-target BA in "the choices" (a global-by-hue
move, e.g. blue-sky luminance down, described as global); a third BA (grade demo or
vibrance-vs-saturation). New profile BA = 21.4; renumber teal-orange Photo 21.4->21.5,
HSL 21.5->21.6, then mixer BAs after. Leica-vs-Hasselblad matched pair -> shot-wish.

**22 local-adjustments-and-masking (3 -> 5).** +2 BeforeAfter WITH afterClip (honesty
rule): 22.6 masked radial dodge on a face (afterClip = face region); 22.7 subject
separation (afterClip = background). Both appended in "The what, and why brightening
aims the eye" after 22.5. Zero renumber.

**23 black-and-white-conversion (2 -> 5).** +3: grain AnnotatedPhoto in the imageless
"Grain" section; a split-tone BeforeAfter (neutral->cool-shadow/warm-highlight) paired
with panel 23.5; a channel-choice/desaturate BA on a fresh frame (non-redundant with
triptych 23.2 and berries 16.2). ids assigned in reading order; renumber as needed.

**25 portrait-in-practice (2 -> 5).** +3, filling imageless sections: near-eye
AnnotatedPhoto (eye-AF point + thin plane) in "The near eye..."; light-pattern
AnnotatedPhoto (Rembrandt/loop terminator + catchlight) in "Put the light..."
(the documented shot-wish gap); skin-tone BeforeAfter in "Land the skin". Renumber
old 25.4 (light-on-face) as later id.

**26 street-and-documentary (3 -> 5).** +2 AnnotatedPhoto in the imageless "Fishing,
not hunting": 26.5 "fish the stage" (a subject entering a pre-composed light/graphic
frame) and 26.6 layered depth (Webb-style fg/mid/bg planes marked). Zero renumber.

**27 landscape-and-architecture (4 -> 5).** +1 BeforeAfter in the imageless "Holding
the whole range of light": as-shot (sky protected, dark foreground) -> shadows lifted,
via live svgFilter. New 27.3; renumber keystone 27.3->27.4, fig 27.4->27.5, verticals
27.5->27.6, symmetry 27.6->27.7.

## Per-chapter log

_One row per touched chapter as it is built: images before -> after, what each new
image teaches, overlays canvas-verified, notes, shot-wishes._

### Part II (committed, no push)

- **14 advanced-composition 4 -> 5.** Added AnnotatedPhoto 14.2 (Alex Robertson /
  Unsplash, Seville colonnade, Unsplash License, attribution API-verified): rhythm /
  repetition as a grouping cue (similarity + good continuation). Overlay = 4 ticks on
  the flanking columns, canvas-verified bright column shafts at x=8/16/80/88, y=60
  (lum 204/205/187/227). Renumbered old 14.2-14.5 -> 14.3-14.6. Zero console errors.
  Considered corridor + figure-ground candidates; corridor pillars too dark/irregular
  to annotate cleanly, figure-ground overlapped ch13 negative space.
- **16 black-and-white-seeing 4 -> 5.** Added BeforeAfter 16.5 (Sydney Sang / Pexels,
  red barn + deep blue sky, Pexels License, attribution API-verified): color -> live
  red-filter mono via feColorMatrix (R 1.3, G 0.1, B -0.4). Screenshot-verified at
  pos=0: sky driven to near-black, cirrus + white trim stand off it bright, barn holds
  mid tone, green conifer dark. Honest (global conversion, no local claim). Renumbered
  Prague 16.5 -> 16.6. Zero console errors.

### Part III (committed, no push)

- **20 tone-and-the-curve 1 -> 5.** +4 live-svgFilter demos, each a distinct curve
  move: 20.2 contrast S-curve (hazy cityscape, David Kristianto/Unsplash), 20.3
  exposure-lift (overcast lake, Jordi Costa Tome/Pexels), 20.4 blacks/whites endpoint
  (same hazy frame, second handle), 20.5 clipping/tonal-zone AnnotatedPhoto (hallway
  window, Duc Nguyen/Unsplash; window box + dark-wall strip canvas-verified, lum
  ~250 vs <=35). Renumbered 20.2->20.6, 20.3->20.7, 20.4->20.8. Screenshot-verified,
  zero console errors.
- **21 color-grading 2 -> 5.** +3: 21.4 profile BA (green door / red wall, Annika
  Rose/Pexels; two renderings), 21.5 mixer luminance BA (blue boat, Sami Aksu/Pexels;
  afterClip=hull polygon so only the blue deepens, green water untouched -- verified),
  21.6 live teal-orange grade (man at dusk, Wolf Art/Pexels). Renumbered old Photo
  21.4->21.7, HSL 21.5->21.8. All screenshot-verified.
- **22 local-adjustments-and-masking 3 -> 5.** +2 masked BeforeAfter (honesty rule):
  22.6 face dodge (Daniwura TCI/Pexels; afterClip=head polygon on the natural
  silhouette, warm brighten to counter a green cast; caption owns the hard mask edge
  and notes real radial gradients feather it), 22.7 subject separation (Anderson
  Santos/Pexels; afterClip=background polygon traced around the man, darken+desaturate
  -- verified the man is untouched). Zero renumber.
- **23 black-and-white-conversion 2 -> 5.** +3: 23.1 desaturate-collapse (poppies in
  green, Vitalii Onyshchuk/Unsplash; saturate 0, poppies drift to the foliage grey),
  23.5 grain BA (moody portrait, Rachel McDermott/Unsplash; live feTurbulence film
  grain over the smooth areas -- verified visible on the dark ground/skin), 23.7
  split-tone BA (sunrise ridge, Daniil Silantev/Unsplash; grey + cool shadows/warm
  highlights, pairs with panel 23.8). Renumbered 6 tail ids -> 23.2-23.9.

### Part IV (committed, no push)

- **25 portrait-in-practice 2 -> 5.** +3: 25.4 near-eye AnnotatedPhoto (Rob Ruth/
  Pexels; eye-AF reticle canvas-verified on the near eye's catchlight ~49,36), 25.5
  light-pattern AnnotatedPhoto (Marcus Queiroga Silva/Pexels; terminator traced down
  the nose on the verified lit/shadow boundary ~x45, catchlight circle on the lit
  eye), 25.7 skin-tone BA (Sam The ShutterSmith/Pexels; small warm/de-green WB move).
  Renumbered old light-on-face 25.4 -> 25.6.
- **26 street-and-documentary 3 -> 5.** +2 AnnotatedPhoto in "Fishing, not hunting":
  26.5 staircase geometry (Nejat Gunduc/Pexels; two figures canvas-verified at the
  darkest clusters 72,30 and 78,74 and boxed; dropped diagonal guides that ran through
  bright tile), 26.6 Baghdad layered depth (AMORIE SAM/Pexels; foreground/middle/far
  labels on the man, the street, the hazed city). Zero renumber.
- **27 landscape-and-architecture 4 -> 5.** +1 BeforeAfter 27.3 (Gabriel Tovar/Pexels,
  Grand Canyon sunrise; live feComponentTransfer lifts the shaded walls while the
  sunlit buttes hold). Renumbered keystone 27.3->27.4, fig 27.4->27.5, verticals
  27.5->27.6, symmetry 27.6->27.7.

**RUN COMPLETE.** All 12 photography/aesthetics/editing/practice chapters now at 5+
image objects (reading-light 6, the other 11 at 5); all 15 mechanism/workflow chapters
untouched at 1-3. End-of-run gates pass: typecheck + build green, 0 em dashes in
src/chapters, no AI tells in prose, no missing /photos paths, no duplicate ids, no
stray staging in public, every touched route renders with zero console errors.


## Shot wishes (accumulated)

_Frames the author could shoot on the Q3 / X2D II where no licensable photo teaches
the point._

- **Color grading (ch21)** -- a matched Leica Q3 vs Hasselblad X2D II pair of the same
  neutral scene under one light, each set off a shared grey-card white balance, to show
  the two color sciences diverging at the profile stage as a real photograph rather than
  the illustrative two-profile filter used in 21.4. Not licensable; only the author's
  own matched pair exists.
- **Portrait (ch25)** -- a clean, neutral Rembrandt-triangle portrait on the author's
  own XCD 90V (a small isolated triangle of light on the shadow-side cheek, high
  catchlight), to trace the actual triangle rather than the short/split terminator the
  licensed frame 25.5 shows. Commons/Pexels Rembrandt frames were colored-gel or the
  same photographer already used in ch12.

## Staging manifest

_Sourced candidates staged under scratchpad/img-density-staging/<slug>/ awaiting
Read-verification + wire-in._
