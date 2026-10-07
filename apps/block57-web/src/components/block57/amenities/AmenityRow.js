import MediaFrame from "@/components/block57/ui/MediaFrame";
import Reveal from "@/components/block57/ui/Reveal";
import { indexLabel } from "@/lib/block57/format";
import styles from "./AmenityRow.module.scss";

/**
 * One amenity: image area + index, title and verified copy. Rows alternate
 * the image side on desktop (`reverse`); on phones the image comes first.
 * The article's id is the amenity slug (/amenities/#padel-court).
 *
 * @param {{ amenity: { slug: string, title: string, copy: string,
 *   image?: { src: string, alt?: string }|null, tone?: "stone"|"sand"|"dark" },
 *   index: number, total: number, groupTitle?: string, reverse?: boolean }} props
 */
export default function AmenityRow({
  amenity,
  index,
  total,
  groupTitle,
  reverse = false,
}) {
  const titleId = `${amenity.slug}-title`;
  const src = amenity.image?.src ?? null;

  return (
    <article
      id={amenity.slug}
      className={[styles.row, reverse ? styles.reverse : null]
        .filter(Boolean)
        .join(" ")}
      aria-labelledby={titleId}
    >
      <Reveal className={styles.media}>
        <div className={styles.frame}>
          <MediaFrame
            ratio="fill"
            tone={amenity.tone ?? "stone"}
            src={src}
            alt={src ? (amenity.image?.alt ?? amenity.title) : ""}
            caption={
              groupTitle ? <span aria-hidden="true">{groupTitle}</span> : null
            }
            sizes="(min-width: 1024px) 58vw, 100vw"
          />
        </div>
      </Reveal>

      <Reveal className={styles.body} delay={120}>
        <p className={styles.index} aria-hidden="true">
          <span className={styles.number}>{indexLabel(index)}</span>
          <span className={styles.total}>/ {indexLabel(total - 1)}</span>
        </p>
        <h3 id={titleId} className={styles.title}>
          {amenity.title}
        </h3>
        <p className={styles.copy}>{amenity.copy}</p>
      </Reveal>
    </article>
  );
}
