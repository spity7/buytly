import Container from "@/components/block57/ui/Container";
import Reveal from "@/components/block57/ui/Reveal";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import TourEmbed from "@/components/block57/ui/TourEmbed";
import { HOME_TOUR } from "@/content/block57/home";
import styles from "./HomeTour.module.scss";

/**
 * "360 Virtual tour / Modern Living": centred eyebrow (static) and H2 (opal
 * move-up) over the lazy CloudPano tour, 100% of the 1350px column × 500px.
 */
export default function HomeTour({ content = HOME_TOUR }) {
  return (
    <section className={styles.tour} aria-labelledby="home-tour-title">
      <Container size="wide">
        <SectionHeading
          eyebrow={content.eyebrow}
          title={
            <Reveal as="span" className={styles.reveal}>
              {content.title}
            </Reveal>
          }
          id="home-tour-title"
          className={styles.heading}
          titleClassName={styles.title}
        />
        <TourEmbed tourId={content.tourId} title={content.frameTitle} />
      </Container>
    </section>
  );
}
