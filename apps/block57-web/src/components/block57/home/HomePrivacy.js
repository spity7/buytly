import Container from "@/components/block57/ui/Container";
import Section from "@/components/block57/ui/Section";
import Reveal from "@/components/block57/ui/Reveal";
import { HOME_PRIVACY, PRIVACY } from "@/content/block57/home";
import styles from "./HomePrivacy.module.scss";

/** Quiet full-width typographic statement (verified privacy copy). */
export default function HomePrivacy({
  privacy = PRIVACY,
  content = HOME_PRIVACY,
}) {
  return (
    <Section
      tone="dark"
      className={styles.band}
      aria-labelledby="home-privacy-title"
    >
      <Container size="narrow">
        <Reveal className={styles.inner}>
          <span className={styles.rule} aria-hidden="true" />
          <h2 id="home-privacy-title" className={styles.heading}>
            {content.headingLabel}
          </h2>
          {privacy.paragraphs.map((paragraph) => (
            <p key={paragraph.slice(0, 40)} className={styles.statement}>
              {paragraph}
            </p>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
