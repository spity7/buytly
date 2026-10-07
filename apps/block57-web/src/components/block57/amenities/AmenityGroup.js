import Container from "@/components/block57/ui/Container";
import Reveal from "@/components/block57/ui/Reveal";
import Section from "@/components/block57/ui/Section";
import AmenityRow from "./AmenityRow";
import { indexLabel } from "@/lib/block57/format";
import styles from "./AmenityGroup.module.scss";

/**
 * A visual group of amenities (e.g. "Rooftop"): numbered group heading with a
 * hairline, then its amenity rows. The section id is the group slug.
 * `startIndex` is the position of the group's first amenity across the page
 * (drives the 01/07 numbering and the alternating image side).
 *
 * @param {{ group: { slug: string, title: string, items: object[] },
 *   groupIndex: number, groupCount: number, startIndex: number,
 *   total: number, tone?: "default"|"alt" }} props
 */
export default function AmenityGroup({
  group,
  groupIndex,
  groupCount,
  startIndex,
  total,
  tone = "default",
}) {
  const titleId = `${group.slug}-title`;

  return (
    <Section
      tone={tone}
      id={group.slug}
      aria-labelledby={titleId}
      className={styles.group}
    >
      <Container>
        <Reveal className={styles.header}>
          <p className={styles.counter} aria-hidden="true">
            {indexLabel(groupIndex)}
            <span className={styles.counterTotal}>
              / {indexLabel(groupCount - 1)}
            </span>
          </p>
          <h2 id={titleId} className={styles.title}>
            {group.title}
          </h2>
          <span className={styles.rule} aria-hidden="true" />
        </Reveal>

        <div className={styles.rows}>
          {group.items.map((amenity, itemIndex) => {
            const index = startIndex + itemIndex;
            return (
              <AmenityRow
                key={amenity.slug}
                amenity={amenity}
                index={index}
                total={total}
                groupTitle={group.title}
                reverse={index % 2 === 1}
              />
            );
          })}
        </div>
      </Container>
    </Section>
  );
}
