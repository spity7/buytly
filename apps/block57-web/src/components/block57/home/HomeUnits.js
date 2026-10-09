import ResidenceGrid from "@/components/block57/apartments/ResidenceGrid";
import Container from "@/components/block57/ui/Container";
import Reveal from "@/components/block57/ui/Reveal";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import { HOME_UNITS } from "@/content/block57/home";
import { UNIT_TYPES } from "@/content/block57/unitTypes";
import styles from "./HomeUnits.module.scss";

/** Card image `sizes` for the 420px columns (3 → 2 ≤1024 → 1 ≤767). */
const CARD_SIZES =
  "(max-width: 767px) calc(100vw - 30px), (max-width: 1024px) calc(50vw - 45px), 420px";

/**
 * "Find your fit": centred eyebrow + H2 over the six residence cards (live
 * home order, 3 × 420px with 30px gutters and hairlines between cards), each
 * with its live availability line. All six cards are laid out on phones too
 * (live clips the last ones under the next section).
 */
export default function HomeUnits({
  content = HOME_UNITS,
  types = UNIT_TYPES,
}) {
  return (
    <section className={styles.units} aria-labelledby="home-units-title">
      <Container>
        <Reveal className={styles.heading}>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            id="home-units-title"
            titleClassName={styles.title}
          />
        </Reveal>
        <ResidenceGrid
          types={types}
          gutter={30}
          headingAs="h3"
          sizes={CARD_SIZES}
        />
      </Container>
    </section>
  );
}
