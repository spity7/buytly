import Link from "next/link";
import Container from "@/components/block57/ui/Container";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import MediaFrame from "@/components/block57/ui/MediaFrame";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import { ArrowIcon } from "@/components/block57/ui/icons";
import { getUnitType, getUnitTypeHref } from "@/content/block57/unitTypes";
import LiveAvailability from "@/components/block57/ui/LiveAvailability";
import { indexLabel } from "@/lib/block57/format";
import styles from "./BlockSection.module.scss";

const MEDIA_TONES = ["stone", "sand", "stone"];

/**
 * One residential block (A/B/C): verified description, image and the
 * residence types found in that block with their live availability there.
 *
 * @param {{ block: object, index: number }} props  `block` from BLOCKS.
 */
export default function BlockSection({ block, index = 0 }) {
  const titleId = `${block.slug}-title`;
  const reversed = index % 2 === 1;
  const types = block.unitTypes.map(getUnitType).filter(Boolean);

  return (
    <Section
      id={block.slug}
      tone={reversed ? "default" : "alt"}
      aria-labelledby={titleId}
      className={styles.section}
    >
      <Container>
        <div
          className={[styles.grid, reversed ? styles.reversed : null]
            .filter(Boolean)
            .join(" ")}
        >
          <Reveal className={styles.media}>
            <MediaFrame
              src={block.image}
              alt={block.imageAlt}
              ratio="4/5"
              tone={MEDIA_TONES[index % MEDIA_TONES.length]}
              caption={block.label}
              sizes="(min-width: 1024px) 45vw, 100vw"
              className={styles.frame}
            />
          </Reveal>

          <div className={styles.body}>
            <span className={styles.letter} aria-hidden="true">
              {block.id}
            </span>
            <Eyebrow rule>{`${indexLabel(index)} · Residential block`}</Eyebrow>
            <h2 id={titleId} className={styles.title}>
              {block.label}
            </h2>
            <p className={styles.description}>{block.description}</p>

            <h3 className={styles.listTitle}>Residences in {block.label}</h3>
            <ul className={styles.types}>
              {types.map((type) => (
                <li key={type.slug}>
                  <Link
                    href={getUnitTypeHref(type.slug)}
                    className={styles.typeLink}
                  >
                    <span className={styles.typeLabel}>{type.label}</span>
                    <LiveAvailability
                      type={type.slug}
                      building={block.id}
                      className={styles.typeCount}
                    />
                    <span className={styles.typeArrow} aria-hidden="true">
                      <ArrowIcon size={16} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Container>
    </Section>
  );
}
