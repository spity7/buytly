import Container from "@/components/block57/ui/Container";
import Reveal from "@/components/block57/ui/Reveal";
import ResidenceCard from "@/components/block57/ui/ResidenceCard";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import { UNIT_TYPES } from "@/content/block57/unitTypes";
import { RESIDENCES_SECTION } from "@/content/block57/apartments";
import styles from "./ResidenceGrid.module.scss";

/**
 * The six residence types with live availability, each linking to
 * /apartments/<slug>/ (shared <ResidenceCard>, as on the home page).
 */
export default function ResidenceGrid({
  id = "residences",
  types = UNIT_TYPES,
  eyebrow = RESIDENCES_SECTION.eyebrow,
  title = RESIDENCES_SECTION.title,
  lead = RESIDENCES_SECTION.lead,
  tone = "default",
  headingLevel = "h2",
}) {
  const titleId = `${id}-title`;

  return (
    <Section id={id} tone={tone} aria-labelledby={titleId}>
      <Container>
        <SectionHeading
          eyebrow={eyebrow}
          title={title}
          lead={lead}
          id={titleId}
          as={headingLevel}
        />

        <ul className={styles.grid}>
          {types.map((type, index) => (
            <Reveal
              as="li"
              key={type.slug}
              delay={(index % 3) * 80}
              className={styles.item}
            >
              <ResidenceCard
                type={type}
                index={index}
                media="landscape"
                headingAs={headingLevel === "h2" ? "h3" : "h4"}
                sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
              />
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
