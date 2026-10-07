import Container from "@/components/block57/ui/Container";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import MediaFrame from "@/components/block57/ui/MediaFrame";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import { MASTERPLAN, PRIVACY } from "@/content/block57/apartments";
import styles from "./MasterplanSection.module.scss";

/** Masterplan copy + plan image + privacy statement (verified client copy). */
export default function MasterplanSection() {
  return (
    <Section id="masterplan" aria-labelledby="masterplan-title">
      <Container>
        <div className={styles.intro}>
          <SectionHeading
            eyebrow={MASTERPLAN.eyebrow}
            title={MASTERPLAN.title}
            id="masterplan-title"
            className={styles.heading}
          />
          <Reveal className={styles.copy}>
            {MASTERPLAN.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </Reveal>
        </div>
      </Container>

      <Container size="wide">
        <Reveal className={styles.plan}>
          <MediaFrame
            src={MASTERPLAN.image}
            alt={MASTERPLAN.imageAlt}
            ratio="21/9"
            tone="sand"
            caption={MASTERPLAN.imageCaption}
            sizes="(min-width: 1600px) 1536px, 100vw"
            className={styles.planFrame}
          />
        </Reveal>
      </Container>

      <Container>
        <div className={styles.privacy}>
          <div className={styles.privacyLabel}>
            <Eyebrow rule>{PRIVACY.eyebrow}</Eyebrow>
            <h3 className={styles.privacyTitle}>{PRIVACY.title}</h3>
          </div>
          <Reveal className={styles.privacyCopy}>
            {PRIVACY.paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 32)}>{paragraph}</p>
            ))}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
