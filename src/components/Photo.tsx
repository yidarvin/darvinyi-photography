import type { ReactNode } from "react";

interface PhotoProps {
  /** Image path under /photos/<chapter>/... or a licensed remote URL. */
  src: string;
  /** Plain-language description of the image for screen readers. Required. */
  alt: string;
  /** Teaching caption: what to look at in the frame, and why. */
  caption?: ReactNode;
  /** Short id shown in the caption, e.g. "12.1". */
  id?: string;
  /** Capture settings, e.g. "Leica Q3 - 28mm - f/2 - 1/500s - ISO 200". */
  meta?: string;
  /** Attribution. Required for anything not shot by the author, e.g. "Jane Doe / Unsplash". */
  credit?: string;
  /** Link to the source page or license. */
  href?: string;
}

/**
 * A real photograph used as a teaching example. Where <Figure> holds an inline-SVG
 * diagram of a concept, <Photo> holds a licensed photograph that shows it in the
 * world. Every photo carries an attribution: use the author's own images first,
 * else properly licensed work (Unsplash, Pexels, Wikimedia Commons) with `credit`
 * and `href` filled in. Never embed unlicensed images. See public/photos/README.md.
 */
export function Photo({ src, alt, caption, id, meta, credit, href }: PhotoProps) {
  const hasCaption = Boolean(caption || meta || credit);
  return (
    <figure className="my-8 rounded-lg border border-border bg-surface p-2">
      <img src={src} alt={alt} loading="lazy" className="w-full rounded-md" />
      {hasCaption && (
        <figcaption className="mt-3 px-3 pb-1 font-mono text-xs leading-relaxed text-muted">
          {id && <span className="text-comment">{`/* photo ${id} */ `}</span>}
          {caption}
          {meta && <span className="mt-1 block text-comment">{meta}</span>}
          {credit && (
            <span className="mt-1 block text-comment">
              {"photo: "}
              {href ? (
                <a
                  href={href}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="text-accent"
                >
                  {credit}
                </a>
              ) : (
                credit
              )}
            </span>
          )}
        </figcaption>
      )}
    </figure>
  );
}
