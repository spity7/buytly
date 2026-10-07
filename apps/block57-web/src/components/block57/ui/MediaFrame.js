import Image from "next/image";
import { remoteImageProps } from "@/lib/images/remoteImage";
import styles from "./MediaFrame.module.scss";

/** "16/9", "16:9", "4/5", 1.5 → CSS aspect-ratio value. */
function toAspectRatio(ratio) {
  if (typeof ratio === "number" && ratio > 0) return String(ratio);
  const match = String(ratio ?? "").match(
    /^\s*(\d+(?:\.\d+)?)\s*[/:x]\s*(\d+(?:\.\d+)?)\s*$/,
  );
  return match ? `${match[1]} / ${match[2]}` : "16 / 9";
}

function isLocalPath(src) {
  return (
    typeof src === "string" && src.startsWith("/") && !src.startsWith("//")
  );
}

/**
 * Image area with a fixed aspect ratio (no layout shift).
 * - local path ("/images/block57/…") → next/image (optimised, `fill`)
 * - remote URL (signed GCS media) → next/image `fill`, unoptimised
 * - no `src` → PROVISIONAL tonal placeholder with a faint architectural line
 *   drawing; swap in real `src` values once the Block 57 media exists.
 *
 * Responsive ratio: set `--b57-media-ratio` on the frame (via `className`) in
 * a media query to override `ratio` at that size, e.g.
 *   .plan { @include bp.down(md) { --b57-media-ratio: 4 / 3; } }
 *
 * @param {{ src?: string|null, alt?: string, ratio?: string|number|"fill",
 *   caption?: React.ReactNode, priority?: boolean, sizes?: string,
 *   tone?: "stone"|"sand"|"dark"|"paper", fit?: "cover"|"contain",
 *   position?: string, className?: string, children?: React.ReactNode }} props
 *   `ratio="fill"` fills a positioned parent (e.g. a full-bleed hero).
 *   `children` render on top of the media (e.g. hero text).
 */
export default function MediaFrame({
  src,
  alt = "",
  ratio = "16/9",
  caption,
  priority = false,
  sizes = "100vw",
  tone = "stone",
  fit = "cover",
  position,
  className,
  children,
}) {
  const fill = ratio === "fill";
  const hasImage = Boolean(src);
  const classes = [
    styles.frame,
    fill ? styles.fill : null,
    styles[`tone-${tone}`],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <figure
      className={classes}
      style={fill ? undefined : { "--_ratio": toAspectRatio(ratio) }}
      data-placeholder={hasImage ? undefined : "true"}
    >
      {hasImage ? (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className={styles.image}
          style={{ objectFit: fit, objectPosition: position }}
          {...(isLocalPath(src)
            ? {}
            : { unoptimized: true, ...remoteImageProps(src) })}
        />
      ) : (
        <div
          className={styles.placeholder}
          {...(alt
            ? { role: "img", "aria-label": alt }
            : { "aria-hidden": "true" })}
        >
          <span className={styles.elevation} />
        </div>
      )}
      {caption ? (
        <figcaption className={styles.caption}>{caption}</figcaption>
      ) : null}
      {children ? <div className={styles.content}>{children}</div> : null}
    </figure>
  );
}
