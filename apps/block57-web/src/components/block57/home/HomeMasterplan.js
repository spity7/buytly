import Link from "next/link";
import Container from "@/components/block57/ui/Container";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import MediaFrame from "@/components/block57/ui/MediaFrame";
import Reveal from "@/components/block57/ui/Reveal";
import { ArrowIcon } from "@/components/block57/ui/icons";
import { BLOCKS, HOME_MASTERPLAN, MASTERPLAN } from "@/content/block57/home";
import { getUnitTypeLabel } from "@/content/block57/unitTypes";
import { leadingSentences } from "@/lib/block57/format";
import styles from "./HomeMasterplan.module.scss";

/** Masterplan copy, the site plan image and one card per block (A, B, C). */
export default function HomeMasterplan({
  masterplan = MASTERPLAN,
  content = HOME_MASTERPLAN,
  blocks = BLOCKS,
}) {
  const [statement, ...rest] = masterplan.paragraphs;

  return (
    <Section tone="alt" aria-labelledby="home-masterplan-title">
      <Container>
        <div className={styles.top}>
          <Reveal>
            <SectionHeading
              eyebrow={masterplan.eyebrow}
              title={masterplan.title}
              id="home-masterplan-title"
              className={styles.heading}
            />
          </Reveal>
          <Reveal className={styles.copy} delay={120}>
            <p className={styles.statement}>{statement}</p>
            {rest.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
          </Reveal>
        </div>

        <Reveal className={styles.plan}>
          <MediaFrame
            ratio="fill"
            tone="sand"
            src={content.media.src}
            alt={content.media.alt}
            caption={content.media.caption}
            sizes="(min-width: 1280px) 1248px, 100vw"
          />
        </Reveal>

        <ul className={styles.blocks}>
          {blocks.map((block, index) => {
            const href = content.blockHref(block.slug);
            const titleId = `home-${block.slug}-title`;
            return (
              <Reveal
                as="li"
                key={block.id}
                delay={index * 100}
                className={styles.block}
              >
                <span className={styles.letter} aria-hidden="true">
                  {block.id}
                </span>
                <h3 id={titleId} className={styles.blockTitle}>
                  <Link href={href} className={styles.blockLink}>
                    {block.label}
                  </Link>
                </h3>
                <p className={styles.excerpt}>
                  {leadingSentences(block.description)}
                </p>
                <p className={styles.types}>
                  {block.unitTypes.map(getUnitTypeLabel).join(" · ")}
                </p>
                <span className={styles.more} aria-hidden="true">
                  {content.blockCtaLabel} {block.label}
                  <ArrowIcon size={16} />
                </span>
              </Reveal>
            );
          })}
        </ul>
      </Container>
    </Section>
  );
}
