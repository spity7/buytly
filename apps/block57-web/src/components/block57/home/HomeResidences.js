import Container from "@/components/block57/ui/Container";
import Section from "@/components/block57/ui/Section";
import Reveal from "@/components/block57/ui/Reveal";
import ResidenceCard from "@/components/block57/ui/ResidenceCard";
import { HOME_RESIDENCES } from "@/content/block57/home";
import { UNIT_TYPES } from "@/content/block57/unitTypes";
import HeadingRow from "./HeadingRow";
import styles from "./HomeResidences.module.scss";

/** Six unit-type cards linking to /apartments/<type>/, each with live availability. */
export default function HomeResidences({
  content = HOME_RESIDENCES,
  unitTypes = UNIT_TYPES,
}) {
  return (
    <Section aria-labelledby="home-residences-title">
      <Container>
        <Reveal>
          <HeadingRow
            eyebrow={content.eyebrow}
            title={content.title}
            lead={content.lead}
            id="home-residences-title"
            link={content.cta}
          />
        </Reveal>

        <ul className={styles.grid}>
          {unitTypes.map((type, index) => (
            <Reveal
              as="li"
              key={type.slug}
              delay={(index % 3) * 100}
              className={styles.item}
            >
              <ResidenceCard type={type} index={index} media="portrait" />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
