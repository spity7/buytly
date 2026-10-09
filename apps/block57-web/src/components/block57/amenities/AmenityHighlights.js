import Image from "next/image";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import Reveal from "@/components/block57/ui/Reveal";
import { AMENITY_HIGHLIGHTS } from "@/content/block57/amenities";
import { getAsset } from "@/lib/block57/assets";
import styles from "./AmenityHighlights.module.scss";

/**
 * amenities.highlights (DESIGN_SPEC §4.5.3–4.5.4): centred eyebrow + H2 in an
 * 840 column, then a 1380 row of three cards (210px cover photo, title, copy)
 * with hairlines around the middle card. The photo zooms to 1.09 on hover.
 * Each card's id is its amenity slug.
 */
export default function AmenityHighlights({ content = AMENITY_HIGHLIGHTS }) {
  return (
    <section
      className={styles.highlights}
      aria-labelledby="amenities-highlights-title"
    >
      <div className={styles.heading}>
        <Reveal className={styles.eyebrowRow}>
          <Eyebrow variant="widget" className={styles.eyebrow}>
            {content.eyebrow}
          </Eyebrow>
        </Reveal>
        <Reveal>
          <h2 id="amenities-highlights-title" className={styles.title}>
            {content.title}
          </h2>
        </Reveal>
      </div>

      <ul className={styles.cards}>
        {content.cards.map((card) => {
          const image = getAsset(card.image);
          return (
            <li key={card.slug} id={card.slug} className={styles.card}>
              <div
                className={styles.media}
                style={{ backgroundColor: image.color }}
              >
                <Image
                  src={image.src}
                  alt={image.alt}
                  fill
                  sizes="(max-width: 767px) calc(100vw - 30px), (max-width: 1440px) calc(33.33vw - 60px), 400px"
                  className={styles.image}
                />
              </div>
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardCopy}>{card.copy}</p>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
