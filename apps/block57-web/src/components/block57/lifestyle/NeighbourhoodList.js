import Container from "@/components/block57/ui/Container";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import SectionHeading from "@/components/block57/ui/SectionHeading";
import { LIFESTYLE_NEIGHBOURHOOD } from "@/content/block57/lifestyle";
import { indexLabel } from "@/lib/block57/format";
import styles from "./NeighbourhoodList.module.scss";

/** "Neighbourhood": qualitative nearby points (no names or drive times). */
export default function NeighbourhoodList({
  content = LIFESTYLE_NEIGHBOURHOOD,
}) {
  const titleId = `${content.id}-title`;

  return (
    <Section tone="alt" id={content.id} aria-labelledby={titleId}>
      <Container>
        <Reveal>
          <SectionHeading
            eyebrow={content.eyebrow}
            title={content.title}
            id={titleId}
          />
        </Reveal>

        <ul className={styles.list}>
          {content.items.map((item, index) => (
            <Reveal
              as="li"
              key={item.slug}
              delay={(index % 3) * 80}
              className={styles.item}
            >
              <span className={styles.index} aria-hidden="true">
                {indexLabel(index)}
              </span>
              <span className={styles.label}>{item.label}</span>
            </Reveal>
          ))}
        </ul>
      </Container>
    </Section>
  );
}
