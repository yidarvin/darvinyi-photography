# Run Queue

Run order, top to bottom. The **next** item is the first `PENDING` row. Statuses:
`PENDING`, `DONE`, `SKIPPED`. Update the status cell after each run. Reorder by
moving rows. Adding a chapter means adding a `PENDING` row here and a matching
entry in `content/registry.json`. See `CLAUDE.md` for the trigger phrases and the
`refsite-runner` skill for the per-item procedure.

Per-chapter photo-example directives live in `prompts/photo-notes.md`. Read the
matching entry before building a chapter and source the real, licensed photos it
calls for.

| #  | slug                              | item                                | status  |
|----|-----------------------------------|-------------------------------------|---------|
| 00 | preface                           | Preface                             | DONE    |
| 01 | the-exposure-triangle             | The exposure triangle               | DONE    |
| 02 | aperture-and-depth-of-field       | Aperture and depth of field         | DONE    |
| 03 | shutter-speed-and-motion          | Shutter speed and motion            | DONE    |
| 04 | iso-sensor-and-dynamic-range      | ISO, the sensor, and dynamic range  | DONE    |
| 05 | focus-and-autofocus               | Focus and autofocus                 | PENDING |
| 06 | metering-and-exposure-decisions   | Metering and the exposure decision  | PENDING |
| 07 | how-a-shutter-uncovers-the-frame  | How a shutter uncovers the frame    | PENDING |
| 08 | rolling-shutter-and-readout       | Rolling shutter and readout speed   | PENDING |
| 09 | flash-sync-and-the-leaf-advantage | Flash sync and the leaf advantage   | PENDING |
| 10 | lenses-optics-and-perspective     | Lenses, optics, and perspective     | PENDING |
| 11 | choosing-a-lens                   | Choosing a lens                     | PENDING |
| 12 | reading-light                     | Reading light                       | PENDING |
| 13 | composition-fundamentals          | Where the eye lands                 | PENDING |
| 14 | advanced-composition              | Working the frame                   | PENDING |
| 15 | color-science-for-photographers   | Seeing in color                     | PENDING |
| 16 | black-and-white-seeing            | Removing color to see               | PENDING |
| 17 | the-digital-negative              | The digital negative                | PENDING |
| 18 | ingest-and-catalog                | Ingest and catalog                  | PENDING |
| 19 | order-of-operations               | Order of operations                 | PENDING |
| 20 | tone-and-the-curve                | Tone and the curve                  | PENDING |
| 21 | color-grading                     | Color grading                       | PENDING |
| 22 | local-adjustments-and-masking     | Local adjustments and masking       | PENDING |
| 23 | black-and-white-conversion        | Black-and-white conversion          | PENDING |
| 24 | output-and-print                  | Output and print                    | PENDING |
| 25 | portrait-in-practice              | Portrait, end to end                | PENDING |
| 26 | street-and-documentary            | Street and documentary              | PENDING |
| 27 | landscape-and-architecture        | Landscape and architecture          | PENDING |

<!--
Four parts: I How a camera works (1-11), II Shooting aesthetically (12-16),
III Editing (17-24), IV In practice (25-27). Full per-chapter build notes
(thesis, figure, widget, gear hooks) are in the approved plan; photo directives
are in prompts/photo-notes.md. Both cameras are leaf-shutter bodies: teach
focal-plane / X-sync / HSS on a generic DSLR-mirrorless, never on the Q3 or X2D.
-->
