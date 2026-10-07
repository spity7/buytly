import Container from "@/components/block57/ui/Container";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import MediaFrame from "@/components/block57/ui/MediaFrame";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import { LIFESTYLE_STORY } from "@/content/block57/lifestyle";
import styles from "./LifestyleStory.module.scss";

/**
 * Editorial band with the three verified lifestyle paragraphs: the first as a
 * serif statement, the other two as body copy, then a staggered image pair.
 */
export default function LifestyleStory({ content = LIFESTYLE_STORY }) {
  const titleId = `${content.id}-title`;
  const [primary, secondary] = content.media ?? [];

  return (
    <Section id={content.id} aria-labelledby={titleId}>
      <Container>
        <div className={styles.top}>
          <Reveal className={styles.heading}>
            <Eyebrow rule>{content.eyebrow}</Eyebrow>
            <h2 id={titleId} className={styles.title}>
              {content.title}
            </h2>
          </Reveal>

          <div className={styles.text}>
            <Reveal delay={100}>
              <p className={styles.statement}>{content.statement}</p>
            </Reveal>
            <div className={styles.columns}>
              {content.paragraphs.map((paragraph, index) => (
                <Reveal
                  key={paragraph.slice(0, 24)}
                  delay={160 + index * 80}
                  className={styles.column}
                >
                  <p className={styles.paragraph}>{paragraph}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.composition}>
          {primary ? (
            <Reveal className={styles.primary}>
              <div className={styles.primaryFrame}>
                <MediaFrame
                  ratio="fill"
                  tone={primary.tone}
                  src={primary.src}
                  alt={primary.src ? primary.alt : ""}
                  caption={primary.caption}
                  sizes="(min-width: 1024px) 66vw, 100vw"
                />
              </div>
            </Reveal>
          ) : null}
          {secondary ? (
            <Reveal className={styles.secondary} delay={140}>
              <div className={styles.secondaryFrame}>
                <MediaFrame
                  ratio="fill"
                  tone={secondary.tone}
                  src={secondary.src}
                  alt={secondary.src ? secondary.alt : ""}
                  caption={secondary.caption}
                  sizes="(min-width: 1024px) 25vw, 60vw"
                />
              </div>
            </Reveal>
          ) : null}
        </div>
      </Container>
    </Section>
  );
}
