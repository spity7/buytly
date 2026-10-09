import Reveal from "@/components/block57/ui/Reveal";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import TourEmbed from "@/components/block57/ui/TourEmbed";
import { TYPE_PAGE_COPY } from "@/content/block57/apartments";
import styles from "./TypeTour.module.scss";

/**
 * "360 Virtual tour / Modern Living" block of the Penthouse, Executive
 * Studio, 1 and 2 Bedroom pages: centred eyebrow + H2 (opal move-up) over
 * the lazy CloudPano tour (100% × 500px).
 */
export default function TypeTour({ type }) {
  const titleId = "type-tour-title";
  return (
    <section className={styles.tour} aria-labelledby={titleId}>
      <div className={styles.card}>
        <SectionHeading
          eyebrow={TYPE_PAGE_COPY.tour.eyebrow}
          title={
            <Reveal as="span" className={styles.reveal}>
              {TYPE_PAGE_COPY.tour.title}
            </Reveal>
          }
          id={titleId}
          className={styles.heading}
          titleClassName={styles.title}
        />
        <TourEmbed
          tourId={type.tourId}
          title={`${type.label} 360° virtual tour`}
        />
      </div>
    </section>
  );
}
