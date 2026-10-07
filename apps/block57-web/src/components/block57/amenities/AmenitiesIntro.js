import Container from "@/components/block57/ui/Container";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import { AMENITIES_PAGE } from "@/content/block57/amenities";
import { indexLabel } from "@/lib/block57/format";
import styles from "./AmenitiesIntro.module.scss";

/**
 * Light editorial opening for /amenities/ (solid header): page title, the
 * verified "balance" line and an index of the amenity groups (anchor links).
 *
 * @param {{ groups: { slug: string, title: string,
 *   items: { slug: string, title: string }[] }[] }} props
 */
export default function AmenitiesIntro({ groups, content = AMENITIES_PAGE }) {
  return (
    <Section
      spacing="none"
      className={styles.intro}
      aria-labelledby="amenities-title"
    >
      <Container>
        <div className={styles.top}>
          <Reveal className={styles.heading}>
            <Eyebrow rule>{content.introEyebrow}</Eyebrow>
            <h1 id="amenities-title" className={styles.title}>
              {content.title}
            </h1>
          </Reveal>
          {content.intro?.[0] ? (
            <Reveal className={styles.leadCol} delay={100}>
              <p className={styles.lead}>{content.intro[0]}</p>
            </Reveal>
          ) : null}
        </div>

        <Reveal
          as="nav"
          aria-label={content.indexLabel}
          className={styles.index}
          delay={160}
        >
          <ol className={styles.groups}>
            {groups.map((group, groupIndex) => (
              <li key={group.slug} className={styles.group}>
                <a href={`#${group.slug}`} className={styles.groupLink}>
                  <span className={styles.groupIndex} aria-hidden="true">
                    {indexLabel(groupIndex)}
                  </span>
                  {group.title}
                </a>
                <ul className={styles.items}>
                  {group.items.map((amenity) => (
                    <li key={amenity.slug}>
                      <a href={`#${amenity.slug}`} className={styles.itemLink}>
                        {amenity.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ol>
        </Reveal>
      </Container>
    </Section>
  );
}
