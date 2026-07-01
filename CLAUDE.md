# CLAUDE.md

This repo is a **queue-built reference site**: a Vite + React + TypeScript + MDX
site deployed on Vercel, where each chapter is researched and built one at a time
from a queue. This file is deliberately thin. The procedure lives in a skill so it
stays consistent across every site of this kind.

## Use the refsite-runner skill

The build loop, the queue verbs, the house style, and the definition of done all
live in the **`refsite-runner`** skill (installed at `~/.claude/skills/refsite-runner/`).
When I say **"run the next one"**, **"run the next N"**, **"queue status"**,
**"add X"**, **"reprioritize"**, or **"rerun <slug>"**, follow that skill.

If the skill is not installed, tell me before improvising.

## Where things live in this repo

- `prompts/queue.md` --- the ordered run list. The next item is the first PENDING row.
- `content/registry.json` --- the database. Which chapters exist, their order, status.
- `src/chapters/<slug>.mdx` --- chapter prose. Bespoke figures and the signature
  widget go under `src/chapters/_figures/` and `src/chapters/_widgets/`.
- `src/styles/tokens.css` --- the running house style. Treat it as source of truth.
- `src/components/` --- shared primitives: Figure, Photo, Widget, ExerciseCard, Callout.
- `public/photos/` --- licensed teaching photographs, one folder per chapter. See
  `public/photos/README.md`. Per-chapter photo directives are in `prompts/photo-notes.md`.

## House rules

- Match the existing house style exactly. Prose has no em dashes and none of the
  usual AI tells (see the skill's authoring spec).
- Use real photo examples wherever a photograph teaches better than a diagram
  (especially light, composition, color, and black and white). Every photo goes
  through the `<Photo>` component with a filled-in `credit` and `href`, sourced per
  `public/photos/README.md` and `prompts/photo-notes.md`. Source my own images first,
  else properly licensed work (Unsplash, Pexels, Wikimedia Commons); never embed
  unlicensed images. The one signature figure per chapter stays an inline-SVG
  diagram; photos are additional.
- Never auto-commit to `main` and push, and never deploy, unless I say so. End each
  run with a summary and let me review with `npm run dev`.
- A run may not mark an item DONE if `npm run typecheck` or `npm run build` fails.
