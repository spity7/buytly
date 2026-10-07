import Link from "next/link";
import MediaFrame from "./MediaFrame";
import LiveAvailability from "./LiveAvailability";
import { ArrowIcon } from "./icons";
import { formatTypeBlocks, getUnitTypeHref } from "@/content/block57/unitTypes";
import { indexLabel } from "@/lib/block57/format";
import styles from "./ResidenceCard.module.scss";

const TONES = ["stone", "sand"];

/**
 * One residence type as a card linking to /apartments/<slug>/ (home teaser and
 * the Apartments grid): image, blocks, label, summary and live availability.
 * The whole card is clickable (stretched title link) with a visible focus ring.
 *
 * @param {{ type: object, index?: number, headingAs?: "h3"|"h4",
 *   media?: "portrait"|"landscape", sizes?: string, className?: string }} props
 *   `type` from content/block57/unitTypes.js. `media` "portrait" is 3:2 on
 *   phones and 4:5 from md; "landscape" is 4:3 throughout.
 */
export default function ResidenceCard({
  type,
  index = 0,
  headingAs: Heading = "h3",
  media = "portrait",
  sizes = "(min-width: 1024px) 400px, (min-width: 768px) 50vw, 100vw",
  className,
}) {
  const image = type.images?.[0] ?? null;
  const src = type.heroImage || image?.src || null;
  const alt = src ? image?.alt || `${type.label} at Block 57` : "";

  return (
    <article
      className={[styles.card, styles[`media-${media}`], className]
        .filter(Boolean)
        .join(" ")}
    >
      <div className={styles.media}>
        <MediaFrame
          ratio="fill"
          tone={TONES[index % TONES.length]}
          src={src}
          alt={alt}
          caption={<span aria-hidden="true">{indexLabel(index)}</span>}
          sizes={sizes}
        />
      </div>
      <div className={styles.body}>
        <p className={styles.blocks}>{formatTypeBlocks(type.blocks)}</p>
        <Heading className={styles.title}>
          <Link href={getUnitTypeHref(type.slug)} className={styles.link}>
            {type.label}
          </Link>
        </Heading>
        <p className={styles.summary}>{type.summary}</p>
        <div className={styles.footer}>
          <LiveAvailability type={type.slug} />
          <ArrowIcon size={18} className={styles.arrow} />
        </div>
      </div>
    </article>
  );
}
