import Container from "@/components/block57/ui/Container";
import Divider from "@/components/block57/ui/Divider";
import Eyebrow from "@/components/block57/ui/Eyebrow";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import { HOME_INTRO } from "@/content/block57/home";
import styles from "./HomeIntro.module.scss";

/**
 * Green "A bold vision" band: eyebrow in a 25% column (enters from the
 * left), then the statement H2, a white divider (helix) and the justified
 * lead paragraph (both enter from the right). Stacked and centred on phones.
 */
export default function HomeIntro({ content = HOME_INTRO }) {
  return (
    <Section
      tone="green"
      spacing="none"
      className={styles.intro}
      aria-labelledby="home-intro-title"
    >
      <Container className={styles.row}>
        <div className={styles.aside}>
          <Reveal effect="right" className={styles.eyebrowWrap}>
            <Eyebrow>{content.eyebrow}</Eyebrow>
          </Reveal>
        </div>
        <div className={styles.main}>
          <Reveal effect="left">
            <h2 id="home-intro-title" className={styles.title}>
              {content.title}
            </h2>
          </Reveal>
          <Reveal effect="helix" className={styles.dividerWrap}>
            <Divider variant="white" className={styles.divider} />
          </Reveal>
          <Reveal effect="left" as="p" className={styles.text}>
            {content.text}
          </Reveal>
        </div>
      </Container>
    </Section>
  );
}
