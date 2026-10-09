import Image from "next/image";
import Reveal from "@/components/block57/ui/Reveal";
import { getAsset } from "@/lib/block57/assets";
import styles from "./AmenityRow.module.scss";

/**
 * Full-bleed 50/50 amenity row (DESIGN_SPEC §4.5.2): a cover photo half and a
 * white text half (520px column, H2 + justified lead), 700px tall (600 ≤880).
 * `reverse` puts the photo on the right; the text then enters from the left,
 * otherwise from the right. Phones: photo (450px) first, then the text.
 * The section id is the amenity slug (/amenities/#padel-court).
 *
 * @param {{ amenity: { slug: string, title: string, copy: string,
 *   image: string }, reverse?: boolean }} props
 */
export default function AmenityRow({ amenity, reverse = false }) {
  const image = getAsset(amenity.image);
  const ratio = image.width / image.height;
  const titleId = `${amenity.slug}-title`;
  const effect = reverse ? "right" : "left";

  return (
    <section
      id={amenity.slug}
      className={[styles.row, reverse ? styles.reverse : null]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={titleId}
    >
      <div className={styles.media} style={{ backgroundColor: image.color }}>
        <Image
          src={image.src}
          alt={image.alt}
          fill
          // Cover crop: the photo is as wide as the box height × its ratio.
          sizes={`(max-width: 767px) ${Math.round(450 * ratio)}px, ${Math.round(700 * ratio)}px`}
          className={styles.image}
        />
      </div>
      <div className={styles.text}>
        <div className={styles.column}>
          <Reveal effect={effect}>
            <h2 id={titleId} className={styles.title}>
              {amenity.title}
            </h2>
          </Reveal>
          <Reveal effect={effect}>
            <p className={styles.copy}>{amenity.copy}</p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
