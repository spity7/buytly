import Container from "@/components/block57/ui/Container";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import { HOME_AMENITIES } from "@/content/block57/home";
import styles from "./HomeAmenities.module.scss";

/**
 * "Modern conveniences" on the #F6F1EA band: centred eyebrow + H2 over eight
 * white text cards (4 columns → 3 ≤1024 → 2 ≤880 → 1 ≤767) entering with
 * 0 / 20 / 40 / 60ms delays per column, as on live.
 */
export default function HomeAmenities({ content = HOME_AMENITIES }) {
  return (
    <Section tone="light" aria-labelledby="home-amenities-title">
      <Container size="wide">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={
            <Reveal as="span" className={styles.reveal}>
              {content.title}
            </Reveal>
          }
          id="home-amenities-title"
          className={styles.heading}
          titleClassName={styles.title}
        />
        <ul className={styles.grid}>
          {content.cards.map((card, index) => (
            <Reveal
              as="li"
              key={card.title}
              delay={(index % 4) * 20}
              className={styles.card}
            >
              <h3 className={styles.cardTitle}>{card.title}</h3>
              <p className={styles.cardText}>{card.text}</p>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
