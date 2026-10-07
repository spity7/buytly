import Container from "@/components/block57/ui/Container";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import { TYPE_PAGE_SECTIONS } from "@/content/block57/apartments";
import { indexLabel } from "@/lib/block57/format";
import styles from "./TypeOverview.module.scss";

/** Description paragraphs + highlights list for one residence type. */
export default function TypeOverview({ type }) {
  const [first, ...rest] = type.description || [];
  return (
    <Section aria-labelledby="type-overview-title">
      <Container>
        <div className={styles.grid}>
          <SectionHeading
            eyebrow={TYPE_PAGE_SECTIONS.overview.eyebrow}
            title={type.pluralLabel}
            id="type-overview-title"
            className={styles.heading}
          />
          <Reveal className={styles.copy}>
            {first ? <p className={styles.lead}>{first}</p> : null}
            {rest.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}

            {type.highlights?.length ? (
              <div className={styles.highlights}>
                <h3 className={styles.highlightsTitle}>Highlights</h3>
                <ul>
                  {type.highlights.map((item, index) => (
                    <li key={item}>
                      <span className={styles.index} aria-hidden="true">
                        {indexLabel(index)}
                      </span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
