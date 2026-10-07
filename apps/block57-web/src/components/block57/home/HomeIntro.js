import Container from "@/components/block57/ui/Container";
import Section from "@/components/block57/ui/Section";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import Reveal from "@/components/block57/ui/Reveal";
import { ButtonLink } from "@/components/block57/ui/Button";
import { HOME_INTRO, BLOCKS } from "@/content/block57/home";
import { UNIT_TYPES } from "@/content/block57/unitTypes";
import { AMENITIES } from "@/content/block57/amenities";
import { twoDigits } from "@/lib/block57/format";
import styles from "./HomeIntro.module.scss";

/** Verified introduction in an editorial two-column layout, plus key figures. */
export default function HomeIntro({ content = HOME_INTRO }) {
  const [lead, ...paragraphs] = content.paragraphs;
  const facts = [
    { value: BLOCKS.length, label: content.factLabels.blocks },
    { value: UNIT_TYPES.length, label: content.factLabels.unitTypes },
    { value: AMENITIES.length, label: content.factLabels.amenities },
  ];

  return (
    <Section id={content.id} aria-labelledby="home-intro-title">
      <Container>
        <div className={styles.grid}>
          <Reveal className={styles.heading}>
            <Eyebrow>{content.eyebrow}</Eyebrow>
            <h2 id="home-intro-title" className={styles.title}>
              {content.title}
            </h2>
          </Reveal>

          <Reveal className={styles.copy} delay={120}>
            <p className={styles.lead}>{lead}</p>
            {paragraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)}>{paragraph}</p>
            ))}
            <ButtonLink
              href={content.cta.href}
              variant="text"
              className={styles.cta}
            >
              {content.cta.label}
            </ButtonLink>
          </Reveal>
        </div>

        <Reveal as="dl" className={styles.facts}>
          {facts.map((fact) => (
            <div key={fact.label} className={styles.fact}>
              <dt className={styles.factLabel}>{fact.label}</dt>
              <dd className={styles.factValue}>{twoDigits(fact.value)}</dd>
            </div>
          ))}
        </Reveal>
      </Container>
    </Section>
  );
}
