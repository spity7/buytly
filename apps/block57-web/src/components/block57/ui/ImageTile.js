"use client";

import Image, { getImageProps } from "next/image";
import { Item } from "react-photoswipe-gallery";
import { PlusIcon } from "./icons";
import styles from "./ImageTile.module.scss";

/**
 * Lightbox image tile (home marquee, apartment photos, gallery): a link
 * wrapping the image; on hover/focus a 30% black overlay, a white 60px circle
 * with a green "+", and the image zooms to 1.1 (0.3s; set
 * `--b57-tile-zoom-duration: 0.5s` on a parent for the gallery page). Click
 * opens the enclosing <LightboxGallery> at this image. Must be rendered inside
 * a <LightboxGallery>.
 *
 * fit: "natural" (width 100%, height from the image ratio: photo grids,
 *   marquee) or "cover" (fills the parent box, which sets the size: masonry).
 *
 * @param {{ image: import("@/lib/block57/assets").Block57Asset,
 *   sizes: string, fit?: "natural"|"cover", className?: string,
 *   imageClassName?: string, priority?: boolean }} props
 */
export default function ImageTile({
  image,
  sizes,
  fit = "natural",
  className,
  imageClassName,
  priority = false,
}) {
  const { src, width, height, alt } = image;
  const {
    props: { srcSet },
  } = getImageProps({ src, width, height, alt, sizes: "100vw" });

  return (
    <Item
      original={src}
      originalSrcset={srcSet}
      width={width}
      height={height}
      alt={alt}
      cropped={fit === "cover"}
    >
      {({ ref, open }) => (
        <a
          ref={ref}
          href={src}
          onClick={(event) => {
            event.preventDefault();
            open(event);
          }}
          className={[styles.tile, styles[fit], className]
            .filter(Boolean)
            .join(" ")}
          aria-haspopup="dialog"
        >
          {fit === "cover" ? (
            <Image
              src={src}
              alt={alt}
              fill
              sizes={sizes}
              priority={priority}
              className={[styles.image, imageClassName]
                .filter(Boolean)
                .join(" ")}
            />
          ) : (
            <Image
              src={src}
              alt={alt}
              width={width}
              height={height}
              sizes={sizes}
              priority={priority}
              className={[styles.image, imageClassName]
                .filter(Boolean)
                .join(" ")}
            />
          )}
          <span className={styles.overlay} aria-hidden="true" />
          <span className={styles.plus} aria-hidden="true">
            <PlusIcon size={16} />
          </span>
        </a>
      )}
    </Item>
  );
}
