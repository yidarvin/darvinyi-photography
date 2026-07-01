# Photo examples

Real photographs used as teaching examples live here and are served from the site
root. A file at `public/photos/<chapter-slug>/<name>.jpg` is reachable at
`/photos/<chapter-slug>/<name>.jpg`.

Diagrams stay inline SVG (the `<Figure>` component). Photographs go through the
`<Photo>` component, which renders the image with a caption and a required credit:

```mdx
<Photo
  src="/photos/reading-light/side-light-portrait.jpg"
  alt="A face lit from the left, the far cheek falling into shadow."
  id="12.1"
  caption="Hard side light. The terminator runs down the nose and the shadow side keeps its shape."
  meta="Leica Q3 - 28mm - f/2 - 1/1000s - ISO 100"
  credit="Jane Doe / Unsplash"
  href="https://unsplash.com/photos/xxxx"
/>
```

## Sourcing, in priority order

1. **The photographer's own images.** Best case. Drop files into the chapter folder
   and set `meta` to the real capture settings (ideally shot on the Leica Q3 or
   Hasselblad X2D II). No `credit`/`href` needed for the author's own work, though a
   `meta` line is still valuable.
2. **Properly licensed work**, when the author has no suitable frame:
   - **Unsplash** (Unsplash License, free commercial use) - credit the photographer.
   - **Pexels** (Pexels License) - credit the photographer.
   - **Wikimedia Commons** - check each file's license (CC BY, CC BY-SA, or public
     domain). For CC BY / BY-SA, the `credit` must name the author and license and
     `href` must link the file page.

**Never** commit unlicensed or all-rights-reserved images. If a fact needs a photo
that cannot be licensed, use a diagram instead.

## Guidelines

- Prefer images that clearly show the one idea the chapter teaches. A photo that
  needs a paragraph to explain what to look at is the wrong photo.
- Where the lesson is gear-specific (leaf-shutter flash, medium-format depth of
  field, Leica vs Hasselblad color), prefer frames actually shot on a Leica Q or
  Hasselblad X. Otherwise any licensed image that shows the concept is fine.
- Resize for the web: long edge around 1600 px, JPEG quality around 80. These are
  teaching illustrations, not downloads.
- `alt` is required and describes the image; `caption` teaches. They are different
  jobs, so do not repeat one in the other.
